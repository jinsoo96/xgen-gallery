# XGen Playground API

PlateerLab 오픈소스 라이브러리들을 웹 데모로 노출하는 FastAPI 백엔드입니다. 일부 라이브러리는 직접 import로, 일부는 MCP subprocess bridge로 구동됩니다.

## 실행

### Docker (권장)

루트의 `docker-compose.yml`로 프론트엔드와 함께 기동합니다.

```bash
cd ..
docker compose up -d --build backend
```

### 로컬

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Swagger UI: http://localhost:8000/docs

## 환경 변수

| 변수 | 설명 | 예시 |
|---|---|---|
| `LLM_BASE_URL` | OpenAI 호환 chat/completions base URL | `https://api.openai.com/v1` |
| `LLM_MODEL` | 기본 LLM 모델 | `gpt-4o-mini`, `Qwen3.5-27b` |
| `LLM_API_KEY` | LLM 인증 키 (vLLM 무인증이면 비움) | `sk-...` |
| `SYNAPTIC_EMBED_URL` | 임베딩 엔드포인트 base URL (내부에서 `/embeddings` 자동 append) | `https://api.openai.com/v1` |
| `SYNAPTIC_EMBED_MODEL` | 임베딩 모델명 | `text-embedding-3-small`, `Qwen/Qwen3-Embedding-8B` |
| `SYNAPTIC_DB` | synaptic-memory SQLite 경로 | `/tmp/synaptic.db` |
| `OPENAI_API_KEY` | 레거시 `/openai-proxy/v1/*` 경로용 | - |

## 엔드포인트

### 직접 import 데모 (`/api/demo/*`)

라이브러리 import로 즉시 호출되는 가벼운 라우터들입니다.

| 라이브러리 | Method | 경로 |
|---|---|---|
| Contextifier | POST | `/api/demo/contextifier/run` |
| xgen-doc2chunk | POST | `/api/demo/doc2chunk/run` |
| f2a | POST | `/api/demo/f2a/run` |
| f2a (URL) | POST | `/api/demo/f2a/run-url` |
| googer | POST | `/api/demo/googer/run` |
| Knowtology | POST | `/api/demo/knowtology/run` |
| mantis-engine | POST | `/api/demo/mantis-engine/run` |
| Toolint | POST | `/api/demo/toolint/run` |

### MCP Bridge (`/api/mcp/*`)

`mcp_servers.py`에 등록된 MCP 서버를 subprocess로 띄우고 호출합니다. 현재 `synaptic-memory`가 등록되어 있습니다.

| Method | 경로 | 설명 |
|---|---|---|
| GET | `/api/mcp/registered` | 등록된 MCP 라이브러리 목록 |
| GET | `/api/mcp/{lib}/tools` | 해당 MCP 서버가 노출하는 툴 목록 |
| POST | `/api/mcp/{lib}/call/{tool}` | MCP 툴 호출 (body = JSON arguments) |

예시:

```bash
# synaptic-memory에 문서 추가
curl -X POST http://localhost:8000/api/mcp/synaptic-memory/call/knowledge_add_document \
  -H "Content-Type: application/json" \
  -d '{"title":"example","content":"...","source":"docs"}'

# 지식 그래프 검색
curl -X POST http://localhost:8000/api/mcp/synaptic-memory/call/knowledge_search \
  -H "Content-Type: application/json" \
  -d '{"query":"what is synaptic memory?","limit":5}'
```

### Synaptic RAG (`/api/demo/synaptic-memory/ask`)

retrieval → LLM 체인을 한 번에 돌리는 고수준 RAG 엔드포인트입니다.

```bash
curl -X POST http://localhost:8000/api/demo/synaptic-memory/ask \
  -H "Content-Type: application/json" \
  -d '{"query":"어떤 임베딩 모델을 쓰나요?","limit":5}'
```

응답:

```json
{
  "answer": "Qwen3-Embedding-8B를 사용합니다 [1].",
  "sources": [
    { "id": "...", "title": "...", "score": 0.91, "content": "..." }
  ],
  "model": "Qwen3.5-27b"
}
```

- 1) MCP bridge로 `knowledge_search` 호출
- 2) 히트가 없으면 `knowledge_export` fallback으로 문서 overview 생성
- 3) `LLM_MODEL`로 chat/completions 직접 호출, 소스 인용 포함 응답

### OpenAI Proxy (`/openai-proxy/v1/*`)

synaptic-mcp 등 **인증 헤더를 설정할 수 없는 MCP 서버**가 임베딩을 호출할 때 쓰는 투명 프록시입니다. `LLM_API_KEY` 또는 `OPENAI_API_KEY`가 있으면 `Authorization` 헤더를 주입해 업스트림(`LLM_BASE_URL`)으로 전달합니다. 키가 없으면 헤더 없이 그대로 전달 (vLLM 같은 무인증 엔드포인트 대응).

> 현재 synaptic-memory는 `SYNAPTIC_EMBED_URL`로 직접 붙기 때문에 이 프록시는 레거시 호환용으로만 남아 있습니다.

### 기타

| Method | 경로 | 설명 |
|---|---|---|
| GET | `/health` | 헬스체크 |

## MCP 서버 추가

새 라이브러리를 MCP bridge로 노출하려면 `mcp_servers.py`에 엔트리를 추가합니다:

```python
MCP_SERVERS = {
    "synaptic-memory": {
        "command": "python",
        "args": ["-m", "synaptic.mcp"],
        "env": {...},
    },
    # 추가:
    # "my-lib": {"command": "...", "args": [...], "env": {...}},
}
```

이후 `/api/mcp/registered`에 자동 노출되고, `bridge.call_tool("my-lib", "tool_name", args)`로 호출할 수 있습니다.
