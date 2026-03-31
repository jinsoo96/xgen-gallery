import tempfile
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["f2a"])


class UrlRequest(BaseModel):
    source: str
    analysis_type: Optional[str] = "fast"


@router.post("/run")
async def run_file(
    file: UploadFile = File(...),
    analysis_type: str = Form("fast"),
):
    try:
        import f2a
        from f2a import AnalysisConfig

        suffix = os.path.splitext(file.filename)[1] or ".csv"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        try:
            if analysis_type == "fast":
                config = AnalysisConfig.fast()
            elif analysis_type == "minimal":
                config = AnalysisConfig.minimal()
            else:
                config = AnalysisConfig.basic_only()

            report = f2a.analyze(tmp_path, config=config)

            with tempfile.TemporaryDirectory() as out_dir:
                html_path = report.to_html(out_dir)
                with open(html_path, "r", encoding="utf-8") as f:
                    html_content = f.read()

            summary = {}
            if hasattr(report, "stats") and hasattr(report.stats, "summary"):
                try:
                    summary = report.stats.summary.to_dict()
                except Exception:
                    summary = {}

            return {"html": html_content, "summary": summary, "shape": list(report.shape)}
        finally:
            os.unlink(tmp_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/run-url")
async def run_url(req: UrlRequest):
    try:
        import f2a
        from f2a import AnalysisConfig

        if req.analysis_type == "fast":
            config = AnalysisConfig.fast()
        elif req.analysis_type == "minimal":
            config = AnalysisConfig.minimal()
        else:
            config = AnalysisConfig.basic_only()

        report = f2a.analyze(req.source, config=config)

        with tempfile.TemporaryDirectory() as out_dir:
            html_path = report.to_html(out_dir)
            with open(html_path, "r", encoding="utf-8") as f:
                html_content = f.read()

        return {"html": html_content, "shape": list(report.shape)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
