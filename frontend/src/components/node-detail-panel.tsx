"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, Zap } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ExploreContext {
    center: {
        id: string;
        title: string;
        kind?: string;
        content?: string;
        tags?: string[];
        level?: string;
        vitality?: number;
    };
}

interface NodeDetailPanelProps {
    context: ExploreContext | null;
    loading: boolean;
    error: string | null;
    onClose: () => void;
    onReinforce: () => void;
    reinforcing: boolean;
    /** Optional lookup from node id to its full content — the server's
     *  agent_explore_context response returns only {id, title, kind}
     *  for the center node, so we pull content from the cached graph. */
    contentLookup?: Map<string, string>;
}

export function NodeDetailPanel({
    context,
    loading,
    error,
    onClose,
    onReinforce,
    reinforcing,
    contentLookup,
}: NodeDetailPanelProps) {
    if (!context && !loading && !error) return null;

    return (
        <AnimatePresence mode="wait">
            <motion.aside
                key={context?.center.id ?? "loading"}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                className="flex h-full flex-col rounded-xl border border-[var(--color-line)] bg-white"
            >
                <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
                    <span className="font-mono text-[12px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                        node detail
                    </span>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded p-1 text-[var(--color-ink-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto px-4 py-4">
                    {loading && (
                        <div className="flex items-center gap-2 text-[14px] text-[var(--color-ink-muted)]">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Exploring context…
                        </div>
                    )}
                    {error && !loading && (
                        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 font-mono text-[13px] text-red-700">
                            {error}
                        </div>
                    )}
                    {context && !loading && (
                        <>
                            <div>
                                <h3 className="text-[16px] font-semibold tracking-tight text-[var(--color-ink)]">
                                    {context.center.title}
                                </h3>
                                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 font-mono text-[12px] text-[var(--color-ink-subtle)]">
                                    {context.center.kind && (
                                        <span className="rounded-sm bg-[var(--color-ink)] px-1.5 py-0.5 text-white">
                                            {context.center.kind}
                                        </span>
                                    )}
                                    {context.center.level && (
                                        <span>level {context.center.level}</span>
                                    )}
                                    {typeof context.center.vitality === "number" && (
                                        <span>vitality {context.center.vitality.toFixed(2)}</span>
                                    )}
                                </div>
                            </div>

                            {(() => {
                                const content =
                                    context.center.content ??
                                    contentLookup?.get(context.center.id);
                                if (!content) return null;
                                return (
                                    <div className="mt-3 max-h-52 overflow-auto rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-3 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)] whitespace-pre-wrap">
                                        {content}
                                    </div>
                                );
                            })()}

                            <button
                                onClick={onReinforce}
                                disabled={reinforcing}
                                className={cn(
                                    "mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-[13px] font-medium transition",
                                    reinforcing
                                        ? "cursor-not-allowed text-[var(--color-ink-subtle)]"
                                        : "text-[var(--color-ink)] hover:border-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]",
                                )}
                            >
                                {reinforcing ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Zap className="h-3 w-3" />
                                )}
                                Reinforce (Hebbian strengthen)
                            </button>
                        </>
                    )}
                </div>
            </motion.aside>
        </AnimatePresence>
    );
}
