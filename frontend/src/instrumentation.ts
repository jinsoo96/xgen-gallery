/**
 * 서버 부팅 시 1회 실행되는 훅(Next.js instrumentation).
 * 필수 런타임 환경변수 누락을 "배포 시점 로그"에서 미리 드러낸다 —
 * Decap CMS GitHub OAuth는 /admin 로그인 순간에야 실패가 보이므로,
 * 컨테이너가 뜰 때 로그로 경고해 조기에 잡는다. (docs/blog-cms.md)
 */
export function register() {
    // Node.js 런타임에서만 검사(Edge/브라우저 프리렌더 제외).
    if (process.env.NEXT_RUNTIME !== "nodejs") return;

    const missing = [
        "GITHUB_OAUTH_CLIENT_ID",
        "GITHUB_OAUTH_CLIENT_SECRET",
    ].filter((k) => !process.env[k]);

    if (missing.length > 0) {
        console.warn(
            `[startup] ⚠ Decap CMS GitHub OAuth 환경변수 누락: ${missing.join(", ")}\n` +
                `  → /admin 의 "Login with GitHub"가 실패합니다.\n` +
                `  → 이 박스의 .env(env_file)에 값이 있는지, docker-compose.yml의 environment\n` +
                `    블록이 이 변수를 빈 값으로 덮어쓰지 않는지 확인하세요.\n` +
                `  → 확인: docker compose exec frontend printenv GITHUB_OAUTH_CLIENT_ID`,
        );
    }
}
