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

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
