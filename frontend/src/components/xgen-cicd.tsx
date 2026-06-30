import {
    GitBranch,
    Hammer,
    Package,
    RefreshCw,
    Server,
    GitMerge,
    ShieldCheck,
    Lock,
    Activity,
    ChevronRight,
    type LucideIcon,
} from "lucide-react";

/**
 * XGEN GitOps CI/CD 파이프라인 (공개-안전 버전).
 * 사내 문서에서 배포 흐름 개념만 추려 재구성 — 레지스트리/서버 호스트·포트,
 * 내부 GitLab·ECR 주소, 자격증명, 고객사 프로젝트명은 포함하지 않는다.
 */

const STAGES: { icon: LucideIcon; t: string; s: string }[] = [
    { icon: GitBranch, t: "Source", s: "브랜치 · MR" },
    { icon: Hammer, t: "CI Build", s: "BuildKit 멀티스테이지 이미지" },
    { icon: Package, t: "Registry", s: "컨테이너 이미지 저장" },
    { icon: RefreshCw, t: "GitOps Sync", s: "ArgoCD 수동 sync" },
    { icon: Server, t: "Cluster", s: "k3s · 앱/인프라 네임스페이스" },
];

const PRINCIPLES: { icon: LucideIcon; t: string; s: string }[] = [
    {
        icon: GitMerge,
        t: "GitOps · 선언형",
        s: "Git이 단일 진실 공급원 — 매니페스트로 클러스터 상태를 정의하고 동기화",
    },
    {
        icon: ShieldCheck,
        t: "통제된 릴리스",
        s: "브랜치 + MR 필수(main 직접 push 금지) · 수동 sync로 배포 시점 통제",
    },
    {
        icon: Lock,
        t: "온프레미스 · 폐쇄망",
        s: "이미지 export/import로 에어갭 이전 · 사이트별 환경 분리(dev/stg/prd)",
    },
    {
        icon: Activity,
        t: "관측성",
        s: "Prometheus · Grafana로 배포 후 상태 · 로그 · 트레이스 모니터링",
    },
];

export function XgenCicd() {
    return (
        <div>
            {/* 파이프라인 흐름 */}
            <div className="overflow-x-auto">
                <div className="flex min-w-[820px] items-stretch gap-2">
                    {STAGES.map((st, i) => (
                        <div key={st.t} className="flex flex-1 items-stretch gap-2">
                            <div className="flex flex-1 flex-col rounded-xl border border-[#d4ddf2] bg-[#f5f8ff] p-4">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#2f7bff]">
                                    <st.icon className="h-5 w-5" />
                                </span>
                                <div className="mt-3 text-[14.5px] font-bold text-[var(--color-ink)]">
                                    {st.t}
                                </div>
                                <div className="mt-1 text-[12.5px] leading-snug text-[var(--color-ink-muted)]">
                                    {st.s}
                                </div>
                            </div>
                            {i < STAGES.length - 1 && (
                                <div className="flex items-center">
                                    <ChevronRight className="h-5 w-5 text-[#9fb0dc]" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 원칙 카드 */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {PRINCIPLES.map((p) => (
                    <div
                        key={p.t}
                        className="rounded-xl border border-[var(--color-line)] bg-white p-5"
                    >
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f7bff]/10 text-[#2f7bff]">
                            <p.icon className="h-5 w-5" />
                        </span>
                        <h3 className="mt-3 text-[15px] font-bold tracking-tight text-[var(--color-ink)]">
                            {p.t}
                        </h3>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
                            {p.s}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
