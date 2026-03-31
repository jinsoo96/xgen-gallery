import tempfile
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException

router = APIRouter(tags=["doc2chunk"])


@router.post("/run")
async def run(
    file: UploadFile = File(...),
    chunk_size: int = Form(1000),
    chunk_overlap: int = Form(200),
):
    try:
        from xgen_doc2chunk import DocumentProcessor

        suffix = os.path.splitext(file.filename)[1] or ".txt"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        try:
            processor = DocumentProcessor()
            result = processor.extract_chunks(
                tmp_path,
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
            )
            text = result.text if hasattr(result, "text") else ""
            chunks = [
                {"index": i, "text": c, "metadata": {}}
                for i, c in enumerate(result.chunks)
            ]
            return {"text": text, "chunks": chunks}
        finally:
            os.unlink(tmp_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
