"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ReadmeViewer({ repoName }: { repoName: string }) {
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://api.github.com/repos/PlateerLab/${repoName}/readme`, {
      headers: { Accept: "application/vnd.github.v3.raw" },
    })
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        setReadme(text);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [repoName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!readme) {
    return (
      <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
        README가 없습니다.
      </div>
    );
  }

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Fix relative image URLs to point to GitHub
          img: ({ src, alt, ...props }) => {
            let resolvedSrc = src;
            if (typeof src === "string" && !src.startsWith("http")) {
              resolvedSrc = `https://raw.githubusercontent.com/PlateerLab/${repoName}/main/${src}`;
            }
            // eslint-disable-next-line @next/next/no-img-element
            return <img src={resolvedSrc as string} alt={alt || ""} {...props} />;
          },
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
        }}
      >
        {readme}
      </ReactMarkdown>
    </div>
  );
}
