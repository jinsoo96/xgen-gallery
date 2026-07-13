import { pageMetadata } from "@/lib/metadata";
import {
    ShieldCheck,
    Brain,
    ScrollText,
    Activity,
    Scale,
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
    ArrowRight,
    type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { GroupPage } from "@/components/onepage";
import { getGroup } from "@/lib/nav";
import { getAllPosts } from "@/lib/blog";

export const metadata = pageMetadata({
    title: "Applied AI by Industry",
    description:
        "금융·공공·커머스·IT 서비스 등 산업별 업무 특성과 규제를 반영한 Enterprise AI를 연구하고 PoC로 실증합니다.",
    path: "/solutions",
});

function SolutionsHero() {
    return (
        <div className="max-w-3xl">
            <p className="text-[16px] font-semibold tracking-tight text-[#5eead4]">
                Applied AI
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
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
                Plateer Labs는 에이전트가 스스로 계획하고, 협업하고, 도구를
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

            {/* 산업별 적용 — Agentic AI가 실제 투입되는 산업 (앵커 id: industries) */}
            <div
                id="industries"
                className="scroll-mt-24 border-t border-[var(--color-line)] pt-10"
            >
                <h3 className="text-[22px] font-bold tracking-tight text-[var(--color-ink)]">
                    산업별 적용{" "}
                    <span className="text-[var(--color-ink-subtle)]">
                        Industries
                    </span>
                </h3>
                <div className="mt-5">
                    <Industries />
                </div>
            </div>
        </div>
    );
}

/** 연구소 솔루션 제품의 인증·품질 — GS인증 1등급 획득(2026-07-06 확정). */
function CertificationQuality() {
    // GS인증 태그가 붙은 인사이트 블로그 글(여정 시리즈 + 관련 글)을 최신순으로
    // 최대 3개만 노출 — 나머지는 하단 "전체 보기"로 연결.
    const gsPosts = getAllPosts()
        .filter((p) => p.tags.includes("GS인증"))
        .slice(0, 3);
    // AI-MASTER 인증 — 고객 눈높이 요약. 시험 계정·내부 파일·계약 로지스틱스 등
    // 사내 정보는 제외하고, 대외 공개 가능한 인증 성격·심사 방식·진행 상태만 담는다.
    const AI_MASTER_INFO: {
        icon: typeof ShieldCheck;
        title: string;
        body: string;
    }[] = [
        {
            icon: Scale,
            title: "국제표준 기반 AI 신뢰성 인증",
            body: "AI-MASTER는 한국인공지능산업협회(AIIA)가 주관하는 민간 AI 신뢰성 인증으로, EU Trustworthy AI 원칙과 ISO/IEC 국제표준을 기준으로 AI의 신뢰성·윤리성·강건성을 평가합니다",
        },
        {
            icon: ScrollText,
            title: "문서 심사 · 기능 시험 병행",
            body: "AI 거버넌스 체계를 담은 관리·개발 문서를 심사하고, 실제 동작을 확인하는 기능 시험을 함께 진행합니다. 63개 정량 항목으로 신뢰성 전반을 점검합니다",
        },
        {
            icon: Activity,
            title: "현재 진행 상황",
            body: "2026년 6월 인증 시험에 착수해 문서 심사와 기능 시험을 진행하고 있습니다. 정상 수행 시 약 13주에 걸친 평가를 거칩니다",
        },
    ];
    return (
        <div className="space-y-10">
            {/* 인덱스 (목차) — 두 인증을 색으로 구분해 바로 이동 */}
            <nav
                aria-label="인증·품질 목차"
                className="grid gap-3 sm:grid-cols-2"
            >
                <a
                    href="#cert-ai-master"
                    className="group flex items-center gap-3 overflow-hidden rounded-xl border border-y-[#bfe9e0] border-r-[#bfe9e0] border-l-4 border-l-[#0f9d8f] bg-gradient-to-br from-[#f2fbf9] to-white px-5 py-4 transition hover:shadow-md"
                >
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-[#0f9d8f] font-mono text-[15px] font-bold text-white shadow-sm">
                        01
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-bold text-[var(--color-ink)]">
                            AI-MASTER
                        </span>
                        <span className="mt-0.5 block text-[13px] text-[#0b7d72]">
                            AI 신뢰성 인증 · 진행 중
                        </span>
                    </span>
                    <ArrowRight className="h-4 w-4 flex-none text-[#0f9d8f] transition group-hover:translate-x-0.5" />
                </a>
                <a
                    href="#cert-gs"
                    className="group flex items-center gap-3 overflow-hidden rounded-xl border border-y-[#bae6fd] border-r-[#bae6fd] border-l-4 border-l-[#0284c7] bg-gradient-to-br from-[#eff8ff] to-white px-5 py-4 transition hover:shadow-md"
                >
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-[#0284c7] font-mono text-[15px] font-bold text-white shadow-sm">
                        02
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-bold text-[var(--color-ink)]">
                            GS인증 · Good Software
                        </span>
                        <span className="mt-0.5 block text-[13px] text-[#0369a1]">
                            SW 품질인증 · 1등급 획득
                        </span>
                    </span>
                    <ArrowRight className="h-4 w-4 flex-none text-[#0284c7] transition group-hover:translate-x-0.5" />
                </a>
            </nav>

            {/* 01 — AI-MASTER (AI 신뢰성 인증) — 틸 패널 */}
            <section id="cert-ai-master" className="scroll-mt-24">
                <div className="overflow-hidden rounded-2xl border border-[#bfe9e0] bg-white shadow-[0_1px_2px_rgba(15,157,143,0.06)]">
                    {/* 헤더 밴드 */}
                    <div className="flex flex-wrap items-center gap-4 border-b border-[#bfe9e0] bg-gradient-to-r from-[#eefaf7] to-white px-6 py-5">
                        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[#0f9d8f] font-mono text-[18px] font-bold text-white shadow-sm">
                            01
                        </span>
                        <div className="min-w-0">
                            <p className="text-[13px] font-bold tracking-tight text-[#0b7d72]">
                                AI 신뢰성 인증
                            </p>
                            <h3 className="text-[20px] font-bold tracking-tight text-[var(--color-ink)]">
                                AI-MASTER
                            </h3>
                        </div>
                        <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-3 py-1 text-[13px] font-semibold text-[var(--color-ink-muted)]">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0f9d8f]" />
                            인증 시험 진행 중
                        </span>
                    </div>

                    {/* 본문 */}
                    <div className="space-y-6 p-6 sm:p-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="flex h-20 w-20 flex-none flex-col items-center justify-center rounded-xl border border-[#bfe9e0] bg-[#effbf8] text-center">
                                <Brain className="h-6 w-6 text-[#0f9d8f]" />
                                <span className="mt-1 text-[13px] font-bold text-[var(--color-ink)]">
                                    AI-MASTER
                                </span>
                            </div>
                            <p className="max-w-2xl text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                                XGEN Agentic AI Platform은 국제표준 기반 AI 신뢰성 인증인
                                AI-MASTER 시험을 받고 있습니다. 문서 심사와 기능 시험을
                                병행해 AI의 신뢰성·투명성·강건성을 제3자 시험기관이
                                검증합니다
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
                            {AI_MASTER_INFO.map((c) => (
                                <div
                                    key={c.title}
                                    className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-6"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f9d8f]/10 text-[#0f9d8f]">
                                            <c.icon className="h-5 w-5" />
                                        </span>
                                        <h4 className="text-[16px] font-bold tracking-tight text-[var(--color-ink)]">
                                            {c.title}
                                        </h4>
                                    </div>
                                    <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
                                        {c.body}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 02 — GS인증 (Good Software) — 골드 패널 */}
            <section id="cert-gs" className="scroll-mt-24">
                <div className="overflow-hidden rounded-2xl border border-[#bae6fd] bg-white shadow-[0_1px_2px_rgba(2,132,199,0.06)]">
                    {/* 헤더 밴드 */}
                    <div className="flex flex-wrap items-center gap-4 border-b border-[#bae6fd] bg-gradient-to-r from-[#eff8ff] to-white px-6 py-5">
                        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[#0284c7] font-mono text-[18px] font-bold text-white shadow-sm">
                            02
                        </span>
                        <div className="min-w-0">
                            <p className="text-[13px] font-bold tracking-tight text-[#0369a1]">
                                SW 품질인증
                            </p>
                            <h3 className="text-[20px] font-bold tracking-tight text-[var(--color-ink)]">
                                GS인증 · Good Software
                            </h3>
                        </div>
                        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#cce6d7] bg-[#ecf8f1] px-3 py-1 text-[13px] font-semibold text-[#1f9d57]">
                            <Check className="h-3.5 w-3.5" />
                            GS 1등급 획득
                        </span>
                    </div>

                    {/* 본문 */}
                    <div className="space-y-6 p-6 sm:p-7">
                        <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
                            <p className="max-w-xl text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                                XGEN이 GS(Good Software) 인증 1등급(최고 등급)을
                                획득했습니다 — 국가 공인 제3자 시험으로 품질을
                                입증했습니다
                            </p>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/gs-seal.png"
                                alt="GS(Good Software) 인증 1등급 마크"
                                className="mx-auto w-44 sm:mx-0"
                            />
                        </div>

                        {gsPosts.length > 0 && (
                            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-6">
                                <h4 className="text-[16px] font-bold tracking-tight text-[var(--color-ink)]">
                                    GS 인증 관련 아티클
                                </h4>
                                <p className="mt-1 text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
                                    GS 인증 준비부터 시험·심사까지의 과정을 인사이트 블로그에 기록했습니다
                                </p>
                                <ul className="mt-4 divide-y divide-[var(--color-line)]">
                                    {gsPosts.map((p) => (
                                        <li key={p.slug}>
                                            <Link
                                                href={`/blog/${p.slug}`}
                                                className="group flex items-center justify-between gap-4 py-3"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 text-[13px] text-[var(--color-ink-subtle)]">
                                                        <span className="rounded-full bg-[#0284c7]/12 px-2 py-0.5 font-semibold text-[#0369a1]">
                                                            {p.category}
                                                        </span>
                                                        <time dateTime={p.date}>
                                                            {p.date.replaceAll("-", ".")}
                                                        </time>
                                                    </div>
                                                    <p className="mt-1 truncate text-[15.5px] font-semibold text-[var(--color-ink)] transition group-hover:text-[#0369a1]">
                                                        {p.title}
                                                    </p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 flex-none text-[var(--color-ink-subtle)] transition group-hover:translate-x-0.5 group-hover:text-[#0369a1]" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/blog"
                                    className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#0369a1] transition hover:text-[#075985]"
                                >
                                    인사이트 블로그 전체 보기
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function SolutionsPage() {
    return (
        <GroupPage
            group={getGroup("solutions")!}
            hero={<SolutionsHero />}
            content={{
                "ai-agents": <AgenticAI />,
                certification: <CertificationQuality />,
            }}
        />
    );
}
