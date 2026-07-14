import type { NextRequest } from "next/server";

/**
 * Decap CMS GitHub OAuth — 1단계: GitHub 인증 화면으로 리다이렉트.
 * 별도 서비스 없이 Next 앱이 OAuth 제공자 역할을 한다.
 * 필요한 env: GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET (docs/blog-cms.md)
 */
export const dynamic = "force-dynamic";

// OAuth Client ID는 비밀이 아니다 — 리다이렉트 URL과 docs/blog-cms.md에 이미 공개돼 있다.
// 서버 env가 비어 있어도 로그인 리다이렉트는 항상 동작하도록 공개 기본값을 둔다.
// (비밀인 CLIENT_SECRET만 서버 .env에 필요 — 토큰 교환은 /api/callback에서 수행)
const PUBLIC_OAUTH_CLIENT_ID = "Ov23liv3gveHfTPsLH2Z";

// GitHub OAuth App에 등록된 콜백 도메인(불변) — GitHub은 이 redirect_uri만 허용한다.
// nginx 프록시 뒤에서는 req.url의 host가 내부 컨테이너 ID로 잡혀 redirect_uri가
// 틀어지므로(→ Invalid Redirect URI), 로컬 개발이 아니면 이 도메인으로 고정한다.
// (다른 도메인으로 바뀌면 OAUTH_REDIRECT_ORIGIN 환경변수로 덮어쓸 수 있음)
const OAUTH_REDIRECT_ORIGIN =
    process.env.OAUTH_REDIRECT_ORIGIN || "https://labs.plateer.com";

export function GET(req: NextRequest) {
    const clientId =
        process.env.GITHUB_OAUTH_CLIENT_ID || PUBLIC_OAUTH_CLIENT_ID;
    const reqOrigin = new URL(req.url).origin;
    const isLocal =
        reqOrigin.includes("localhost") || reqOrigin.includes("127.0.0.1");
    const base = isLocal ? reqOrigin : OAUTH_REDIRECT_ORIGIN;
    const authorize = new URL("https://github.com/login/oauth/authorize");
    authorize.searchParams.set("client_id", clientId);
    authorize.searchParams.set("redirect_uri", `${base}/api/callback`);
    // private repo 커밋까지 허용하려면 'repo' 스코프가 필요하다.
    authorize.searchParams.set("scope", "repo,user");
    authorize.searchParams.set("state", crypto.randomUUID());
    return Response.redirect(authorize.toString());
}
