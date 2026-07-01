"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ShieldCheck,
    Server,
    Blocks,
    Bot,
    Database,
    Network,
    Layers,
    Cable,
    ShieldAlert,
    Cpu,
    Boxes,
    Activity,
    Library,
    ArrowRight,
    BadgeCheck,
    GraduationCap,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
    { id: "challenges", label: "우리가 연구하는 핵심 과제" },
    { id: "fields", label: "핵심 연구 분야" },
    { id: "cases", label: "실증 연구 사례" },
    { id: "methodology", label: "검증 가능한 AI를 위한 연구 방법론" },
];

type ArtKind = "trust" | "sovereignty" | "composable";

interface Card {
    icon: LucideIcon;
    kind: ArtKind;
    title: string;
    body: string[];
}

const CHALLENGES: Card[] = [
    {
        icon: ShieldCheck,
        kind: "trust",
        title: "신뢰할 수 있는 AI",
        body: [
            "AI가 생성한 답변이 아닌, 기업이 보유한 지식과 데이터에 근거한 답변을 제공합니다.",
            "모든 응답은 문서, 규정, 업무 지침, 온톨로지 기반 지식 모델을 근거로 생성되며, 근거가 없는 경우에는 명확하게 판단 불가를 선언합니다.",
            "이를 통해 AI 환각(Hallucination)을 최소화하고 설명 가능한 AI 환경을 제공합니다.",
        ],
    },
    {
        icon: Server,
        kind: "sovereignty",
        title: "기업 데이터 주권",
        body: [
            "AI는 기업 내부 데이터 위에서 동작해야 합니다.",
            "Plateer Labs는 클라우드 종속 없이 고객의 인프라 환경에서 AI를 운영할 수 있는 온프레미스 중심 아키텍처를 연구합니다.",
            "금융, 공공, 제조 등 망분리 환경에서도 적용 가능한 운영 체계를 제공합니다.",
        ],
    },
    {
        icon: Blocks,
        kind: "composable",
        title: "조합하고 확장할 수 있는 AI",
        body: [
            "기업의 업무는 모두 다릅니다.",
            "우리는 Agent, Workflow, Knowledge, Tool을 모듈화하여 업무 목적에 따라 재조합할 수 있는 Composable AI Architecture를 연구합니다.",
            "이를 통해 특정 벤더나 모델에 종속되지 않는 유연한 AI 환경을 구현합니다.",
        ],
    },
];

interface Field {
    icon: LucideIcon;
    badge: string;
    title: string;
    desc: string;
    tags: string[];
    note?: string;
}

const FIELDS: Field[] = [
    {
        icon: Bot,
        badge: "Execution",
        title: "Agentic AI Runtime",
        desc: "복잡한 업무를 여러 AI 에이전트가 협업하여 수행하는 실행 환경을 연구합니다.",
        tags: [
            "Planner 기반 계획 수립",
            "Multi-Agent 협업",
            "Tool Calling",
            "Workflow Orchestration",
            "Human-in-the-Loop",
        ],
        note: "단순 질문 응답을 넘어 실제 업무 수행을 목표로 합니다.",
    },
    {
        icon: Database,
        badge: "Retrieval",
        title: "Knowledge & RAG",
        desc: "기업의 문서와 데이터를 활용하여 정확한 답변을 생성하는 지식 엔진을 연구합니다.",
        tags: [
            "Hybrid Retrieval",
            "Multimodal Document Understanding",
            "Structured Table Understanding",
            "Metadata 기반 접근 제어",
            "Grounded Generation",
        ],
        note: "문서, 이미지, 표, 스캔 문서를 통합적으로 이해하는 차세대 RAG 기술을 개발하고 있습니다.",
    },
    {
        icon: Network,
        badge: "Core Focus",
        title: "Ontology & Graph Intelligence",
        desc: "Plateer Labs의 핵심 연구 영역입니다. 단순 검색을 넘어 기업 데이터 간의 관계와 맥락을 이해하는 Ontology 기반 AI를 연구합니다.",
        tags: [
            "조직 지식의 구조화",
            "관계 기반 탐색",
            "원인 분석",
            "영향도 분석",
            "멀티홉 추론",
        ],
        note: "이를 통해 관계와 맥락을 추론하는 Graph RAG 환경을 구축합니다.",
    },
    {
        icon: Layers,
        badge: "Model-Agnostic",
        title: "Enterprise Model Architecture",
        desc: "기업은 특정 모델에 종속되어서는 안 됩니다. 다양한 LLM을 업무 목적과 비용, 정확도에 따라 선택적으로 활용할 수 있는 모델 중립(Model-Agnostic) 구조를 연구합니다.",
        tags: ["Claude", "GPT", "Gemini", "Private LLM"],
        note: "다양한 모델을 하나의 체계에서 통합 운영할 수 있습니다.",
    },
    {
        icon: Cable,
        badge: "Integration",
        title: "AI Connectivity & MCP",
        desc: "기업 내부 시스템과 AI를 연결하는 기술을 연구합니다.",
        tags: ["ERP", "그룹웨어", "데이터베이스", "문서 시스템", "업무 시스템"],
        note: "내부 시스템과 AI를 안전하게 연계하여 업무 자동화를 실현합니다.",
    },
    {
        icon: ShieldAlert,
        badge: "Security",
        title: "AI Governance & Security",
        desc: "AI 도입의 핵심은 보안과 통제입니다. 금융권과 공공기관 수준의 보안 요구사항을 충족하기 위한 Governance Framework를 연구합니다.",
        tags: [
            "Context Isolation",
            "Prompt Firewall",
            "개인정보 보호",
            "감사 추적(Audit Trail)",
            "정책 기반 Agent 제어",
            "위험도 평가",
            "승인 체계(Human Approval)",
        ],
    },
];

const CASES: {
    icon: LucideIcon;
    title: string;
    desc: string;
    href: string;
}[] = [
    {
        icon: Cpu,
        title: "Engines",
        desc: "인제스션·검색·추론을 처리하는 XGEN 핵심 AI 엔진",
        href: "/technology#engines",
    },
    {
        icon: Boxes,
        title: "Frameworks",
        desc: "Agent·Workflow·Knowledge를 조합하는 애플리케이션 프레임워크",
        href: "/technology#frameworks",
    },
    {
        icon: Activity,
        title: "Runtime",
        desc: "엔터프라이즈 환경에서 AI를 안정적으로 운영하는 실행 런타임",
        href: "/technology#runtime",
    },
    {
        icon: Library,
        title: "Library Gallery",
        desc: "XGEN을 떠받치는 오픈소스 라이브러리 모음 — pip 설치·브라우저 체험",
        href: "/library-gallery",
    },
];

const METHODOLOGY = [
    "Accuracy Benchmark",
    "Groundedness Evaluation",
    "Hallucination Assessment",
    "Coverage Analysis",
    "Response Performance Benchmark",
];

/** Highlights the section currently in view for the sticky index. */
function useScrollSpy(ids: string[]) {
    const [active, setActive] = useState(ids[0]);
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]) setActive(visible[0].target.id);
            },
            { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
        );
        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [ids]);
    return active;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-[28px]">
            {children}
        </h3>
    );
}

function Chips({ items }: { items: string[] }) {
    return (
        <div className="mt-4 flex flex-wrap gap-2">
            {items.map((t) => (
                <span
                    key={t}
                    className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-3 py-1 text-[15px] font-medium text-[var(--color-ink-muted)]"
                >
                    {t}
                </span>
            ))}
        </div>
    );
}

function IconBadge({ icon: Icon }: { icon: LucideIcon }) {
    return (
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f7bff] to-[#7c5cff] text-white">
            <Icon className="h-5 w-5" />
        </span>
    );
}

/** Hand-drawn SVG illustration per core-challenge topic. */
function ChallengeArt({ kind, className }: { kind: ArtKind; className?: string }) {
    const wrap = (bg: string, children: React.ReactNode) => (
        <div
            className={cn(
                "relative aspect-[16/10] overflow-hidden rounded-xl border border-[var(--color-line)]",
                bg,
                className,
            )}
        >
            <svg
                viewBox="0 0 360 220"
                fill="none"
                className="h-full w-full"
                role="img"
            >
                {children}
            </svg>
        </div>
    );

    if (kind === "trust") {
        return wrap(
            "bg-gradient-to-br from-[#eef3ff] to-[#e7ecff]",
            <>
                <defs>
                    <linearGradient id="trustShield" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#3b82f6" />
                        <stop offset="1" stopColor="#7c5cff" />
                    </linearGradient>
                </defs>
                <g stroke="#9bb8ff" strokeWidth="2">
                    <line x1="98" y1="74" x2="168" y2="118" />
                    <line x1="92" y1="166" x2="168" y2="122" />
                    <line x1="268" y1="80" x2="192" y2="118" />
                </g>
                {[
                    { x: 52, y: 48 },
                    { x: 48, y: 140 },
                    { x: 244, y: 52 },
                ].map((d, i) => (
                    <g key={i}>
                        <rect x={d.x} y={d.y} width="48" height="58" rx="7" fill="#fff" stroke="#cdd9f5" />
                        <rect x={d.x + 9} y={d.y + 12} width="22" height="4" rx="2" fill="#bcd0f7" />
                        <rect x={d.x + 9} y={d.y + 22} width="30" height="4" rx="2" fill="#dde7fb" />
                        <rect x={d.x + 9} y={d.y + 32} width="26" height="4" rx="2" fill="#dde7fb" />
                    </g>
                ))}
                <path
                    d="M180 62 L223 79 V120 C223 153 202 172 180 182 C158 172 137 153 137 120 V79 Z"
                    fill="url(#trustShield)"
                />
                <path
                    d="M164 121 l11 11 l21 -27"
                    stroke="#fff"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </>,
        );
    }

    if (kind === "sovereignty") {
        return wrap(
            "bg-gradient-to-br from-[#eafff6] to-[#e6fbf1]",
            <>
                <rect
                    x="28"
                    y="42"
                    width="208"
                    height="148"
                    rx="16"
                    fill="#10b981"
                    fillOpacity="0.06"
                    stroke="#34d399"
                    strokeWidth="2"
                    strokeDasharray="7 7"
                />
                {[72, 106, 140].map((y) => (
                    <g key={y}>
                        <rect x="74" y={y} width="116" height="26" rx="6" fill="#fff" stroke="#a9e6cd" />
                        <circle cx="88" cy={y + 13} r="3.6" fill="#10b981" />
                        <rect x="102" y={y + 10} width="74" height="6" rx="3" fill="#e1f6ec" />
                    </g>
                ))}
                <g transform="translate(44,56)">
                    <circle cx="0" cy="0" r="16" fill="#10b981" />
                    <rect x="-6" y="-2" width="12" height="10" rx="2" fill="#fff" />
                    <path d="M-3 -2 v-3 a3 3 0 0 1 6 0 v3" stroke="#fff" strokeWidth="2" fill="none" />
                </g>
                <g transform="translate(286,96)">
                    <path
                        d="M-28 14 a16 16 0 0 1 3 -32 a21 21 0 0 1 39 5 a14 14 0 0 1 -2 27 z"
                        fill="#eef2f7"
                        stroke="#cbd5e1"
                        strokeWidth="2"
                    />
                    <line x1="-30" y1="22" x2="24" y2="-28" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
                </g>
            </>,
        );
    }

    // composable
    return wrap(
        "bg-gradient-to-br from-[#f6f0ff] to-[#efe9ff]",
        <>
            <g stroke="#c9b8ff" strokeWidth="2">
                <line x1="118" y1="80" x2="172" y2="108" />
                <line x1="242" y1="80" x2="188" y2="108" />
                <line x1="118" y1="140" x2="172" y2="112" />
                <line x1="242" y1="140" x2="188" y2="112" />
            </g>
            {[
                { x: 56, y: 56, label: "Agent" },
                { x: 214, y: 56, label: "Workflow" },
                { x: 56, y: 116, label: "Knowledge" },
                { x: 214, y: 116, label: "Tool" },
            ].map((b) => (
                <g key={b.label}>
                    <rect x={b.x} y={b.y} width="90" height="48" rx="11" fill="#fff" stroke="#d8ccff" />
                    <text
                        x={b.x + 45}
                        y={b.y + 29}
                        textAnchor="middle"
                        fontSize="13.5"
                        fontWeight="700"
                        fill="#7c3aed"
                        fontFamily="inherit"
                    >
                        {b.label}
                    </text>
                </g>
            ))}
            <circle cx="180" cy="110" r="17" fill="#7c5cff" />
            <circle cx="180" cy="110" r="6" fill="#fff" />
        </>,
    );
}

export function ResearchContent() {
    const active = useScrollSpy(NAV.map((n) => n.id));

    return (
        <div className="grid gap-12 lg:grid-cols-[1fr_240px]">
            <div className="min-w-0 space-y-24">
                {/* 콘텐츠 헤드라인 — 키비주얼에서 분리한 연구 메시지 */}
                <header className="max-w-3xl border-b border-[var(--color-line)] pb-12">
                    <p className="text-[16px] leading-relaxed text-[var(--color-ink-subtle)]">
                        공공기관과 대기업은 데이터 주권, 보안, 감사 추적, 조직
                        거버넌스, 운영 안정성까지 고려해야 하며, AI는 단순한 실험을
                        넘어 실제 업무 프로세스에 통합되어야 합니다
                    </p>
                    <h2 className="mt-5 text-2xl font-bold leading-snug tracking-tight text-[var(--color-ink)] md:text-[28px] md:leading-snug">
                        Plateer Labs는 이러한 요구에 대응하기 위해 기업 환경에
                        최적화된 Agentic AI 기술과 운영 체계를 연구합니다
                    </h2>
                    <p className="mt-4 text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                        우리는 단순한 LLM 활용을 넘어, 지식·추론·실행·운영이 하나의
                        체계로 연결되는 Enterprise AI Runtime을 구축하는 것을
                        목표로 합니다
                    </p>
                </header>

                {/* 1. 우리가 연구하는 핵심 과제 */}
                <section id="challenges" className="scroll-mt-28">
                    <SectionHeading>우리가 연구하는 핵심 과제</SectionHeading>
                    <div className="mt-7 space-y-6">
                        {CHALLENGES.map((c, i) => (
                            <div
                                key={c.title}
                                className="grid items-center gap-6 rounded-2xl border border-[var(--color-line)] bg-white p-6 md:grid-cols-2 md:gap-8 md:p-8"
                            >
                                <div className={i % 2 === 1 ? "md:order-2" : undefined}>
                                    <div className="flex items-center gap-3">
                                        <IconBadge icon={c.icon} />
                                        <h4 className="text-xl font-bold tracking-tight text-[var(--color-ink)]">
                                            {c.title}
                                        </h4>
                                    </div>
                                    <div className="mt-4 space-y-2.5 text-[16.5px] leading-relaxed text-[var(--color-ink-muted)]">
                                        {c.body.map((p, j) => (
                                            <p key={j}>{p}</p>
                                        ))}
                                    </div>
                                </div>
                                <ChallengeArt
                                    kind={c.kind}
                                    className={i % 2 === 1 ? "md:order-1" : undefined}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. 핵심 연구 분야 — 컴팩트 2열 그리드(상단 컬러 액센트) */}
                <section id="fields" className="scroll-mt-28">
                    <SectionHeading>핵심 연구 분야</SectionHeading>
                    <div className="mt-7 grid gap-5 md:grid-cols-2">
                        {FIELDS.map((f) => (
                            <div
                                key={f.title}
                                className="flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[0_1px_2px_rgba(20,40,80,0.04)] transition hover:border-[#bcd0f5] hover:shadow-[0_14px_36px_-18px_rgba(20,40,80,0.22)] md:p-7"
                            >
                                {/* 아이콘 박스 + 배지 (첨부 논문 카드 스타일) */}
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2f7bff]/10 text-[#2f7bff]">
                                        <f.icon className="h-5 w-5" />
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-[#2f7bff] px-3 py-1 text-[14px] font-bold tracking-tight text-white">
                                        {f.badge}
                                    </span>
                                </div>

                                <h4 className="mt-4 text-[19px] font-bold leading-snug tracking-tight text-[var(--color-ink)]">
                                    {f.title}
                                </h4>
                                <p className="mt-2.5 text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                                    {f.desc}
                                </p>
                                <Chips items={f.tags} />
                                {f.note && (
                                    <p className="mt-auto pt-4 text-[15px] leading-relaxed text-[var(--color-ink-subtle)]">
                                        {f.note}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. 실증 연구 사례 */}
                <section id="cases" className="scroll-mt-28">
                    <SectionHeading>실증 연구 사례</SectionHeading>
                    <p className="mt-3 text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                        연구 성과는 XGEN의 기술 스택으로 제품화됩니다
                    </p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {CASES.map((c) => (
                            <Link
                                key={c.title}
                                href={c.href}
                                className="group flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-5 transition hover:border-[var(--color-line-strong)] hover:shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <IconBadge icon={c.icon} />
                                        <h4 className="text-[17px] font-bold tracking-tight text-[var(--color-ink)]">
                                            {c.title}
                                        </h4>
                                    </div>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-ink-subtle)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-ink)]" />
                                </div>
                                <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--color-ink-muted)]">
                                    {c.desc}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 4. 검증 가능한 AI를 위한 연구 방법론 */}
                <section id="methodology" className="scroll-mt-28">
                    <SectionHeading>검증 가능한 AI를 위한 연구 방법론</SectionHeading>
                    <p className="mt-3 text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                        Plateer Labs는 단순 데모가 아닌 재현 가능한 검증 체계를
                        운영합니다
                    </p>
                    <div className="mt-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-7">
                        <div className="flex items-center gap-3">
                            <IconBadge icon={BadgeCheck} />
                            <h4 className="text-lg font-bold tracking-tight text-[var(--color-ink)]">
                                Validation Framework
                            </h4>
                        </div>
                        <Chips items={METHODOLOGY} />
                        <p className="mt-5 border-t border-[var(--color-line)] pt-4 text-[16px] font-medium leading-relaxed text-[var(--color-ink)]">
                            모든 연구 결과는 정량적 지표를 기반으로 평가됩니다
                        </p>
                    </div>
                </section>
            </div>

            {/* sticky scroll-spy index (right) */}
            <aside className="hidden lg:block">
                <nav className="sticky top-28 border-l border-[var(--color-line)]">
                    {NAV.map((n) => (
                        <a
                            key={n.id}
                            href={`#${n.id}`}
                            className={cn(
                                "-ml-px block border-l-2 py-2 pl-4 text-[16px] leading-snug transition",
                                active === n.id
                                    ? "border-[#2f7bff] font-semibold text-[var(--color-ink)]"
                                    : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
                            )}
                        >
                            {n.label}
                        </a>
                    ))}
                </nav>
            </aside>
        </div>
    );
}

/**
 * Papers 섹션 콘텐츠 — 연구 그룹 one-page의 `/research#papers` 섹션에 주입된다.
 * 섹션 제목("Papers")은 GroupPage의 Section이 렌더하므로 여기서는 카드만 반환한다.
 */
export function PapersContent() {
    return (
        <div className="rounded-2xl border border-[var(--color-line)] bg-white p-7 md:p-8">
            <div className="flex items-center gap-3">
                <IconBadge icon={GraduationCap} />
                <h4 className="text-xl font-bold tracking-tight text-[var(--color-ink)]">
                    학술적 검증을 거친 AI 핵심 기술
                </h4>
            </div>
            <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-[var(--color-ink-muted)]">
                Enterprise AI의 신뢰성과 실용성을 높이기 위해 연구 성과를
                지속적으로 발표하고 검증합니다
            </p>

            {/* 구성원 논문 연결 영역 — 추후 게재 */}
            <div className="mt-6 rounded-xl border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-alt)] p-8 text-center">
                <p className="text-[16px] text-[var(--color-ink-muted)]">
                    구성원들의 논문이 곧 연결됩니다
                </p>
            </div>
        </div>
    );
}
