from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["googer"])


class SearchRequest(BaseModel):
    query: str
    search_type: Optional[str] = "web"
    max_results: Optional[int] = 10
    region: Optional[str] = "ko-kr"
    timelimit: Optional[str] = None


@router.post("/run")
async def run(req: SearchRequest):
    try:
        from googer import Googer

        g = Googer()
        results = []

        if req.search_type == "images":
            raw = g.images(req.query, max_results=req.max_results)
            results = [
                {"title": r.title, "url": str(r.image), "body": r.title}
                for r in raw
            ]
        elif req.search_type == "news":
            raw = g.news(
                req.query,
                max_results=req.max_results,
                timelimit=req.timelimit,
            )
            results = [
                {
                    "title": r.title,
                    "url": str(r.url),
                    "body": getattr(r, "body", "") or "",
                    "source": getattr(r, "source", ""),
                    "date": str(getattr(r, "date", "") or ""),
                }
                for r in raw
            ]
        elif req.search_type == "videos":
            raw = g.videos(req.query, max_results=req.max_results)
            results = [
                {
                    "title": r.title,
                    "url": str(r.url),
                    "body": getattr(r, "description", "") or "",
                    "duration": str(getattr(r, "duration", "") or ""),
                }
                for r in raw
            ]
        else:
            raw = g.search(
                req.query,
                region=req.region,
                max_results=req.max_results,
            )
            results = [
                {"title": r.title, "url": str(r.href), "body": r.body or ""}
                for r in raw
            ]

        return {"results": results, "count": len(results), "query": req.query}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
