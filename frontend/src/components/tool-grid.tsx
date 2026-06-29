"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, TOOLS, type ToolCategory } from "@/lib/tools";
import { ToolCard } from "./tool-card";
import { cn } from "@/lib/cn";
import { useI18n } from "@/components/i18n-provider";

export function ToolGrid() {
    const { t } = useI18n();
    const [active, setActive] = useState<ToolCategory | "all">("all");

    const filtered = useMemo(
        () => (active === "all" ? TOOLS : TOOLS.filter((t) => t.category === active)),
        [active],
    );

    const counts = useMemo(() => {
        return {
            all: TOOLS.length,
            ingestion: TOOLS.filter((t) => t.category === "ingestion").length,
            knowledge: TOOLS.filter((t) => t.category === "knowledge").length,
            agent: TOOLS.filter((t) => t.category === "agent").length,
            utility: TOOLS.filter((t) => t.category === "utility").length,
        } as Record<ToolCategory | "all", number>;
    }, []);

    return (
        <section id="tools" className="mx-auto max-w-6xl px-6 py-28">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                        {t.toolsSection.eyebrow}
                    </p>
                    <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                        {t.toolsSection.titleA}
                        <br />
                        <span className="bg-gradient-to-r from-[#00acee] to-[#185aea] bg-clip-text text-transparent">
                            {t.toolsSection.titleB}
                        </span>
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setActive(c.id)}
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[14px] font-medium transition",
                                active === c.id
                                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                                    : "border-[var(--color-line)] bg-white text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]",
                            )}
                        >
                            {t.categories[c.id as keyof typeof t.categories]}
                            <span
                                className={cn(
                                    "font-mono text-[12px]",
                                    active === c.id
                                        ? "text-white/70"
                                        : "text-[var(--color-ink-subtle)]",
                                )}
                            >
                                {counts[c.id]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                ))}
            </div>
        </section>
    );
}
