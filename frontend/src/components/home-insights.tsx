import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";

/**
 * 메인 — Insight 미리보기. 파일베이스 블로그의 최신 3개 글을 홈에 노출한다.
 * (server component — 빌드 시 content/blog 프론트매터를 읽어 정적 렌더)
 */
function fmt(date: string) {
    return date.replaceAll("-", ".");
}

export function HomeInsights() {
    const posts = getAllPosts().slice(0, 3);
    if (posts.length === 0) return null;

    return (
        <section className="border-t border-[var(--color-line)] bg-white">
            <div className="mx-auto max-w-6xl px-6 py-28">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                            / Insight
                        </p>
                        <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
                            연구와 현장에서 얻은{" "}
                            <span className="bg-gradient-to-r from-[#00acee] to-[#185aea] bg-clip-text text-transparent">
                                인사이트
                            </span>
                        </h2>
                    </div>
                    <Link
                        href="/blog"
                        className="group inline-flex flex-none items-center gap-1.5 text-[15px] font-semibold text-[#2461d8] transition hover:text-[#1b4fb0]"
                    >
                        블로그 전체 보기
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <div className="mt-12 grid gap-4 md:grid-cols-3">
                    {posts.map((p) => (
                        <Link
                            key={p.slug}
                            href={`/blog/${p.slug}`}
                            className="group flex flex-col rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-6 transition hover:-translate-y-0.5 hover:border-[var(--color-ink)]"
                        >
                            <div className="flex items-center gap-2">
                                <span className="rounded-full border border-[var(--color-line)] bg-white px-2.5 py-1 font-mono text-[11.5px] text-[#2461d8]">
                                    {p.category}
                                </span>
                                <span className="font-mono text-[12px] text-[var(--color-ink-subtle)]">
                                    {fmt(p.date)}
                                </span>
                            </div>
                            <h3 className="mt-4 text-[18px] font-bold leading-snug tracking-tight text-[var(--color-ink)]">
                                {p.title}
                            </h3>
                            <p className="mt-2 line-clamp-3 text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
                                {p.description}
                            </p>
                            <span className="mt-5 inline-flex items-center gap-1 text-[14px] font-medium text-[var(--color-ink)] transition group-hover:gap-2">
                                읽어보기
                                <ArrowRight className="h-3 w-3" />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
