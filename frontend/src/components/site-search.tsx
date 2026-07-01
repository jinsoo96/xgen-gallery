"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

type Doc = {
    title: string;
    subtitle?: string;
    url: string;
    type: string;
    keywords?: string;
};

/** 전역 사이트 검색 — 트리거 버튼 + ⌘K 모달. /api/search-index 인덱스를 퍼지 검색. */
export function SiteSearch({ light = false }: { light?: boolean }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [docs, setDocs] = useState<Doc[] | null>(null);
    const [q, setQ] = useState("");
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // ⌘K / Ctrl+K 토글
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // 열릴 때: 인덱스 로드(1회) + 포커스, 닫힐 때: 초기화
    useEffect(() => {
        if (open) {
            if (!docs) {
                fetch("/api/search-index")
                    .then((r) => r.json())
                    .then((d) => setDocs(d.docs ?? []))
                    .catch(() => setDocs([]));
            }
            const t = setTimeout(() => inputRef.current?.focus(), 10);
            document.body.style.overflow = "hidden";
            return () => {
                clearTimeout(t);
                document.body.style.overflow = "";
            };
        } else {
            setQ("");
            setActive(0);
        }
    }, [open, docs]);

    const results = useMemo(() => {
        if (!docs) return [];
        const query = q.trim().toLowerCase();
        if (!query) return docs.slice(0, 8);
        const terms = query.split(/\s+/).filter(Boolean);
        return docs
            .map((d) => {
                const title = d.title.toLowerCase();
                const hay = `${title} ${d.subtitle ?? ""} ${d.keywords ?? ""}`.toLowerCase();
                let score = 0;
                for (const t of terms) {
                    if (!hay.includes(t)) return { d, score: -1 };
                    if (title.startsWith(t)) score += 12;
                    else if (title.includes(t)) score += 8;
                    score += 1;
                }
                return { d, score };
            })
            .filter((x) => x.score >= 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 24)
            .map((x) => x.d);
    }, [docs, q]);

    useEffect(() => setActive(0), [q]);
    useEffect(() => {
        const el = listRef.current?.querySelector<HTMLElement>(
            `[data-idx="${active}"]`,
        );
        el?.scrollIntoView({ block: "nearest" });
    }, [active]);

    const go = (url: string) => {
        setOpen(false);
        router.push(url);
    };

    const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const r = results[active];
            if (r) go(r.url);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <>
            {/* 트리거 */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="사이트 검색 (⌘K)"
                className={cn(
                    "flex w-full items-center gap-2.5 rounded-full border px-4 py-2 text-[13.5px] transition",
                    light
                        ? "border-white/25 bg-white/5 text-white/70 hover:bg-white/10"
                        : "border-[var(--color-line)] bg-[var(--color-surface-alt)] text-[var(--color-ink-subtle)] hover:border-[var(--color-ink-muted)]",
                )}
            >
                <Search className="h-4 w-4 flex-none" />
                <span className="flex-1 text-left">검색…</span>
                <kbd
                    className={cn(
                        "hidden flex-none rounded border px-1.5 py-0.5 font-mono text-[11px] sm:inline",
                        light ? "border-white/25 text-white/60" : "border-[var(--color-line)] text-[var(--color-ink-subtle)]",
                    )}
                >
                    ⌘K
                </kbd>
            </button>

            {/* 모달 */}
            {open && (
                <div
                    className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 입력 */}
                        <div className="flex items-center gap-3 border-b border-[var(--color-line)] px-4">
                            <Search className="h-5 w-5 flex-none text-[var(--color-ink-subtle)]" />
                            <input
                                ref={inputRef}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                onKeyDown={onInputKey}
                                placeholder="페이지 · 문서 · 블로그 · 도구 검색…"
                                className="w-full bg-transparent py-4 text-[16px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-subtle)]"
                            />
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex-none rounded-md border border-[var(--color-line)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-ink-subtle)]"
                            >
                                esc
                            </button>
                        </div>

                        {/* 결과 */}
                        <ul
                            ref={listRef}
                            className="max-h-[52vh] overflow-y-auto p-2"
                        >
                            {docs === null ? (
                                <li className="px-3 py-8 text-center text-[14px] text-[var(--color-ink-subtle)]">
                                    불러오는 중…
                                </li>
                            ) : results.length === 0 ? (
                                <li className="px-3 py-8 text-center text-[14px] text-[var(--color-ink-subtle)]">
                                    검색 결과가 없습니다
                                </li>
                            ) : (
                                results.map((r, i) => (
                                    <li key={`${r.url}-${i}`} data-idx={i}>
                                        <button
                                            type="button"
                                            onMouseEnter={() => setActive(i)}
                                            onClick={() => go(r.url)}
                                            className={cn(
                                                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                                                active === i
                                                    ? "bg-[#2f7bff]/10"
                                                    : "hover:bg-[var(--color-surface-alt)]",
                                            )}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-[14.5px] font-semibold text-[var(--color-ink)]">
                                                    {r.title}
                                                </div>
                                                {r.subtitle && (
                                                    <div className="truncate text-[12.5px] text-[var(--color-ink-muted)]">
                                                        {r.subtitle}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="flex-none rounded-full border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--color-ink-subtle)]">
                                                {r.type}
                                            </span>
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>

                        {/* 푸터 힌트 */}
                        <div className="flex items-center gap-4 border-t border-[var(--color-line)] px-4 py-2.5 text-[11.5px] text-[var(--color-ink-subtle)]">
                            <span>↑↓ 이동</span>
                            <span>↵ 열기</span>
                            <span>esc 닫기</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
