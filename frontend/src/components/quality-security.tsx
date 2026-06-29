import Link from "next/link";
import { Award, ShieldCheck, BadgeCheck, Check, ArrowRight } from "lucide-react";

/**
 * 메인 — 품질·보안(GS 인증) 섹션. 경쟁사 장표를 그대로 옮기지 않고 연구소 톤으로 재구성하고
 * 좌(헤딩·상태) / 우(카드 스택) 2단 레이아웃으로 새로 잡았다.
 * ※ 우리 상태는 '획득'이 아니라 '심사 종료 · 최종 인증 대기 중' — 과장 없이 표기.
 */
const INFO: { icon: typeof Award; title: string; body: string }[] = [
    {
        icon: Award,
        title: "GS 인증이란?",
        body: "GS(Good Software) 인증은 2001년부터 시행된 국가 공인 SW 품질 인증 제도로, ISO/IEC 25023·25041·25051 국제 표준 기반의 체계적인 시험·평가를 통해 소프트웨어 제품의 품질을 검증합니다.",
    },
    {
        icon: ShieldCheck,
        title: "시험·평가 방법",
        body: "실제 운영 환경과 유사한 시험 환경에서 기능 적합성, 성능 효율성, 호환성, 사용성, 신뢰성, 보안성, 유지보수성, 이식성 등 8대 품질 특성을 종합적으로 평가합니다.",
    },
];

const EFFECTS = [
    "조달청 나라장터 등록 및 공공기관 우선 구매 대상 지정",
    "행정·공공 정보화사업 우선 도입 대상 SW 지정",
    "국가기관 상용SW 구매 시 기술성 평가 우선 반영",
    "제3자 공인 시험을 통한 고객 신뢰도 확보",
];

export function QualitySecurity() {
    return (
        <section className="border-t border-[var(--color-line)] bg-[var(--color-surface-alt)]">
            <div className="mx-auto max-w-6xl px-6 py-28">
                {/* 헤딩 + 상태 — 상단 한 줄 */}
                <div className="max-w-3xl">
                    <span className="inline-flex rounded-full border border-[var(--color-line)] bg-white px-3 py-1 font-mono text-[12px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                        Quality &amp; Security
                    </span>
                    <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[var(--color-ink)] md:text-[40px] md:leading-[1.15]">
                        검증 가능한 Enterprise AI,{" "}
                        <span className="bg-gradient-to-r from-[#00acee] to-[#185aea] bg-clip-text text-transparent">
                            GS 인증
                        </span>
                        으로 품질을 증명
                    </h2>
                    <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                        XGEN Agentic AI Platform은 한국정보통신기술협회(TTA)의 GS
                        인증 시험·평가를 완료하고, 최종 인증 결과를 기다리고 있습니다
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-4">
                        {/* 상태 배지 */}
                        <div className="inline-flex items-center gap-2 rounded-xl border border-[#cce6d7] bg-[#ecf8f1] px-4 py-3">
                            <Award className="h-5 w-5 text-[#b9810f]" />
                            <div className="text-left">
                                <p className="text-[14px] font-bold text-[var(--color-ink)]">
                                    GS 인증 (Good Software)
                                </p>
                                <p className="text-[13px] font-semibold text-[#b9810f]">
                                    심사 종료 · 최종 인증 대기 중
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/solutions#certification"
                            className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#2461d8] transition hover:text-[#1b4fb0]"
                        >
                            인증·품질 자세히 보기
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </div>

                {/* 카드 — 3개 한 줄 */}
                <div className="mt-12 grid gap-4 md:grid-cols-3 md:items-stretch">
                    {INFO.map((c) => (
                        <div
                            key={c.title}
                            className="rounded-2xl border border-[var(--color-line)] bg-white p-6"
                        >
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f7bff]/10 text-[#2f7bff]">
                                    <c.icon className="h-5 w-5" />
                                </span>
                                <h3 className="text-[18px] font-bold tracking-tight text-[var(--color-ink)]">
                                    {c.title}
                                </h3>
                            </div>
                            <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                                {c.body}
                            </p>
                        </div>
                    ))}

                    {/* 효과 — 체크리스트 */}
                    <div className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#0f9d6f]">
                                <BadgeCheck className="h-5 w-5" />
                            </span>
                            <h3 className="text-[18px] font-bold tracking-tight text-[var(--color-ink)]">
                                GS 인증의 도입 효과
                            </h3>
                        </div>
                        <ul className="mt-4 space-y-2.5">
                            {EFFECTS.map((e) => (
                                <li
                                    key={e}
                                    className="flex items-start gap-2 text-[14.5px] leading-snug text-[var(--color-ink-muted)]"
                                >
                                    <Check className="mt-0.5 h-4 w-4 flex-none text-[#0f9d6f]" />
                                    {e}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
