import type { NextRequest } from "next/server";

/**
 * Decap CMS GitHub OAuth — 1단계: GitHub 인증 화면으로 리다이렉트.
 * 별도 서비스 없이 Next 앱이 OAuth 제공자 역할을 한다.
 * 필요한 env: GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET (docs/blog-cms.md)
 */
export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
    if (!clientId) {
        return new Response(
            "GITHUB_OAUTH_CLIENT_ID 가 설정되지 않았습니다. .env 를 확인하세요.",
            { status: 500 },
        );
    }
    const origin = new URL(req.url).origin;
    const authorize = new URL("https://github.com/login/oauth/authorize");
    authorize.searchParams.set("client_id", clientId);
    authorize.searchParams.set("redirect_uri", `${origin}/api/callback`);
    // private repo 커밋까지 허용하려면 'repo' 스코프가 필요하다.
    authorize.searchParams.set("scope", "repo,user");
    authorize.searchParams.set("state", crypto.randomUUID());
    return Response.redirect(authorize.toString());
}
