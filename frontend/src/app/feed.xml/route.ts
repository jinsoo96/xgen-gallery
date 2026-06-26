import { getAllPosts } from "@/lib/blog";
import { SITE, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

function esc(s: string) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function GET() {
    const posts = getAllPosts();
    const items = posts
        .map((p) => {
            const url = absoluteUrl(`/blog/${p.slug}`);
            return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.description)}</description>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    </item>`;
        })
        .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)} Blog</title>
    <link>${absoluteUrl("/blog")}</link>
    <description>${esc(SITE.description)}</description>
    <language>ko</language>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: { "content-type": "application/rss+xml; charset=utf-8" },
    });
}
