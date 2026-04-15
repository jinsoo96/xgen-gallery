FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# knowtology는 PyPI에 없을 수 있으므로 실패해도 계속 진행
RUN pip install --no-cache-dir -r requirements.txt || \
    (echo "Some packages failed, installing without knowtology..." && \
     grep -v knowtology requirements.txt | pip install --no-cache-dir -r /dev/stdin)

# ── Post-install patch: lower HybridSearch vector threshold 0.45 → 0.30 ──
# Rationale: Synaptic is tuned for BAAI/bge-m3-class models whose cosine
# distribution peaks high. We use OpenAI text-embedding-3-small via a proxy
# whose real cosines for relevant pairs typically land in 0.30–0.55. The
# default 0.45 gate filters out valid semantic hits. This patch is a demo
# workaround — the right fix is to make the threshold configurable upstream.
RUN SEARCH_PY=$(python -c "import synaptic.search as s; print(s.__file__)") \
    && sed -i 's/cos >= 0\.45/cos >= 0.30/g' "$SEARCH_PY" \
    && grep -n "cos >= 0\.30" "$SEARCH_PY" || echo "WARNING: patch did not apply"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
