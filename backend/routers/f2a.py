import math
import os
import tempfile
from typing import Any, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

router = APIRouter(tags=["f2a"])


class UrlRequest(BaseModel):
    source: str
    analysis_type: Optional[str] = "fast"
    language: Optional[str] = "ko"


def _sanitize(value: Any) -> Any:
    """Recursively replace NaN/Inf with None for JSON compliance."""
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return value
    if isinstance(value, dict):
        return {k: _sanitize(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_sanitize(v) for v in value]
    return value


def _build_config(analysis_type: str):
    from f2a import AnalysisConfig

    if analysis_type == "minimal":
        return AnalysisConfig.minimal()
    if analysis_type == "basic":
        return AnalysisConfig.basic_only()
    return AnalysisConfig.fast()


def _render_report(path: str, analysis_type: str) -> dict[str, Any]:
    import f2a

    report = f2a.analyze(path, config=_build_config(analysis_type))

    with tempfile.TemporaryDirectory() as out_dir:
        html_path = report.to_html(out_dir)
        with open(html_path, "r", encoding="utf-8") as f:
            html_content = f.read()

    summary: dict[str, Any] = {}
    if hasattr(report, "stats") and hasattr(report.stats, "summary"):
        try:
            summary = report.stats.summary.to_dict()
        except Exception:
            summary = {}

    stats: dict[str, Any] = {}
    if hasattr(report, "to_dict"):
        try:
            stats = report.to_dict()
        except Exception:
            stats = {}

    return _sanitize(
        {
            "report_html": html_content,
            "summary": summary,
            "stats": stats,
            "shape": list(report.shape),
        }
    )


@router.post("/run")
async def run_file(
    file: UploadFile = File(...),
    analysis_type: str = Form("fast"),
    language: str = Form("ko"),  # accepted for UI parity; f2a reports are not localized
):
    try:
        suffix = os.path.splitext(file.filename)[1] or ".csv"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        try:
            return _render_report(tmp_path, analysis_type)
        finally:
            os.unlink(tmp_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/run-url")
async def run_url(req: UrlRequest):
    try:
        return _render_report(req.source, req.analysis_type or "fast")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
