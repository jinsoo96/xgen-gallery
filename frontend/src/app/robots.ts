import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * robots.txt — explicitly welcomes the major generative-AI crawlers so our
 * open-source tools can be read, cited, and recommended by AI answer engines.
 * See docs/GEO-OPTIMIZATION-GUIDE.md §2.3.
 */
const AI_BOTS = [
    "GPTBot", // OpenAI training / ChatGPT
    "OAI-SearchBot", // ChatGPT search
    "ChatGPT-User", // ChatGPT live browsing
    "ClaudeBot", // Anthropic
    "anthropic-ai",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot", // Perplexity index
    "Perplexity-User",
    "Google-Extended", // Gemini / AI Overviews grounding
    "Applebot-Extended", // Apple Intelligence
    "Bingbot", // Copilot / Bing
    "CCBot", // Common Crawl (feeds many LLMs)
    "Amazonbot",
    "Bytespider",
    "DuckAssistBot",
    "cohere-ai",
];

/**
 * SEO 경쟁정보 · 백링크 분석 · 대량 콘텐츠 스크래퍼 — 경쟁사가 우리 콘텐츠를
 * 긁어가거나 분석하는 데 쓰는 봇. 예의 바른 봇은 robots.txt를 지키므로 여기서 멈춘다.
 * robots를 무시하는 봇은 middleware.ts(BLOCKED_BOTS)에서 403으로 차단한다.
 * 두 목록은 항상 동기화한다. (docs/GEO-OPTIMIZATION-GUIDE.md §2.3-S)
 */
export const BLOCKED_BOTS = [
    "AhrefsBot",
    "AhrefsSiteAudit",
    "SemrushBot",
    "MJ12bot",
    "DotBot",
    "rogerbot",
    "DataForSeoBot",
    "BLEXBot",
    "Barkrowler",
    "serpstatbot",
    "ZoominfoBot",
    "magpie-crawler",
    "VelenPublicWebCrawler",
    "Screaming Frog SEO Spider",
    "SeznamBot",
    "Sogou web spider",
    "linkdexbot",
    "spbot", // OpenLinkProfiler
    "SiteAuditBot",
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // Default: allow everything to all generic crawlers (except CMS admin).
            { userAgent: "*", allow: "/", disallow: "/admin/" },
            // Be explicit about beneficial AI crawlers (some honor only named rules).
            ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/" })),
            // Block competitor SEO/scraper bots — keeps content out of their indexes
            // while leaving search + GEO answer engines fully allowed.
            ...BLOCKED_BOTS.map((userAgent) => ({ userAgent, disallow: "/" })),
        ],
        sitemap: `${SITE.url}/sitemap.xml`,
        host: SITE.url,
    };
}
