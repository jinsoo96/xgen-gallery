import type { ContributedRepo } from "./types";

/**
 * Curated org-repo contributions per member.
 *
 * The public GitHub API lists only a user's *owned* repos (`type=owner`), so
 * contributions to organization repositories (e.g. PlateerLab/xgen-gallery,
 * owned/maintained by @sooanc) don't appear in the fetched profile. Surface
 * them explicitly here — this always renders regardless of repo visibility or
 * whether a GITHUB_TOKEN is configured.
 */
export const CURATED_CONTRIBUTIONS: Record<string, ContributedRepo[]> = {
    sooanc: [
        {
            name: "xgen-gallery",
            fullName: "PlateerLab/xgen-gallery",
            htmlUrl: "https://github.com/PlateerLab/xgen-gallery",
            description:
                "Plateer Labs 연구소 웹사이트 — Enterprise AI 갤러리·인사이트 블로그·멤버 허브.",
            role: "Owner",
            language: "TypeScript",
        },
    ],
};

/** Curated org-repo contributions for a given login (empty if none). */
export function contributedReposFor(login: string): ContributedRepo[] {
    return CURATED_CONTRIBUTIONS[login] ?? [];
}
