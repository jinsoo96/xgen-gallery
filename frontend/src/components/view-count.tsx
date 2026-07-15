"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

/**
 * 블로그 글 조회수. 백엔드(FastAPI) /api/views/{slug} 를 호출한다.
 * - 세션당 1회만 POST(증가), 그 뒤에는 GET(읽기)로 중복 카운트를 막는다.
 * - readOnly(목록 카드 등)면 절대 증가시키지 않고 GET으로 읽기만 한다.
 * - 백엔드 미배포/오류 시에는 조용히 아무것도 렌더하지 않는다(디그레이드).
 */
const API =
    process.env.NEXT_PUBLIC_GALLERY_API_URL || "http://localhost:8800";

export function ViewCount({
    slug,
    readOnly = false,
    compact = false,
}: {
    slug: string;
    /** 목록 등에서 카운트 증가 없이 읽기만. */
    readOnly?: boolean;
    /** 눈 아이콘 + 숫자만 간결하게. */
    compact?: boolean;
}) {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const key = `viewed:${slug}`;
        const seen = sessionStorage.getItem(key) === "1";
        const method = readOnly || seen ? "GET" : "POST";
        const url = `${API}/api/views/${encodeURIComponent(slug)}`;
        fetch(url, { method })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (d && typeof d.count === "number") setCount(d.count);
                if (!readOnly && !seen) sessionStorage.setItem(key, "1");
            })
            .catch(() => {});
    }, [slug, readOnly]);

    if (count === null) return null;

    if (compact) {
        return (
            <span className="inline-flex items-center gap-1 tabular-nums">
                <Eye className="h-3.5 w-3.5" aria-hidden />
                {count.toLocaleString()}
            </span>
        );
    }

    return (
        <>
            <span aria-hidden>·</span>
            <span>Views | {count.toLocaleString()}</span>
        </>
    );
}
