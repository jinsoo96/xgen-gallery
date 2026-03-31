import tempfile
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException

router = APIRouter(tags=["contextifier"])


@router.post("/run")
async def run(
    file: UploadFile = File(...),
    mode: str = Form("chunk"),
    chunk_size: int = Form(1000),
):
    try:
        from contextifier import DocumentProcessor
        from contextifier.config import ProcessingConfig, ChunkingConfig

        suffix = os.path.splitext(file.filename)[1] or ".txt"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        try:
            config = ProcessingConfig(
                chunking=ChunkingConfig(chunk_size=chunk_size, chunk_overlap=200),
            )
            processor = DocumentProcessor(config=config)

            if mode == "chunk":
                result = processor.extract_chunks(tmp_path)
                text = result.text if hasattr(result, "text") else ""
                chunks = [
                    {"index": i, "text": c, "metadata": {}}
                    for i, c in enumerate(result.chunks)
                ]
            else:
                text = processor.extract_text(tmp_path)
                chunks = []

            metadata = {
                "filename": file.filename,
                "mode": mode,
                "chunk_size": chunk_size,
                "chunk_count": len(chunks),
            }
            return {"text": text, "chunks": chunks, "metadata": metadata}
        finally:
            os.unlink(tmp_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
