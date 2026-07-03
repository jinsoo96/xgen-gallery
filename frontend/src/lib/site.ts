/**
 * Single source of truth for site-wide identity used by GEO / SEO surfaces
 * (metadata, JSON-LD structured data, robots, sitemap, llms.txt).
 *
 * Keep the brand name spelling IDENTICAL everywhere — entity consistency is a
 * core GEO signal. See docs/GEO-OPTIMIZATION-GUIDE.md.
 */
export const SITE = {
    name: "Plateer Labs",
    shortName: "Plateer Labs",
    // Canonical production origin. Override per-environment with NEXT_PUBLIC_SITE_URL.
    url: (process.env.NEXT_PUBLIC_SITE_URL || "https://gallery-xgen.x2bee.com").replace(/\/$/, ""),
    description:
        "Plateer Labs는 XGEN 플랫폼을 떠받치는 오픈소스 AI 라이브러리를 공개하는 연구소입니다. 문서 인제스션, 지식 그래프, 에이전트 도구를 pip로 설치하거나 브라우저에서 바로 체험하세요.",
    descriptionEn:
        "Plateer Labs is the open-source AI research lab behind the XGEN platform. Install document-ingestion, knowledge-graph, and agent libraries with pip, or try every tool in your browser.",
    github: "https://github.com/PlateerLab",
    githubOrg: "PlateerLab",
    locale: "ko_KR",
    /** OG/Twitter share image (served from app/icon.png). */
    ogImage: "/icon.png",
} as const;

/** Absolute URL helper — always returns a canonical, origin-prefixed URL. */
export function absoluteUrl(path = "/"): string {
    if (/^https?:\/\//.test(path)) return path;
    return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
