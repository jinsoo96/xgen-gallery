import type { MemberDetail, MembersPayload } from "./types";

/**
 * Optional upstream source for member data. When MEMBERS_UPSTREAM_URL is set,
 * the members list + detail are proxied from another deployment's public API
 * (e.g. the live XGEN gallery) instead of hitting GitHub directly. This lets a
 * server with no GITHUB_TOKEN still render the real roster by borrowing the
 * upstream's already-fetched, cached payload.
 *
 * The upstream is expected to be a deployment of THIS app, exposing:
 *   GET {UPSTREAM}/api/members          -> MembersPayload
 *   GET {UPSTREAM}/api/members/{login}  -> MemberDetail
 */
const UPSTREAM = (process.env.MEMBERS_UPSTREAM_URL || "").replace(/\/+$/, "");
const TIMEOUT_MS = 15_000;

export const MEMBERS_UPSTREAM_URL = UPSTREAM;
export const hasUpstream = UPSTREAM.length > 0;

async function getJson<T>(url: string): Promise<T> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            signal: ctrl.signal,
            headers: { accept: "application/json" },
            // Always hit the upstream live; our own unstable_cache handles TTL.
            cache: "no-store",
        });
        if (!res.ok) {
            throw new Error(`upstream ${url} responded ${res.status}`);
        }
        return (await res.json()) as T;
    } finally {
        clearTimeout(timer);
    }
}

/** Members list (summaries) from the upstream gallery. */
export async function fetchMembersFromUpstream(): Promise<MembersPayload> {
    const payload = await getJson<MembersPayload>(`${UPSTREAM}/api/members`);
    if (!Array.isArray(payload?.members)) {
        throw new Error("upstream /api/members returned no members array");
    }
    return payload;
}

/** A single member's full detail from the upstream gallery. */
export async function fetchMemberDetailFromUpstream(
    login: string,
): Promise<MemberDetail> {
    return getJson<MemberDetail>(
        `${UPSTREAM}/api/members/${encodeURIComponent(login)}`,
    );
}
