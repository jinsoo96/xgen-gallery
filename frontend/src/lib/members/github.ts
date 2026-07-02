import { marked } from "marked";
import type {
    ContributedRepo,
    ContributionCalendar,
    ContributionDay,
    MemberDetail,
    MemberRepo,
    MemberSummary,
    MembersPayload,
    RecentEvent,
} from "./types";
import { contributedReposFor } from "./contributions";

const ORG = process.env.GITHUB_ORG || "PlateerLab";
const TOKEN = process.env.GITHUB_TOKEN || "";
const API = "https://api.github.com";
const UA = "xgen-gallery (members-panel)";
const TIMEOUT_MS = 10_000;

/** Concurrency limiter — minimal, no external dep. */
function pLimit(concurrency: number) {
    let active = 0;
    const queue: (() => void)[] = [];
    const next = () => {
        if (active >= concurrency) return;
        const job = queue.shift();
        if (job) {
            active++;
            job();
        }
    };
    return <T>(fn: () => Promise<T>) =>
        new Promise<T>((resolve, reject) => {
            const run = () => {
                fn()
                    .then(resolve, reject)
                    .finally(() => {
                        active--;
                        next();
                    });
            };
            queue.push(run);
            next();
        });
}

interface GhUser {
    login: string;
    id: number;
    name: string | null;
    avatar_url: string;
    html_url: string;
    bio: string | null;
    company: string | null;
    location: string | null;
    blog: string | null;
    twitter_username: string | null;
    email: string | null;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
}

interface GhRepo {
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    watchers_count: number;
    open_issues_count: number;
    language: string | null;
    fork: boolean;
    archived: boolean;
    updated_at: string;
    pushed_at: string;
    topics: string[] | null;
    license: { spdx_id: string | null; name: string | null } | null;
}

interface GhContributor {
    login: string;
    contributions: number;
}

let lastRateLimitRemaining: number | null = null;
export function getLastRateLimit(): number | null {
    return lastRateLimitRemaining;
}

async function gh<T>(path: string): Promise<{ data: T; res: Response }> {
    const url = path.startsWith("http") ? path : `${API}${path}`;
    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": UA,
    };
    if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res: Response;
    try {
        res = await fetch(url, {
            headers,
            signal: ctrl.signal,
            // Disable Next.js fetch cache — we manage caching upstream.
            cache: "no-store",
        });
    } finally {
        clearTimeout(timer);
    }
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining != null) lastRateLimitRemaining = Number(remaining);

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(
            `GitHub ${res.status} ${res.statusText} for ${path} :: ${body.slice(0, 200)}`,
        );
    }
    const data = (await res.json()) as T;
    return { data, res };
}

/** Parse RFC 5988 Link header to extract the next page URL. */
function nextLink(linkHeader: string | null): string | null {
    if (!linkHeader) return null;
    for (const part of linkHeader.split(",")) {
        const m = /<([^>]+)>;\s*rel="next"/.exec(part.trim());
        if (m) return m[1];
    }
    return null;
}

async function ghAllPages<T>(initialPath: string): Promise<T[]> {
    const out: T[] = [];
    let url: string | null = initialPath;
    let pages = 0;
    while (url && pages < 10) {
        const { data, res } = await gh<T[]>(url);
        out.push(...data);
        url = nextLink(res.headers.get("link"));
        pages++;
    }
    return out;
}

function mapRepo(r: GhRepo): MemberRepo {
    return {
        name: r.name,
        fullName: r.full_name,
        htmlUrl: r.html_url,
        description: r.description,
        stars: r.stargazers_count,
        forks: r.forks_count,
        watchers: r.watchers_count,
        openIssues: r.open_issues_count,
        language: r.language,
        isFork: r.fork,
        isArchived: r.archived,
        updatedAt: r.updated_at,
        pushedAt: r.pushed_at,
        topics: r.topics ?? [],
        license: r.license?.spdx_id || r.license?.name || null,
    };
}

function topLanguages(
    repos: MemberRepo[],
    extraLangs: (string | null | undefined)[] = [],
    n = 5,
) {
    const counts = new Map<string, number>();
    for (const r of repos) {
        if (r.isFork) continue;
        if (!r.language) continue;
        counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    }
    // 소유 레포에 안 잡히는 조직 기여 레포(xgen-gallery 등)의 언어도 포함한다.
    for (const lang of extraLangs) {
        if (!lang) continue;
        counts.set(lang, (counts.get(lang) ?? 0) + 1);
    }
    return [...counts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, n);
}

/** commit_activity(주별 total + 일별 days[7])를 히트맵용 ContributionCalendar로 변환. */
function buildRepoCalendar(
    weeks: { total: number; week: number; days: number[] }[],
): ContributionCalendar {
    const allCounts: number[] = [];
    for (const w of weeks) for (const c of w.days) allCounts.push(c);
    const positives = allCounts.filter((n) => n > 0).sort((a, b) => a - b);
    const q = (p: number) =>
        positives.length === 0
            ? 0
            : positives[
                  Math.min(positives.length - 1, Math.floor(positives.length * p))
              ];
    const t1 = Math.max(1, q(0.25));
    const t2 = Math.max(t1 + 1, q(0.5));
    const t3 = Math.max(t2 + 1, q(0.75));
    const bucket = (n: number): 0 | 1 | 2 | 3 | 4 =>
        n <= 0 ? 0 : n <= t1 ? 1 : n <= t2 ? 2 : n <= t3 ? 3 : 4;
    const calWeeks: ContributionDay[][] = weeks.map((w) =>
        w.days.map((count, di) => ({
            date: new Date((w.week + di * 86400) * 1000)
                .toISOString()
                .slice(0, 10),
            count,
            level: bucket(count),
        })),
    );
    const total = weeks.reduce((s, w) => s + w.total, 0);
    return { totalContributions: total, weeks: calWeeks };
}

/**
 * 작성자 커밋 날짜 목록으로 GitHub식 53주 히트맵 캘린더를 만든다. 통계 API의
 * 202(계산 중) 지연 문제를 피하려고 /commits?author= 결과를 직접 버킷팅한다.
 */
function buildAuthorCalendar(dates: string[]): ContributionCalendar {
    const byDate = new Map<string, number>();
    for (const iso of dates) {
        const d = iso.slice(0, 10);
        byDate.set(d, (byDate.get(d) ?? 0) + 1);
    }
    const positives = [...byDate.values()]
        .filter((n) => n > 0)
        .sort((a, b) => a - b);
    const q = (p: number) =>
        positives.length === 0
            ? 0
            : positives[
                  Math.min(positives.length - 1, Math.floor(positives.length * p))
              ];
    const t1 = Math.max(1, q(0.25));
    const t2 = Math.max(t1 + 1, q(0.5));
    const t3 = Math.max(t2 + 1, q(0.75));
    const bucket = (n: number): 0 | 1 | 2 | 3 | 4 =>
        n <= 0 ? 0 : n <= t1 ? 1 : n <= t2 ? 2 : n <= t3 ? 3 : 4;

    // 이번 주 토요일까지, 그 직전 53주의 일요일부터 하루씩 채운다.
    const today = new Date();
    const end = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    const lastSat = new Date(end);
    lastSat.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));
    const WEEKS = 53;
    const cursor = new Date(lastSat);
    cursor.setUTCDate(lastSat.getUTCDate() - (WEEKS * 7 - 1));

    const weeks: ContributionDay[][] = [];
    for (let w = 0; w < WEEKS; w++) {
        const week: ContributionDay[] = [];
        for (let d = 0; d < 7; d++) {
            const date = cursor.toISOString().slice(0, 10);
            const count = byDate.get(date) ?? 0;
            week.push({ date, count, level: bucket(count) });
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
        weeks.push(week);
    }
    const total = [...byDate.values()].reduce((a, b) => a + b, 0);
    return { totalContributions: total, weeks };
}

function summarize(profile: GhUser, repos: MemberRepo[]): MemberSummary {
    const ownRepos = repos.filter((r) => !r.isFork);
    const totalStars = ownRepos.reduce((s, r) => s + r.stars, 0);
    const totalForks = ownRepos.reduce((s, r) => s + r.forks, 0);
    return {
        login: profile.login,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        htmlUrl: profile.html_url,
        bio: profile.bio,
        company: profile.company,
        location: profile.location,
        blog: profile.blog,
        twitterUsername: profile.twitter_username,
        email: profile.email,
        publicRepos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        totalStars,
        totalForks,
        recentActivityCount: 0,
        topLanguages: topLanguages(repos),
    };
}

/**
 * Enrich the curated contribution list for a member with live repo stats and the
 * member's own commit count (from the contributors API). Org repos never appear
 * in `/users/:login/repos?type=owner`, so they're sourced from the curated map.
 * Any per-repo failure (private repo, missing token) falls back to the static entry.
 */
async function fetchContributedRepos(login: string): Promise<ContributedRepo[]> {
    const curated = contributedReposFor(login);
    if (curated.length === 0) return [];
    return Promise.all(
        curated.map(async (c) => {
            try {
                const { data: repo } = await gh<GhRepo>(`/repos/${c.fullName}`);
                let commits: number | undefined;
                try {
                    const contributors = await ghAllPages<GhContributor>(
                        `/repos/${c.fullName}/contributors?per_page=100`,
                    );
                    commits = contributors.find(
                        (x) => x.login?.toLowerCase() === login.toLowerCase(),
                    )?.contributions;
                } catch (e) {
                    console.warn(`[members] contributors ${c.fullName}:`, e);
                }
                // 최근 ~52주 커밋 활동(주별 total + 일별 days). GitHub이 통계를 계산
                // 중이면 202+빈 응답을 줄 수 있으니, 배열이 아닐 때는 생략한다.
                let weeklyCommits: number[] | undefined;
                let activity: ContributionCalendar | undefined;
                try {
                    const { data: raw } = await gh<
                        { total: number; week: number; days: number[] }[]
                    >(`/repos/${c.fullName}/stats/commit_activity`);
                    if (Array.isArray(raw) && raw.length) {
                        weeklyCommits = raw.map((w) => w.total);
                        activity = buildRepoCalendar(raw);
                    }
                } catch (e) {
                    console.warn(`[members] commit_activity ${c.fullName}:`, e);
                }
                // 히트맵은 작성자 커밋 목록으로 직접 만든다(통계 API의 202 지연 회피).
                // 성공 시 위 commit_activity 기반 값을 덮어쓴다.
                try {
                    const since = new Date(
                        Date.now() - 372 * 86400 * 1000,
                    ).toISOString();
                    const authored = await ghAllPages<{
                        commit?: { author?: { date?: string } };
                    }>(
                        `/repos/${c.fullName}/commits?author=${encodeURIComponent(login)}&since=${since}&per_page=100`,
                    );
                    const dates = authored
                        .map((x) => x.commit?.author?.date)
                        .filter((d): d is string => Boolean(d));
                    if (dates.length) activity = buildAuthorCalendar(dates);
                } catch (e) {
                    console.warn(`[members] commits ${c.fullName}:`, e);
                }
                // 레포의 전체 언어(바이트 내림차순) — 언어 분포에 반영한다.
                let languages: string[] | undefined;
                try {
                    const { data: langs } = await gh<Record<string, number>>(
                        `/repos/${c.fullName}/languages`,
                    );
                    if (langs && typeof langs === "object") {
                        languages = Object.entries(langs)
                            .sort((a, b) => b[1] - a[1])
                            .map(([name]) => name);
                    }
                } catch (e) {
                    console.warn(`[members] languages ${c.fullName}:`, e);
                }
                return {
                    ...c,
                    description: repo.description ?? c.description,
                    language: repo.language ?? c.language ?? null,
                    stars: repo.stargazers_count,
                    commits,
                    weeklyCommits,
                    activity,
                    languages,
                };
            } catch (e) {
                console.warn(`[members] contributed repo ${c.fullName}:`, e);
                return c; // static fallback (private repo / no token)
            }
        }),
    );
}

async function buildMember(login: string): Promise<MemberDetail> {
    const [{ data: profile }, repoRaw] = await Promise.all([
        gh<GhUser>(`/users/${login}`),
        ghAllPages<GhRepo>(`/users/${login}/repos?per_page=100&type=owner&sort=updated`),
    ]);
    const repos = repoRaw.map(mapRepo);
    const summary = summarize(profile, repos);
    // These are non-critical — if any fails, return empty/null and continue.
    const [contributions, recentEvents, readmeHtml, contributedRepos] =
        await Promise.all([
            fetchContributions(login).catch((e) => {
                console.warn(`[members] contributions ${login}:`, e);
                return null;
            }),
            fetchRecentEvents(login).catch((e) => {
                console.warn(`[members] events ${login}:`, e);
                return [];
            }),
            fetchProfileReadme(login).catch((e) => {
                console.warn(`[members] readme ${login}:`, e);
                return null;
            }),
            fetchContributedRepos(login).catch((e) => {
                console.warn(`[members] contributed ${login}:`, e);
                return contributedReposFor(login); // static fallback
            }),
        ]);
    // 조직 기여 레포의 언어까지 포함해 언어 분포를 다시 계산한다.
    const extraLangs = contributedRepos.flatMap((c) => c.languages ?? []);
    return {
        ...summary,
        topLanguages: extraLangs.length
            ? topLanguages(repos, extraLangs)
            : summary.topLanguages,
        repos,
        contributions,
        recentEvents: recentEvents.slice(0, 50),
        readmeHtml,
        contributedRepos,
        recentActivityCount: countRecentActivity(recentEvents, 3),
    };
}

/** Count events whose `createdAt` falls within the last `days` days. */
function countRecentActivity(events: RecentEvent[], days: number): number {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    let n = 0;
    for (const e of events) {
        if (new Date(e.createdAt).getTime() >= cutoff) n++;
    }
    return n;
}

/* ---------------- Contributions (GraphQL) ---------------- */

interface GqlContribResp {
    data?: {
        user?: {
            contributionsCollection?: {
                contributionCalendar?: {
                    totalContributions: number;
                    weeks: {
                        contributionDays: {
                            date: string;
                            contributionCount: number;
                        }[];
                    }[];
                };
            };
        };
    };
    errors?: { message: string }[];
}

async function fetchContributions(
    login: string,
): Promise<ContributionCalendar | null> {
    if (!TOKEN) return null; // GraphQL strictly requires auth.
    const query = `query($login: String!) {
        user(login: $login) {
            contributionsCollection {
                contributionCalendar {
                    totalContributions
                    weeks {
                        contributionDays { date contributionCount }
                    }
                }
            }
        }
    }`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res: Response;
    try {
        res = await fetch(`${API}/graphql`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
                "User-Agent": UA,
            },
            body: JSON.stringify({ query, variables: { login } }),
            signal: ctrl.signal,
            cache: "no-store",
        });
    } finally {
        clearTimeout(timer);
    }
    if (!res.ok) {
        throw new Error(`graphql ${res.status} ${res.statusText}`);
    }
    const json = (await res.json()) as GqlContribResp;
    if (json.errors?.length) {
        throw new Error(json.errors.map((e) => e.message).join("; "));
    }
    const cal = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal) return null;

    // Bucket counts into 0..4 levels using simple per-user thresholds.
    const allCounts: number[] = [];
    for (const w of cal.weeks) for (const d of w.contributionDays) allCounts.push(d.contributionCount);
    const positives = allCounts.filter((n) => n > 0).sort((a, b) => a - b);
    // Quartile thresholds; if there are too few positives, fall back to fixed steps.
    const q = (p: number) =>
        positives.length === 0
            ? 0
            : positives[Math.min(positives.length - 1, Math.floor(positives.length * p))];
    const t1 = Math.max(1, q(0.25));
    const t2 = Math.max(t1 + 1, q(0.5));
    const t3 = Math.max(t2 + 1, q(0.75));

    const bucket = (n: number): 0 | 1 | 2 | 3 | 4 => {
        if (n <= 0) return 0;
        if (n <= t1) return 1;
        if (n <= t2) return 2;
        if (n <= t3) return 3;
        return 4;
    };

    const weeks: ContributionDay[][] = cal.weeks.map((w) =>
        w.contributionDays.map((d) => ({
            date: d.date,
            count: d.contributionCount,
            level: bucket(d.contributionCount),
        })),
    );

    return { totalContributions: cal.totalContributions, weeks };
}

/* ---------------- Recent events (REST) ---------------- */

interface GhEvent {
    id: string;
    type: string;
    actor: { login: string };
    repo: { name: string; url: string };
    created_at: string;
    payload: Record<string, unknown>;
}

function summarizeEvent(e: GhEvent): { summary: string; targetUrl?: string } {
    const p = e.payload;
    const repoUrl = `https://github.com/${e.repo.name}`;
    switch (e.type) {
        case "PushEvent": {
            const commits = (p.commits as { sha: string; message: string }[] | undefined) ?? [];
            const ref = (p.ref as string | undefined)?.replace("refs/heads/", "") ?? "";
            const distinct = (p.distinct_size as number | undefined) ?? 0;
            // distinct_size can be 0 (force-push, mirror-push, or commits already
            // pushed elsewhere). Fall back to the raw commit list, and if that's
            // also empty, describe it as a branch update instead of "0 commits".
            const n = distinct > 0 ? distinct : commits.length;
            if (n === 0) {
                return {
                    summary: ref ? `Updated branch ${ref}` : "Updated a branch",
                    targetUrl: ref ? `${repoUrl}/commits/${ref}` : repoUrl,
                };
            }
            return {
                summary: `Pushed ${n} commit${n === 1 ? "" : "s"} to ${ref}`,
                targetUrl: commits.length
                    ? `${repoUrl}/commit/${commits[commits.length - 1].sha}`
                    : repoUrl,
            };
        }
        case "PullRequestEvent": {
            const action = (p.action as string) ?? "updated";
            const pr = p.pull_request as { number: number; title: string; html_url: string } | undefined;
            return {
                summary: `${cap(action)} PR #${pr?.number ?? "?"} — ${pr?.title ?? ""}`.trim(),
                targetUrl: pr?.html_url,
            };
        }
        case "IssuesEvent": {
            const action = (p.action as string) ?? "updated";
            const issue = p.issue as { number: number; title: string; html_url: string } | undefined;
            return {
                summary: `${cap(action)} issue #${issue?.number ?? "?"} — ${issue?.title ?? ""}`.trim(),
                targetUrl: issue?.html_url,
            };
        }
        case "IssueCommentEvent": {
            const issue = p.issue as { number: number; title: string; html_url: string } | undefined;
            return {
                summary: `Commented on #${issue?.number ?? "?"} — ${issue?.title ?? ""}`.trim(),
                targetUrl: (p.comment as { html_url: string } | undefined)?.html_url ?? issue?.html_url,
            };
        }
        case "PullRequestReviewEvent":
        case "PullRequestReviewCommentEvent": {
            const pr = p.pull_request as { number: number; title: string; html_url: string } | undefined;
            return {
                summary: `Reviewed PR #${pr?.number ?? "?"} — ${pr?.title ?? ""}`.trim(),
                targetUrl: pr?.html_url,
            };
        }
        case "CreateEvent": {
            const refType = (p.ref_type as string) ?? "thing";
            const ref = (p.ref as string | undefined) ?? "";
            return {
                summary: ref ? `Created ${refType} ${ref}` : `Created ${refType}`,
                targetUrl: repoUrl,
            };
        }
        case "DeleteEvent": {
            const refType = (p.ref_type as string) ?? "thing";
            const ref = (p.ref as string | undefined) ?? "";
            return {
                summary: `Deleted ${refType} ${ref}`.trim(),
                targetUrl: repoUrl,
            };
        }
        case "ForkEvent": {
            const forkee = p.forkee as { full_name: string; html_url: string } | undefined;
            return {
                summary: `Forked to ${forkee?.full_name ?? ""}`.trim(),
                targetUrl: forkee?.html_url ?? repoUrl,
            };
        }
        case "WatchEvent":
            return { summary: "Starred the repository", targetUrl: repoUrl };
        case "PublicEvent":
            return { summary: "Made the repository public", targetUrl: repoUrl };
        case "ReleaseEvent": {
            const rel = p.release as { name: string | null; tag_name: string; html_url: string } | undefined;
            return {
                summary: `Released ${rel?.name || rel?.tag_name || ""}`.trim(),
                targetUrl: rel?.html_url,
            };
        }
        case "GollumEvent":
            return { summary: "Updated the wiki", targetUrl: `${repoUrl}/wiki` };
        case "MemberEvent":
            return { summary: "Updated repository members", targetUrl: repoUrl };
        case "CommitCommentEvent": {
            const c = p.comment as { html_url: string } | undefined;
            return { summary: "Commented on a commit", targetUrl: c?.html_url ?? repoUrl };
        }
        default:
            return { summary: e.type.replace(/Event$/, ""), targetUrl: repoUrl };
    }
}

function cap(s: string): string {
    return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/**
 * Fetch a member's public events.
 *
 * Paginates up to {@link max} events (capped by GitHub's own ~300 event ceiling)
 * so the 3-day activity counter is accurate even for highly active accounts.
 * Stops early once a page contains an event older than 3 days, since events are
 * returned newest-first and older entries do not affect the 3-day count.
 */
async function fetchRecentEvents(login: string, max = 1000): Promise<RecentEvent[]> {
    const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;
    const out: RecentEvent[] = [];
    let url: string | null = `/users/${login}/events/public?per_page=100`;
    let pages = 0;
    while (url && pages < 10 && out.length < max) {
        const { data, res } = await gh<GhEvent[]>(url);
        for (const e of data) {
            const { summary, targetUrl } = summarizeEvent(e);
            out.push({
                id: e.id,
                type: e.type,
                createdAt: e.created_at,
                repoName: e.repo.name,
                repoUrl: `https://github.com/${e.repo.name}`,
                summary,
                targetUrl,
            });
            if (out.length >= max) break;
        }
        // Events are newest-first; if oldest in this page is already past the
        // 3-day cutoff, no further pages can contribute to the count.
        const last = data[data.length - 1];
        if (last && new Date(last.created_at).getTime() < cutoff) break;
        url = nextLink(res.headers.get("link"));
        pages++;
    }
    return out;
}

/* ---------------- Profile README ---------------- */

async function fetchProfileReadme(login: string): Promise<string | null> {
    const url = `${API}/repos/${login}/${login}/readme`;
    const headers: Record<string, string> = {
        Accept: "application/vnd.github.raw+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": UA,
    };
    if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res: Response;
    try {
        res = await fetch(url, { headers, signal: ctrl.signal, cache: "no-store" });
    } finally {
        clearTimeout(timer);
    }
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`readme ${res.status} ${res.statusText}`);
    const md = await res.text();
    if (!md.trim()) return null;
    // Render to HTML server-side. marked v14 returns Promise<string> with async extensions; cast for simplicity.
    const html = marked.parse(md, { gfm: true, breaks: true, async: false }) as string;
    return sanitizeHtml(html);
}

/** Strip `<script>`, `<style>`, `<iframe>` tags and inline `on*=...` event handlers and `javascript:` URLs. */
function sanitizeHtml(html: string): string {
    return html
        .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
        .replace(/<\s*(script|style|iframe|object|embed)[^>]*\/?\s*>/gi, "")
        .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
        .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
        .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
        .replace(/(href|src)\s*=\s*"\s*javascript:[^"]*"/gi, '$1="#"')
        .replace(/(href|src)\s*=\s*'\s*javascript:[^']*'/gi, "$1='#'");
}

/** Try the authenticated members endpoint (returns private memberships too). */
async function tryApiMembers(path: string): Promise<string[]> {
    try {
        const items = await ghAllPages<{ login: string }>(path);
        return items.map((i) => i.login);
    } catch (err) {
        console.warn(`[members] ${path} failed:`, err);
        return [];
    }
}

async function discoverMemberLogins(): Promise<{
    logins: string[];
    via: string;
}> {
    // 1) Authenticated /members — returns ALL members visible to the token
    //    (includes private memberships when token has read:org).
    if (TOKEN) {
        const fromApi = await tryApiMembers(
            `/orgs/${ORG}/members?per_page=100`,
        );
        if (fromApi.length > 0) {
            return { logins: fromApi, via: "orgs/members" };
        }
    }
    // 2) Public members fallback (anonymous-safe). Will be empty if every
    //    member chose private membership in the org.
    const fromPublic = await tryApiMembers(
        `/orgs/${ORG}/public_members?per_page=100`,
    );
    return { logins: fromPublic, via: "orgs/public_members" };
}

/**
 * One-shot fetch of the org membership list AND every member's full detail.
 *
 * The list view and the per-member detail view share the same upstream calls
 * (profile, repos, events, contributions, readme) — building them together
 * guarantees they stay in lock-step (a single 30-min refresh updates the
 * "Activity (3d)" sort on the list AND every detail page's Recent activity)
 * and avoids paying for the same GitHub calls twice.
 */
export async function fetchMembersAndDetailsFromGithub(): Promise<{
    payload: MembersPayload;
    details: Record<string, MemberDetail>;
}> {
    const { logins, via } = await discoverMemberLogins();
    console.log(
        `[members] discovered ${logins.length} login(s) via ${via}` +
            (TOKEN ? "" : " (no GITHUB_TOKEN)"),
    );

    const limiter = pLimit(5);
    const settled = await Promise.allSettled(
        logins.map((login) => limiter(() => buildMember(login))),
    );

    const detailList: MemberDetail[] = [];
    for (const r of settled) {
        if (r.status === "fulfilled") detailList.push(r.value);
        else console.warn("[members] buildMember failed:", r.reason);
    }

    const members: MemberSummary[] = detailList
        .map(({ repos: _r, contributions: _c, recentEvents: _e, readmeHtml: _h, ...s }) => s)
        .sort((a, b) => b.totalStars - a.totalStars);

    const details: Record<string, MemberDetail> = {};
    for (const d of detailList) details[d.login] = d;

    const now = new Date();
    const payload: MembersPayload = {
        org: ORG,
        members,
        fetchedAt: now.toISOString(),
        nextRefreshAt: new Date(now.getTime() + 30 * 60_000).toISOString(),
        source: "github",
        discoveredVia: logins.length === 0 ? "none" : (via as "orgs/members" | "orgs/public_members"),
        tokenMissing: !TOKEN,
        rateLimitRemaining: lastRateLimitRemaining,
    };
    return { payload, details };
}

export async function fetchMembersFromGithub(): Promise<MembersPayload> {
    const { payload } = await fetchMembersAndDetailsFromGithub();
    return payload;
}

/** Fetch a single member's full detail (including repo list). */
export async function fetchMemberDetailFromGithub(
    login: string,
): Promise<MemberDetail> {
    return buildMember(login);
}

export const MEMBERS_ORG = ORG;
