"use client";

import { useEffect, useState } from "react";
import {
    Network,
    Cpu,
    TerminalSquare,
    Server,
    Layers,
    Gauge,
    Brain,
    BadgeCheck,
    ArrowRight,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * research-areas2 — 사내 위키 "03. R&D/연구"(AI Platform&도구 연구 · 온톨로지 ·
 * 개발 도구 가이드 · 하네스)의 실제 연구 내용을 B2B 고객 눈높이로 재작성한 버전.
 * 기존 research-content.tsx(=research-areas)는 백업으로 보존하고, 이 컴포넌트는
 * /research-areas2 에서 미리보기한다.
 */

const NAV = [
    { id: "fields", label: "핵심 연구 분야" },
    { id: "ontology", label: "온톨로지 심층" },
    { id: "highlights", label: "연구 하이라이트" },
    { id: "methodology", label: "연구 방법론" },
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
        icon: Network,
        badge: "Core Focus",
        title: "Ontology & Graph Intelligence",
        desc: "RAG에 온톨로지 지식그래프를 결합한 OGRAG를 연구합니다. 문서에 직접 적혀 있지 않아도 정의된 규칙(OWL 추론)으로 논리적 사실을 도출하고, 왜 그 답이 나왔는지 그래프 경로로 설명합니다.",
        tags: [
            "OGRAG",
            "OWL 추론",
            "지식그래프(RDF·Neo4j)",
            "설명 가능성",
            "Entity-Relation 편집",
            "Graph RAG",
        ],
        note: "LLM(유사도)과 온톨로지(논리)를 결합해 검색 품질과 설명력을 함께 높입니다",
    },
    {
        icon: Cpu,
        badge: "Execution Core",
        title: "Agent Harness Runtime",
        desc: "LLM을 감싸 실제 행동으로 바꾸는 실행 제어 프레임워크(하네스)를 12개 계층으로 연구합니다. 도구 실행·권한 샌드박스·컨텍스트 압축·세션 영속·서브에이전트가 하나의 런타임으로 동작합니다.",
        tags: [
            "12계층 하네스",
            "Tool Dispatch",
            "권한 샌드박스",
            "Sub-Agent 병렬",
            "컨텍스트 압축",
            "MCP 통합",
        ],
        note: "에이전트의 경쟁력은 모델이 아니라 실행 제어에 있습니다",
    },
    {
        icon: TerminalSquare,
        badge: "Productivity",
        title: "AI 개발 생산성 · 도구 엔지니어링",
        desc: "AI 코딩 도구를 코드 레벨로 분석하고, 토큰 최적화·자동화 환경을 연구합니다. 동적 도구 로딩으로 도구 정의 토큰을 최대 79% 줄이고, 도구 검색 정확도를 82%까지 끌어올렸습니다.",
        tags: [
            "하네스 엔지니어링 분석",
            "graph-tool-call",
            "동적 도구 로딩",
            "토큰 최적화",
            "슬래시 명령·Hook",
            "워크플로우 자동화",
        ],
        note: "반복 업무를 AI 워크플로우로 자동화해 개발 생산성을 높입니다",
    },
    {
        icon: Server,
        badge: "Infra & Model",
        title: "Enterprise AI 인프라 · 모델 최적화",
        desc: "특정 하드웨어·모델에 종속되지 않는 운영을 위해 서빙 인프라와 모델을 연구합니다. NPU/GPU 다양성, 멀티노드 추론, MLOps 파이프라인, 한국어 모델·임베딩 평가를 다룹니다.",
        tags: [
            "NPU/GPU 서빙 최적화",
            "멀티노드 vLLM",
            "MLOps(Metaflow)",
            "한국어 LLM·임베딩 평가",
            "검색 최적화",
            "온프레미스 배포",
        ],
        note: "비용·성능·정확도 기준으로 하드웨어와 모델을 선택합니다",
    },
];

/** OGRAG 온톨로지 빌드 파이프라인 단계. */
const ONTOLOGY_STEPS = [
    "문서 수집",
    "스키마·인스턴스 추출",
    "OWL 생성",
    "SCS 프로필",
    "지식그래프 구축",
    "그래프 뷰어·전문가 편집",
];

interface Highlight {
    icon: LucideIcon;
    stat: string;
    label: string;
    desc: string;
}

const HIGHLIGHTS: Highlight[] = [
    {
        icon: Layers,
        stat: "12",
        label: "하네스 계층 아키텍처",
        desc: "AI 코딩 도구를 코드 레벨로 분석해, LLM 실행 제어 프레임워크를 12개 계층으로 구조화했습니다.",
    },
    {
        icon: Gauge,
        stat: "−79%",
        label: "도구 정의 토큰 절감",
        desc: "동적 도구 로딩으로 도구 검색 정확도를 12%에서 82%로 높이면서 토큰 사용을 79% 줄였습니다.",
    },
    {
        icon: Brain,
        stat: "유저 단위",
        label: "장기기억 확장 설계",
        desc: "세션 경계를 넘어 유저·조직 단위로 지속되는 에이전트 기억 구조를 사례조사 기반으로 설계했습니다.",
    },
    {
        icon: Cpu,
        stat: "½ 비용",
        label: "추론 하드웨어 최적화",
        desc: "Intel Gaudi HPU 검증에서 A100 대비 절반 가격으로 유사한 추론 성능을 확인했습니다.",
    },
];

const METHODOLOGY = [
    "Accuracy Benchmark",
    "Groundedness Evaluation",
    "Hallucination Assessment",
    "멀티에이전트 적대적 교차검증",
    "한국어 LLM·임베딩 벤치마크",
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

export function ResearchContent2() {
    const active = useScrollSpy(NAV.map((n) => n.id));

    return (
        <div className="grid gap-12 lg:grid-cols-[1fr_240px]">
            <div className="min-w-0 space-y-24">
                {/* 콘텐츠 헤드라인 */}
                <header className="max-w-3xl border-b border-[var(--color-line)] pb-12">
                    <p className="text-[16px] leading-relaxed text-[var(--color-ink-subtle)]">
                        Plateer Labs의 R&amp;D는 실제 기업 환경에서 검증한 네 갈래
                        연구로 이어집니다 — 온톨로지 기반 지식, 에이전트 실행 제어,
                        AI 개발 생산성, 그리고 인프라·모델 최적화입니다
                    </p>
                    <h2 className="mt-5 text-2xl font-bold leading-snug tracking-tight text-[var(--color-ink)] md:text-[28px] md:leading-snug">
                        답을 지어내지 않고 근거로 추론하며, 모델이 아니라 실행 체계로
                        신뢰를 만드는 Enterprise AI를 연구합니다
                    </h2>
                    <p className="mt-4 text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                        각 연구는 데모가 아니라 정량 지표와 적대적 교차검증을 거쳐
                        XGEN 플랫폼의 기능으로 제품화됩니다
                    </p>
                </header>

                {/* 1. 핵심 연구 분야 */}
                <section id="fields" className="scroll-mt-28">
                    <SectionHeading>핵심 연구 분야</SectionHeading>
                    <div className="mt-7 grid gap-5 md:grid-cols-2">
                        {FIELDS.map((f) => (
                            <div
                                key={f.title}
                                className="flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[0_1px_2px_rgba(20,40,80,0.04)] transition hover:border-[#bcd0f5] hover:shadow-[0_14px_36px_-18px_rgba(20,40,80,0.22)] md:p-7"
                            >
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

                {/* 2. 온톨로지 심층 — OGRAG */}
                <section id="ontology" className="scroll-mt-28">
                    <SectionHeading>온톨로지 심층 — OGRAG</SectionHeading>
                    <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                        일반 RAG는 문서에 직접 적힌 문장만 찾습니다. OGRAG는 지식을
                        관계로 구조화해, 문서에 없는 사실도 규칙을 따라 논리적으로
                        도출하고 그 근거를 그래프 경로로 제시합니다
                    </p>

                    <div className="mt-7 grid gap-5 lg:grid-cols-3">
                        {[
                            {
                                t: "RAG의 한계",
                                d: "관련 문서를 찾아 그대로 전달하는 방식이라, 문서에 직접 적혀 있지 않은 관계는 답하지 못합니다.",
                            },
                            {
                                t: "온톨로지 추론",
                                d: "개념 간 관계를 규칙(OWL)으로 정의하면, ‘A는 B, B는 C → A는 C’ 같은 추론이 가능해집니다.",
                            },
                            {
                                t: "AI 구축 + 전문가 검수",
                                d: "AI가 문서를 읽어 온톨로지 초안을 자동 생성하고, 도메인 전문가가 그래프 위에서 검토·보정합니다.",
                            },
                        ].map((c) => (
                            <div
                                key={c.t}
                                className="rounded-2xl border border-[var(--color-line)] bg-white p-6"
                            >
                                <h4 className="text-[17px] font-bold tracking-tight text-[var(--color-ink)]">
                                    {c.t}
                                </h4>
                                <p className="mt-2 text-[15.5px] leading-relaxed text-[var(--color-ink-muted)]">
                                    {c.d}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* 빌드 파이프라인 */}
                    <div className="mt-5 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-6 md:p-7">
                        <p className="font-mono text-[12px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                            Ontology Build Pipeline
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-2">
                            {ONTOLOGY_STEPS.map((s, i) => (
                                <div key={s} className="flex items-center gap-1.5">
                                    <span className="rounded-lg border border-[var(--color-line)] bg-white px-3 py-1.5 text-[14.5px] font-semibold text-[var(--color-ink)]">
                                        {s}
                                    </span>
                                    {i < ONTOLOGY_STEPS.length - 1 && (
                                        <ArrowRight className="h-4 w-4 text-[var(--color-ink-subtle)]" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-ink-subtle)]">
                            AI가 초안을 만들고, 도메인 전문가가 다듬는 협업 구조로 실제
                            운영 가능한 지식 베이스를 완성합니다
                        </p>
                    </div>
                </section>

                {/* 3. 연구 하이라이트 */}
                <section id="highlights" className="scroll-mt-28">
                    <SectionHeading>연구 하이라이트</SectionHeading>
                    <p className="mt-3 text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                        정량 지표로 확인한 대표 연구 성과입니다
                    </p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {HIGHLIGHTS.map((h) => (
                            <div
                                key={h.label}
                                className="flex gap-4 rounded-2xl border border-[var(--color-line)] bg-white p-6"
                            >
                                <IconBadge icon={h.icon} />
                                <div className="min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[24px] font-extrabold tracking-tight text-[#2f7bff]">
                                            {h.stat}
                                        </span>
                                        <span className="text-[16px] font-bold text-[var(--color-ink)]">
                                            {h.label}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                                        {h.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. 연구 방법론 */}
                <section id="methodology" className="scroll-mt-28">
                    <SectionHeading>검증 가능한 AI를 위한 연구 방법론</SectionHeading>
                    <p className="mt-3 text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                        모든 연구 결과는 재현 가능한 검증 체계를 거칩니다
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
                            핵심 주장은 멀티에이전트 적대적 교차검증으로 반증을 시도한
                            뒤에만 채택합니다
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
