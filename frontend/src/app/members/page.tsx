import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { MemberGrid } from "@/components/member-grid";
import { MembersHeader } from "@/components/members-header";
import { SceneBackground } from "@/components/scene-background";
import { getMembersPayload } from "@/lib/members/cache";
import { formatRelative, formatStars } from "@/lib/members/format";

// Render at request time so the GitHub token (and any runtime env) is available.
// Without this, Next.js prerenders at Docker `npm run build`, when no .env is mounted.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
    title: "Members",
    description:
        "Meet the people behind Plateer Labs — the open-source contributors building XGEN.",
    alternates: { canonical: "/members" },
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
            <SiteNav overlay />
            <section className="relative flex h-[560px] items-center overflow-hidden border-b border-white/10 text-white">
                <SceneBackground concept="members" />
                <div className="relative mx-auto w-full max-w-6xl px-6 pt-16">
                    <MembersHeader />

                    {payload && (
                        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[13px] text-white/55">
                            <span>
                                <span className="text-white">
                                    {members.length}
                                </span>{" "}
                                members
                            </span>
                            <span>
                                <span className="text-white">
                                    ★ {formatStars(totalStars)}
                                </span>{" "}
                                combined stars
                            </span>
                            <span>
                                <span className="text-white">
                                    {totalActivity}
                                </span>{" "}
                                events in the last 3 days
                            </span>
                            <span>
                                Updated {formatRelative(payload.fetchedAt)}
                                {payload.source !== "github" && (
                                    <span className="ml-1 rounded border border-white/20 px-1 py-0.5">
                                        {payload.source}
                                    </span>
                                )}
                            </span>
                        </div>
                    )}
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">

                {error ? (
                    <div className="rounded-xl border border-[var(--color-line)] bg-white p-10 text-center text-[16px] text-[var(--color-ink-muted)]">
                        {error}
                    </div>
                ) : members.length === 0 ? (
                    <div className="rounded-xl border border-[var(--color-line)] bg-white p-10 text-center">
                        <p className="text-[17px] font-semibold text-[var(--color-ink)]">
                            No members visible from this server.
                        </p>
                        <p className="mt-2 text-[16px] text-[var(--color-ink-muted)]">
                            {payload?.tokenMissing ? (
                                <>
                                    GitHub does not expose org membership to
                                    anonymous callers. Set a{" "}
                                    <code className="rounded border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-1.5 py-0.5 font-mono text-[14px]">
                                        GITHUB_TOKEN
                                    </code>{" "}
                                    (PAT with{" "}
                                    <code className="font-mono text-[14px]">
                                        read:org
                                    </code>{" "}
                                    scope) on the server, then restart.
                                </>
                            ) : (
                                <>
                                    A token is configured, but the API returned
                                    no members for{" "}
                                    <code className="font-mono text-[14px]">
                                        {payload?.org}
                                    </code>
                                    . Verify the token belongs to a member of
                                    the organization and includes the{" "}
                                    <code className="font-mono text-[14px]">
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
