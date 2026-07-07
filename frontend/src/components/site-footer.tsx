"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ArrowRight, UsersRound } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { GeoPattern, variantForPath } from "@/components/geo-pattern";
import { NAV_GROUPS, ABOUT_GROUP, sectionHref } from "@/lib/nav";
import { SITE } from "@/lib/site";

export function SiteFooter() {
    const pathname = usePathname();
    // CTA는 메인(/)과 문의 페이지(/demo)를 제외한 모든 페이지 하단에 노출.
    const showCta = pathname !== "/" && pathname !== "/contact";
    // 페이지마다 다른 패턴이 나오도록 경로 기반으로 변형을 고른다(충돌 방지 맵).
    const ctaVariant = variantForPath(pathname);
    // Explore 목록 — 좌 3개(Research·Technology·Applied AI) / 우 3개(Resources·Insights·Product).
    const exploreGroups = NAV_GROUPS.filter((g) => !g.hidden);
    // 저작권 끝 연도는 현재 연도로 자동 갱신 (2027년이면 2023–2027).
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-[var(--color-line)] bg-white">
            {showCta && (
                <div className="relative overflow-hidden border-y border-[var(--color-line)] bg-[#eceef2]">
                    {/* 기하학적 그레이 패턴 배경 (페이지별 변형) */}
                    <GeoPattern
                        variant={ctaVariant}
                        className="pointer-events-none absolute inset-0 h-full w-full"
                    />

                    <div className="relative mx-auto max-w-6xl px-6 py-20 text-center md:py-24">
                        <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-subtle)]">
                            Research. Technology. Impact.
                        </p>
                        <h2 className="mt-4 text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-[34px] md:leading-[1.2]">
                            기업용{" "}
                            <span className="bg-gradient-to-r from-[#2f7bff] to-[#7c5cff] bg-clip-text text-transparent">
                                AI 솔루션
                            </span>{" "}
                            도입, 연구에서 실증까지 함께 설계합니다
                        </h2>
                        <p className="mx-auto mt-4 flex items-center justify-center gap-2 text-[14.5px] leading-snug text-[var(--color-ink-muted)]">
                            <UsersRound className="h-4 w-4 flex-none text-[#2461d8]" />
                            <span>
                                현장에 배치되는{" "}
                                <span className="font-bold text-[#2461d8]">
                                    FDE(Forward Deployed Engineer)
                                </span>
                                가 요구사항 발굴부터 설계·구현·내재화까지 함께합니다
                            </span>
                        </p>
                        <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                            Plateer Labs는 풍부한 연구 경험과 검증된 기술력으로
                            <br className="hidden sm:block" />
                            귀사의 AI 전환 여정을 성공적으로 지원합니다
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            <Link
                                href="/contact"
                                className="group inline-flex items-center gap-2 rounded-full bg-[linear-gradient(45deg,#00acee_20%,#185aea_80%)] px-6 py-3 text-[16px] font-semibold text-white shadow-[0_8px_24px_-6px_rgba(47,123,255,0.5)] transition hover:brightness-110"
                            >
                                문의하기
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                            </Link>
                            {pathname !== "/technical-consulting" && (
                                <Link
                                    href="/poc-projects"
                                    className="group inline-flex items-center gap-2 rounded-full border border-[var(--color-line-strong)] bg-white/70 px-6 py-3 text-[16px] font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-ink)]"
                                >
                                    PoC 사례 보러가기
                                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className="mx-auto max-w-6xl px-6 py-16">
                <div className="grid gap-10 md:grid-cols-[1.1fr_1.5fr_1fr]">
                    {/* brand */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-[16px] text-[var(--color-ink-muted)]">
                            <BrandMark className="h-5 w-5" />
                            <span>
                                © 2023{year > 2023 ? `–${year}` : ""} Plateer{" "}
                                <span className="text-[#00adee]">Labs</span>
                            </span>
                        </div>
                        <p className="max-w-xs text-[14px] leading-relaxed text-[var(--color-ink-subtle)]">
                            {"Plateer Labs는 기업이 신뢰할 수 있는 AI 플랫폼을 만들기 위한 핵심 기술을 연구하고 공유합니다. XGEN을 구성하는 문서 인제스션, 지식그래프, 에이전트 프레임워크 등 검증된 AI 기술을 오픈소스로 공개하여 누구나 쉽게 설치하고, 실험하고, 서비스에 적용할 수 있도록 지원합니다.".slice(
                                0,
                                80,
                            )}
                            …
                        </p>
                    </div>

                    {/* Explore — top-level groups, split 3 + 3 (좌: Research·Technology·Applied AI / 우: Resources·Insights·Product) */}
                    <nav className="text-[16px]">
                        <p className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                            Explore
                        </p>
                        <div className="mt-2.5 grid grid-cols-2 gap-x-6">
                            {[
                                exploreGroups.slice(0, 3),
                                exploreGroups.slice(3),
                            ].map((col, ci) => (
                                <div key={ci} className="flex flex-col gap-2.5">
                                    {col.map((g) =>
                                        g.external ? (
                                            <a
                                                key={g.key}
                                                href={g.external}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]"
                                            >
                                                {g.label}
                                                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-ink-subtle)]" />
                                            </a>
                                        ) : (
                                            <Link
                                                key={g.key}
                                                href={`/${g.key}`}
                                                className="text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]"
                                            >
                                                {g.label}
                                            </Link>
                                        ),
                                    )}
                                </div>
                            ))}
                        </div>
                    </nav>

                    {/* About — Explore와 같은 선상의 헤딩 + Company/GitHub/PoC */}
                    <nav className="text-[16px]">
                        <p className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                            About
                        </p>
                        <div className="mt-2.5 flex flex-col gap-2.5">
                            {ABOUT_GROUP.items.map((it) =>
                                it.external ? (
                                    <a
                                        key={it.id}
                                        href={it.external}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]"
                                    >
                                        {it.label}
                                        <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-ink-subtle)]" />
                                    </a>
                                ) : (
                                    <Link
                                        key={it.id}
                                        href={it.route ?? sectionHref(ABOUT_GROUP.key, it.id)}
                                        className="text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]"
                                    >
                                        {it.label}
                                    </Link>
                                ),
                            )}
                            <a
                                href={SITE.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]"
                            >
                                GitHub
                                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-ink-subtle)]" />
                            </a>
                            <Link
                                href="/contact"
                                className="text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]"
                            >
                                PoC · 기술 상담
                            </Link>
                            <Link
                                href="/newsletter"
                                className="text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]"
                            >
                                뉴스레터 구독
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
