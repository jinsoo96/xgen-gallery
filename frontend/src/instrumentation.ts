/**
 * 서버 부팅 시 1회 실행되는 훅(Next.js instrumentation).
 * 필수 런타임 환경변수 누락을 "배포 시점 로그"에서 미리 드러낸다 —
 * Decap CMS GitHub OAuth는 /admin 로그인 순간에야 실패가 보이므로,
 * 컨테이너가 뜰 때 로그로 경고해 조기에 잡는다. (docs/blog-cms.md)
 */
export function register() {
    // Node.js 런타임에서만 검사(Edge/브라우저 프리렌더 제외).
    if (process.env.NEXT_RUNTIME !== "nodejs") return;

    // Client ID는 코드 공개 기본값이 있으므로, 실제로 필요한 비밀값(Secret)만 검사한다.
    if (!process.env.GITHUB_OAUTH_CLIENT_SECRET) {
        console.warn(
            `[startup] ⚠ GITHUB_OAUTH_CLIENT_SECRET 누락 — /admin 의 GitHub 로그인 토큰 교환이 실패합니다.\n` +
                `  → 이 박스의 .env에 값을 넣거나, CI 시크릿 GH_OAUTH_CLIENT_SECRET을 등록 후 재배포하세요.\n` +
                `  → 확인: docker compose exec frontend printenv GITHUB_OAUTH_CLIENT_SECRET`,
        );
    }
}
