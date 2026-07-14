"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { PostMeta } from "@/lib/blog";
import { cn } from "@/lib/cn";

const ALL = "전체";
const TABS = [ALL, "제품 소식", "Tech Note", "Case Study"] as const;
type Tab = (typeof TABS)[number];

/** GNB 서브메뉴 딥링크용: /blog?cat=<key> → 카테고리 라벨. */
const CATEGORY_BY_KEY: Record<string, Tab> = {
    product: "제품 소식",
    labs: "Tech Note",
    case: "Case Study",
};
const KEY_BY_CATEGORY: Partial<Record<Tab, string>> = {
    "제품 소식": "product",
    "Tech Note": "labs",
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
    // 주제(태그) 필터 — 카테고리와 AND로 조합. URL ?tag= 에서 읽는다.
    const activeTag = searchParams.get("tag");
    // 작성자 필터 — 멤버 카드의 "더보기"에서 진입. URL ?author= 에서 읽는다.
    const activeAuthor = searchParams.get("author");

    // author 필터는 최상위 스코프 — 카테고리/태그/카운트 모두 이 집합에서 파생된다.
    const scoped = useMemo(
        () => (activeAuthor ? posts.filter((p) => p.author === activeAuthor) : posts),
        [posts, activeAuthor],
    );

    // cat/tag/author 세 파라미터를 함께 관리하는 단일 URL 빌더(author는 기본 유지).
    const pushParams = (
        catKey: string | undefined,
        tag: string | null,
        author: string | null = activeAuthor,
    ) => {
        const sp = new URLSearchParams();
        if (catKey) sp.set("cat", catKey);
        if (tag) sp.set("tag", tag);
        if (author) sp.set("author", author);
        const qs = sp.toString();
        router.replace(qs ? `/blog?${qs}` : "/blog", { scroll: false });
    };

    // 탭 클릭 → 카테고리 변경 시 주제 필터는 초기화(다른 카테고리엔 없을 수 있음).
    const selectTab = (t: Tab) => pushParams(KEY_BY_CATEGORY[t], null);
    // 주제 칩 클릭 → 현재 카테고리는 유지, 같은 칩 재클릭 시 해제(토글).
    const selectTag = (tag: string) =>
        pushParams(KEY_BY_CATEGORY[active], tag === activeTag ? null : tag);

    // 현재 카테고리에 속한 글에서 주제(태그)를 빈도순으로 뽑아 칩으로 노출.
    const catPosts = useMemo(
        () => (active === ALL ? scoped : scoped.filter((p) => p.category === active)),
        [scoped, active],
    );
    const topicTags = useMemo(() => {
        const count = new Map<string, number>();
        catPosts.forEach((p) => p.tags.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
        return [...count.entries()]
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .map(([t]) => t);
    }, [catPosts]);

    const filtered = activeTag
        ? catPosts.filter((p) => p.tags.includes(activeTag))
        : catPosts;

    return (
        <div>
            {/* 작성자 필터 배너 — 멤버 글 모아보기 진입 시 */}
            {activeAuthor && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#cfe0ff] bg-[#f1f6ff] px-4 py-3">
                    <p className="text-[15px] text-[var(--color-ink-muted)]">
                        <span className="font-bold text-[var(--color-ink)]">
                            {activeAuthor}
                        </span>{" "}
                        님의 글 {scoped.length}건
                    </p>
                    <button
                        type="button"
                        onClick={() => pushParams(KEY_BY_CATEGORY[active], activeTag, null)}
                        className="text-[14px] font-semibold text-[#2461d8] transition hover:text-[#1b4fb0]"
                    >
                        전체 글 보기
                    </button>
                </div>
            )}

            {/* 카테고리 탭 */}
            <div className="flex flex-wrap gap-2 border-b border-[var(--color-line)] pb-4">
                {TABS.map((t) => {
                    const count =
                        t === ALL
                            ? scoped.length
                            : scoped.filter((p) => p.category === t).length;
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

            {/* 주제(태그) 필터 — 현재 카테고리의 주제만 노출 */}
            {topicTags.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-[13px] font-semibold text-[var(--color-ink-subtle)]">
                        주제
                    </span>
                    {activeTag && (
                        <button
                            type="button"
                            onClick={() => selectTag(activeTag)}
                            className="rounded-full border border-[var(--color-line)] px-3 py-1 text-[14px] font-medium text-[var(--color-ink-muted)] transition hover:border-[var(--color-line-strong)] hover:text-[var(--color-ink)]"
                        >
                            전체 주제
                        </button>
                    )}
                    {topicTags.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => selectTag(t)}
                            className={cn(
                                "rounded-full px-3 py-1 text-[14px] font-medium transition",
                                activeTag === t
                                    ? "bg-[#2f7bff] text-white"
                                    : "border border-[var(--color-line)] text-[var(--color-ink-muted)] hover:border-[#bcd0f5] hover:text-[#2461d8]",
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            )}

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
                            className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white transition hover:border-[#bcd0f5] hover:shadow-[0_14px_36px_-18px_rgba(20,40,80,0.22)]"
                        >
                            {p.cover && (
                                <div className="aspect-[16/9] w-full overflow-hidden bg-[var(--color-surface-alt)]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={p.cover}
                                        alt=""
                                        loading="lazy"
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                    />
                                </div>
                            )}
                            <div className="flex flex-1 flex-col p-6">
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
                            {p.tags.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {p.tags.slice(0, 3).map((t) => (
                                        <span
                                            key={t}
                                            className={cn(
                                                "rounded-full px-2 py-0.5 text-[12.5px] font-medium",
                                                activeTag === t
                                                    ? "bg-[#2f7bff]/10 text-[#2461d8]"
                                                    : "bg-[var(--color-surface-alt)] text-[var(--color-ink-subtle)]",
                                            )}
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                                <span className="flex min-w-0 items-center gap-2">
                                    {p.authorGithub ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={`https://github.com/${p.authorGithub}.png`}
                                            alt=""
                                            loading="lazy"
                                            className="h-6 w-6 flex-none rounded-full ring-1 ring-[var(--color-line)]"
                                        />
                                    ) : (
                                        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[var(--color-surface-alt)] text-[11px] font-bold text-[var(--color-ink-subtle)]">
                                            {p.author.slice(0, 1)}
                                        </span>
                                    )}
                                    <span className="truncate text-[13.5px] font-medium text-[var(--color-ink-muted)]">
                                        {p.author}
                                    </span>
                                </span>
                                <span className="inline-flex flex-none items-center gap-1.5 text-[15px] font-semibold text-[#2461d8]">
                                    읽어보기
                                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                                </span>
                            </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
