import Link from "next/link";
import {
    Compass,
    Network,
    FlaskConical,
    ShieldCheck,
    Banknote,
    Landmark,
    ShoppingCart,
    Factory,
    Server,
    Check,
    ChevronRight,
    ArrowRight,
    type LucideIcon,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd } from "@/lib/structured-data";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata = {
    title: "Technical Consulting",
    description:
        "연구로 검증하고 PoC로 입증하는 Enterprise AI 기술 컨설팅 — AI 전략 수립, 아키텍처 설계, PoC 검증, AI 거버넌스까지 도입 전 과정을 설계합니다.",
    alternates: { canonical: "/technical-consulting" },
    openGraph: {
        title: "Technical Consulting · Plateer AI Labs",
        description:
            "연구로 검증하고, PoC로 입증합니다 — 연구 기반 Enterprise AI 기술 컨설팅.",
        type: "website",
        url: absoluteUrl("/technical-consulting"),
    },
};

const SERVICES: {
    icon: LucideIcon;
    en: string;
    ko: string;
    desc: string;
    items: string[];
}[] = [
    {
        icon: Compass,
        en: "AI Strategy & Assessment",
        ko: "Enterprise AI 전략 수립",
        desc: "AI 도입 목표와 비즈니스 과제를 분석하고, 조직에 적합한 AI 활용 전략과 우선순위를 제안합니다.",
        items: ["AI 도입 전략 수립", "업무 과제 발굴", "ROI 분석", "기술 적합성 평가"],
    },
    {
        icon: Network,
        en: "AI Architecture Consulting",
        ko: "Enterprise AI 아키텍처 설계",
        desc: "기업 환경에 적합한 AI 플랫폼과 운영 구조를 설계합니다.",
        items: [
            "Enterprise AI Architecture",
            "LLM & RAG Architecture",
            "On-Premise AI",
            "Multi-LLM 설계",
            "MCP Integration",
            "Data Architecture",
        ],
    },
    {
        icon: FlaskConical,
        en: "PoC & Validation",
        ko: "PoC 설계 및 기술 검증",
        desc: "도입 이전 단계에서 기술의 적합성과 성능을 검증하여 사업 리스크를 최소화합니다.",
        items: ["PoC 설계", "Benchmark", "성능 평가", "정확도 검증", "비용 분석", "운영성 검토"],
    },
    {
        icon: ShieldCheck,
        en: "AI Governance",
        ko: "AI 운영 및 거버넌스",
        desc: "Enterprise AI 운영에 필요한 보안과 관리 체계를 설계합니다.",
        items: [
            "AI Governance",
            "Prompt Governance",
            "Security Compliance",
            "Audit Trail",
            "AI Risk Management",
        ],
    },
];

const PROCESS = [
    "Business Discovery",
    "AI Readiness Assessment",
    "Technology Consulting",
    "Architecture Design",
    "PoC Validation",
    "Deployment Strategy",
];

const INDUSTRIES: [LucideIcon, string, string][] = [
    [Banknote, "Finance", "여신심사 · 규제준수 · 계약서 분석 · 금융 RAG"],
    [Landmark, "Public Sector", "민원 상담 · 행정 AI · 정책 검색 · 문서 지식화"],
    [ShoppingCart, "Commerce", "상품 심사 · VOC 분석 · 가격 모니터링 · 추천"],
    [Factory, "Manufacturing", "품질 검사 · 설비 분석 · 예지보전 · 생산 지식 검색"],
    [Server, "IT Services", "개발 생산성 · 운영 자동화 · 기술 문서 검색"],
];

export default function TechnicalConsultingPage() {
    return (
        <>
            <SiteNav overlay />
            <JsonLd
                data={[
                    {
                        "@context": "https://schema.org",
                        "@type": "Service",
                        name: "Technical Consulting",
                        serviceType: "Enterprise AI Technical Consulting",
                        provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
                        areaServed: "KR",
                        description:
                            "AI 전략 수립, 아키텍처 설계, PoC 검증, AI 거버넌스 등 연구 기반 Enterprise AI 기술 컨설팅.",
                    },
                    breadcrumbLd([
                        { name: "Home", path: "/" },
                        { name: "Applied AI", path: "/solutions" },
                        { name: "Technical Consulting", path: "/technical-consulting" },
                    ]),
                ]}
            />

            {/* Hero */}
            <section className="relative flex min-h-[520px] items-center overflow-hidden border-b border-white/10 py-28 text-white">
                <SceneBackground concept="solutions" />
                <div className="relative mx-auto w-full max-w-6xl px-6 pt-16">
                    <p className="text-[16px] font-semibold tracking-tight text-[#5eead4]">
                        Applied AI · Technical Consulting
                    </p>
                    <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">
                        Enterprise AI의 성공은 올바른 기술 전략에서 시작됩니다
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
                        기업의 업무 환경과 기술 요구사항을 분석하여, AI 도입 전략부터
                        PoC, 아키텍처 설계, 운영 체계까지 Enterprise AI 구축 전 과정을
                        함께 설계합니다
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[13px] text-white/75 backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        연구로 검증하고, PoC로 입증합니다
                    </span>
                </div>
            </section>

            <main>
                {/* 핵심 서비스 */}
                <section className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
                    <div className="mx-auto max-w-6xl px-6 py-24">
                        <p className="font-mono text-[12px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                            Core Services
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-ink)] md:text-4xl">
                            핵심 서비스
                        </h2>
                        <div className="mt-10 grid gap-4 md:grid-cols-2">
                            {SERVICES.map((s) => (
                                <div
                                    key={s.en}
                                    className="flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6 transition hover:border-[#bcd0f5] hover:shadow-[0_14px_36px_-18px_rgba(20,40,80,0.22)]"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#2f7bff]/10 text-[#2f7bff]">
                                            <s.icon className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <h3 className="text-[18px] font-bold tracking-tight text-[var(--color-ink)]">
                                                {s.en}
                                            </h3>
                                            <p className="text-[13.5px] font-semibold text-[#2461d8]">
                                                {s.ko}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                                        {s.desc}
                                    </p>
                                    <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                                        {s.items.map((it) => (
                                            <li
                                                key={it}
                                                className="flex items-center gap-1.5 text-[14px] leading-snug text-[var(--color-ink-muted)]"
                                            >
                                                <Check className="h-3.5 w-3.5 flex-none text-[#2f7bff]" />
                                                {it}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Consulting Framework */}
                <section className="border-t border-[var(--color-line)] bg-[var(--color-surface-alt)]">
                    <div className="mx-auto max-w-6xl px-6 py-24">
                        <p className="font-mono text-[12px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                            Consulting Framework
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-ink)] md:text-4xl">
                            Enterprise AI Consulting Process
                        </h2>
                        <div className="mt-10 grid grid-cols-1 gap-2 sm:grid-cols-[repeat(6,1fr)] sm:items-stretch">
                            {PROCESS.map((step, i) => (
                                <div
                                    key={step}
                                    className="flex items-center gap-2 sm:flex-col sm:items-stretch sm:gap-0"
                                >
                                    <div className="flex flex-1 flex-col rounded-xl border border-[var(--color-line)] bg-white p-4">
                                        <span className="font-mono text-[13px] font-bold text-[#2461d8]">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <span className="mt-1.5 text-[14px] font-semibold leading-snug text-[var(--color-ink)]">
                                            {step}
                                        </span>
                                    </div>
                                    {i < PROCESS.length - 1 && (
                                        <ChevronRight className="h-4 w-4 shrink-0 rotate-90 self-center text-[var(--color-ink-subtle)] sm:hidden" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 산업별 컨설팅 */}
                <section className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
                    <div className="mx-auto max-w-6xl px-6 py-24">
                        <p className="font-mono text-[12px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                            By Industry
                        </p>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-ink)] md:text-4xl">
                            산업별 컨설팅
                        </h2>
                        <div className="mt-8 divide-y divide-[var(--color-line)] overflow-hidden rounded-2xl border border-[var(--color-line)]">
                            {INDUSTRIES.map(([Icon, name, desc]) => (
                                <div
                                    key={name}
                                    className="flex flex-col gap-2 bg-white px-6 py-5 sm:flex-row sm:items-center sm:gap-6"
                                >
                                    <div className="flex w-44 shrink-0 items-center gap-3">
                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#2f7bff]/10 text-[#2f7bff]">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <span className="text-[16px] font-bold text-[var(--color-ink)]">
                                            {name}
                                        </span>
                                    </div>
                                    <p className="text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                                        {desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 차별화 + CTA */}
                <section className="border-t border-[var(--color-line)] bg-[#070b1c] text-white">
                    <div className="mx-auto max-w-4xl px-6 py-24 text-center">
                        <p className="font-mono text-[12px] uppercase tracking-widest text-white/45">
                            Research-driven Consulting
                        </p>
                        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-[40px]">
                            연구로 검증하고, PoC로 입증합니다
                        </h2>
                        <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-white/70">
                            제품을 판매하기 위한 컨설팅이 아니라, 기술을 검증하고 고객에게
                            가장 적합한 Enterprise AI 아키텍처를 설계하는 연구 기반
                            컨설팅입니다. 도입 전략부터 기술 검증, 아키텍처 설계, 운영 체계
                            수립까지 연구소의 기술 전문성으로 함께합니다.
                        </p>
                        <Link
                            href="/demo"
                            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(45deg,#00acee_20%,#185aea_80%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(47,123,255,0.5)] transition hover:brightness-110"
                        >
                            PoC · 기술 컨설팅 문의
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
