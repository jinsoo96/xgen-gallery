import { NextResponse, type NextRequest } from "next/server";

/**
 * 엣지 봇 차단 — robots.txt를 무시하는 경쟁사·스크래퍼 봇을 User-Agent로 식별해 403을 반환한다.
 * robots.ts의 BLOCKED_BOTS와 동기화한다. (docs/GEO-OPTIMIZATION-GUIDE.md §2.3-S)
 *
 * 주의: 검색엔진(Googlebot·Bingbot·Naver Yeti)과 GEO 답변엔진(GPTBot·ClaudeBot·PerplexityBot 등)은
 * 절대 차단하지 않는다 — SEO·GEO 노출에 필수다. 더 강한 방어(레이트리밋, UA 위조)는 WAF에서 처리한다.
 */
const BLOCKED_BOTS = [
    "ahrefsbot",
    "ahrefssiteaudit",
    "semrushbot",
    "mj12bot",
    "dotbot",
    "rogerbot",
    "dataforseobot",
    "blexbot",
    "barkrowler",
    "serpstatbot",
    "zoominfobot",
    "magpie-crawler",
    "velenpublicwebcrawler",
    "screaming frog seo spider",
    "seznambot",
    "sogou web spider",
    "linkdexbot",
    "spbot",
    "siteauditbot",
];

export function middleware(req: NextRequest) {
    const ua = req.headers.get("user-agent")?.toLowerCase() ?? "";
    if (ua && BLOCKED_BOTS.some((bot) => ua.includes(bot))) {
        return new NextResponse("Access denied", {
            status: 403,
            headers: { "x-robots-tag": "noindex, nofollow" },
        });
    }
    return NextResponse.next();
}

export const config = {
    // 정적 에셋·이미지 최적화·favicon은 제외하고 페이지 요청에만 적용.
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
