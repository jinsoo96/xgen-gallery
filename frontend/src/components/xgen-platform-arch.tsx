import {
    Monitor,
    Building2,
    Bot,
    Cpu,
    BookOpen,
    Brain,
    Server,
    Landmark,
    ShoppingCart,
    MonitorPlay,
    Boxes,
    Workflow,
    Wrench,
    Network,
    Rocket,
    Settings,
    Activity,
    LineChart,
    Split,
    Database,
    FileSearch,
    Wand2,
    Container,
    GitBranch,
    HardDrive,
    Gauge,
    ShieldCheck,
    ShieldAlert,
    KeyRound,
    ScrollText,
    EyeOff,
    Power,
    BadgeCheck,
    ChevronDown,
    type LucideIcon,
} from "lucide-react";

/**
 * XGEN 2.0 플랫폼 아키텍처 맵.
 * 접근·콘솔 → 도메인·채널 → 에이전트·응용 → AI Platform 코어 → RAG·지식 →
 * 파운데이션 모델 → 인프라 계층 스택 + 전 계층 크로스커팅 거버넌스·보안 + 레퍼런스.
 * 컬러 토큰 — Primary #2563EB · Hover #EEF5FF · Section #F8FAFC · Border #E5E7EB ·
 * Text #111827 · Sub #6B7280.
 */

type Item = { icon: LucideIcon; t: string; s?: string };

const ACCESS = [
    "사용자 모드 (Chat/Assist)",
    "관리자 모드 (Admin)",
    "Portal / 대시보드",
    "Open-API · SDK",
    "SSO 연동",
];

const DOMAIN: Item[] = [
    { icon: Landmark, t: "금융", s: "I캐피탈 · 제주은행" },
    { icon: Building2, t: "공공", s: "공공기관" },
    { icon: ShoppingCart, t: "이커머스", s: "롯데홈쇼핑" },
    { icon: MonitorPlay, t: "서비스", s: "아이스크림미디어" },
    { icon: Boxes, t: "기타", s: "Private LLM" },
];

const AGENT: Item[] = [
    { icon: Workflow, t: "Workflow Canvas", s: "Low/No-code Agent 설계 · 60+ 노드 · 커스텀 노드" },
    { icon: Bot, t: "Unit Agents", s: "대출상품 · 심사승인 · 사고예방 · 업무 단위 에이전트" },
    { icon: Wrench, t: "MCP Station", s: "사내 도구 · API tool-call 연계 · 다중 도구 조합" },
    { icon: Network, t: "Multi-Agent Orchestration", s: "Planner → Agent 라우팅 · 단계별 기능 확장" },
];

const CORE: Item[] = [
    { icon: Rocket, t: "AI Service Generator", s: "서비스 생성 · 배포 · 버전 관리" },
    { icon: Settings, t: "서비스 설정", s: "Ondemand GPU · LLM/ML · VectorDB 연결" },
    { icon: Activity, t: "LLMOps (Generative)", s: "모델 훈련 · 모니터링 · 평가 · Model Switch & Repo" },
    { icon: LineChart, t: "MLOps (Predictive)", s: "ML 추론 · 학습 · DataOps · Repository (Add-on)" },
    { icon: Split, t: "Model Router", s: "Multi-LLM 라우팅 · 비용 · 성능 최적화" },
];

const RAG_CHIPS = ["Dense", "Sparse (SPLADE)", "Reranker", "Late Chunking", "Vision / OCR"];
const RAG_SIDE: Item[] = [
    { icon: Database, t: "Qdrant Vector DB", s: "Dense + Sparse 하이브리드 인덱스" },
    { icon: FileSearch, t: "Embedding · Parsing", s: "문서 파싱 · OCR · 벡터화 파이프라인" },
];

const FOUNDATION: Item[] = [
    { icon: Brain, t: "오픈소스 LLM", s: "Qwen3 계열 (32B / 8B) · Private · Vertical LLM" },
    { icon: Wand2, t: "Fine-Tuning", s: "SFT / DPO · 도메인 특화 학습" },
    { icon: Boxes, t: "멀티모델 확장", s: "Model Router 연계 · Vision · 임베딩 모델" },
];

const INFRA: Item[] = [
    { icon: Container, t: "k3s HA", s: "Kubernetes 고가용성" },
    { icon: GitBranch, t: "ArgoCD", s: "GitOps · 무중단 배포" },
    { icon: Database, t: "Qdrant", s: "Vector Database" },
    { icon: HardDrive, t: "MinIO", s: "Object Storage" },
    { icon: Server, t: "On-Premise", s: "GPU · 컨테이너" },
    { icon: Gauge, t: "Monitoring", s: "자원 · 성능 · Alert" },
];

const GOVERNANCE: Item[] = [
    { icon: ShieldAlert, t: "Guardrail", s: "프롬프트 인젝션 · 유해 · 기밀 차단" },
    { icon: KeyRound, t: "RBAC / ABAC", s: "역할 · 속성 기반 접근제어 · MFA" },
    { icon: ScrollText, t: "Audit Log", s: "전 구간 감사로그 · 반출 추적" },
    { icon: EyeOff, t: "PII 비식별화", s: "개인 · 금융정보 마스킹 · 가명처리" },
    { icon: Power, t: "Kill Switch", s: "사전 · 사후 결재 + 자동 알림" },
    { icon: BadgeCheck, t: "Compliance", s: "정책 템플릿 · Harmbench 검증" },
];

const LAYERS: { icon: LucideIcon; ko: string; en: string }[] = [
    { icon: Building2, ko: "도메인 · 채널", en: "Vertical Domain" },
    { icon: Bot, ko: "에이전트 · 응용", en: "Agent & Application" },
    { icon: Cpu, ko: "AI Platform 코어", en: "Platform Core" },
    { icon: BookOpen, ko: "RAG · 지식", en: "Retrieval-Augmented" },
    { icon: Brain, ko: "파운데이션 모델", en: "Foundation Model" },
    { icon: Server, ko: "인프라", en: "Infrastructure" },
];

/** 좌측 계층 라벨 (Hover 배경 + Primary 아이콘). */
function LayerLabel({ icon: Icon, ko, en }: { icon: LucideIcon; ko: string; en: string }) {
    return (
        <div className="flex w-[126px] shrink-0 flex-col justify-center rounded-lg border border-[#E5E7EB] bg-[#EEF5FF] px-3 py-3">
            <Icon className="h-5 w-5 text-[#2563EB]" />
            <div className="mt-1.5 text-[14px] font-bold leading-tight text-[#111827]">
                {ko}
            </div>
            <div className="mt-0.5 text-[11px] font-medium leading-tight text-[#6B7280]">
                {en}
            </div>
        </div>
    );
}

/** 컴포넌트 카드 (흰 배경 · Border · 아이콘 + 텍스트). */
function Comp({ icon: Icon, t, s }: Item) {
    return (
        <div className="flex min-h-[64px] flex-col justify-center rounded-md border border-[#E5E7EB] bg-white px-3 py-2">
            <div className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 shrink-0 text-[#2563EB]" />
                <div className="text-[13.5px] font-bold leading-tight text-[#111827]">
                    {t}
                </div>
            </div>
            {s && (
                <div className="mt-1 text-[12px] leading-snug text-[#6B7280]">{s}</div>
            )}
        </div>
    );
}

/** 한 계층 행: 좌측 라벨 + 우측 콘텐츠. */
function LayerRow({
    icon,
    ko,
    en,
    children,
}: {
    icon: LucideIcon;
    ko: string;
    en: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex gap-3">
            <LayerLabel icon={icon} ko={ko} en={en} />
            <div className="min-w-0 flex-1 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                {children}
            </div>
        </div>
    );
}

function Flow() {
    return (
        <div className="flex justify-center py-0.5">
            <ChevronDown className="h-4 w-4 text-[#2563EB]/50" />
        </div>
    );
}

export function XgenPlatformArchitecture() {
    return (
        <div className="overflow-x-auto">
            <div className="min-w-[1000px] space-y-3">
                {/* 접근 · 콘솔 */}
                <div className="rounded-xl border border-[#E5E7EB] bg-[#EEF5FF] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="mr-1 inline-flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-widest text-[#2563EB]">
                            <Monitor className="h-3.5 w-3.5" />
                            Access · Console
                        </span>
                        {ACCESS.map((a) => (
                            <span
                                key={a}
                                className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-[13px] font-semibold text-[#111827]"
                            >
                                {a}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 본체: 좌측 계층 스택 + 우측 거버넌스 */}
                <div className="flex gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                        <LayerRow {...LAYERS[0]}>
                            <div className="grid grid-cols-5 gap-2">
                                {DOMAIN.map((d) => (
                                    <Comp key={d.t} {...d} />
                                ))}
                            </div>
                        </LayerRow>
                        <Flow />

                        <LayerRow {...LAYERS[1]}>
                            <div className="grid grid-cols-4 gap-2">
                                {AGENT.map((a) => (
                                    <Comp key={a.t} {...a} />
                                ))}
                            </div>
                        </LayerRow>
                        <Flow />

                        <LayerRow {...LAYERS[2]}>
                            <div className="grid grid-cols-5 gap-2">
                                {CORE.map((c) => (
                                    <Comp key={c.t} {...c} />
                                ))}
                            </div>
                        </LayerRow>
                        <Flow />

                        <LayerRow {...LAYERS[3]}>
                            <div className="flex flex-wrap gap-1.5">
                                {RAG_CHIPS.map((c) => (
                                    <span
                                        key={c}
                                        className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-[12.5px] font-semibold text-[#2563EB]"
                                    >
                                        {c}
                                    </span>
                                ))}
                            </div>
                            <p className="mt-2 text-[12.5px] font-medium text-[#6B7280]">
                                문서 파싱 → 임베딩 → 하이브리드 검색 → Rerank → Context 주입
                            </p>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {RAG_SIDE.map((r) => (
                                    <Comp key={r.t} {...r} />
                                ))}
                            </div>
                        </LayerRow>
                        <Flow />

                        <LayerRow {...LAYERS[4]}>
                            <div className="grid grid-cols-3 gap-2">
                                {FOUNDATION.map((f) => (
                                    <Comp key={f.t} {...f} />
                                ))}
                            </div>
                        </LayerRow>
                        <Flow />

                        <LayerRow {...LAYERS[5]}>
                            <div className="grid grid-cols-6 gap-2">
                                {INFRA.map((i) => (
                                    <Comp key={i.t} {...i} />
                                ))}
                            </div>
                        </LayerRow>
                    </div>

                    {/* 거버넌스 & 보안 (전 계층 크로스커팅) */}
                    <div className="flex w-[240px] shrink-0 flex-col rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                            <span className="text-[15px] font-bold text-[#111827]">
                                거버넌스 &amp; 보안
                            </span>
                        </div>
                        <p className="mt-0.5 text-[11.5px] text-[#6B7280]">
                            전 계층 크로스커팅 통제
                        </p>
                        <div className="mt-3 space-y-2">
                            {GOVERNANCE.map((g) => (
                                <div
                                    key={g.t}
                                    className="flex gap-2 rounded-md border border-[#E5E7EB] bg-white px-3 py-2"
                                >
                                    <g.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
                                    <div className="min-w-0">
                                        <div className="text-[13px] font-bold text-[#111827]">
                                            {g.t}
                                        </div>
                                        <div className="mt-0.5 text-[11.5px] leading-snug text-[#6B7280]">
                                            {g.s}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 레퍼런스 구축 */}
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-[#E5E7EB] bg-[#EEF5FF] px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#111827]">
                            <BadgeCheck className="h-4 w-4 text-[#2563EB]" />
                            레퍼런스 구축
                        </span>
                        <span className="text-[13.5px] font-semibold text-[#111827]">
                            금융 J은행 · I캐피탈 · 이커머스 L홈쇼핑 · 미디어 I사 · 공공기관 · 엔터프라이즈
                        </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2563EB]">
                        <Server className="h-3.5 w-3.5" />
                        On-Premise · Air-gap 대응
                    </span>
                </div>
            </div>
        </div>
    );
}
