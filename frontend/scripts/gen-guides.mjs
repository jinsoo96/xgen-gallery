/**
 * 작성 가이드 정적 HTML 생성기.
 *   docs/*.md  →  frontend/public/guides/*.html (스타일된 스탠드얼론 페이지)
 * 원본 md를 고친 뒤 재생성:  cd frontend && node scripts/gen-guides.mjs
 * (Decap /admin 로그인 바·헤더·사이드바가 이 결과 파일을 링크한다)
 */
import { marked } from "marked";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.resolve(HERE, "../../docs");
const OUT = path.resolve(HERE, "../public/guides");
const GH = "https://github.com/PlateerLab/xgen-gallery/blob/main/docs/";

const PAGES = [
    { src: "BLOG-WRITING-GUIDE.md", out: "blog-writing.html", title: "블로그 글쓰기 가이드", emoji: "📝" },
    { src: "GEO-OPTIMIZATION-GUIDE.md", out: "geo-seo.html", title: "GEO·SEO 최적화 가이드", emoji: "🔍" },
    { src: "BLOG-CONTRIBUTING.md", out: "contributing.html", title: "블로그 기여 가이드", emoji: "🤝" },
    { src: "BLOG-OPERATIONS.md", out: "operations.html", title: "블로그 운영 방식", emoji: "🛠️" },
];

// 내부 .md 상호링크 → 사이트 내 .html. 변환하지 않는 문서는 GitHub로.
function rewriteLinks(html) {
    return html
        .replace(/\.\/BLOG-WRITING-GUIDE\.md/g, "blog-writing.html")
        .replace(/\.\/GEO-OPTIMIZATION-GUIDE\.md/g, "geo-seo.html")
        .replace(/\.\/BLOG-CONTRIBUTING\.md/g, "contributing.html")
        .replace(/\.\/BLOG-OPERATIONS\.md/g, "operations.html")
        .replace(/\.\/blog-cms\.md/g, GH + "blog-cms.md")
        .replace(/\(\.\/([A-Za-z0-9_-]+)\.md\)/g, "(" + GH + "$1.md)");
}

function nav(currentOut) {
    return PAGES.map(
        (p) =>
            `<a href="${p.out}"${p.out === currentOut ? ' class="on"' : ""}>${p.emoji} ${p.title}</a>`,
    ).join("");
}

function template({ title, emoji, body, currentOut }) {
    return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>${title} · Plateer Labs</title>
<style>
  @font-face{font-family:Pretendard;src:url(/fonts/PretendardVariable.woff2) format("woff2-variations");font-weight:45 920;font-display:swap;}
  :root{--ink:#16224a;--muted:#4a5878;--subtle:#7a89a8;--line:#e3e8f0;--surface:#f4f6fb;--accent:#2461d8;--accent-bg:#eef3ff;}
  *{box-sizing:border-box;}
  body{margin:0;background:var(--surface);color:var(--ink);font-family:Pretendard,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.7;-webkit-font-smoothing:antialiased;}
  .top{position:sticky;top:0;z-index:5;background:rgba(244,246,251,.9);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);}
  .top .inner{max-width:900px;margin:0 auto;padding:12px 24px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;}
  .top .brand{font-weight:800;color:var(--ink);margin-right:8px;font-size:14px;}
  .top a{display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:9999px;background:#fff;border:1px solid var(--line);color:var(--muted);text-decoration:none;font-size:13px;font-weight:600;white-space:nowrap;}
  .top a.on{background:var(--accent-bg);border-color:#c7d9ff;color:var(--accent);}
  .top a.admin{margin-left:auto;background:var(--ink);border-color:var(--ink);color:#fff;}
  .top a.admin:hover{background:#0e1836;}
  main{max-width:820px;margin:0 auto;padding:40px 24px 96px;}
  .doc{background:#fff;border:1px solid var(--line);border-radius:20px;padding:44px 48px;box-shadow:0 20px 50px -30px rgba(20,40,80,.25);}
  h1{font-size:30px;line-height:1.25;margin:.2em 0 .6em;letter-spacing:-.01em;}
  h2{font-size:22px;margin:1.7em 0 .5em;padding-top:.4em;border-top:1px solid var(--line);letter-spacing:-.01em;}
  h2:first-of-type{border-top:0;}
  h3{font-size:17px;margin:1.3em 0 .4em;}
  p,li{color:var(--muted);font-size:15.5px;}
  a{color:var(--accent);text-decoration:none;}a:hover{text-decoration:underline;}
  code{background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:.12em .4em;font-size:.9em;font-family:"SFMono-Regular",Consolas,monospace;color:#0b1b3a;}
  pre{background:#0f1730;color:#e6ecff;border-radius:12px;padding:16px 18px;overflow:auto;font-size:13px;line-height:1.6;}
  pre code{background:none;border:0;color:inherit;padding:0;}
  blockquote{margin:1.2em 0;padding:.6em 1.1em;border-left:3px solid var(--accent);background:var(--accent-bg);border-radius:0 10px 10px 0;color:var(--ink);}
  blockquote p{color:var(--ink);margin:.3em 0;}
  hr{border:0;border-top:1px solid var(--line);margin:2em 0;}
  table{border-collapse:collapse;width:100%;font-size:14.5px;}
  th,td{border:1px solid var(--line);padding:8px 12px;text-align:left;}
  th{background:var(--surface);}
  ul,ol{padding-left:1.3em;}
  li{margin:.25em 0;}
  @media(max-width:640px){.doc{padding:28px 22px;}.top a.admin{margin-left:0;}}
</style>
</head>
<body>
<div class="top"><div class="inner"><span class="brand">${emoji} 작성 가이드</span>${nav(currentOut)}<a href="/admin" class="admin">⚙️ 어드민</a></div></div>
<main><article class="doc">${body}</article></main>
</body>
</html>`;
}

fs.mkdirSync(OUT, { recursive: true });
for (const p of PAGES) {
    const md = fs.readFileSync(path.join(DOCS, p.src), "utf8");
    const body = rewriteLinks(marked.parse(md, { async: false }));
    const html = template({ title: p.title, emoji: p.emoji, body, currentOut: p.out });
    fs.writeFileSync(path.join(OUT, p.out), html, "utf8");
    console.log("wrote", path.relative(process.cwd(), path.join(OUT, p.out)), `(${html.length} bytes)`);
}
