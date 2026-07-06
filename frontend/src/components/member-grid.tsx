"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { MemberCard, type RecentPost } from "./member-card";
import type { MemberSummary } from "@/lib/members/types";

type SortKey = "stars" | "repos" | "followers" | "activity" | "joined";

const SORTS: { id: SortKey; label: string }[] = [
    { id: "stars", label: "Stars" },
    { id: "repos", label: "Repos" },
    { id: "followers", label: "Followers" },
    { id: "activity", label: "Activity (3d)" },
    { id: "joined", label: "Recently joined" },
];

export function MemberGrid({
    members,
    postsByAuthor = {},
}: {
    members: MemberSummary[];
    postsByAuthor?: Record<string, RecentPost>;
}) {
    const [sort, setSort] = useState<SortKey>("stars");
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const base = q
            ? members.filter(
                  (m) =>
                      m.login.toLowerCase().includes(q) ||
                      (m.name ?? "").toLowerCase().includes(q) ||
                      (m.bio ?? "").toLowerCase().includes(q),
              )
            : members.slice();

        switch (sort) {
            case "stars":
                base.sort((a, b) => b.totalStars - a.totalStars);
                break;
            case "repos":
                base.sort((a, b) => b.publicRepos - a.publicRepos);
                break;
            case "followers":
                base.sort((a, b) => b.followers - a.followers);
                break;
            case "activity":
                base.sort(
                    (a, b) => b.recentActivityCount - a.recentActivityCount,
                );
                break;
            case "joined":
                base.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                );
                break;
        }
        return base;
    }, [members, query, sort]);

    return (
        <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    {SORTS.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setSort(s.id)}
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[14px] font-medium transition",
                                sort === s.id
                                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                                    : "border-[var(--color-line)] bg-white text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]",
                            )}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search members…"
                    className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-1.5 text-[16px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-subtle)] focus:border-[var(--color-ink)] focus:outline-none md:w-64"
                />
            </div>

            {filtered.length === 0 ? (
                <p className="mt-16 text-center text-[16px] text-[var(--color-ink-muted)]">
                    No members match your search.
                </p>
            ) : (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((m, i) => (
                        <MemberCard
                            key={m.login}
                            member={m}
                            isTop={i === 0}
                            recent={m.name ? postsByAuthor[m.name] : undefined}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
