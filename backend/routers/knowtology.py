from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(tags=["knowtology"])


class KnowtologyRequest(BaseModel):
    chunks: List[str]
    query: Optional[str] = None
    collection_id: Optional[str] = "demo"


@router.post("/run")
async def run(req: KnowtologyRequest):
    try:
        import knowtology  # noqa: F401
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="knowtology is not yet published to PyPI. Install from source: pip install git+https://github.com/PlateerLab/Knowtology.git",
        )

    try:
        from knowtology import KnowledgeMapTools
        from knowtology.adapters.memory import (
            InMemoryTreeStore,
            InMemoryVectorStore,
            InMemoryTextStore,
        )

        chunk_dicts = [
            {"text": text, "chunk_id": f"chunk-{i}", "chunk_index": i}
            for i, text in enumerate(req.chunks)
        ]

        tree_store = InMemoryTreeStore()
        vector_store = InMemoryVectorStore()
        text_store = InMemoryTextStore()

        for c in chunk_dicts:
            await vector_store.add(req.collection_id, c)
            await text_store.add(req.collection_id, c)

        tools = KnowledgeMapTools(
            collection_id=req.collection_id,
            tree_store=tree_store,
            vector_store=vector_store,
            text_store=text_store,
            top_k=5,
        )

        result: dict = {}
        if req.query:
            result["semantic_search"] = str(await tools.search_chunks(req.query))
            result["keyword_search"] = str(await tools.search_keyword(req.query))
        else:
            result["tree"] = str(await tools.browse_tree("root"))

        result["chunks_indexed"] = len(req.chunks)
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
