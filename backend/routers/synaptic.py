from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["synaptic-memory"])

# 인메모리 그래프 (서버 수명 동안 유지)
_graph = None


async def get_graph():
    global _graph
    if _graph is None:
        from synaptic import SynapticGraph
        _graph = SynapticGraph.memory()
    return _graph


class SynapticRequest(BaseModel):
    operation: str  # "add" | "search" | "stats"
    title: Optional[str] = None
    content: Optional[str] = None
    query: Optional[str] = None


@router.post("/run")
async def run(req: SynapticRequest):
    try:
        graph = await get_graph()

        if req.operation == "add":
            if not req.title or not req.content:
                raise HTTPException(status_code=400, detail="title and content required for add")
            node = await graph.add(req.title, req.content)
            return {
                "operation": "add",
                "result": {
                    "id": str(node.id),
                    "title": node.title,
                    "kind": str(node.kind),
                    "tags": node.tags,
                },
            }

        elif req.operation == "search":
            if not req.query:
                raise HTTPException(status_code=400, detail="query required for search")
            results = await graph.search(req.query, top_k=5)
            return {
                "operation": "search",
                "result": [
                    {
                        "id": str(r.node.id),
                        "title": r.node.title,
                        "content": r.node.content[:200],
                        "score": round(r.score, 4),
                    }
                    for r in results
                ],
            }

        elif req.operation == "stats":
            stats = await graph.stats()
            return {"operation": "stats", "result": stats}

        else:
            raise HTTPException(status_code=400, detail=f"Unknown operation: {req.operation}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
