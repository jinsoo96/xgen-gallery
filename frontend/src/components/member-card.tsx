import Link from "next/link";
import { Activity, ArrowUpRight, MapPin, Star, GitBranch } from "lucide-react";
import { formatStars, languageColor } from "@/lib/members/format";
import type { MemberSummary } from "@/lib/members/types";

export function MemberCard({ member, isTop = false }: { member: MemberSummary; isTop?: boolean }) {
    const displayName = member.name ?? member.login;
    return (
        <Link
            href={`/members/${member.login}`}
            className="group relative flex flex-col rounded-xl border border-[var(--color-line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-ink)] hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)]"
        >
            <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-ink-subtle)]">
                    / member
                </span>
                <a
                    href={member.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[var(--color-ink-subtle)] transition hover:text-[var(--color-ink)]"
                    aria-label={`Open ${member.login} on GitHub`}
                >
                    <ArrowUpRight className="h-4 w-4" />
                </a>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={member.avatarUrl}
                        alt={`${member.login} avatar`}
                        width={48}
                        height={48}
                        loading="lazy"
                        className={`h-12 w-12 rounded-full border bg-[var(--color-surface-alt)] object-cover ${
                            isTop
                                ? "border-amber-400 ring-2 ring-amber-300/60"
                                : "border-[var(--color-line)]"
                        }`}
                    />
                    {isTop && (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/vecteezy_gradient-gold-royal-crown_20774605.svg"
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none absolute -top-[22px] -left-[10px] h-[34px] w-[68px] -rotate-[14deg] select-none drop-shadow-[0_2px_3px_rgba(180,120,0,0.45)]"
                            />
                            <span className="sr-only">Top contributor</span>
                        </>
                    )}
                </div>
                <div className="min-w-0">
                    <h3 className="truncate text-[16px] font-semibold tracking-tight text-[var(--color-ink)]">
                        {displayName}
                    </h3>
                    <p className="truncate font-mono text-[11.5px] text-[var(--color-ink-muted)]">
                        @{member.login}
                    </p>
                </div>
            </div>

            <p className="mt-4 line-clamp-2 h-[2.6em] text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
                {member.bio || "—"}
            </p>

            <div className="mt-4 flex h-[1.5rem] flex-wrap items-center gap-x-4 gap-y-1.5 overflow-hidden text-[12px] text-[var(--color-ink-muted)]">
                <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    <span className="font-medium text-[var(--color-ink)]">
                        {formatStars(member.totalStars)}
                    </span>
                </span>
                <span className="inline-flex items-center gap-1">
                    <GitBranch className="h-3.5 w-3.5" />
                    <span className="font-medium text-[var(--color-ink)]">
                        {member.publicRepos}
                    </span>
                    <span>repos</span>
                </span>
                <span
                    className="inline-flex items-center gap-1"
                    title={`${member.recentActivityCount} public event${member.recentActivityCount === 1 ? "" : "s"} in the last 3 days`}
                >
                    <Activity className="h-3.5 w-3.5" />
                    <span className="font-medium text-[var(--color-ink)]">
                        {member.recentActivityCount}
                    </span>
                    <span>3d</span>
                </span>
                {member.location && (
                    <span className="inline-flex min-w-0 items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{member.location}</span>
                    </span>
                )}
            </div>

            <div className="mt-4 flex h-[1.5rem] flex-nowrap gap-1.5 overflow-hidden">
                {member.topLanguages.slice(0, 3).map((l) => (
                    <span
                        key={l.name}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--color-ink-muted)]"
                    >
                        <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: languageColor(l.name) }}
                        />
                        {l.name}
                    </span>
                ))}
            </div>

            <div className="mt-auto pt-5">
                <div className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--color-ink)] bg-[var(--color-ink)] px-3 py-2 text-xs font-medium text-white transition group-hover:bg-[var(--color-ink)]/90">
                    View profile
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
            </div>
        </Link>
    );
}
