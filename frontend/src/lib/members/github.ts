import { marked } from "marked";
import type {
    ContributionCalendar,
    ContributionDay,
    MemberDetail,
    MemberRepo,
    MemberSummary,
    MembersPayload,
    RecentEvent,
} from "./types";

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

function topLanguages(repos: MemberRepo[], n = 5) {
    const counts = new Map<string, number>();
    for (const r of repos) {
        if (r.isFork) continue;
        if (!r.language) continue;
        counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    }
    return [...counts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, n);
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

async function buildMember(login: string): Promise<MemberDetail> {
    const [{ data: profile }, repoRaw] = await Promise.all([
        gh<GhUser>(`/users/${login}`),
        ghAllPages<GhRepo>(`/users/${login}/repos?per_page=100&type=owner&sort=updated`),
    ]);
    const repos = repoRaw.map(mapRepo);
    const summary = summarize(profile, repos);
    // These three are non-critical — if any fails, return empty/null and continue.
    const [contributions, recentEvents, readmeHtml] = await Promise.all([
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
    ]);
    return {
        ...summary,
        repos,
        contributions,
        recentEvents: recentEvents.slice(0, 50),
        readmeHtml,
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

export async function fetchMembersFromGithub(): Promise<MembersPayload> {
    const { logins, via } = await discoverMemberLogins();
    console.log(
        `[members] discovered ${logins.length} login(s) via ${via}` +
            (TOKEN ? "" : " (no GITHUB_TOKEN)"),
    );

    const limiter = pLimit(5);
    const settled = await Promise.allSettled(
        logins.map((login) => limiter(() => buildMember(login))),
    );

    const details: MemberDetail[] = [];
    for (const r of settled) {
        if (r.status === "fulfilled") details.push(r.value);
        else console.warn("[members] buildMember failed:", r.reason);
    }

    const members: MemberSummary[] = details
        .map(({ repos: _r, contributions: _c, recentEvents: _e, readmeHtml: _h, ...s }) => s)
        .sort((a, b) => b.totalStars - a.totalStars);

    const now = new Date();
    return {
        org: ORG,
        members,
        fetchedAt: now.toISOString(),
        nextRefreshAt: new Date(now.getTime() + 30 * 60_000).toISOString(),
        source: "github",
        discoveredVia: logins.length === 0 ? "none" : (via as "orgs/members" | "orgs/public_members"),
        tokenMissing: !TOKEN,
        rateLimitRemaining: lastRateLimitRemaining,
    };
}

/** Fetch a single member's full detail (including repo list). */
export async function fetchMemberDetailFromGithub(
    login: string,
): Promise<MemberDetail> {
    return buildMember(login);
}

export const MEMBERS_ORG = ORG;
