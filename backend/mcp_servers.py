"""Registry of MCP server launch configurations per library.

Add a new entry here when a library ships its own MCP server.
The generic mcp_bridge will spawn it as a stdio subprocess.

Environment variables (optional):
    SYNAPTIC_DB         Path to SQLite knowledge graph file
                        default: /tmp/synaptic.db
    SYNAPTIC_EMBED_URL  OpenAI-compatible /v1 endpoint for embeddings
                        Enables semantic search when set.
                        e.g. http://host.docker.internal:11434/v1 (Ollama)
                             http://embedder:8080/v1 (local TEI service)
    SYNAPTIC_EMBED_MODEL Embedding model name
                        default: default
                        Ollama e.g.: nomic-embed-text, bge-m3
"""
from __future__ import annotations

import os


def _synaptic_args() -> list[str]:
    args: list[str] = [
        "--db",
        os.environ.get("SYNAPTIC_DB", "/tmp/synaptic.db"),
    ]
    embed_url = os.environ.get("SYNAPTIC_EMBED_URL", "").strip()
    if embed_url:
        args += ["--embed-url", embed_url]
        args += [
            "--embed-model",
            os.environ.get("SYNAPTIC_EMBED_MODEL", "default"),
        ]
    return args


MCP_SERVERS: dict[str, dict] = {
    "synaptic-memory": {
        "command": "synaptic-mcp",
        "args": _synaptic_args(),
        "env": None,
    },
    # Future entries:
    # "contextifier": {"command": "python", "args": ["-m", "contextifier.mcp"]},
    # ...
}
