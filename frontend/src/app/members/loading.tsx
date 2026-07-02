import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";

/**
 * Instant navigation fallback for /members. Because the page is
 * `force-dynamic` (live GitHub data), this skeleton renders immediately on
 * click so the navigation feels responsive while the server prepares the
 * real list.
 */
export default function MembersLoading() {
    return (
        <>
            <SiteNav overlay />
            <section className="relative flex h-[560px] items-center overflow-hidden border-b border-white/10 text-white">
                <SceneBackground concept="members" />
                <div className="relative mx-auto w-full max-w-6xl px-6 pt-16">
                    <div className="h-4 w-40 animate-pulse rounded bg-white/15" />
                    <div className="mt-4 h-11 w-80 max-w-full animate-pulse rounded bg-white/15" />
                    <div className="mt-6 h-4 w-[28rem] max-w-full animate-pulse rounded bg-white/10" />
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white"
                        >
                            <div className="h-14 animate-pulse bg-[var(--color-surface-alt)]" />
                            <div className="px-5 pb-5">
                                <div className="-mt-9 h-16 w-16 animate-pulse rounded-2xl border-[3px] border-white bg-[var(--color-surface-alt)]" />
                                <div className="mt-3 h-5 w-32 animate-pulse rounded bg-[var(--color-surface-alt)]" />
                                <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[var(--color-surface-alt)]" />
                                <div className="mt-4 h-[3.2rem] animate-pulse rounded bg-[var(--color-surface-alt)]" />
                                <div className="mt-4 h-14 animate-pulse rounded-xl bg-[var(--color-surface-alt)]" />
                                <div className="mt-3 flex gap-1.5">
                                    <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--color-surface-alt)]" />
                                    <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--color-surface-alt)]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
