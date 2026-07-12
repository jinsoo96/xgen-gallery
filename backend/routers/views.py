"""블로그 글 조회수 카운터 — SQLite 백엔드.

- POST /api/views/{slug} : 조회수 +1 후 현재값 반환
- GET  /api/views/{slug} : 현재값만 반환(증가 없음)

DB 파일은 환경변수 VIEWS_DB 로 지정한다(기본 /tmp/views.db). 운영에서는
도커 볼륨에 마운트된 경로(예: /data/views.db)를 주어 재빌드에도 값이 유지되게 한다.
"""

import os
import sqlite3

from fastapi import APIRouter

router = APIRouter()

DB_PATH = os.environ.get("VIEWS_DB", "/tmp/views.db")


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS views ("
        "slug TEXT PRIMARY KEY, count INTEGER NOT NULL DEFAULT 0)"
    )
    return conn


@router.post("/{slug}")
def increment(slug: str) -> dict[str, object]:
    with _conn() as conn:
        conn.execute(
            "INSERT INTO views(slug, count) VALUES(?, 1) "
            "ON CONFLICT(slug) DO UPDATE SET count = count + 1",
            (slug,),
        )
        row = conn.execute(
            "SELECT count FROM views WHERE slug = ?", (slug,)
        ).fetchone()
    return {"slug": slug, "count": row[0] if row else 0}


@router.get("/{slug}")
def get(slug: str) -> dict[str, object]:
    with _conn() as conn:
        row = conn.execute(
            "SELECT count FROM views WHERE slug = ?", (slug,)
        ).fetchone()
    return {"slug": slug, "count": row[0] if row else 0}
