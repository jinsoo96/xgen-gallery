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
        "Plateer Labs는 기업이 신뢰할 수 있는 AI 플랫폼을 만들기 위한 핵심 기술을 연구하고 공유합니다. XGEN을 구성하는 문서 인제스션, 지식그래프, 에이전트 프레임워크 등 검증된 AI 기술을 오픈소스로 공개하여 누구나 쉽게 설치하고, 실험하고, 서비스에 적용할 수 있도록 지원합니다.",
    descriptionEn:
        "Plateer Labs researches and shares the core technology for building AI platforms enterprises can trust. We open-source proven AI building blocks behind XGEN — document ingestion, knowledge graphs, and agent frameworks — so anyone can install, experiment, and put them into production.",
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
