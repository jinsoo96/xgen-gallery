"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { PostMeta } from "@/lib/blog";
import { cn } from "@/lib/cn";

const ALL = "전체";
const TABS = [ALL, "제품 소식", "Tech News", "Case Study"] as const;
type Tab = (typeof TABS)[number];

/** GNB 서브메뉴 딥링크용: /blog?cat=<key> → 카테고리 라벨. */
const CATEGORY_BY_KEY: Record<string, Tab> = {
    product: "제품 소식",
    labs: "Tech News",
    case: "Case Study",
};
const KEY_BY_CATEGORY: Partial<Record<Tab, string>> = {
    "제품 소식": "product",
    "Tech News": "labs",
    "Case Study": "case",
};

function fmtDate(d: string) {
    return d.replaceAll("-", ".");
}

export function BlogList({ posts }: { posts: PostMeta[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    // 활성 카테고리는 URL(?cat=)에서 반응형으로 읽는다. /blog에 머문 상태에서 다른
    // 카테고리 서브메뉴를 눌러 URL만 바뀌어도(리마운트 없이) 필터가 갱신된다.
    const key = searchParams.get("cat");
    const active: Tab = (key && CATEGORY_BY_KEY[key]) || ALL;

    // 탭 클릭도 URL을 갱신해 단일 소스로 통일(공유 가능한 링크 + 서브메뉴와 일치).
    const selectTab = (t: Tab) => {
        const k = KEY_BY_CATEGORY[t];
        router.replace(k ? `/blog?cat=${k}` : "/blog", { scroll: false });
    };

    const filtered =
        active === ALL ? posts : posts.filter((p) => p.category === active);

    return (
        <div>
            {/* 카테고리 탭 */}
            <div className="flex flex-wrap gap-2 border-b border-[var(--color-line)] pb-4">
                {TABS.map((t) => {
                    const count =
                        t === ALL
                            ? posts.length
                            : posts.filter((p) => p.category === t).length;
                    return (
                        <button
                            key={t}
                            type="button"
                            onClick={() => selectTab(t)}
                            className={cn(
                                "rounded-full px-3.5 py-1.5 text-[15px] font-semibold transition",
                                active === t
                                    ? "bg-[var(--color-ink)] text-white"
                                    : "border border-[var(--color-line)] text-[var(--color-ink-muted)] hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]",
                            )}
                        >
                            {t}
                            <span
                                className={cn(
                                    "ml-1.5 text-[13px]",
                                    active === t ? "text-white/60" : "text-[var(--color-ink-subtle)]",
                                )}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {filtered.length === 0 ? (
                <div className="mt-8 rounded-xl border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-alt)] p-10 text-center">
                    <p className="text-[16px] text-[var(--color-ink-muted)]">
                        해당 카테고리의 글을 준비 중입니다
                    </p>
                </div>
            ) : (
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    {filtered.map((p) => (
                        <Link
                            key={p.slug}
                            href={`/blog/${p.slug}`}
                            className="group flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6 transition hover:border-[#bcd0f5] hover:shadow-[0_14px_36px_-18px_rgba(20,40,80,0.22)]"
                        >
                            <div className="flex items-center gap-2 text-[13.5px] text-[var(--color-ink-subtle)]">
                                <span className="rounded-full bg-[#2f7bff]/10 px-2.5 py-0.5 font-semibold text-[#2461d8]">
                                    {p.category}
                                </span>
                                <time dateTime={p.date}>{fmtDate(p.date)}</time>
                            </div>
                            <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight text-[var(--color-ink)]">
                                {p.title}
                            </h2>
                            <p className="mt-2.5 line-clamp-3 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                                {p.description}
                            </p>
                            <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[15px] font-semibold text-[#2461d8]">
                                읽어보기
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
