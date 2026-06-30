import {
    Monitor,
    Network,
    Boxes,
    GitBranch,
    BookOpen,
    Wrench,
    Cpu,
    Layers,
    Database,
    Server,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * XGEN 2.0 플랫폼 아키텍처 (공개-안전 버전).
 * 사내 개발자 문서(Confluence)에서 구조 개념만 추려 재구성 — 자격증명·내부 호스트·
 * 포트·고객사명·내부 URL 등 비공개 정보는 일절 포함하지 않는다.
 */

type Cell = { t: string; s?: string };

const CLIENTS: Cell[] = [
    { t: "웹 UI", s: "Next.js · Agentflow Canvas" },
    { t: "Chrome 확장", s: "자연어 브라우저 제어" },
    { t: "CLI · SDK", s: "OAuth · 자동화" },
];

const SERVICES: { icon: LucideIcon; t: string; s: string }[] = [
    { icon: Network, t: "Core", s: "인증 · 세션 · 설정 · 데이터 허브" },
    { icon: GitBranch, t: "Agent · Workflow", s: "LangGraph DAG · 멀티에이전트 · SSE 실행" },
    { icon: BookOpen, t: "Knowledge · RAG", s: "추출 · 청킹 · 하이브리드 임베딩 · 벡터 검색 · 온톨로지" },
    { icon: Wrench, t: "MCP Tool Runtime", s: "MCP 서버 관리 · JSON-RPC 도구 실행" },
    { icon: Cpu, t: "Model Serving", s: "vLLM GPU 추론 · 멀티 HW 자동 감지" },
    { icon: Boxes, t: "Harness Runtime", s: "12-Stage 선언형 에이전트 SDK" },
];

const DATA: Cell[] = [
    { t: "관계형 DB", s: "PostgreSQL (HA)" },
    { t: "캐시 · 세션", s: "Redis 호환" },
    { t: "벡터 DB", s: "Qdrant" },
    { t: "객체 스토리지", s: "S3 호환" },
];

const PLATFORM = [
    "컨테이너 오케스트레이션 (k3s)",
    "GitOps 배포 (ArgoCD)",
    "온프레미스 · 폐쇄망 지원",
    "관측성 (Prometheus · Grafana)",
];

function BandLabel({ icon: Icon, en, ko }: { icon: LucideIcon; en: string; ko?: string }) {
    return (
        <div className="mb-3 flex items-center gap-2">
            <Icon className="h-4 w-4 text-[#2f3aa0]" />
            <span className="text-[15px] font-bold text-[#2f3aa0]">{en}</span>
            {ko && (
                <span className="text-[13px] text-[var(--color-ink-subtle)]">
                    {ko}
                </span>
            )}
        </div>
    );
}

function Band({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("rounded-xl border border-[#d4ddf2] bg-[#f5f8ff] p-4", className)}>
            {children}
        </div>
    );
}

function Box({ t, s }: Cell) {
    return (
        <div className="flex min-h-[64px] flex-col justify-center rounded-md border border-[#dbe2f4] bg-white px-3 py-2 text-center">
            <div className="text-[13.5px] font-semibold leading-tight text-[var(--color-ink)]">
                {t}
            </div>
            {s && (
                <div className="mt-0.5 text-[12px] leading-tight text-[var(--color-ink-subtle)]">
                    {s}
                </div>
            )}
        </div>
    );
}

export function XgenPlatformArchitecture() {
    return (
        <div className="overflow-x-auto">
            <div className="min-w-[860px] space-y-3">
                {/* Clients */}
                <Band>
                    <BandLabel icon={Monitor} en="접근 채널" ko="Clients" />
                    <div className="grid grid-cols-3 gap-2.5">
                        {CLIENTS.map((c) => (
                            <Box key={c.t} {...c} />
                        ))}
                    </div>
                </Band>

                {/* Gateway */}
                <Band className="border-[#c2cdee] bg-[#eaf0fc]">
                    <BandLabel icon={Network} en="API Gateway" ko="단일 진입점" />
                    <div className="rounded-md border border-[#dbe2f4] bg-white px-4 py-3 text-center text-[13.5px] font-semibold text-[var(--color-ink)]">
                        JWT 인증 · 모듈 기반 라우팅 · OpenAPI 집계 · WebSocket 프록시
                    </div>
                </Band>

                {/* Microservices */}
                <Band>
                    <BandLabel icon={Layers} en="코어 서비스" ko="Microservices" />
                    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
                        {SERVICES.map((s) => (
                            <div
                                key={s.t}
                                className="rounded-lg border border-[#d3dcf3] bg-white p-3"
                            >
                                <div className="flex items-center gap-2">
                                    <s.icon className="h-4 w-4 shrink-0 text-[#2f7bff]" />
                                    <span className="text-[14px] font-bold text-[var(--color-ink)]">
                                        {s.t}
                                    </span>
                                </div>
                                <p className="mt-1.5 text-[12.5px] leading-snug text-[var(--color-ink-muted)]">
                                    {s.s}
                                </p>
                            </div>
                        ))}
                    </div>
                </Band>

                {/* Data layer */}
                <Band>
                    <BandLabel icon={Database} en="데이터 계층" ko="Data Layer" />
                    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                        {DATA.map((d) => (
                            <Box key={d.t} {...d} />
                        ))}
                    </div>
                </Band>

                {/* Platform foundation */}
                <Band>
                    <BandLabel icon={Server} en="플랫폼 기반" ko="Platform" />
                    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                        {PLATFORM.map((p) => (
                            <div
                                key={p}
                                className="rounded-md border border-[#dbe2f4] bg-white px-3 py-2.5 text-center text-[13px] font-semibold leading-tight text-[var(--color-ink)]"
                            >
                                {p}
                            </div>
                        ))}
                    </div>
                </Band>
            </div>
        </div>
    );
}
