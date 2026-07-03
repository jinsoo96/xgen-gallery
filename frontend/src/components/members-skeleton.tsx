/**
 * Loading placeholders for the Lab Members grid. Rendered as the <Suspense>
 * fallback while the server component fetches the roster, so the hero paints
 * immediately and the grid area never collapses (no layout shift).
 */

/** Stats bar placeholder (members / stars / activity / updated). */
export function StatsBarSkeleton() {
    return (
        <div className="mb-8 h-4 w-96 max-w-full animate-pulse rounded bg-[var(--color-surface-alt)]" />
    );
}

/** Six card placeholders matching the real grid layout. */
export function SkeletonGrid() {
    return (
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
                        <div className="mt-4 h-14 animate-pulse rounded-xl bg-[var(--color-surface-alt)]" />
                        <div className="mt-3 flex gap-1.5">
                            <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--color-surface-alt)]" />
                            <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--color-surface-alt)]" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
