import {
    ShieldCheck,
    Brain,
    Users,
    Cable,
    Database,
    UserCheck,
    Server,
    ArrowUpRight,
    ShoppingCart,
    Landmark,
    Banknote,
    Check,
    type LucideIcon,
} from "lucide-react";
import { GroupPage } from "@/components/onepage";
import { UseCases } from "@/components/usecases";
import { getGroup } from "@/lib/nav";

export const metadata = {
    title: "Applied AI by Industry",
    description:
        "금융·공공·커머스·IT 서비스 등 산업별 업무 특성과 규제를 반영한 Enterprise AI를 연구하고 PoC로 실증합니다.",
    alternates: { canonical: "/solutions" },
};

function SolutionsHero() {
    return (
        <div className="max-w-3xl">
            <p className="font-mono text-[13px] uppercase tracking-widest text-white/55">
                / Applied AI
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
                Applied AI by Industry
            </h1>
            <p className="mt-5 text-lg font-medium leading-relaxed text-white/85">
                산업별 업무를 이해하는 Enterprise AI를 연구하고 실증합니다
            </p>
            <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/65">
                금융, 공공, 커머스, IT 서비스 등 다양한 산업의 업무 특성과 규제를
                반영한 AI 기술을 연구하며, 실제 PoC와 프로젝트를 통해 검증된
                Enterprise AI 적용 사례를 제공합니다
            </p>
        </div>
    );
}

/** 산업별 적용 영역 — E-Commerce · Public Sector · Finance · IT Services. */
const INDUSTRIES: { icon: LucideIcon; title: string; sub: string; items: string[] }[] = [
    {
        icon: ShoppingCart,
        title: "E-Commerce",
        sub: "AI Commerce Automation",
        items: ["상품 심사 자동화", "VOC 분석 및 응대", "가격 모니터링", "프로모션 최적화"],
    },
    {
        icon: Landmark,
        title: "Public Sector",
        sub: "AI for Digital Government",
        items: ["민원 상담 자동화", "행정 업무 지원", "정책·규정 검색", "공공 데이터 활용"],
    },
    {
        icon: Banknote,
        title: "Finance",
        sub: "Trusted Financial AI",
        items: ["여신 심사 지원", "계약서 검토", "이상 거래 탐지", "규제 준수 자동화"],
    },
    {
        icon: Server,
        title: "IT Services",
        sub: "Enterprise AI Operations",
        items: ["기술 문서 검색", "장애 분석", "운영 자동화", "코드 지원 Agent"],
    },
];

function Industries() {
    return (
        <div className="space-y-6">
            <p className="max-w-2xl text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                산업마다 업무 특성과 규제가 다릅니다. 각 산업의 맥락을 반영해 검증된
                Enterprise AI 적용 영역을 정리했습니다.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
                {INDUSTRIES.map((ind) => (
                    <div
                        key={ind.title}
                        className="flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6 transition hover:border-[#bcd0f5] hover:shadow-[0_14px_36px_-18px_rgba(20,40,80,0.22)]"
                    >
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#2f7bff]/10 text-[#2f7bff]">
                                <ind.icon className="h-5 w-5" />
                            </span>
                            <div>
                                <h3 className="text-[19px] font-bold tracking-tight text-[var(--color-ink)]">
                                    {ind.title}
                                </h3>
                                <p className="text-[13.5px] font-semibold text-[#2461d8]">
                                    {ind.sub}
                                </p>
                            </div>
                        </div>
                        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                            {ind.items.map((it) => (
                                <li
                                    key={it}
                                    className="flex items-center gap-1.5 text-[14.5px] leading-snug text-[var(--color-ink-muted)]"
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
    );
}

/**
 * Agentic AI — 연구소는 '완성된 에이전트 제품'이 아니라, 에이전트를 신뢰성 있게
 * 만드는 기술·연구를 다룬다. (제품화 사례는 x2bee로 아웃링크)
 */
const AGENTIC: { icon: LucideIcon; title: string; en: string; desc: string }[] = [
    {
        icon: Brain,
        title: "Planning & Reasoning",
        en: "계획 · 추론",
        desc: "복잡한 목표를 실행 가능한 단계로 분해하고, 다단계로 추론해 스스로 작업을 설계합니다",
    },
    {
        icon: Users,
        title: "Multi-Agent Orchestration",
        en: "다중 에이전트 협업",
        desc: "여러 에이전트가 역할을 나눠 협업하도록 조율하는 오케스트레이션을 연구합니다",
    },
    {
        icon: Cable,
        title: "Tool Use & MCP",
        en: "도구 연동",
        desc: "외부 시스템·API·도구를 표준 프로토콜(MCP)로 안전하게 연결해 실제 업무를 수행합니다",
    },
    {
        icon: Database,
        title: "Memory & Knowledge",
        en: "기억 · 지식 접지",
        desc: "장기 기억과 기업 지식에 접지(grounding)해 일관되고 근거 있는 행동을 보장합니다",
    },
    {
        icon: UserCheck,
        title: "Human-in-the-Loop & Governance",
        en: "통제 · 거버넌스",
        desc: "승인 체계와 정책·안전 제어를 통해 통제 가능하고 신뢰할 수 있는 에이전트를 만듭니다",
    },
    {
        icon: Server,
        title: "Runtime & Reliability",
        en: "런타임 · 신뢰성",
        desc: "운영 환경에서 끊김 없이 안정적으로 동작하는 에이전트 실행 런타임을 연구합니다",
    },
];

function AgenticAI() {
    return (
        <div className="space-y-6">
            <p className="max-w-2xl text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                Plateer AI Labs는 에이전트가 스스로 계획하고, 협업하고, 도구를
                다루며, 신뢰성 있게 운영되도록 만드는 <strong className="font-semibold text-[var(--color-ink)]">기반 기술과 연구</strong>를 다룹니다.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {AGENTIC.map((a) => (
                    <div
                        key={a.title}
                        className="flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-5 transition hover:border-[#bcd0f5] hover:shadow-[0_14px_36px_-18px_rgba(20,40,80,0.22)]"
                    >
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#2f7bff]/10 text-[#2f7bff]">
                            <a.icon className="h-5 w-5" />
                        </span>
                        <h3 className="mt-4 text-[17px] font-bold tracking-tight text-[var(--color-ink)]">
                            {a.title}
                        </h3>
                        <p className="mt-0.5 text-[13px] font-semibold text-[var(--color-ink-subtle)]">
                            {a.en}
                        </p>
                        <p className="mt-2.5 text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
                            {a.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* 원천기술 → 제품화 내러티브 (x2bee 아웃링크) */}
            <a
                href="https://www.x2bee.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#cfe0ff] bg-[#f3f7ff] p-6 transition hover:border-[#2f7bff] sm:flex-row sm:items-center"
            >
                <p className="text-[15.5px] leading-relaxed text-[var(--color-ink)]">
                    이 Agentic 기술은 <strong className="font-semibold">x2bee</strong>의 Shop ·
                    CS · Review Agent 등 실제 비즈니스 에이전트로 제품화됩니다
                </p>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[15px] font-semibold text-[#2461d8] transition group-hover:text-[#1b4fb0]">
                    x2bee에서 보기
                    <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
            </a>
        </div>
    );
}

/** 연구소 솔루션 제품의 인증·품질 — 현재 GS인증 심사 종료, 최종 인증 대기 중. */
function CertificationQuality() {
    return (
        <div className="space-y-6">
            <div className="grid gap-5 rounded-xl border border-[var(--color-line)] bg-white p-6 sm:grid-cols-[auto_1fr] sm:items-center">
                {/* GS인증 배지 (로고 입수 전 텍스트 배지) */}
                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] text-center">
                    <ShieldCheck className="h-6 w-6 text-[#2f7bff]" />
                    <span className="mt-1 text-[14px] font-bold text-[var(--color-ink)]">
                        GS인증
                    </span>
                </div>
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-[var(--color-ink)]">
                            XGEN Agentic AI Platform — GS인증 (Good Software)
                        </h3>
                        <span className="rounded-full border border-[#f3dca0] bg-[#fff7e6] px-2.5 py-0.5 text-[14px] font-semibold text-[#b9810f]">
                            심사 종료 · 최종 인증 대기 중
                        </span>
                    </div>
                    <p className="mt-2 max-w-xl text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                        연구소 솔루션 제품의 GS인증 심사가 종료되었으며, 최종 인증
                        결과를 기다리고 있습니다
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-alt)] p-10 text-center">
                <p className="text-[16px] text-[var(--color-ink-muted)]">
                    해당 페이지는 준비 중입니다
                </p>
            </div>
        </div>
    );
}

export default function SolutionsPage() {
    return (
        <GroupPage
            group={getGroup("solutions")!}
            hero={<SolutionsHero />}
            content={{
                industries: <Industries />,
                "ai-agents": <AgenticAI />,
                "library-recipes": <UseCases embedded />,
                certification: <CertificationQuality />,
            }}
        />
    );
}
