import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { XgenPlatformArchitecture } from "@/components/xgen-platform-arch";
import { XgenCicd } from "@/components/xgen-cicd";
import { CodeAssistantArchitecture } from "@/components/code-assistant-arch";
import { ArchIndex } from "@/components/arch-index";
import {
    ShieldCheck,
    Share2,
    CheckCircle2,
    Lock,
    Blocks,
    Scale,
    type LucideIcon,
} from "lucide-react";

export const metadata = {
    title: "Architecture",
    description:
        "Plateer Labs의 Enterprise AI 참조 아키텍처 — 데이터 주권·보안·거버넌스를 보장하는 계층형 설계.",
    alternates: { canonical: "/architecture" },
};

/** 아키텍처 페이지 섹션 목차 — 온페이지 인덱스와 GNB 서브메뉴가 공유. */
export const ARCH_SECTIONS = [
    { id: "foundation", label: "기반 아키텍처" },
    { id: "principles", label: "설계 원칙" },
    { id: "reference", label: "Enterprise AI 아키텍처" },
    { id: "platform", label: "XGEN 플랫폼" },
    { id: "code-assistant", label: "코드 어시스턴트" },
    { id: "cicd", label: "CI/CD 배포" },
];

function ArchitectureHero() {
    return (
        <div className="max-w-3xl">
            <p className="text-[16px] font-semibold tracking-tight text-[#7dd3fc]">
                Architecture
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">
                Enterprise AI Architecture
            </h1>
            <p className="mt-5 text-xl font-semibold leading-relaxed text-white">
                신뢰할 수 있는 AI를 위한 엔터프라이즈 아키텍처
            </p>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/70">
                데이터 주권 · 보안 · 거버넌스를 지키는 폐쇄망 · 온프레미스 설계,
                지식 · 추론 · 실행 · 운영을 하나로 잇는 Enterprise AI
            </p>
        </div>
    );
}

const CONCEPTS: { icon: LucideIcon; lead: string; strong: string }[] = [
    {
        icon: ShieldCheck,
        lead: "데이터 주권, 보안, 감사 추적, 조직 거버넌스를 보장하는",
        strong: "폐쇄망 · 온프레미스 친화 아키텍처",
    },
    {
        icon: Share2,
        lead: "지식 · 추론 · 실행 · 운영을 하나의 체계로 연결하는",
        strong: "Enterprise AI Runtime의 참조 아키텍처",
    },
];

const PRINCIPLES: { icon: LucideIcon; title: string; desc: string }[] = [
    {
        icon: CheckCircle2,
        title: "근거 기반 응답",
        desc: "기업이 보유한 문서·규정·지식 모델에 근거해 답변하고, 근거가 없으면 판단 불가를 선언해 환각을 최소화합니다",
    },
    {
        icon: Lock,
        title: "데이터 주권",
        desc: "클라우드 종속 없이 고객 인프라에서 운영하며, 금융·공공·제조의 망분리 환경까지 지원합니다",
    },
    {
        icon: Blocks,
        title: "조합 가능성",
        desc: "Agent · Workflow · Knowledge · Tool을 모듈화해 업무 목적에 따라 자유롭게 재조합합니다",
    },
    {
        icon: Scale,
        title: "모델 중립 · 거버넌스",
        desc: "목적·비용·정확도에 따라 LLM을 선택하고, 정책·승인·감사 추적으로 운영을 통제합니다",
    },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <p className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
            {children}
        </p>
    );
}

export default function ArchitecturePage() {
    return (
        <>
            <SiteNav overlay />
            <section className="relative flex min-h-[560px] items-center overflow-hidden border-b border-white/10 py-28 text-white">
                <SceneBackground concept="architecture" />
                <div className="relative mx-auto w-full max-w-7xl px-6 pt-16">
                    <ArchitectureHero />
                </div>
            </section>

            <ArchIndex sections={ARCH_SECTIONS} />

            <main>
                {/* 신뢰 컨셉 — 2-card (콘텐츠 시작) */}
                <section
                    id="foundation"
                    className="scroll-mt-[140px] border-b border-[var(--color-line)] bg-[var(--color-surface)]"
                >
                    <div className="mx-auto max-w-7xl px-6 py-24">
                        <h2 className="max-w-3xl text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-[32px]">
                            데이터 주권과 AI Runtime을 위한 핵심 기반 아키텍처
                        </h2>
                        <div className="mt-8 grid gap-5 md:grid-cols-2">
                            {CONCEPTS.map((c) => (
                                <div
                                    key={c.strong}
                                    className="flex items-start gap-4 rounded-2xl border border-[var(--color-line)] bg-white p-6"
                                >
                                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f7bff] to-[#7c5cff] text-white">
                                        <c.icon className="h-5 w-5" />
                                    </span>
                                    <p className="text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                                        {c.lead}
                                        <br />
                                        <span className="font-bold text-[var(--color-ink)]">
                                            {c.strong}
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 설계 원칙 */}
                <section
                    id="principles"
                    className="scroll-mt-[140px] border-b border-[var(--color-line)] bg-[var(--color-surface-alt)]"
                >
                    <div className="mx-auto max-w-7xl px-6 py-24">
                        <Eyebrow>/ Design Principles</Eyebrow>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-3xl">
                            아키텍처 설계 원칙
                        </h2>
                        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                            엔터프라이즈 환경에서 AI를 신뢰하고 운영하기 위해 모든
                            계층이 공유하는 네 가지 설계 기준입니다
                        </p>
                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {PRINCIPLES.map((p) => (
                                <div
                                    key={p.title}
                                    className="rounded-2xl border border-[var(--color-line)] bg-white p-6"
                                >
                                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#2f7bff]/10 text-[#2f7bff]">
                                        <p.icon className="h-5 w-5" />
                                    </span>
                                    <h3 className="mt-4 text-[18px] font-bold tracking-tight text-[var(--color-ink)]">
                                        {p.title}
                                    </h3>
                                    <p className="mt-2 text-[15.5px] leading-relaxed text-[var(--color-ink-muted)]">
                                        {p.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 참조 아키텍처 다이어그램 */}
                <section id="reference" className="scroll-mt-[140px] bg-[var(--color-surface)]">
                    <div className="mx-auto max-w-7xl px-6 py-24">
                        <Eyebrow>/ Reference Architecture</Eyebrow>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-3xl">
                            Enterprise AI 아키텍처
                        </h2>
                        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                            접근 채널부터 모델·인프라까지, 신뢰할 수 있는 Enterprise
                            AI를 구성하는 전체 계층 구조
                        </p>
                        <div className="mt-8">
                            <ArchitectureDiagram />
                        </div>
                    </div>
                </section>

                {/* XGEN 2.0 플랫폼 아키텍처 (공개-안전 구성) */}
                <section
                    id="platform"
                    className="scroll-mt-[140px] border-t border-[var(--color-line)] bg-[var(--color-surface-alt)]"
                >
                    <div className="mx-auto max-w-7xl px-6 py-24">
                        <Eyebrow>/ XGEN Platform</Eyebrow>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-3xl">
                            XGEN 2.0 플랫폼 아키텍처
                        </h2>
                        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                            웹 · 확장 · SDK 클라이언트부터 API Gateway, 마이크로서비스,
                            데이터 계층까지 — GitOps로 운영되는 컨테이너 기반 Enterprise
                            AI 플랫폼
                        </p>
                        <div className="mt-8">
                            <XgenPlatformArchitecture />
                        </div>
                        <p className="mt-6 max-w-3xl text-[14px] leading-relaxed text-[var(--color-ink-subtle)]">
                            모든 요청은 API Gateway에서 인증 · 라우팅되어 각
                            마이크로서비스로 전달되며, 워크플로우 · 지식검색 · 도구실행 ·
                            모델추론이 하나의 클러스터에서 협력합니다. 온프레미스 ·
                            폐쇄망 배포를 기본 지원합니다.
                        </p>
                    </div>
                </section>

                {/* 코드 어시스턴트 아키텍처 (공개-안전 구성) */}
                <section
                    id="code-assistant"
                    className="scroll-mt-[140px] border-t border-[var(--color-line)] bg-[var(--color-surface)]"
                >
                    <div className="mx-auto max-w-7xl px-6 py-24">
                        <Eyebrow>/ Code Assistant</Eyebrow>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-3xl">
                            코드 어시스턴트 아키텍처
                        </h2>
                        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                            자연어 질문 · 코드 검색 요청을 인덱싱과 하이브리드 검색, AI
                            재정렬로 처리해 근거 있는 코드 답변을 제공합니다
                        </p>
                        <div className="mt-8">
                            <CodeAssistantArchitecture />
                        </div>
                    </div>
                </section>

                {/* CI/CD — GitOps 배포 파이프라인 (공개-안전 구성) */}
                <section
                    id="cicd"
                    className="scroll-mt-[140px] border-t border-[var(--color-line)] bg-[var(--color-surface)]"
                >
                    <div className="mx-auto max-w-7xl px-6 py-24">
                        <Eyebrow>/ CI/CD</Eyebrow>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink)] md:text-3xl">
                            GitOps 배포 파이프라인
                        </h2>
                        <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                            소스 변경부터 운영 반영까지 — 컨테이너 이미지 빌드와 선언형
                            GitOps 동기화로 통제된 배포를 수행합니다
                        </p>
                        <div className="mt-8">
                            <XgenCicd />
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </>
    );
}
