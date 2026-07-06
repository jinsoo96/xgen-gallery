import { MemberGrid } from "@/components/member-grid";
import { getMembersPayload } from "@/lib/members/cache";
import { formatRelative, formatStars } from "@/lib/members/format";
import { getAllPosts } from "@/lib/blog";
import type { RecentPost } from "@/components/member-card";

/** 작성자명 → 최근 글 1건 + 글 수. 블로그 author가 멤버 name과 일치하는 글만 매칭. */
function buildPostsByAuthor(): Record<string, RecentPost> {
    const map: Record<string, RecentPost> = {};
    // getAllPosts()는 최신순 → 작성자별 첫 항목이 최근 글.
    for (const p of getAllPosts()) {
        const a = p.author;
        if (!map[a]) map[a] = { slug: p.slug, title: p.title, date: p.date, count: 0 };
        map[a].count += 1;
    }
    return map;
}

/**
 * Server-rendered member roster. Awaited inside a <Suspense> boundary on the
 * members page, so React streams the hero/shell first and swaps in this grid
 * (as real HTML) the moment the cached payload resolves — no client-side
 * hydration → observer → fetch waterfall, so the first card paints far sooner.
 *
 * getMembersPayload() is backed by unstable_cache + a disk cache, so a warm
 * server answers in milliseconds; a cold fetch only slows this streamed chunk,
 * never the hero.
 */
export async function MembersSection() {
    let payload;
    try {
        payload = await getMembersPayload();
    } catch {
        return (
            <div className="rounded-xl border border-[var(--color-line)] bg-white p-10 text-center text-[16px] text-[var(--color-ink-muted)]">
                멤버를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요
            </div>
        );
    }

    const members = payload.members;
    const postsByAuthor = buildPostsByAuthor();
    const totalStars = members.reduce((s, m) => s + m.totalStars, 0);
    const totalActivity = members.reduce(
        (s, m) => s + (m.recentActivityCount ?? 0),
        0,
    );

    return (
        <>
            <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[13px] text-[var(--color-ink-subtle)]">
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
                <span>Updated {formatRelative(payload.fetchedAt)}</span>
            </div>

            {members.length > 0 ? (
                <MemberGrid members={members} postsByAuthor={postsByAuthor} />
            ) : (
                <div className="rounded-xl border border-[var(--color-line)] bg-white p-10 text-center text-[16px] text-[var(--color-ink-muted)]">
                    표시할 멤버가 없습니다
                </div>
            )}
        </>
    );
}
