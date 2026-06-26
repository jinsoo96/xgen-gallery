import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";
import {
    fetchMemberDetailFromGithub,
    fetchMembersAndDetailsFromGithub,
    MEMBERS_ORG,
} from "./github";
import {
    fetchMemberDetailFromUpstream,
    fetchMembersFromUpstream,
    hasUpstream,
} from "./upstream";
import type { MemberDetail, MembersPayload } from "./types";

const REVALIDATE_SECONDS = Number(
    process.env.MEMBERS_REVALIDATE_SECONDS || 1800,
);

const CACHE_DIR = path.join(process.cwd(), ".cache");
const LIST_CACHE = path.join(CACHE_DIR, "members.json");
const DETAIL_CACHE = (login: string) =>
    path.join(CACHE_DIR, `member-${login}.json`);

async function ensureCacheDir() {
    try {
        await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch {
        // ignore
    }
}

async function readJson<T>(file: string): Promise<T | null> {
    try {
        const buf = await fs.readFile(file, "utf-8");
        return JSON.parse(buf) as T;
    } catch {
        return null;
    }
}

/**
 * Atomic write: serialize to a temp file and rename. Prevents readers from
 * ever seeing a half-written JSON if the process crashes mid-write.
 */
async function writeJson(file: string, data: unknown): Promise<void> {
    try {
        await ensureCacheDir();
        const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
        await fs.writeFile(tmp, JSON.stringify(data), "utf-8");
        await fs.rename(tmp, file);
    } catch {
        // disk cache is best-effort
    }
}

async function fileMtime(file: string): Promise<number | null> {
    try {
        const st = await fs.stat(file);
        return st.mtimeMs;
    } catch {
        return null;
    }
}

interface MembersBundle {
    payload: MembersPayload;
    details: Record<string, MemberDetail>;
}

/**
 * Fetch the full bundle (list + every member's detail) in one shot, with disk
 * fallback on failure. Persists each detail JSON so a cold restart can keep
 * serving while the next live fetch is in flight.
 *
 * Cache-poisoning guard: if the live fetch returns 0 members but a disk
 * cache has any, prefer the disk cache and DO NOT overwrite. Protects
 * against transient outages (missing token, org permission flap) wiping a
 * good cache.
 */
async function loadBundleWithFallback(): Promise<MembersBundle> {
    try {
        // When an upstream gallery is configured, borrow its list and lazy-load
        // details on demand (via getMemberDetail) instead of fetching GitHub.
        const fresh = hasUpstream
            ? {
                  payload: await fetchMembersFromUpstream(),
                  details: {} as Record<string, MemberDetail>,
              }
            : await fetchMembersAndDetailsFromGithub();
        if (fresh.payload.members.length === 0) {
            const stale = await readDiskBundle();
            if (stale && stale.payload.members.length > 0) {
                console.warn(
                    "[members] live fetch returned 0 members; serving disk cache",
                );
                return stale;
            }
        }
        // Persist list + per-member details for cold restarts.
        await writeJson(LIST_CACHE, fresh.payload);
        await Promise.all(
            Object.values(fresh.details).map((d) =>
                writeJson(DETAIL_CACHE(d.login), d),
            ),
        );
        return fresh;
    } catch (err) {
        console.warn("[members] live fetch failed, trying disk cache:", err);
        const stale = await readDiskBundle();
        if (stale) return stale;
        throw err;
    }
}

async function readDiskBundle(): Promise<MembersBundle | null> {
    const list = await readJson<MembersPayload>(LIST_CACHE);
    if (!list) return null;
    const details: Record<string, MemberDetail> = {};
    await Promise.all(
        list.members.map(async (m) => {
            const d = await readJson<MemberDetail>(DETAIL_CACHE(m.login));
            if (d) details[m.login] = d;
        }),
    );
    return { payload: { ...list, source: "stale-cache" }, details };
}

// Cache key version. Bump when MemberSummary / MembersPayload shape changes
// so previously cached values from older deployments are not reused.
const CACHE_VERSION = "v3";

/**
 * Single source of truth — refreshed every 30 minutes (per server process).
 * Both the members list page AND every member detail page read from this same
 * cache, so one refresh updates the "Activity (3d)" sort and every member's
 * Recent activity / contribution graph / README in lock-step. The user never
 * has to manually refresh a detail page to see fresh data.
 */
const getMembersBundle = unstable_cache(
    async () => loadBundleWithFallback(),
    [`plateerlab-members-bundle-${CACHE_VERSION}`, MEMBERS_ORG],
    { revalidate: REVALIDATE_SECONDS, tags: ["members"] },
);

/** Cached members list — refreshed every 30 minutes (per server process). */
export async function getMembersPayload(): Promise<MembersPayload> {
    const bundle = await getMembersBundle();
    return bundle.payload;
}

/**
 * Per-member detail. Looks up from the unified bundle first (so it tracks
 * the same 30-min refresh as the list). Only when a login is not present in
 * the bundle (e.g. the URL was hand-typed for a non-member, or the member
 * was added between refreshes) do we fall back to a one-off direct fetch.
 */
export async function getMemberDetail(login: string): Promise<MemberDetail> {
    const bundle = await getMembersBundle();
    const cached = bundle.details[login];
    if (cached) return cached;

    // Fallback path — not part of the unified cache. Try direct fetch, then disk.
    try {
        const fresh = hasUpstream
            ? await fetchMemberDetailFromUpstream(login)
            : await fetchMemberDetailFromGithub(login);
        await writeJson(DETAIL_CACHE(login), fresh);
        return fresh;
    } catch (err) {
        console.warn(
            `[members] detail fallback fetch failed for ${login}:`,
            err,
        );
        const stale = await readJson<MemberDetail>(DETAIL_CACHE(login));
        if (stale) return stale;
        throw err;
    }
}

/** Read-only inspection of the disk cache for debug endpoints. */
export async function inspectMembersCache(): Promise<{
    listExists: boolean;
    listMtime: string | null;
    listAgeSeconds: number | null;
    listMemberCount: number | null;
    detailFiles: number;
    revalidateSeconds: number;
    cacheVersion: string;
}> {
    const mtime = await fileMtime(LIST_CACHE);
    const list = await readJson<MembersPayload>(LIST_CACHE);
    let detailFiles = 0;
    try {
        const entries = await fs.readdir(CACHE_DIR);
        detailFiles = entries.filter(
            (n) => n.startsWith("member-") && n.endsWith(".json"),
        ).length;
    } catch {
        /* noop */
    }
    return {
        listExists: mtime !== null,
        listMtime: mtime ? new Date(mtime).toISOString() : null,
        listAgeSeconds:
            mtime !== null ? Math.round((Date.now() - mtime) / 1000) : null,
        listMemberCount: list?.members.length ?? null,
        detailFiles,
        revalidateSeconds: REVALIDATE_SECONDS,
        cacheVersion: CACHE_VERSION,
    };
}

export const MEMBERS_REVALIDATE_SECONDS = REVALIDATE_SECONDS;
