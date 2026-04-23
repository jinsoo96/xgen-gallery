import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";
import {
    fetchMemberDetailFromGithub,
    fetchMembersFromGithub,
    MEMBERS_ORG,
} from "./github";
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

/**
 * Fetch + persist members list. Falls back to disk cache on failure.
 *
 * Cache-poisoning guard: if the live fetch returns 0 members but the disk
 * cache has any, prefer the disk cache and DO NOT overwrite. This protects
 * against transient outages (e.g. missing GITHUB_TOKEN at build time, org
 * permission flap) wiping out a good cache.
 */
async function loadMembersWithFallback(): Promise<MembersPayload> {
    try {
        const fresh = await fetchMembersFromGithub();
        if (fresh.members.length === 0) {
            const stale = await readJson<MembersPayload>(LIST_CACHE);
            if (stale && stale.members.length > 0) {
                console.warn(
                    "[members] live fetch returned 0 members; serving disk cache",
                );
                return { ...stale, source: "stale-cache" };
            }
        }
        await writeJson(LIST_CACHE, fresh);
        return fresh;
    } catch (err) {
        console.warn("[members] live fetch failed, trying disk cache:", err);
        const stale = await readJson<MembersPayload>(LIST_CACHE);
        if (stale) return { ...stale, source: "stale-cache" };
        throw err;
    }
}

// Cache key version. Bump when MemberSummary / MembersPayload shape changes
// so previously cached values from older deployments are not reused.
const CACHE_VERSION = "v2";

/** Cached members list — refreshed every 30 minutes (per server process). */
export const getMembersPayload = unstable_cache(
    async () => loadMembersWithFallback(),
    [`plateerlab-members-${CACHE_VERSION}`, MEMBERS_ORG],
    { revalidate: REVALIDATE_SECONDS, tags: ["members"] },
);

async function loadMemberDetailWithFallback(
    login: string,
): Promise<MemberDetail> {
    try {
        const fresh = await fetchMemberDetailFromGithub(login);
        await writeJson(DETAIL_CACHE(login), fresh);
        return fresh;
    } catch (err) {
        console.warn(
            `[members] detail fetch failed for ${login}, trying disk cache:`,
            err,
        );
        const stale = await readJson<MemberDetail>(DETAIL_CACHE(login));
        if (stale) return stale;
        throw err;
    }
}

export function getMemberDetail(login: string) {
    // unstable_cache requires a key array — include login.
    return unstable_cache(
        async () => loadMemberDetailWithFallback(login),
        [`plateerlab-member-detail-${CACHE_VERSION}`, login],
        {
            revalidate: REVALIDATE_SECONDS,
            tags: ["members", `member:${login}`],
        },
    )();
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
