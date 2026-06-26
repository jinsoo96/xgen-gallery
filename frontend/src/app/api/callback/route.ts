import type { NextRequest } from "next/server";

/**
 * Decap CMS GitHub OAuth — 2단계: code를 access_token으로 교환하고,
 * Decap 어드민 창(window.opener)에 토큰을 postMessage로 전달한다.
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const code = new URL(req.url).searchParams.get("code");
    const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

    let status = "error";
    let payload: string;
    try {
        if (!code || !clientId || !clientSecret) {
            throw new Error("missing code or OAuth credentials");
        }
        const res = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
            }),
        });
        const data = await res.json();
        if (data.access_token) {
            status = "success";
            payload = JSON.stringify({
                token: data.access_token,
                provider: "github",
            });
        } else {
            payload = JSON.stringify({
                error: data.error_description || data.error || "no access_token",
            });
        }
    } catch (e) {
        payload = JSON.stringify({ error: String(e) });
    }

    // Decap 핸드셰이크: opener에 'authorization:github:<status>:<json>' 전송.
    const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body>
<script>
(function () {
  var message = 'authorization:github:${status}:' + ${JSON.stringify(payload)};
  function send() {
    if (window.opener) window.opener.postMessage(message, '*');
  }
  window.addEventListener('message', send, false);
  if (window.opener) window.opener.postMessage('authorizing:github', '*');
  setTimeout(send, 800);
})();
</script>
인증 처리 중입니다. 이 창은 자동으로 닫힙니다.
</body></html>`;

    return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
    });
}
