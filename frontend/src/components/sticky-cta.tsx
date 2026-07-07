"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { DEMO_CTA } from "@/lib/nav";

/**
 * 전 페이지 우측 하단에 떠 있는 PoC·기술 상담 배너 (흰 배경 카드 + 일러스트).
 * (목적지 /demo 와 CMS /admin 에서는 숨김) 닫으면 localStorage에 기록해 다시 띄우지 않는다.
 */
const DISMISS_KEY = "ailabs-poc-cta-dismissed";

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
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (localStorage.getItem(DISMISS_KEY)) return;
        const t = setTimeout(() => setVisible(true), 700);
        return () => clearTimeout(t);
    }, []);

    const hidden = pathname === "/contact" || pathname.startsWith("/admin");
    if (hidden || !visible) return null;

    const en = locale === "en";
    const title = en ? DEMO_CTA.en : DEMO_CTA.ko;

    return (
        <div className="cta-enter fixed bottom-5 right-5 z-50 w-[min(330px,calc(100vw-2rem))]">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-[0_20px_50px_-12px_rgba(20,40,80,0.28)]">
                <button
                    type="button"
                    aria-label={en ? "Dismiss" : "닫기"}
                    onClick={() => {
                        localStorage.setItem(DISMISS_KEY, "1");
                        setVisible(false);
                    }}
                    className="absolute right-2.5 top-2.5 rounded-full p-1 text-[var(--color-ink-subtle)] transition hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-ink)]"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* 아이콘 + 타이틀 — 한 라인 */}
                <div className="flex items-center gap-2 pr-6">
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
                    {en ? "Request a consultation" : "상담 신청하기"}
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </Link>
            </div>
        </div>
    );
}
