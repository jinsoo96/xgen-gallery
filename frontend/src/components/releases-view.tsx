"use client";

import { useMemo, useState } from "react";
import {
    RELEASE_CATEGORY_LABEL,
    RELEASE_CATEGORY_STYLE,
    type Release,
    type ReleaseCategory,
    type ReleaseItem,
} from "@/lib/releases";

type Filter = "all" | ReleaseCategory;

const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "new", label: "New" },
    { value: "improved", label: "Improved" },
    { value: "fixed", label: "Fixed" },
];

function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

export function ReleasesView({ releases }: { releases: Release[] }) {
    const [filter, setFilter] = useState<Filter>("all");

    const filteredReleases = useMemo(() => {
        if (filter === "all") return releases;
        return releases
            .map((r) => ({
                ...r,
                items: r.items.filter((i) => i.category === filter),
            }))
            .filter((r) => r.items.length > 0);
    }, [filter, releases]);

    return (
        <div>
            <div className="mb-10 flex flex-wrap items-center gap-2 border-b border-[var(--color-line)] pb-4">
                {FILTERS.map((f) => {
                    const active = filter === f.value;
                    return (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
                                active
                                    ? "bg-[var(--color-ink)] text-white"
                                    : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]"
                            }`}
                        >
                            {f.label}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-16">
                {filteredReleases.map((release) => (
                    <ReleaseEntry key={release.version} release={release} />
                ))}
            </div>
        </div>
    );
}

function ReleaseEntry({ release }: { release: Release }) {
    return (
        <article className="grid gap-8 md:grid-cols-[160px_1fr]">
            <aside className="md:sticky md:top-20 md:self-start">
                <div className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-ink-subtle)]">
                    {formatDate(release.date)}
                </div>
                <div className="mt-2 inline-flex items-center rounded-md border border-[var(--color-line)] bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--color-ink)]">
                    {release.version}
                </div>
            </aside>

            <div>
                <h2 className="text-2xl font-semibold tracking-tight md:text-[26px]">
                    {release.tagline}
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                    {release.summary}
                </p>

                {release.highlights && release.highlights.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-1.5">
                        {release.highlights.map((h) => (
                            <span
                                key={h}
                                className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-ink-muted)]"
                            >
                                {h}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-8 space-y-3">
                    {release.items.map((item, idx) => (
                        <ReleaseItemRow
                            key={`${release.version}-${idx}`}
                            item={item}
                        />
                    ))}
                </div>
            </div>
        </article>
    );
}

function ReleaseItemRow({ item }: { item: ReleaseItem }) {
    return (
        <div className="rounded-xl border border-[var(--color-line)] bg-white p-4 transition hover:border-[var(--color-line-strong)]">
            <div className="flex items-start gap-3">
                <span
                    className={`mt-0.5 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        RELEASE_CATEGORY_STYLE[item.category]
                    }`}
                >
                    {RELEASE_CATEGORY_LABEL[item.category]}
                </span>

                <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-semibold tracking-tight">
                        {item.title}
                    </h3>
                    {item.detail && (
                        <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
                            {item.detail}
                        </p>
                    )}
                    {item.modules && item.modules.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                            {item.modules.map((m) => (
                                <code
                                    key={m}
                                    className="rounded border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-1.5 py-0.5 font-mono text-[10.5px] text-[var(--color-ink-muted)]"
                                >
                                    {m}
                                </code>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
