export interface MemberLanguage {
    name: string;
    count: number;
}

export interface MemberSummary {
    login: string;
    name: string | null;
    avatarUrl: string;
    htmlUrl: string;
    bio: string | null;
    company: string | null;
    location: string | null;
    blog: string | null;
    twitterUsername: string | null;
    email: string | null;
    publicRepos: number;
    followers: number;
    following: number;
    createdAt: string;
    updatedAt: string;
    totalStars: number;
    totalForks: number;
    /** Number of public events the user produced in the last 3 days. */
    recentActivityCount: number;
    topLanguages: MemberLanguage[];
}

export interface MemberRepo {
    name: string;
    fullName: string;
    htmlUrl: string;
    description: string | null;
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    language: string | null;
    isFork: boolean;
    isArchived: boolean;
    updatedAt: string;
    pushedAt: string;
    topics: string[];
    license: string | null;
}

/**
 * A repository a member contributes to that isn't in their owned-repo list —
 * e.g. an organization repo. Curated in `lib/members/contributions.ts` because
 * the public GitHub API only lists a user's owned repos.
 */
export interface ContributedRepo {
    name: string;
    fullName: string;
    htmlUrl: string;
    description: string | null;
    /** Relationship label, e.g. "Owner", "Maintainer", "Contributor". */
    role?: string;
    language?: string | null;
    /** Live repo stars (from GitHub); undefined when not fetched. */
    stars?: number;
    /** The member's own commit count in this repo (from the contributors API). */
    commits?: number;
}

export interface ContributionDay {
    /** ISO date YYYY-MM-DD */
    date: string;
    count: number;
    /** 0..4 — GitHub-style intensity bucket. */
    level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionCalendar {
    totalContributions: number;
    /** Each week is exactly 7 days, Sunday → Saturday. May contain leading/trailing nulls if the year boundary doesn't align. */
    weeks: ContributionDay[][];
}

export type RecentEventType =
    | "PushEvent"
    | "PullRequestEvent"
    | "IssuesEvent"
    | "IssueCommentEvent"
    | "CreateEvent"
    | "DeleteEvent"
    | "ForkEvent"
    | "WatchEvent"
    | "PullRequestReviewEvent"
    | "PullRequestReviewCommentEvent"
    | "ReleaseEvent"
    | "PublicEvent"
    | "MemberEvent"
    | "GollumEvent"
    | "CommitCommentEvent";

export interface RecentEvent {
    id: string;
    type: RecentEventType | string;
    createdAt: string;
    repoName: string;
    repoUrl: string;
    /** Short, human-readable summary (e.g. "Pushed 3 commits", "Opened PR #42 — Fix bug"). */
    summary: string;
    /** Optional URL to take user to the action target (PR, issue, commit, etc.). */
    targetUrl?: string;
}

export interface MemberDetail extends MemberSummary {
    repos: MemberRepo[];
    contributions: ContributionCalendar | null;
    recentEvents: RecentEvent[];
    /** Pre-rendered HTML from the user's profile README (`<login>/<login>` repo). null if missing. */
    readmeHtml: string | null;
    /** Curated org-repo contributions (e.g. PlateerLab/xgen-gallery), enriched with live stats. */
    contributedRepos: ContributedRepo[];
}

export type PayloadSource = "github" | "disk-cache" | "stale-cache";

export interface MembersPayload {
    org: string;
    members: MemberSummary[];
    fetchedAt: string;
    nextRefreshAt: string;
    source: PayloadSource;
    /** Which discovery path produced the login list. */
    discoveredVia?: "orgs/members" | "orgs/public_members" | "none";
    /** True when no GITHUB_TOKEN is configured on the server. */
    tokenMissing?: boolean;
    rateLimitRemaining?: number | null;
}

export interface MemberDetailPayload {
    member: MemberDetail;
    fetchedAt: string;
    source: PayloadSource;
}
