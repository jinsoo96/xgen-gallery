"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowUpRight,
    Building2,
    Calendar,
    Globe,
    MapPin,
    Star,
    Users,
    GitBranch,
    Archive,
    Activity,
    BookOpen,
    FolderGit2,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
    formatRelative,
    formatStars,
    formatYearMonth,
    languageColor,
    normalizeBlog,
} from "@/lib/members/format";
import type {
    MemberDetail,
    MemberRepo,
    RecentEvent,
} from "@/lib/members/types";
import { contributedReposFor } from "@/lib/members/contributions";
import { MemberLanguageBar } from "./member-language-bar";
import { MemberContributionGraph } from "./member-contribution-graph";

type RepoSort = "stars" | "updated";
type Tab = "repos" | "activity" | "readme";

export function MemberDetailView({ member }: { member: MemberDetail }) {
    const [repoSort, setRepoSort] = useState<RepoSort>("stars");
    const [includeForks, setIncludeForks] = useState(false);
    const [tab, setTab] = useState<Tab>("repos");

    const blog = normalizeBlog(member.blog);
    const displayName = member.name ?? member.login;
    // Prefer live-enriched data from the pipeline; fall back to the static map
    // (e.g. stale disk cache that predates the field).
    const contributed = member.contributedRepos?.length
        ? member.contributedRepos
        : contributedReposFor(member.login);

    return (
        <div>
            <Link
                href="/members"
                className="inline-flex items-center gap-1.5 text-[16px] text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]"
            >
                <ArrowLeft className="h-4 w-4" />
                All members
            </Link>

            <header className="mt-8 grid gap-8 md:grid-cols-[auto_1fr] md:items-stretch">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={member.avatarUrl}
                    alt={`${member.login} avatar`}
                    width={240}
                    height={240}
                    className="aspect-square h-32 w-32 rounded-2xl border border-[var(--color-line)] object-cover md:h-full md:max-h-56 md:w-auto"
                />
                <div className="flex min-w-0 flex-col">
                    <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                        {displayName}
                    </h1>
                    <p className="mt-1 font-mono text-[16px] text-[var(--color-ink-muted)]">
                        @{member.login}
                    </p>
                    {member.bio && (
                        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                            {member.bio}
                        </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[15px] text-[var(--color-ink-muted)]">
                        {member.company && (
                            <span className="inline-flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5" />
                                {member.company}
                            </span>
                        )}
                        {member.location && (
                            <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                {member.location}
                            </span>
                        )}
                        {blog && (
                            <a
                                href={blog}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[var(--color-ink)] underline-offset-4 hover:underline"
                            >
                                <Globe className="h-3.5 w-3.5" />
                                {blog.replace(/^https?:\/\//, "")}
                            </a>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Joined {formatYearMonth(member.createdAt)}
                        </span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                        <a
                            href={member.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-ink)] bg-[var(--color-ink)] px-3 py-1.5 text-[14px] font-medium text-white transition hover:bg-[var(--color-ink)]/90"
                        >
                            View on GitHub
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                        {member.twitterUsername && (
                            <a
                                href={`https://twitter.com/${member.twitterUsername}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-line)] bg-white px-3 py-1.5 text-[14px] font-medium text-[var(--color-ink)] transition hover:border-[var(--color-ink)]"
                            >
                                @{member.twitterUsername}
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <section className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Kpi
                    icon={<Star className="h-3.5 w-3.5" />}
                    label="Total stars"
                    value={formatStars(member.totalStars)}
                />
                <Kpi
                    icon={<GitBranch className="h-3.5 w-3.5" />}
                    label="Public repos"
                    value={member.publicRepos.toString()}
                />
                <Kpi
                    icon={<Users className="h-3.5 w-3.5" />}
                    label="Followers"
                    value={formatStars(member.followers)}
                />
                <Kpi
                    icon={<Users className="h-3.5 w-3.5" />}
                    label="Following"
                    value={formatStars(member.following)}
                />
                <Kpi
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    label="Joined"
                    value={formatYearMonth(member.createdAt)}
                />
            </section>

            {member.topLanguages.length > 0 && (
                <section className="mt-10 rounded-xl border border-[var(--color-line)] bg-white p-5">
                    <p className="font-mono text-[12px] uppercase tracking-wider text-[var(--color-ink-subtle)]">
                        / languages
                    </p>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight">
                        Language distribution
                    </h2>
                    <p className="mt-1 text-[15px] text-[var(--color-ink-muted)]">
                        Primary language across non-fork repositories.
                    </p>
                    <MemberLanguageBar
                        className="mt-5"
                        languages={member.topLanguages}
                    />
                </section>
            )}

            {member.contributions && (
                <div className="mt-6">
                    <MemberContributionGraph calendar={member.contributions} />
                </div>
            )}

            {contributed.length > 0 && (
                <section className="mt-10">
                    <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-widest text-[var(--color-ink-subtle)]">
                        <FolderGit2 className="h-4 w-4" />
                        Contributions
                    </h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {contributed.map((c) => (
                            <a
                                key={c.fullName}
                                href={c.htmlUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col rounded-xl border border-[var(--color-line)] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[var(--color-ink)] hover:shadow-[0_8px_24px_-14px_rgba(20,40,80,0.25)]"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="truncate font-mono text-[14px] font-semibold text-[var(--color-ink)]">
                                        {c.fullName}
                                    </span>
                                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--color-ink-subtle)] transition group-hover:text-[var(--color-ink)]" />
                                </div>
                                {c.description && (
                                    <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
                                        {c.description}
                                    </p>
                                )}
                                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                    {c.role && (
                                        <span className="inline-flex items-center rounded-full bg-[#2f7bff]/10 px-2 py-0.5 text-[12px] font-semibold text-[#2461d8]">
                                            {c.role}
                                        </span>
                                    )}
                                    {typeof c.stars === "number" && (
                                        <span className="inline-flex items-center gap-1 text-[12.5px] text-[var(--color-ink-muted)]">
                                            <Star className="h-3.5 w-3.5" />
                                            {formatStars(c.stars)}
                                        </span>
                                    )}
                                    {typeof c.commits === "number" && (
                                        <span className="inline-flex items-center gap-1 text-[12.5px] text-[var(--color-ink-muted)]">
                                            <GitBranch className="h-3.5 w-3.5" />
                                            {c.commits.toLocaleString("en-US")} commits
                                        </span>
                                    )}
                                    {c.language && (
                                        <span className="inline-flex items-center gap-1 text-[12.5px] text-[var(--color-ink-muted)]">
                                            <span
                                                className="h-2 w-2 rounded-full"
                                                style={{ background: languageColor(c.language) }}
                                            />
                                            {c.language}
                                        </span>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            <section className="mt-10">
                <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-line)]">
                    <TabButton
                        active={tab === "repos"}
                        onClick={() => setTab("repos")}
                        icon={<FolderGit2 className="h-3.5 w-3.5" />}
                        label="Repositories"
                        count={member.publicRepos}
                    />
                    <TabButton
                        active={tab === "activity"}
                        onClick={() => setTab("activity")}
                        icon={<Activity className="h-3.5 w-3.5" />}
                        label="Recent activity"
                        count={member.recentEvents.length}
                    />
                    <TabButton
                        active={tab === "readme"}
                        onClick={() => setTab("readme")}
                        icon={<BookOpen className="h-3.5 w-3.5" />}
                        label="README"
                    />
                </div>

                {tab === "repos" && (
                    <ReposPanel
                        member={member}
                        repoSort={repoSort}
                        setRepoSort={setRepoSort}
                        includeForks={includeForks}
                        setIncludeForks={setIncludeForks}
                    />
                )}
                {tab === "activity" && (
                    <ActivityPanel events={member.recentEvents} />
                )}
                {tab === "readme" && (
                    <ReadmePanel
                        login={member.login}
                        readmeHtml={member.readmeHtml}
                    />
                )}
            </section>
        </div>
    );
}

function ReposPanel({
    member,
    repoSort,
    setRepoSort,
    includeForks,
    setIncludeForks,
}: {
    member: MemberDetail;
    repoSort: RepoSort;
    setRepoSort: (s: RepoSort) => void;
    includeForks: boolean;
    setIncludeForks: (b: boolean) => void;
}) {
    const repos = useMemo(() => {
        const base = includeForks
            ? member.repos.slice()
            : member.repos.filter((r) => !r.isFork);
        if (repoSort === "stars") {
            base.sort((a, b) => b.stars - a.stars);
        } else {
            base.sort(
                (a, b) =>
                    new Date(b.pushedAt).getTime() -
                    new Date(a.pushedAt).getTime(),
            );
        }
        return base;
    }, [member.repos, repoSort, includeForks]);

    return (
        <div className="mt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <p className="text-[16px] text-[var(--color-ink-muted)]">
                    {repos.length} {repos.length === 1 ? "repo" : "repos"}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                    <ToggleButton
                        active={repoSort === "stars"}
                        onClick={() => setRepoSort("stars")}
                    >
                        Stars
                    </ToggleButton>
                    <ToggleButton
                        active={repoSort === "updated"}
                        onClick={() => setRepoSort("updated")}
                    >
                        Updated
                    </ToggleButton>
                    <label className="ml-2 inline-flex cursor-pointer items-center gap-1.5 text-[14px] text-[var(--color-ink-muted)]">
                        <input
                            type="checkbox"
                            checked={includeForks}
                            onChange={(e) => setIncludeForks(e.target.checked)}
                            className="h-3.5 w-3.5 accent-[var(--color-ink)]"
                        />
                        Include forks
                    </label>
                </div>
            </div>

            <div className="mt-5 divide-y divide-[var(--color-line)] overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
                {repos.length === 0 ? (
                    <p className="px-5 py-10 text-center text-[16px] text-[var(--color-ink-muted)]">
                        No repositories.
                    </p>
                ) : (
                    repos.map((r) => <RepoRow key={r.fullName} repo={r} />)
                )}
            </div>
        </div>
    );
}

function ActivityPanel({ events }: { events: RecentEvent[] }) {
    if (events.length === 0) {
        return (
            <p className="mt-10 text-center text-[16px] text-[var(--color-ink-muted)]">
                No recent public activity.
            </p>
        );
    }
    return (
        <div className="mt-6 divide-y divide-[var(--color-line)] overflow-hidden rounded-xl border border-[var(--color-line)] bg-white">
            {events.map((e) => (
                <EventRow key={e.id} event={e} />
            ))}
        </div>
    );
}

function EventRow({ event }: { event: RecentEvent }) {
    const inner = (
        <>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="rounded border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-1.5 py-0.5 font-mono text-[12px] uppercase tracking-wider text-[var(--color-ink-subtle)]">
                    {event.type.replace(/Event$/, "")}
                </span>
                <a
                    href={event.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-mono text-[14px] text-[var(--color-ink)] hover:underline"
                >
                    {event.repoName}
                </a>
                <span className="ml-auto text-[13px] text-[var(--color-ink-subtle)]">
                    {formatRelative(event.createdAt)}
                </span>
            </div>
            <p className="mt-1 text-[15.5px] leading-relaxed text-[var(--color-ink-muted)]">
                {event.summary}
            </p>
        </>
    );
    if (event.targetUrl) {
        return (
            <a
                href={event.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-5 py-4 transition hover:bg-[var(--color-surface-alt)]"
            >
                {inner}
            </a>
        );
    }
    return <div className="block px-5 py-4">{inner}</div>;
}

function ReadmePanel({
    login,
    readmeHtml,
}: {
    login: string;
    readmeHtml: string | null;
}) {
    if (!readmeHtml) {
        return (
            <div className="mt-6 rounded-xl border border-dashed border-[var(--color-line)] bg-white px-5 py-10 text-center text-[16px] text-[var(--color-ink-muted)]">
                <p>@{login} doesn&apos;t have a profile README yet.</p>
                <p className="mt-1 text-[14px] text-[var(--color-ink-subtle)]">
                    A profile README lives in a repository named after the user
                    (<span className="font-mono">
                        {login}/{login}
                    </span>
                    ).
                </p>
            </div>
        );
    }
    return (
        <div className="mt-6 rounded-xl border border-[var(--color-line)] bg-white p-6">
            <article
                className="member-readme"
                dangerouslySetInnerHTML={{ __html: readmeHtml }}
            />
        </div>
    );
}

function TabButton({
    active,
    onClick,
    icon,
    label,
    count,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    count?: number;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-[15px] font-medium transition",
                active
                    ? "border-[var(--color-ink)] text-[var(--color-ink)]"
                    : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
            )}
        >
            {icon}
            {label}
            {typeof count === "number" && (
                <span
                    className={cn(
                        "ml-1 rounded-full px-1.5 py-0.5 font-mono text-[12px]",
                        active
                            ? "bg-[var(--color-ink)] text-white"
                            : "bg-[var(--color-surface-alt)] text-[var(--color-ink-muted)]",
                    )}
                >
                    {count}
                </span>
            )}
        </button>
    );
}

function Kpi({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-[var(--color-line)] bg-white p-4">
            <div className="inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-wider text-[var(--color-ink-subtle)]">
                {icon}
                {label}
            </div>
            <div className="mt-2 text-xl font-semibold tracking-tight">
                {value}
            </div>
        </div>
    );
}

function ToggleButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "rounded-full border px-3 py-1 text-[13px] font-medium transition",
                active
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                    : "border-[var(--color-line)] bg-white text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]",
            )}
        >
            {children}
        </button>
    );
}

function RepoRow({ repo }: { repo: MemberRepo }) {
    return (
        <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "block px-5 py-4 transition hover:bg-[var(--color-surface-alt)]",
                repo.isFork && "opacity-70",
            )}
        >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-[17px] font-semibold tracking-tight text-[var(--color-ink)]">
                    {repo.name}
                </span>
                {repo.isFork && (
                    <span className="rounded border border-[var(--color-line)] px-1.5 py-0.5 font-mono text-[12px] text-[var(--color-ink-subtle)]">
                        fork
                    </span>
                )}
                {repo.isArchived && (
                    <span className="inline-flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 font-mono text-[12px] text-amber-700">
                        <Archive className="h-3 w-3" /> archived
                    </span>
                )}
            </div>
            {repo.description && (
                <p className="mt-1 text-[15.5px] leading-relaxed text-[var(--color-ink-muted)]">
                    {repo.description}
                </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-[var(--color-ink-muted)]">
                {repo.language && (
                    <span className="inline-flex items-center gap-1.5">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: languageColor(repo.language) }}
                        />
                        {repo.language}
                    </span>
                )}
                <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {formatStars(repo.stars)}
                </span>
                <span className="inline-flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {formatStars(repo.forks)}
                </span>
                {repo.license && (
                    <span className="font-mono text-[13px] text-[var(--color-ink-subtle)]">
                        {repo.license}
                    </span>
                )}
                <span className="ml-auto text-[var(--color-ink-subtle)]">
                    Updated {formatRelative(repo.pushedAt)}
                </span>
            </div>
            {repo.topics.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {repo.topics.slice(0, 6).map((t) => (
                        <span
                            key={t}
                            className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-2 py-0.5 font-mono text-[12px] text-[var(--color-ink-muted)]"
                        >
                            {t}
                        </span>
                    ))}
                </div>
            )}
        </a>
    );
}
