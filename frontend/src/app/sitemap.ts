import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { TOOLS } from "@/lib/tools";
import { NAV_GROUPS } from "@/lib/nav";
import { getMembersPayload } from "@/lib/members/cache";
import { getAllPosts } from "@/lib/blog";

/**
 * Dynamic sitemap covering every public URL (home, tools, members, releases).
 * Member URLs are pulled from the live roster so AI crawlers and search engines
 * discover them. See docs/GEO-OPTIMIZATION-GUIDE.md §2.3.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
        { url: `${SITE.url}/demo`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
        // /library-gallery 는 Open Source 그룹(key=library-gallery)에서 생성됨 — 중복 제거
        { url: `${SITE.url}/poc-projects`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
        { url: `${SITE.url}/technical-consulting`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: `${SITE.url}/security`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
        { url: `${SITE.url}/documentation`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
        { url: `${SITE.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
        { url: `${SITE.url}/members`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
        { url: `${SITE.url}/newsletter`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
        { url: `${SITE.url}/releases`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ];

    // Top-level GNB one-pages (Research, Technology, Products, …).
    const groupRoutes: MetadataRoute.Sitemap = NAV_GROUPS.map((g) => ({
        url: `${SITE.url}/${g.key}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((t) => ({
        url: `${SITE.url}/tool/${t.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
        url: `${SITE.url}/blog/${p.slug}`,
        lastModified: p.updated ? new Date(p.updated) : new Date(p.date),
        changeFrequency: "monthly",
        priority: 0.7,
    }));

    let memberRoutes: MetadataRoute.Sitemap = [];
    try {
        const { members } = await getMembersPayload();
        memberRoutes = members.map((m) => ({
            url: `${SITE.url}/members/${m.login}`,
            lastModified: m.updatedAt ? new Date(m.updatedAt) : now,
            changeFrequency: "weekly",
            priority: 0.5,
        }));
    } catch {
        // Members are best-effort — never let a GitHub hiccup break the sitemap.
    }

    return [
        ...staticRoutes,
        ...groupRoutes,
        ...toolRoutes,
        ...blogRoutes,
        ...memberRoutes,
    ];
}
