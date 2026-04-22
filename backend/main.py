import json
import os
from contextlib import asynccontextmanager
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from routers import contextifier, doc2chunk, f2a, googer
from mcp_bridge import bridge
from mcp_servers import MCP_SERVERS


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: nothing eager — sessions are lazy.
    yield
    # Shutdown: close MCP subprocesses cleanly.
    await bridge.close()


app = FastAPI(title="XGen Playground API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Direct-import demo routers (libraries without MCP servers) ──────────────
app.include_router(contextifier.router, prefix="/api/demo/contextifier")
app.include_router(doc2chunk.router, prefix="/api/demo/doc2chunk")
app.include_router(f2a.router, prefix="/api/demo/f2a")
app.include_router(googer.router, prefix="/api/demo/googer")


# ── Generic MCP bridge (libraries with native MCP servers) ──────────────────
@app.get("/api/mcp/registered")
async def mcp_registered() -> dict[str, list[str]]:
    """Libraries that have an MCP server registered."""
    return {"libraries": list(MCP_SERVERS.keys())}


@app.get("/api/mcp/{lib}/tools")
async def mcp_list_tools(lib: str) -> dict[str, Any]:
    if lib not in MCP_SERVERS:
        raise HTTPException(404, f"No MCP server for library: {lib}")
    try:
        tools = await bridge.list_tools(lib)
    except Exception as e:
        raise HTTPException(500, f"MCP list_tools failed: {e}") from e
    return {"lib": lib, "tools": tools}


@app.post("/api/mcp/{lib}/call/{tool}")
async def mcp_call_tool(lib: str, tool: str, request: Request) -> dict[str, Any]:
    if lib not in MCP_SERVERS:
        raise HTTPException(404, f"No MCP server for library: {lib}")

    try:
        arguments = await request.json()
        if not isinstance(arguments, dict):
            raise ValueError("body must be a JSON object")
    except ValueError:
        arguments = {}

    try:
        result = await bridge.call_tool(lib, tool, arguments)
    except Exception as e:
        raise HTTPException(500, f"MCP call_tool failed: {e}") from e
    return result


# ── Synaptic Ask (RAG) ──────────────────────────────────────────────────────
# Higher-level endpoint that combines:
#   1. knowledge_search (retrieval) via MCP bridge
#   2. OpenAI chat/completions (direct, no self-HTTP hop)
# Returns a natural-language answer with source citations.

OPENAI_UPSTREAM = os.environ.get("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")
LLM_API_KEY = os.environ.get("LLM_API_KEY") or os.environ.get("OPENAI_API_KEY", "")
LLM_DEFAULT_MODEL = os.environ.get("LLM_MODEL", "gpt-4o-mini")


class AskRequest(BaseModel):
    query: str
    limit: int = 5
    model: str = LLM_DEFAULT_MODEL


def _unwrap_mcp_text(raw: dict[str, Any]) -> Any:
    """Dig a JSON payload out of an MCP call_tool response.

    MCP returns ``{"content": [{"type": "text", "text": "..."}]}`` where
    the text itself is JSON. Some tools double-wrap: the outer JSON has
    another ``content`` string field that is *also* JSON. This helper
    peels both layers and returns the innermost decoded value (or None).
    """
    content = raw.get("content") or []
    if not content or not isinstance(content[0], dict):
        return None
    text = content[0].get("text")
    if not text:
        return None
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        return None
    if (
        isinstance(parsed, dict)
        and "content" in parsed
        and isinstance(parsed["content"], str)
    ):
        try:
            return json.loads(parsed["content"])
        except json.JSONDecodeError:
            return parsed
    return parsed


def _parse_search_result(raw: dict[str, Any]) -> list[dict[str, Any]]:
    """Extract hits from MCP knowledge_search response."""
    parsed = _unwrap_mcp_text(raw)
    if not isinstance(parsed, dict):
        return []
    return parsed.get("results") or []


async def _chat_complete(
    model: str,
    system_msg: str,
    user_msg: str,
    temperature: float = 0.2,
) -> str:
    """Call OpenAI chat/completions directly with the server's API key.

    The openai-proxy HTTP route exists for synaptic-mcp (which can only
    hit unauthenticated endpoints). FastAPI handlers inside this process
    should NOT self-HTTP to that route — they'd pay a socket round-trip
    and silently break in deployments where the backend binds a different
    port. Call OpenAI directly instead.
    """
    headers: dict[str, str] = {"Content-Type": "application/json"}
    if LLM_API_KEY:
        headers["Authorization"] = f"Bearer {LLM_API_KEY}"

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            f"{OPENAI_UPSTREAM}/chat/completions",
            headers=headers,
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": user_msg},
                ],
                "temperature": temperature,
            },
        )
    if resp.status_code != 200:
        raise HTTPException(
            502, f"LLM returned {resp.status_code}: {resp.text[:200]}"
        )
    body = resp.json()
    try:
        return body["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError) as e:
        raise HTTPException(502, "unexpected LLM response shape") from e


@app.post("/api/demo/synaptic-memory/ask")
async def synaptic_ask(req: AskRequest) -> dict[str, Any]:
    # 1) retrieve context via MCP
    try:
        search_raw = await bridge.call_tool(
            "synaptic-memory",
            "knowledge_search",
            {"query": req.query, "limit": req.limit},
        )
    except Exception as e:
        raise HTTPException(500, f"retrieval failed: {e}") from e

    hits = _parse_search_result(search_raw)

    # When targeted retrieval misses, fall back to a graph-level overview:
    # give the LLM the list of ingested document titles + a few sample
    # chunks so it can answer meta questions ("what's in here?",
    # "summarize this knowledge base") instead of going dead.
    if not hits:
        try:
            export_raw = await bridge.call_tool(
                "synaptic-memory",
                "knowledge_export",
                {"output_format": "json"},
            )
        except Exception:
            export_raw = {}

        inner = _unwrap_mcp_text(export_raw)
        overview_nodes: list[dict[str, Any]] = []
        if isinstance(inner, dict):
            overview_nodes = inner.get("nodes") or []

        if not overview_nodes:
            return {
                "answer": (
                    "The knowledge graph is empty. Upload a document first, "
                    "then ask questions about its contents."
                ),
                "sources": [],
                "model": req.model,
            }

        # Group nodes by source (document) for a compact overview.
        by_source: dict[str, dict[str, Any]] = {}
        for n in overview_nodes:
            src = (n.get("source") or "(untitled)").strip() or "(untitled)"
            title = n.get("title") or "(no title)"
            if src not in by_source:
                by_source[src] = {
                    "source": src,
                    "titles": set(),
                    "sample": (n.get("content") or "")[:160],
                    "chunk_count": 0,
                }
            # Strip the "[n/m]" suffix that add_document appends so we
            # group chunks of the same doc under a single title.
            stripped = title.split(" [")[0]
            by_source[src]["titles"].add(stripped)
            by_source[src]["chunk_count"] += 1

        overview_lines: list[str] = []
        for entry in by_source.values():
            title_list = " / ".join(sorted(entry["titles"]))
            overview_lines.append(
                f"- {title_list} ({entry['chunk_count']} chunks) — {entry['sample'].strip()}"
            )
        overview_text = "\n".join(overview_lines[:10])

        system_msg = (
            "You are a concise knowledge-base concierge. You will be given "
            "a list of documents currently loaded in the knowledge graph. "
            "When the user asks a meta question like 'what's here?' or "
            "'summarize this', answer in 2–4 sentences describing what "
            "documents are available and what topics they cover. Then "
            "suggest 2-3 specific questions the user could ask next. "
            "IMPORTANT: Detect the language of the user's question and "
            "respond in that exact language. If the question is in English, "
            "answer in English. If in Korean, answer in Korean."
        )
        user_msg = (
            f"Documents currently in the knowledge graph:\n\n{overview_text}\n\n"
            f"User's question: {req.query}\n\nAnswer:"
        )

        try:
            answer = await _chat_complete(
                req.model, system_msg, user_msg, temperature=0.3
            )
        except HTTPException:
            # Key missing or upstream 4xx/5xx: fall back to a plain text
            # listing so the demo still answers instead of going dead.
            answer = (
                "The knowledge graph contains the following documents:\n\n"
                + overview_text
                + "\n\nAsk a specific question about their contents."
            )

        return {
            "answer": answer,
            "sources": [],
            "model": req.model,
            "is_overview": True,
        }

    # 2) build grounded prompt
    context_blocks: list[str] = []
    for i, h in enumerate(hits, start=1):
        snippet = (h.get("content") or "").strip()
        title = h.get("title") or f"Source {i}"
        # trim individual chunks to keep prompt compact
        snippet = snippet[:700]
        context_blocks.append(f"[{i}] {title}\n{snippet}")

    system_msg = (
        "You are a precise assistant that answers questions using ONLY the "
        "provided source excerpts. Write concise, natural-language answers in "
        "the same language as the user question (Korean or English). Cite "
        "sources with bracket notation like [1] or [2] after the relevant "
        "claim. If the sources do not contain the answer, say so explicitly."
    )
    user_msg = (
        f"Sources:\n\n{chr(10).join(context_blocks)}\n\n"
        f"Question: {req.query}\n\nAnswer:"
    )

    # 3) call OpenAI directly (proxy route exists for synaptic-mcp only).
    answer = await _chat_complete(req.model, system_msg, user_msg, temperature=0.2)

    sources = [
        {
            "id": h.get("id"),
            "title": h.get("title"),
            "score": h.get("score"),
            "content": (h.get("content") or "")[:200],
        }
        for h in hits
    ]

    return {
        "answer": answer,
        "sources": sources,
        "model": req.model,
    }


# ── OpenAI proxy (server-side Authorization injection) ─────────────────────
# Used by synaptic-mcp's embedder (no --api-key CLI option upstream).
# synaptic-mcp hits http://localhost:8000/openai-proxy/v1/embeddings (no auth)
# → this handler adds Authorization: Bearer $OPENAI_API_KEY and forwards
# → response is returned verbatim.
# In-process handlers use _chat_complete() directly to avoid a socket hop.


@app.api_route(
    "/openai-proxy/v1/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
)
async def openai_proxy(path: str, request: Request) -> Response:
    upstream_url = f"{OPENAI_UPSTREAM}/{path}"
    body = await request.body()
    forwarded_headers = {
        "Content-Type": request.headers.get("content-type", "application/json"),
    }
    if LLM_API_KEY:
        forwarded_headers["Authorization"] = f"Bearer {LLM_API_KEY}"
    async with httpx.AsyncClient(timeout=120) as client:
        upstream = await client.request(
            request.method,
            upstream_url,
            content=body,
            headers=forwarded_headers,
            params=dict(request.query_params),
        )
    # pass-through body + status, strip hop-by-hop headers
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        media_type=upstream.headers.get("content-type", "application/json"),
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
