from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import contextifier, doc2chunk, f2a, googer, synaptic, knowtology, mantis, toolint

app = FastAPI(title="XGen Playground API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contextifier.router, prefix="/api/demo/contextifier")
app.include_router(doc2chunk.router, prefix="/api/demo/doc2chunk")
app.include_router(f2a.router, prefix="/api/demo/f2a")
app.include_router(googer.router, prefix="/api/demo/googer")
app.include_router(synaptic.router, prefix="/api/demo/synaptic-memory")
app.include_router(knowtology.router, prefix="/api/demo/knowtology")
app.include_router(mantis.router, prefix="/api/demo/mantis-engine")
app.include_router(toolint.router, prefix="/api/demo/toolint")


@app.get("/health")
def health():
    return {"status": "ok"}
