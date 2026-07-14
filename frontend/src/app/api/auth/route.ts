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
            [
                "GITHUB_OAUTH_CLIENT_ID가 실행 중인 서버에 없습니다.",
                "",
                "이 값은 docker-compose의 env_file(.env)로 주입됩니다. 다음을 확인하세요:",
                "  1) 이 박스의 .env에 GITHUB_OAUTH_CLIENT_ID / _SECRET 값이 있는가",
                '  2) docker-compose.yml의 environment 블록이 이 변수를 "${VAR:-}"로',
                "     덮어써 빈 값으로 만들고 있지 않은가 (env_file보다 우선함 — clobber)",
                "",
                "수정 후 재배포:  docker compose up -d --build frontend",
                "실행 확인:      docker compose exec frontend printenv GITHUB_OAUTH_CLIENT_ID",
                "(docs/blog-cms.md — OAuth 환경변수 함정)",
            ].join("\n"),
            {
                status: 500,
                headers: { "content-type": "text/plain; charset=utf-8" },
            },
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
