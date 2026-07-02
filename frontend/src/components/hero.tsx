"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
// import { CustomerMarquee } from "@/components/customer-marquee"; // 임시 주석 처리
import { cn } from "@/lib/cn";

function XgenMark() {
    return (
        <span className="relative inline-block">
            XGEN
            <span className="absolute -bottom-1 left-0 right-0 h-[6px] bg-[#2f7bff]/50" />
        </span>
    );
}

const SLIDE_COUNT = 3;
const ROTATE_MS = 6000;

// Per-slide background videos (index matches the active slide).
// hero-security.mp4 = 방금 내려받은 영상을 frontend/public/ 에 저장.
const SLIDE_BG = [
    "/hero-vision.mp4",
    "/hero-security.mp4",
    "/hero-slide2.mp4",
];

const H1_CLS =
    "max-w-5xl text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-[3.5rem] lg:leading-[1.05]";

/** CTA buttons — defaults to the XGEN toolkit pair; per-slide overridable. */
function HeroActions({
    primary,
    secondary,
}: {
    primary?: { label: string; href: string };
    secondary?: { label: string; href: string; external?: boolean };
} = {}) {
    const { t } = useI18n();
    const p = primary ?? { label: t.hero.browse, href: "/#tools" };
    const s = secondary ?? {
        label: t.hero.viewGithub,
        href: "https://github.com/PlateerLab",
        external: true,
    };
    return (
        <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
                href={p.href}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[16px] font-semibold text-[#070b1c] transition hover:bg-white/90"
            >
                {p.label}
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
                href={s.href}
                {...(s.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-transparent px-6 py-3 text-[16px] font-semibold text-white transition hover:bg-white/10"
            >
                {s.label}
            </Link>
        </div>
    );
}

/** Slide 1 — Enterprise AI research vision. */
function VisionSlide() {
    return (
        <>
            <h1 className={H1_CLS}>
                Researching the Future
                <br />
                of Enterprise AI
            </h1>

            <p className="mt-7 max-w-2xl text-xl leading-relaxed text-white/70">
                Plateer Labs는 단순한 AI 기능 개발을 넘어,
                <br className="hidden sm:block" />
                기업이 신뢰하고 운영할 수 있는 Enterprise AI의 표준을 연구합니다
            </p>

            <HeroActions
                primary={{ label: "연구 영역 둘러보기", href: "/research" }}
                secondary={{ label: "AI 기술 보기", href: "/technology" }}
            />
        </>
    );
}

/** Slide 2 — the XGEN toolkit pitch (original hero). */
function XgenSlide() {
    const { locale, t } = useI18n();
    return (
        <>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[13px] text-white/70 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t.hero.badge}
            </div>

            <h1 className={cn(H1_CLS, "mt-7")}>
                {locale === "ko" ? (
                    <>
                        <XgenMark />을 움직이는
                        <br />
                        AI 툴킷
                    </>
                ) : (
                    <>
                        The AI toolkit
                        <br />
                        behind <XgenMark />
                    </>
                )}
            </h1>

            <p className="mt-7 max-w-xl text-xl leading-relaxed text-white/70">
                {t.hero.desc}
            </p>

            <HeroActions />
        </>
    );
}

/** Slide 2 — Security & Governance (가드레일·통제, /security-and-governance 참고). */
function SecuritySlide() {
    return (
        <>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[13px] text-white/70 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Security &amp; Governance
            </div>

            <h1 className={cn(H1_CLS, "mt-7")}>
                선언한 대로 통제되는
                <br />
                Enterprise AI
            </h1>

            <p className="mt-7 max-w-2xl text-xl leading-relaxed text-white/70">
                가드 모델·개인정보 마스킹·금칙어 필터에 감사 로그와 AI 위험도
                등급까지 —
                <br className="hidden sm:block" />
                규제 산업에서도 신뢰할 수 있는 다층 통제 위에서 AI를 운영합니다
            </p>

            <HeroActions
                primary={{
                    label: "보안·거버넌스 보기",
                    href: "/security-and-governance",
                }}
                secondary={{ label: "인증·품질 보기", href: "/solutions#certification" }}
            />
        </>
    );
}

export function Hero() {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const id = setInterval(
            () => setActive((a) => (a + 1) % SLIDE_COUNT),
            ROTATE_MS,
        );
        return () => clearInterval(id);
    }, []);

    return (
        <section className="relative flex min-h-[calc(100dvh+2px)] items-center overflow-hidden border-b border-white/10 text-white">
            {/* main background videos — crossfade between slides */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                {SLIDE_BG.map((src, i) => (
                    <video
                        key={src}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={cn(
                            "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out",
                            i === active ? "opacity-100" : "opacity-0",
                        )}
                    >
                        <source src={src} type="video/mp4" />
                    </video>
                ))}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050813]/80 via-[#050813]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050813]/55 to-transparent" />
            </div>

            <div className="relative mx-auto w-full max-w-6xl px-6 py-28">
                {/* rolling slides — fade/slide-in on change */}
                <div key={active} className="hero-slide-enter">
                    {active === 0 ? (
                        <VisionSlide />
                    ) : active === 1 ? (
                        <SecuritySlide />
                    ) : (
                        <XgenSlide />
                    )}
                </div>

                {/* slide indicators */}
                <div className="mt-12 flex items-center gap-2">
                    {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setActive(i)}
                            aria-label={`슬라이드 ${i + 1}`}
                            aria-current={i === active}
                            className={cn(
                                "h-2 rounded-full transition-all",
                                i === active
                                    ? "w-6 bg-white"
                                    : "w-2 bg-white/40 hover:bg-white/70",
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* 고객사 로고 — 동영상 위 하단 오버레이 (임시 주석 처리) */}
            {/* <CustomerMarquee /> */}
        </section>
    );
}
