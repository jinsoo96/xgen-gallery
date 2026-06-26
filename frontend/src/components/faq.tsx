"use client";

import { useI18n } from "@/components/i18n-provider";

export function Faq() {
    const { t } = useI18n();
    return (
        <section
            id="faq"
            className="border-t border-[var(--color-line)] bg-white"
        >
            <div className="mx-auto max-w-3xl px-6 py-28">
                <p className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                    {t.faq.eyebrow}
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                    {t.faq.title}
                </h2>

                <dl className="mt-12 divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
                    {t.faq.entries.map((f) => (
                        <details key={f.question} className="group py-5">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold tracking-tight text-[var(--color-ink)]">
                                <dt>{f.question}</dt>
                                <span className="text-[var(--color-ink-subtle)] transition group-open:rotate-45">
                                    +
                                </span>
                            </summary>
                            <dd className="mt-3 text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                                {f.answer}
                            </dd>
                        </details>
                    ))}
                </dl>
            </div>
        </section>
    );
}
