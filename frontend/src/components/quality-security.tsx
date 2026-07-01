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
        title: "국가 공인 SW 품질인증",
        body: "GS(Good Software) 인증은 「소프트웨어 진흥법」에 근거해 과학기술정보통신부가 운영하는 국가 공인 소프트웨어 품질인증입니다. 지정된 공인 시험기관이 ISO/IEC 25000 계열 국제표준을 기준으로 제품 품질을 시험·평가합니다.",
    },
    {
        icon: ShieldCheck,
        title: "세 영역을 실증 시험",
        body: "실사용과 유사한 환경에서 제품 명세서 · 사용자 설명서 · 실행 소프트웨어 세 영역을 시험하고, 기능 적합성 · 성능 효율성 · 신뢰성 · 보안성 등 품질 특성을 종합 평가합니다.",
    },
];

const EFFECTS = [
    "조달청 우수조달물품 지정 신청 자격",
    "공공 소프트웨어 사업 발주 시 분리발주 의무 대상",
    "중소벤처기업부 우선구매 대상 지정",
    "기술성 평가 가점 · 제3자 공인시험 기반 신뢰",
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
                    <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--color-ink)] md:text-5xl">
                        검증 가능한 Enterprise AI,{" "}
                        <span className="bg-gradient-to-r from-[#00acee] to-[#185aea] bg-clip-text text-transparent">
                            GS 인증
                        </span>
                    </h2>
                    <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                        연구소는 성능을 주장하는 대신, 국가 공인 제3자 시험으로
                        품질을 증명합니다. XGEN은 GS 인증 시험·평가를 완료하고 최종
                        인증 결과를 기다리고 있습니다
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-4">
                        {/* 상태 배지 */}
                        <div className="inline-flex items-center gap-2 rounded-xl border border-[#cce6d7] bg-[#ecf8f1] px-4 py-3">
                            <Award className="h-5 w-5 text-[#1f9d57]" />
                            <div className="text-left">
                                <p className="text-[14px] font-bold text-[var(--color-ink)]">
                                    GS 인증 (Good Software)
                                </p>
                                <p className="text-[13px] font-semibold text-[#1f9d57]">
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
                                인증의 의미와 효과
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
