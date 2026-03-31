# XGen Playground API

PlateerLab 오픈소스 프로젝트를 웹에서 데모로 실행할 수 있는 FastAPI 백엔드입니다.

## 설치 및 실행

```bash
cd C:\workspace\xgen-playground-api

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API 엔드포인트

| 프로젝트 | 엔드포인트 | 방식 |
|---|---|---|
| Contextifier | POST /api/demo/contextifier/run | multipart/form-data |
| xgen-doc2chunk | POST /api/demo/doc2chunk/run | multipart/form-data |
| f2a | POST /api/demo/f2a/run | multipart/form-data |
| f2a (URL) | POST /api/demo/f2a/run-url | JSON |
| googer | POST /api/demo/googer/run | JSON |
| synaptic-memory | POST /api/demo/synaptic-memory/run | JSON |
| Knowtology | POST /api/demo/knowtology/run | JSON |
| mantis-engine | POST /api/demo/mantis-engine/run | JSON |
| Toolint | POST /api/demo/toolint/run | JSON |

## Swagger UI

서버 실행 후 http://localhost:8000/docs 에서 확인 가능합니다.

## xgen-frontend 연결

`gallery/page.tsx`에서 apiBaseUrl prop을 추가합니다:

```tsx
<XgenGallery org="PlateerLab" theme={theme} apiBaseUrl="http://localhost:8000" />
```
