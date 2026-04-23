import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { MemberGrid } from "@/components/member-grid";
import { getMembersPayload } from "@/lib/members/cache";
import { formatRelative, formatStars } from "@/lib/members/format";

// Render at request time so the GitHub token (and any runtime env) is available.
// Without this, Next.js prerenders at Docker `npm run build`, when no .env is mounted.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
    title: "Members · PlateerLab",
    description:
        "Meet the people behind PlateerLab — the open-source contributors building XGEN.",
};

export default async function MembersPage() {
    let payload;
    let error: string | null = null;
    try {
        payload = await getMembersPayload();
    } catch (e) {
        console.error("[/members] failed to load:", e);
        error = "Could not load members right now. Please try again later.";
    }

    const members = payload?.members ?? [];
    const totalStars = members.reduce((s, m) => s + m.totalStars, 0);
    const totalActivity = members.reduce(
        (s, m) => s + (m.recentActivityCount ?? 0),
        0,
    );

    return (
        <>
            <SiteNav />
            <main className="mx-auto max-w-6xl px-6 pb-24 pt-14 md:pt-20">
                <header className="mb-12 md:mb-16">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-ink-subtle)]">
                        Team
                    </p>
                    <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                        The people behind PlateerLab.
                    </h1>
                    <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                        Open-source contributors building the XGEN platform and
                        its ecosystem of libraries. Synced from{" "}
                        <a
                            href="https://github.com/PlateerLab"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-ink)] underline-offset-4 hover:underline"
                        >
                            github.com/PlateerLab
                        </a>
                        .
                    </p>

                    {payload && (
                        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] text-[var(--color-ink-subtle)]">
                            <span>
                                <span className="text-[var(--color-ink)]">
                                    {members.length}
                                </span>{" "}
                                members
                            </span>
                            <span>
                                <span className="text-[var(--color-ink)]">
                                    ★ {formatStars(totalStars)}
                                </span>{" "}
                                combined stars
                            </span>
                            <span>
                                <span className="text-[var(--color-ink)]">
                                    {totalActivity}
                                </span>{" "}
                                events in the last 3 days
                            </span>
                            <span>
                                Updated {formatRelative(payload.fetchedAt)}
                                {payload.source !== "github" && (
                                    <span className="ml-1 rounded border border-[var(--color-line)] px-1 py-0.5">
                                        {payload.source}
                                    </span>
                                )}
                            </span>
                        </div>
                    )}
                </header>

                {error ? (
                    <div className="rounded-xl border border-[var(--color-line)] bg-white p-10 text-center text-sm text-[var(--color-ink-muted)]">
                        {error}
                    </div>
                ) : members.length === 0 ? (
                    <div className="rounded-xl border border-[var(--color-line)] bg-white p-10 text-center">
                        <p className="text-[15px] font-semibold text-[var(--color-ink)]">
                            No members visible from this server.
                        </p>
                        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                            {payload?.tokenMissing ? (
                                <>
                                    GitHub does not expose org membership to
                                    anonymous callers. Set a{" "}
                                    <code className="rounded border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-1.5 py-0.5 font-mono text-[12px]">
                                        GITHUB_TOKEN
                                    </code>{" "}
                                    (PAT with{" "}
                                    <code className="font-mono text-[12px]">
                                        read:org
                                    </code>{" "}
                                    scope) on the server, then restart.
                                </>
                            ) : (
                                <>
                                    A token is configured, but the API returned
                                    no members for{" "}
                                    <code className="font-mono text-[12px]">
                                        {payload?.org}
                                    </code>
                                    . Verify the token belongs to a member of
                                    the organization and includes the{" "}
                                    <code className="font-mono text-[12px]">
                                        read:org
                                    </code>{" "}
                                    scope.
                                </>
                            )}
                        </p>
                    </div>
                ) : (
                    <MemberGrid members={members} />
                )}
            </main>
            <SiteFooter />
        </>
    );
}
