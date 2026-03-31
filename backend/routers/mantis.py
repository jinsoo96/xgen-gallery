from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Any

router = APIRouter(tags=["mantis-engine"])


class MantisRequest(BaseModel):
    workflow_json: dict
    input_data: Optional[dict] = None


@router.post("/run")
async def run(req: MantisRequest):
    try:
        from mantis import WorkflowRuntime

        runtime = WorkflowRuntime()
        events = []

        async for event in runtime.execute(req.workflow_json, req.input_data or {}):
            events.append(event)
            if event.get("type") == "workflow_complete":
                break

        final = next(
            (e for e in events if e.get("type") == "workflow_complete"),
            None,
        )
        return {
            "events": events,
            "result": final.get("results") if final else None,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
