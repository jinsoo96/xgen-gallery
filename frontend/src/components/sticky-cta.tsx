"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUp, ChevronDown, Sparkles } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { DEMO_CTA } from "@/lib/nav";
import { cn } from "@/lib/cn";

/**
 * 전 페이지 우측 하단에 떠 있는 PoC·기술 상담 배너 (흰 배경 카드 + 일러스트).
 * 알약 버튼으로 접었다 펼 수 있고, 접힌 상태는 localStorage에 기록해 유지한다.
 * (/contact·/admin, 그리고 구독 위젯을 쓰는 /blog·/newsletter 에서는 숨김)
 */
const COLLAPSE_KEY = "ailabs-poc-cta-collapsed";

/** PoC 검증을 상징하는 인라인 일러스트. */
function CtaArt() {
    return (
        <svg
            viewBox="0 0 300 104"
            className="w-full"
            role="img"
            aria-label="PoC로 검증된 결과"
        >
            <defs>
                <linearGradient id="cta-art-bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#eef3ff" />
                    <stop offset="1" stopColor="#f5f8ff" />
                </linearGradient>
                <linearGradient id="cta-art-accent" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#2f7bff" />
                    <stop offset="1" stopColor="#16224a" />
                </linearGradient>
            </defs>
            <rect width="300" height="104" rx="14" fill="url(#cta-art-bg)" />
            {/* 좌측 돋보기 (위치 교체) */}
            <circle cx="56" cy="48" r="12" fill="none" stroke="#2f7bff" strokeWidth="2.5" />
            <line x1="65" y1="57" x2="72" y2="64" stroke="#2f7bff" strokeWidth="2.5" strokeLinecap="round" />
            {/* 중앙 결과 카드 */}
            <rect x="108" y="24" width="84" height="56" rx="10" fill="#ffffff" stroke="#dbe4f5" strokeWidth="1.5" />
            <rect x="120" y="34" width="44" height="5" rx="2.5" fill="#cdd9ef" />
            <rect x="120" y="44" width="60" height="5" rx="2.5" fill="#e7edf9" />
            {/* 검증 체크 배지 */}
            <circle cx="150" cy="63" r="15" fill="url(#cta-art-accent)" />
            <path d="M143 63 l5 5 9 -10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* 우측 미니 바차트 (위치 교체) */}
            <g>
                <rect x="226" y="58" width="10" height="22" rx="2" fill="#c4d4f1" />
                <rect x="240" y="44" width="10" height="36" rx="2" fill="#2f7bff" />
                <rect x="254" y="64" width="10" height="16" rx="2" fill="#c4d4f1" />
            </g>
            {/* 스파클 */}
            <path d="M214 26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="#7c5cff" />
            <path d="M70 30 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" fill="#2f7bff" />
        </svg>
    );
}

export function StickyCta() {
    const pathname = usePathname();
    const { locale } = useI18n();
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        // 사용자가 한 번 접었으면 접힌 채 시작, 아니면 잠시 뒤 자동으로 펼쳐 안내한다.
        if (localStorage.getItem(COLLAPSE_KEY) === "1") return;
        const t = setTimeout(() => setOpen(true), 700);
        return () => clearTimeout(t);
    }, []);

    // /blog·/newsletter 영역에서는 기술상담 대신 구독 위젯(SubscribeCta)을 띄운다.
    const hidden =
        pathname === "/contact" ||
        pathname.startsWith("/admin") ||
        pathname === "/blog" ||
        pathname.startsWith("/blog/") ||
        pathname.startsWith("/newsletter");
    if (!mounted || hidden) return null;

    const en = locale === "en";
    const title = en ? DEMO_CTA.en : DEMO_CTA.ko;
    const pillLabel = en ? "Request a consultation" : "상담 신청하기";

    function collapse() {
        setOpen(false);
        localStorage.setItem(COLLAPSE_KEY, "1");
    }

    return (
        <div className="fixed bottom-5 right-5 z-50 flex w-[min(330px,calc(100vw-2rem))] flex-col items-end gap-3">
            {open && (
                <div className="cta-enter w-full overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-[0_20px_50px_-12px_rgba(20,40,80,0.28)]">
                    {/* 아이콘 + 타이틀 + 접기 */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span
                                aria-hidden
                                className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[linear-gradient(45deg,#00acee_20%,#185aea_80%)] text-white"
                            >
                                <Sparkles className="h-4 w-4" />
                            </span>
                            <p className="text-[16px] font-bold tracking-tight text-[var(--color-ink)]">
                                {title}
                            </p>
                        </div>
                        <button
                            type="button"
                            aria-label={en ? "Collapse" : "접기"}
                            onClick={collapse}
                            className="-mr-1.5 -mt-0.5 rounded-full p-1.5 text-[var(--color-ink-subtle)] transition hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-ink)]"
                        >
                            <ChevronDown className="h-5 w-5" />
                        </button>
                    </div>

                    <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
                        {en
                            ? "Validate your Enterprise AI with a PoC before adoption"
                            : "도입 전, Enterprise AI를 PoC로 먼저 검증하세요"}
                    </p>
                    <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-[#2461d8]">
                        {en
                            ? "A Forward Deployed Engineer (FDE) stays on-site through delivery"
                            : "현장 FDE가 발굴·구현·내재화까지 함께합니다"}
                    </p>

                    {/* 중앙 일러스트 */}
                    <div className="mt-3.5">
                        <CtaArt />
                    </div>

                    <Link
                        href={DEMO_CTA.href}
                        className="group mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(45deg,#00acee_20%,#185aea_80%)] px-4 py-2.5 text-[15px] font-semibold text-white transition hover:brightness-125"
                    >
                        {pillLabel}
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </Link>
                </div>
            )}

            {/* 하단 컨트롤: 맨 위로 + 상담 신청 토글 알약 */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    aria-label={en ? "Back to top" : "맨 위로"}
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-ink-muted)] shadow-[0_8px_24px_-10px_rgba(20,40,80,0.4)] transition hover:text-[var(--color-ink)]"
                >
                    <ArrowUp className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full border bg-white px-5 py-3 text-[15px] font-bold shadow-[0_8px_24px_-8px_rgba(20,40,80,0.4)] transition",
                        open
                            ? "border-[var(--color-line)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                            : "border-[#c7d9ff] text-[#2461d8] hover:border-[#2f7bff]",
                    )}
                >
                    <Sparkles className="h-4 w-4 text-[#2f7bff]" />
                    {pillLabel}
                </button>
            </div>
        </div>
    );
}
