"use client";

import { useEffect, useState } from "react";

/**
 * 블로그 글 조회수. 백엔드(FastAPI) /api/views/{slug} 를 호출한다.
 * - 세션당 1회만 POST(증가), 그 뒤에는 GET(읽기)로 중복 카운트를 막는다.
 * - 백엔드 미배포/오류 시에는 조용히 아무것도 렌더하지 않는다(디그레이드).
 */
const API =
    process.env.NEXT_PUBLIC_GALLERY_API_URL || "http://localhost:8800";

export function ViewCount({ slug }: { slug: string }) {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const key = `viewed:${slug}`;
        const seen = sessionStorage.getItem(key) === "1";
        const url = `${API}/api/views/${encodeURIComponent(slug)}`;
        fetch(url, { method: seen ? "GET" : "POST" })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (d && typeof d.count === "number") setCount(d.count);
                if (!seen) sessionStorage.setItem(key, "1");
            })
            .catch(() => {});
    }, [slug]);

    if (count === null) return null;
    return (
        <>
            <span aria-hidden>·</span>
            <span>Views | {count.toLocaleString()}</span>
        </>
    );
}
