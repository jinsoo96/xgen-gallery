"use client";

import { ArrowRight } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

/**
 * Library Recipes / Use Cases 카드.
 * - 기본: 자체 섹션(제목·배경 포함) — 홈·라이브러리 갤러리에서 사용.
 * - embedded: 카드 그리드만 렌더 — GroupPage 섹션(예: /solutions#library-recipes) 안에
 *   주입될 때 중첩 컨테이너·제목 중복을 피한다.
 */
export function UseCases({ embedded = false }: { embedded?: boolean }) {
    const { t } = useI18n();

    const grid = (
        <div className="grid gap-4 md:grid-cols-3">
            {t.usecases.items.map((uc) => (
                <div
                    key={uc.title}
                    className="group flex flex-col rounded-xl border border-[var(--color-line)] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[var(--color-ink)]"
                >
                    <h3 className="text-lg font-semibold tracking-tight">
                        {uc.title}
                    </h3>
                    <p className="mt-2 text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                        {uc.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-1.5">
                        {uc.stack.map((s) => (
                            <span
                                key={s}
                                className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-2 py-1 font-mono text-[12px] text-[var(--color-ink-muted)]"
                            >
                                {s}
                            </span>
                        ))}
                    </div>

                    <button className="mt-6 inline-flex items-center gap-1 text-[14px] font-medium text-[var(--color-ink)] transition group-hover:gap-2">
                        {t.usecases.seeRecipe}
                        <ArrowRight className="h-3 w-3" />
                    </button>
                </div>
            ))}
        </div>
    );

    // GroupPage 섹션 안에 주입될 때 — 카드 그리드만.
    if (embedded) return grid;

    return (
        <section
            id="usecases"
            className="border-t border-[var(--color-line)] bg-[var(--color-surface-alt)]"
        >
            <div className="mx-auto max-w-6xl px-6 py-28">
                <p className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                    {t.usecases.eyebrow}
                </p>
                <h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight md:text-5xl">
                    {t.usecases.titleA}{" "}
                    <span className="bg-gradient-to-r from-[#00acee] to-[#185aea] bg-clip-text text-transparent">
                        {t.usecases.titleB}
                    </span>
                </h2>

                <div className="mt-12">{grid}</div>
            </div>
        </section>
    );
}
