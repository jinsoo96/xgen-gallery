import type { ReactNode } from "react";
import {
    BookOpen,
    Layers,
    ShieldCheck,
    Boxes,
    Cable,
    Network,
    ChevronRight,
    RotateCw,
    Settings,
    Workflow,
    ListChecks,
} from "lucide-react";

/**
 * Technology 페이지 섹션 콘텐츠 — XGEN 발표자료(운영·독립·연결·확장)를 웹 에디토리얼로
 * 재구성. PPT 장표를 그대로 쓰지 않고, 핵심 다이어그램을 인라인 SVG·HTML로 재현한다.
 * (실제 텍스트·벡터라 해상도 독립 + GEO·SEO 크롤링·인용 가능)
 * 각 하위 주제는 GNB 딥링크(#ontology, #harness, #mcp-apps …)와 맞물리도록 id를 갖는다.
 */

function Lead({ children }: { children: ReactNode }) {
    return (
        <p className="max-w-3xl text-[18px] leading-relaxed text-[var(--color-ink-muted)]">
            {children}
        </p>
    );
}

function Topic({
    id,
    pillar,
    en,
    title,
    children,
}: {
    id: string;
    pillar: string;
    en: string;
    title: string;
    children: ReactNode;
}) {
    return (
        <div id={id} className="scroll-mt-24 border-t border-[var(--color-line)] pt-14 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-2 text-[14px] font-semibold">
                <span className="rounded-full bg-[#2f7bff]/10 px-2.5 py-0.5 text-[#2461d8]">
                    {pillar}
                </span>
                <span className="text-[var(--color-ink-subtle)]">{en}</span>
            </div>
            <h3 className="mt-3 text-xl font-bold tracking-tight text-[var(--color-ink)] md:text-2xl">
                {title}
            </h3>
            <div className="mt-4">{children}</div>
        </div>
    );
}

function Quote({ children }: { children: ReactNode }) {
    return (
        <p className="mt-5 max-w-2xl border-l-2 border-[#2f7bff]/40 pl-4 text-[16px] font-semibold italic leading-relaxed text-[var(--color-ink)]">
            {children}
        </p>
    );
}

/* ── 네이티브 다이어그램 ─────────────────────────────────────── */

/** Ontology — 관계를 따라가는 지식 그래프 (인라인 SVG). */
function OntologyGraph() {
    const nodes: Record<string, [number, number, string]> = {
        q: [70, 175, "질문"],
        order: [250, 80, "주문"],
        cust: [250, 270, "고객"],
        item: [440, 175, "상품"],
        eval: [430, 60, "평가"],
        react: [430, 290, "반응"],
        fact: [620, 175, "근거"],
    };
    const edges: [string, string][] = [
        ["q", "order"],
        ["q", "cust"],
        ["order", "eval"],
        ["order", "item"],
        ["cust", "react"],
        ["item", "eval"],
        ["item", "fact"],
        ["react", "fact"],
    ];
    const path: [string, string][] = [
        ["q", "order"],
        ["order", "item"],
        ["item", "fact"],
    ];
    const isPath = (a: string, b: string) =>
        path.some(([x, y]) => x === a && y === b);

    return (
        <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-4">
            <svg viewBox="0 0 700 340" className="w-full" role="img" aria-label="질문에서 출발해 데이터 간 관계를 따라 근거에 도달하는 지식 그래프">
                <defs>
                    <linearGradient id="ont-g" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#2f7bff" />
                        <stop offset="1" stopColor="#7c5cff" />
                    </linearGradient>
                </defs>
                {/* edges */}
                {edges.map(([a, b]) => {
                    const [x1, y1] = nodes[a];
                    const [x2, y2] = nodes[b];
                    const hot = isPath(a, b);
                    return (
                        <line
                            key={a + b}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={hot ? "#2f7bff" : "#c4ccdb"}
                            strokeWidth={hot ? 3 : 1.5}
                            strokeDasharray={hot ? "0" : "4 4"}
                        />
                    );
                })}
                {/* nodes */}
                {Object.entries(nodes).map(([k, [x, y, label]]) => {
                    const isQ = k === "q";
                    const isFact = k === "fact";
                    return (
                        <g key={k}>
                            <circle
                                cx={x}
                                cy={y}
                                r="26"
                                fill={isQ ? "url(#ont-g)" : isFact ? "#10b981" : "#ffffff"}
                                stroke={isQ || isFact ? "none" : "#2f7bff"}
                                strokeWidth="2"
                            />
                            <text
                                x={x}
                                y={y + 5}
                                textAnchor="middle"
                                fontSize="14"
                                fontWeight="700"
                                fill={isQ || isFact ? "#fff" : "#1f2733"}
                            >
                                {label}
                            </text>
                        </g>
                    );
                })}
                {/* labels */}
                <text x="70" y="232" textAnchor="middle" fontSize="12" fill="#5a6478">유사도가 아닌</text>
                <text x="160" y="150" fontSize="11" fill="#8b93a4" transform="rotate(-26 160 150)">관계</text>
                <text x="620" y="232" textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f9d6f">근거 경로 도달</text>
            </svg>
        </div>
    );
}

/** Harness — 9 Stage / 3 Phase의 핵심 실행 파이프라인 (HTML). */
function HarnessPipeline() {
    const steps: [string, string, string][] = [
        ["01", "Trigger", "요청 수신"],
        ["02", "Plan", "테스트 계획"],
        ["03", "Execute", "스크립트 실행"],
        ["04", "Verify", "결과 검증"],
        ["05", "Report", "리포트 생성"],
    ];
    return (
        <div className="mt-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[repeat(5,1fr)] sm:items-stretch">
                {steps.map(([no, t, d], i) => (
                    <div key={no} className="flex items-center gap-2 sm:flex-col sm:items-stretch sm:gap-0">
                        <div className="flex flex-1 flex-col rounded-xl border border-[var(--color-line)] bg-white p-3.5">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#2f7bff] to-[#7c5cff] font-mono text-[13px] font-bold text-white">
                                {no}
                            </span>
                            <span className="mt-2.5 text-[15px] font-bold text-[var(--color-ink)]">{t}</span>
                            <span className="text-[13px] text-[var(--color-ink-muted)]">{d}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <ChevronRight className="h-4 w-4 shrink-0 rotate-90 self-center text-[var(--color-ink-subtle)] sm:rotate-0 sm:hidden" />
                        )}
                    </div>
                ))}
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-white px-3 py-1 text-[13px] font-medium text-[var(--color-ink-muted)]">
                <RotateCw className="h-3.5 w-3.5 text-[#2f7bff]" />
                피드백 루프 기반 지속 개선 — 점수 미달 시 재시도로 환각·오류 차단
            </p>
        </div>
    );
}

/** MCP Apps — Wrapper(감싸기) vs Compiler(코드 내재) 비교 다이어그램 (HTML). */
function WrapperCompilerDiagram() {
    return (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Wrapper — 엔진이 플랫폼 안에 남음 */}
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-6">
                <h4 className="text-[16px] font-bold text-[var(--color-ink)]">
                    엔진이 플랫폼 안에 남아있음
                </h4>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#e5e7eb] px-2.5 py-1 text-[13px] font-bold text-[#4b5563]">
                        Wrapper 방식
                    </span>
                    <span className="text-[13px] text-[var(--color-ink-muted)]">
                        MCP 핸드프린트를 ‘감싸는 구조’
                    </span>
                </div>
                <div className="mt-4 flex items-center gap-2.5">
                    <div className="min-w-0 flex-1 rounded-xl border border-[#d4d8e0] bg-white p-3">
                        <p className="text-[12.5px] font-semibold text-[var(--color-ink-muted)]">
                            MCP WRAPPER
                        </p>
                        <div className="mt-2 rounded-lg border border-[#dbe0e8] bg-[var(--color-surface-alt)] p-2.5">
                            <p className="text-[12.5px] font-semibold text-[var(--color-ink-muted)]">
                                Platform Engine (always-on)
                            </p>
                            <div className="mt-2 flex items-center gap-2 rounded-md border border-[#e2e6ee] bg-white px-2.5 py-2">
                                <Settings className="h-4 w-4 flex-none text-[var(--color-ink-subtle)]" />
                                <div className="min-w-0">
                                    <p className="text-[13px] font-bold text-[var(--color-ink)]">
                                        Workflow JSON
                                    </p>
                                    <p className="text-[11.5px] text-[var(--color-ink-subtle)]">
                                        플랫폼 DB 안에 저장
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 flex-none text-[var(--color-ink-subtle)]" />
                    <div className="w-24 flex-none rounded-xl border border-[#d4d8e0] bg-[#eceef2] p-2.5 text-center">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-subtle)]">
                            Output
                        </p>
                        <p className="mt-1 text-[13px] font-bold leading-snug text-[var(--color-ink)]">
                            플랫폼 종속 MCP 서버
                        </p>
                        <p className="mt-1 text-[11.5px] text-[var(--color-ink-subtle)]">
                            Node · Python
                        </p>
                    </div>
                </div>
                <p className="mt-4 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
                    엔진을 내부에 상시 구동하고 MCP로 겉면만 래핑
                </p>
            </div>

            {/* Compiler — 실행 로직을 독립 자산으로 (XGEN) */}
            <div className="rounded-2xl border border-[#cfe0ff] bg-[#f3f7ff] p-6">
                <h4 className="text-[16px] font-bold text-[#2461d8]">
                    실행 로직을 독립 자산으로 전환
                </h4>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#2f7bff] px-2.5 py-1 text-[13px] font-bold text-white">
                        Compiler 방식
                    </span>
                    <span className="text-[13px] text-[var(--color-ink-muted)]">
                        표준 프로세스 코드로 내재화
                    </span>
                </div>
                <div className="mt-4 flex items-center gap-2.5">
                    <div className="min-w-0 flex-1 rounded-xl border border-[#bcd0f5] bg-white p-3">
                        <p className="text-[12.5px] font-semibold text-[#2461d8]">
                            XGEN SDK
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            <div className="rounded-lg border border-[#cfe0ff] bg-[#f7faff] px-2 py-2 text-center">
                                <Workflow className="mx-auto h-4 w-4 text-[#2f7bff]" />
                                <p className="mt-1 text-[13px] font-bold text-[var(--color-ink)]">
                                    Workflow
                                </p>
                                <p className="text-[11.5px] text-[#2461d8]">코드 내재</p>
                            </div>
                            <div className="rounded-lg border border-[#cfe0ff] bg-[#f7faff] px-2 py-2 text-center">
                                <ListChecks className="mx-auto h-4 w-4 text-[#2f7bff]" />
                                <p className="mt-1 text-[13px] font-bold text-[var(--color-ink)]">
                                    Tool
                                </p>
                                <p className="text-[11.5px] text-[#2461d8]">코드 내재</p>
                            </div>
                        </div>
                    </div>
                    <ChevronRight className="h-5 w-5 flex-none text-[#2f7bff]" />
                    <div className="w-24 flex-none rounded-xl bg-gradient-to-br from-[#2f7bff] to-[#7c5cff] p-2.5 text-center text-white">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-white/70">
                            Output
                        </p>
                        <p className="mt-1 text-[13px] font-bold leading-snug">
                            독립 MCP 서버 패키지
                        </p>
                        <p className="mt-1 text-[11.5px] text-white/70">
                            Node · Python
                        </p>
                    </div>
                </div>
                <p className="mt-4 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
                    SDK를 통해 워크플로우와 보안 정책 자체를 표준 프로세스 코드로
                    내재화하여 내보냄
                </p>
            </div>
        </div>
    );
}

/** Runtime SDK — XGEN 엔진 → SDK 내보내기 → 독립 MCP 서버 → MCP 클라이언트.
 *  4개 균일 카드(번호로 흐름 표현)로 깔끔하게 정리. */
function SdkArchitecture() {
    const steps: {
        no: string;
        title: string;
        caption: string;
        items: [string, string][];
        teal?: boolean;
    }[] = [
        {
            no: "1",
            title: "XGEN 엔진",
            caption: "RAG · 워크플로우 · LLMOps 전체를 단 하나의 SDK API로 제공",
            items: [
                ["RAG", "지식 검색"],
                ["Workflow", "워크플로우 엔진"],
                ["Session", "세션 관리"],
                ["LLMOps", "운영 · 모니터링"],
            ],
        },
        {
            no: "2",
            title: "SDK 내보내기",
            caption: "표준 Python / Node 코드로 두 SDK를 조합",
            items: [
                ["표준 코드", "SDK 조합"],
                ["워크플로우 · 정책", "자산화"],
                ["배포 패키지", "실행 패키지 생성"],
            ],
        },
        {
            no: "3",
            title: "독립 MCP 서버",
            caption: "원하는 모든 환경에 단독 배포 가능",
            items: [
                ["컨테이너", ""],
                ["서버리스", ""],
                ["엣지", ""],
            ],
        },
        {
            no: "4",
            title: "MCP 클라이언트",
            caption: "어디서나 연결, 어떤 클라이언트도 가능",
            teal: true,
            items: [
                ["Claude", "MCP Client"],
                ["Cursor", "MCP Client"],
                ["Internal AI", "사내 시스템"],
                ["Custom App", "자체 앱"],
                ["Any Client", "MCP 호환"],
            ],
        },
    ];

    return (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
                <div
                    key={s.no}
                    className="flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6"
                >
                    <div className="flex items-center gap-2.5">
                        <span
                            className={
                                "inline-flex h-7 w-7 flex-none items-center justify-center rounded-full font-mono text-[13px] font-bold text-white " +
                                (s.teal
                                    ? "bg-[#2c8c8c]"
                                    : "bg-gradient-to-br from-[#2f7bff] to-[#7c5cff]")
                            }
                        >
                            {s.no}
                        </span>
                        <h4 className="text-[16px] font-bold tracking-tight text-[var(--color-ink)]">
                            {s.title}
                        </h4>
                    </div>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
                        {s.caption}
                    </p>
                    <ul className="mt-4 space-y-2 border-t border-[var(--color-line)] pt-4">
                        {s.items.map(([t, sub]) => (
                            <li key={t} className="flex items-center gap-2">
                                <span
                                    className={
                                        "h-1.5 w-1.5 flex-none rounded-full " +
                                        (s.teal ? "bg-[#2c8c8c]" : "bg-[#2f7bff]")
                                    }
                                />
                                <span className="text-[14px] font-semibold text-[var(--color-ink)]">
                                    {t}
                                </span>
                                {sub && (
                                    <span className="text-[12.5px] text-[var(--color-ink-subtle)]">
                                        {sub}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

/* ── Engines — 운영(Operation): Ontology & Harness ───────────── */
export function EnginesContent() {
    const ontology: [string, string, string][] = [
        ["검색 방식", "Pinned Top-K (고정)", "Dynamic Top-k (적응형)"],
        ["탐색", "유사도 기반 단편 검색", "관계 기반 사실 탐색"],
        ["출처", "출처 추적이 약함", "복잡 질문 → 근거 경로 추적"],
        ["저장소", "Vector DB · 차원 기반", "Graph DB · 사실 관계 기반"],
    ];
    const harnessLayers: [typeof BookOpen, string, string][] = [
        [BookOpen, "Prompt Engineering", "LLM에게 무엇을 하라고 지시하는 문장을 정교하게 설계"],
        [Layers, "Context Engineering", "LLM이 답할 때 무엇을 참고하고 어떤 도구를 쓸지 맥락을 설계"],
        [ShieldCheck, "Harness Engineering", "지시·맥락·행동·검증까지, 일하는 환경 전체를 통제"],
    ];

    return (
        <div className="space-y-16">
            <Lead>
                XGEN 엔진은 AI가 ‘닮은 문장’이 아니라 ‘맞는 사실’을 따라가게 하고
                (Ontology), 그 실행 과정 전체를 통제합니다(Harness). 정확한 지식
                맥락과 검증된 실행 환경이 신뢰할 수 있는 결과를 만듭니다.
            </Lead>

            <Topic id="ontology" pillar="운영" en="Knowledge Engine" title="Ontology — 관계로 ‘맞는 사실’을 따라가는 지식 엔진">
                <p className="max-w-3xl text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                    벡터 기반 검색은 유사도가 높은 단편을 찾는 데 그칩니다. XGEN
                    Ontology RAG는 데이터 사이의 관계를 따라가며 ‘무엇이 있는가’가
                    아니라 ‘왜 그런가, 무엇과 연결되는가’까지 추적합니다. 문서 검색을
                    넘어 하나의 지식 그래프로 동작합니다.
                </p>

                <OntologyGraph />

                <div className="mt-6 overflow-hidden rounded-xl border border-[var(--color-line)]">
                    <table className="w-full text-left text-[15px]">
                        <thead>
                            <tr className="bg-[var(--color-surface-alt)]">
                                <th className="px-4 py-2.5 font-semibold text-[var(--color-ink-subtle)]"> </th>
                                <th className="px-4 py-2.5 font-semibold text-[var(--color-ink-muted)]">Vector RAG</th>
                                <th className="px-4 py-2.5 font-bold text-[#2461d8]">XGEN Ontology RAG</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ontology.map(([k, a, b]) => (
                                <tr key={k} className="border-t border-[var(--color-line)]">
                                    <td className="px-4 py-2.5 font-semibold text-[var(--color-ink)]">{k}</td>
                                    <td className="px-4 py-2.5 text-[var(--color-ink-muted)]">{a}</td>
                                    <td className="px-4 py-2.5 font-medium text-[var(--color-ink)]">{b}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Quote>벡터는 ‘닮은 문장’을 찾고, 온톨로지는 ‘맞는 사실’을 따라갑니다</Quote>
            </Topic>

            <Topic id="harness" pillar="운영" en="Execution Harness" title="Harness — AI가 일하는 환경 전체를 설계하는 기술">
                <p className="max-w-3xl text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                    AI를 움직이는 것은 모델이 아니라 환경입니다. Harness
                    Engineering은 지시(Prompt)와 맥락(Context)을 넘어, LLM이 실제로
                    일하는 환경 전체를 통제해 신뢰할 수 있는 실행을 보장합니다.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {harnessLayers.map(([Icon, t, d], i) => (
                        <div key={t} className="rounded-xl border border-[var(--color-line)] bg-white p-5">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f7bff]/10 text-[#2f7bff]">
                                    <Icon className="h-4 w-4" />
                                </span>
                                <span className="font-mono text-[12px] text-[var(--color-ink-subtle)]">
                                    0{i + 1}
                                </span>
                            </div>
                            <h4 className="mt-3 text-[16px] font-bold text-[var(--color-ink)]">{t}</h4>
                            <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--color-ink-muted)]">{d}</p>
                        </div>
                    ))}
                </div>

                <HarnessPipeline />

                <ul className="mt-5 space-y-2">
                    <li className="flex gap-2 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#2f7bff]" />
                        일관성 — 9 Stage / 3 Phase 고정 파이프라인
                    </li>
                    <li className="flex gap-2 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#2f7bff]" />
                        토큰 효율 — Cascade 압축 · Progressive Disclosure로 컨텍스트 낭비 방지
                    </li>
                    <li className="flex gap-2 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[#2f7bff]" />
                        LangChain 코어에 의존하지 않고 메시지 한 토막까지 통제
                    </li>
                </ul>
            </Topic>
        </div>
    );
}

/* ── Frameworks — 운영 지능과 검색 프레임워크 ────────────────── */
export function FrameworksContent() {
    const items: [typeof Boxes, string, string, string, string][] = [
        [
            ShieldCheck,
            "agenticops",
            "AgenticOps",
            "운영 지능",
            "Ontology와 Harness를 하나로 묶어, 정확한 지식 맥락과 검증된 실행 환경으로 신뢰할 수 있는 결과를 보장하는 운영 지능 계층입니다.",
        ],
        [
            Network,
            "graphrag",
            "GraphRAG",
            "지식 그래프 검색",
            "닮은 문장이 아닌 문서 기반 관계를 탐색해 넓은 범주에서 정답을 찾습니다. 문서 검색을 넘어 하나의 지식 그래프로 추론합니다.",
        ],
        [
            Layers,
            "hybrid-rag",
            "Hybrid RAG",
            "벡터 + 그래프",
            "벡터(유사도)와 그래프(관계)를 결합해 정밀도와 탐색 범위를 동시에 확보하는 하이브리드 검색입니다.",
        ],
        [
            BookOpen,
            "context-engineering",
            "Context Engineering",
            "맥락 설계",
            "LLM이 답할 때 무엇을 참고하고 어떤 도구를 사용할지 — 맥락(context) 자체를 설계하는 기술입니다.",
        ],
    ];
    return (
        <div className="space-y-8">
            <Lead>
                엔진을 업무로 잇는 프레임워크입니다. 운영 지능부터 그래프·하이브리드
                검색, 맥락 설계까지 — 목적에 맞게 조합해 실제 업무를 수행합니다.
            </Lead>

            <div className="grid gap-4 sm:grid-cols-2">
                {items.map(([Icon, id, title, kicker, desc]) => (
                    <div
                        key={id}
                        id={id}
                        className="scroll-mt-24 flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6 transition hover:border-[#bcd0f5] hover:shadow-[0_14px_36px_-18px_rgba(20,40,80,0.22)]"
                    >
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#2f7bff]/10 text-[#2f7bff]">
                            <Icon className="h-5 w-5" />
                        </span>
                        <p className="mt-4 text-[13px] font-semibold text-[var(--color-ink-subtle)]">{kicker}</p>
                        <h3 className="mt-0.5 text-[19px] font-bold tracking-tight text-[var(--color-ink)]">{title}</h3>
                        <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Runtime — 독립(Independence): MCP Apps · SDK · API ──────── */
export function RuntimeContent() {
    const clients = ["Claude", "Cursor", "내부 시스템(Internal AI)", "자체 앱(Custom App)", "MCP 호환 클라이언트"];
    return (
        <div className="space-y-16">
            <Lead>
                XGEN 엔진은 코드를 내보내 어디서나 실행됩니다. 플랫폼에 종속되는
                서버가 아니라, 표준 생태계(PyPI·npm) 위에서 어디서나 수정·실행·연결되는
                독립 MCP 서버입니다.
            </Lead>

            <Topic id="mcp-apps" pillar="독립" en="Open Architecture" title="MCP Apps — 감싸지(Wrapper) 않고, 코드로 담아(Compiler)냅니다">
                <p className="max-w-3xl text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                    대부분의 플랫폼은 엔진을 내부에 상시 구동하고 MCP로 겉면만 감쌉니다.
                    XGEN은 SDK로 워크플로우와 보안 정책 자체를 표준 프로세스 코드로
                    내재화해 ‘독립 MCP 서버 패키지’로 내보냅니다 — 한 번 만들고 어디서나
                    실행합니다.
                </p>
                <WrapperCompilerDiagram />
            </Topic>

            <Topic id="runtime-sdk" pillar="독립" en="Runtime SDK" title="Runtime SDK — 엔진 전체를 단 하나의 SDK API로">
                <p className="max-w-3xl text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                    RAG · 워크플로우 · 세션 · LLMOps 전체를 표준 Python / Node 코드로
                    조합합니다. 워크플로우와 정책을 자산화해 배포 가능한 실행 패키지로
                    만듭니다.
                </p>
                <SdkArchitecture />
            </Topic>

            <Topic id="runtime-api" pillar="연결" en="Runtime API" title="Runtime API — 어디서나 배포하고, 어떤 클라이언트와도 연결">
                <p className="max-w-3xl text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                    컨테이너 · 서버리스 · 엣지까지 원하는 모든 환경에 단독 배포할 수
                    있습니다. 표준 MCP 인터페이스로 어떤 클라이언트와도 연결됩니다.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                    {clients.map((c) => (
                        <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-3 py-1.5 text-[14px] font-semibold text-[var(--color-ink-muted)]">
                            <Cable className="h-3.5 w-3.5 text-[#2f7bff]" />
                            {c}
                        </span>
                    ))}
                </div>
            </Topic>
        </div>
    );
}
