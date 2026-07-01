import Link from "next/link";
import {
    BookOpen,
    FileText,
    Users,
    Boxes,
    ArrowRight,
    ArrowUpRight,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
    title: "Resources",
    description:
        "Enterprise AI를 위한 기술 문서·사용자 매뉴얼, 릴리즈 노트, 연구 인사이트, 오픈소스 라이브러리 — 연구소가 축적한 지식 자산을 한곳에서.",
    alternates: { canonical: "/resources" },
};

const AREAS = [
    {
        icon: BookOpen,
        title: "Documentation",
        body: "XGEN 사용자 매뉴얼 — 플랫폼과 라이브러리 사용을 위한 가이드와 레퍼런스를 한곳에서 확인합니다",
        href: "/documentation",
        cta: "매뉴얼 보기",
    },
    {
        icon: FileText,
        title: "Release Notes",
        body: "XGEN 플랫폼의 새 기능, 개선사항, 버그 수정 이력 — 최신 변경사항을 먼저 확인합니다",
        href: "/releases",
        cta: "변경 이력 보기",
    },
    {
        icon: Users,
        title: "Research Team",
        body: "Plateer Labs를 만드는 멤버들 — 연구진의 프로필과 기여 활동을 소개합니다",
        href: "/members",
        cta: "멤버 보러가기",
    },
];

function fmt(date: string) {
    return date.replaceAll("-", ".");
}

function ResourcesHero() {
    return (
        <div className="max-w-3xl">
            <p className="text-[16px] font-semibold tracking-tight text-[#5eead4]">
                Resources
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Enterprise AI Resources
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
                기술 문서와 사용자 매뉴얼, 릴리즈 노트, 연구 인사이트, 오픈소스
                라이브러리까지 — 연구소가 축적한 지식 자산을 한곳에서 공유합니다
            </p>
        </div>
    );
}

export default function ResourcesPage() {
    const posts = getAllPosts().slice(0, 3);

    return (
        <>
            <SiteNav overlay />
            <section className="relative flex min-h-[480px] items-center overflow-hidden border-b border-white/10 py-28 text-white">
                <SceneBackground concept="resources" />
                <div className="relative mx-auto w-full max-w-6xl px-6 pt-16">
                    <ResourcesHero />
                </div>
            </section>

            <main>
                {/* 리소스 영역 카드 */}
                <section className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
                    <div className="mx-auto max-w-6xl px-6 py-24">
                        <p className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                            / Knowledge Assets
                        </p>
                        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
                            리소스 한눈에
                        </h2>
                        <div className="mt-10 grid gap-4 md:grid-cols-3">
                            {AREAS.map((a) => (
                                <Link
                                    key={a.title}
                                    href={a.href}
                                    className="group flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[var(--color-ink)]"
                                >
                                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#2f7bff]/10 text-[#2f7bff]">
                                        <a.icon className="h-5 w-5" />
                                    </span>
                                    <h3 className="mt-4 text-[18px] font-bold tracking-tight text-[var(--color-ink)]">
                                        {a.title}
                                    </h3>
                                    <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                                        {a.body}
                                    </p>
                                    <span className="mt-5 inline-flex items-center gap-1 text-[14px] font-medium text-[var(--color-ink)] transition group-hover:gap-2">
                                        {a.cta}
                                        <ArrowRight className="h-3 w-3" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 최신 인사이트 */}
                {posts.length > 0 && (
                    <section className="border-b border-[var(--color-line)] bg-[var(--color-surface-alt)]">
                        <div className="mx-auto max-w-6xl px-6 py-24">
                            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                                        / Insights
                                    </p>
                                    <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
                                        최신 연구 인사이트
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

                            <div className="mt-10 grid gap-4 md:grid-cols-3">
                                {posts.map((p) => (
                                    <Link
                                        key={p.slug}
                                        href={`/blog/${p.slug}`}
                                        className="group flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[var(--color-ink)]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-2.5 py-1 font-mono text-[11.5px] text-[#2461d8]">
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
                )}

                {/* 오픈소스 라이브러리 콜아웃 */}
                <section className="bg-[var(--color-surface)]">
                    <div className="mx-auto max-w-6xl px-6 py-24">
                        <div className="flex flex-col gap-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-8 md:flex-row md:items-center md:justify-between md:p-10">
                            <div className="flex items-start gap-4">
                                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2f7bff]/10 text-[#2f7bff]">
                                    <Boxes className="h-6 w-6" />
                                </span>
                                <div>
                                    <h2 className="text-[22px] font-bold tracking-tight text-[var(--color-ink)]">
                                        오픈소스 라이브러리
                                    </h2>
                                    <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                                        XGEN을 떠받치는 인제스션 · 지식 그래프 · 에이전트
                                        도구 라이브러리를 pip로 설치하거나 브라우저에서 바로
                                        체험하세요
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/library-gallery"
                                className="group inline-flex flex-none items-center gap-2 rounded-full bg-[var(--color-ink)] px-6 py-3 text-[15px] font-semibold text-white transition hover:opacity-90"
                            >
                                라이브러리 갤러리
                                <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
