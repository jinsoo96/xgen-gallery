"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Copy, Play } from "lucide-react";
import { useState } from "react";
import type { Tool } from "@/lib/tools";
import { useI18n } from "@/components/i18n-provider";
import { TOOL_I18N } from "@/lib/i18n";

export function ToolCard({ tool }: { tool: Tool }) {
    const { locale, t } = useI18n();
    const [copied, setCopied] = useState(false);
    const desc = TOOL_I18N[tool.id]?.[locale]?.description ?? tool.description;
    const categoryLabel =
        t.categories[tool.category as keyof typeof t.categories] ??
        tool.category;

    const copy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(tool.install);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
        } catch {
            // ignore
        }
    };

    return (
        <div className="group relative flex flex-col justify-between rounded-xl border border-[var(--color-line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-ink)] hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]">
            <div>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] uppercase tracking-wider text-[var(--color-ink-subtle)]">
                            {categoryLabel}
                        </span>
                        {tool.hasDemo && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-line)] px-2 py-0.5 font-mono text-[12px] text-[var(--color-ink-muted)]">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {t.toolCard.liveDemo}
                            </span>
                        )}
                    </div>
                    <Link
                        href={`https://github.com/PlateerLab/${tool.repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-ink-subtle)] transition hover:text-[var(--color-ink)]"
                        aria-label="Open GitHub repository"
                    >
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>

                <h3 className="mt-4 text-[18px] font-semibold tracking-tight text-[var(--color-ink)]">
                    {tool.name}
                </h3>
                <p className="mt-1.5 text-[15.5px] leading-relaxed text-[var(--color-ink-muted)]">
                    {desc}
                </p>
            </div>

            <div className="mt-5 space-y-2">
                <button
                    onClick={copy}
                    className="flex w-full items-center justify-between rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-3 py-2 font-mono text-[13.5px] text-[var(--color-ink-muted)] transition hover:border-[var(--color-ink)] hover:bg-white hover:text-[var(--color-ink)]"
                >
                    <span className="truncate">$ {tool.install}</span>
                    {copied ? (
                        <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                    ) : (
                        <Copy className="h-3.5 w-3.5 flex-shrink-0" />
                    )}
                </button>
                {tool.hasDemo && (
                    <Link
                        href={`/tool/${tool.id}`}
                        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--color-ink)] bg-[var(--color-ink)] px-3 py-2 text-[14px] font-medium text-white transition hover:bg-[var(--color-ink)]/90"
                    >
                        <Play className="h-3 w-3 fill-current" />
                        {t.toolCard.openDemo}
                    </Link>
                )}
            </div>
        </div>
    );
}
