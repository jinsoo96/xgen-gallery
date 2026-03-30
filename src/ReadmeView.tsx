import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import type { Theme } from "./styles";

export function ReadmeView({
  org,
  repoName,
  content,
  t,
}: {
  org: string;
  repoName: string;
  content: string | null;
  t: Theme;
}) {
  if (!content) {
    return <div style={{ textAlign: "center", padding: 40, color: t.textMuted }}>README not found</div>;
  }

  return (
    <div className="xgen-markdown" style={{ color: t.text, lineHeight: 1.7, fontSize: 14 }}>
      <style>{markdownStyles(t)}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ src, alt, ...props }) => {
            let resolved = src;
            if (typeof src === "string" && !src.startsWith("http")) {
              resolved = `https://raw.githubusercontent.com/${org}/${repoName}/main/${src}`;
            }
            return <img src={resolved} alt={alt || ""} style={{ maxWidth: "100%" }} {...props} />;
          },
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: t.accentLight }} {...props}>
              {children}
            </a>
          ),
          code: ({ children, className, ...props }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code
                  style={{
                    display: "block", background: t.bg, padding: 16, borderRadius: 8,
                    overflow: "auto", fontSize: 13, lineHeight: 1.6,
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code style={{ background: t.accentGlow, padding: "2px 6px", borderRadius: 4, fontSize: 13 }} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function markdownStyles(t: Theme): string {
  return `
    .xgen-markdown h1, .xgen-markdown h2, .xgen-markdown h3 { color: ${t.text}; margin: 1.2em 0 0.5em; }
    .xgen-markdown h1 { font-size: 1.8em; border-bottom: 1px solid ${t.border}; padding-bottom: 8px; }
    .xgen-markdown h2 { font-size: 1.4em; border-bottom: 1px solid ${t.border}; padding-bottom: 6px; }
    .xgen-markdown h3 { font-size: 1.15em; }
    .xgen-markdown p { margin: 0.8em 0; }
    .xgen-markdown ul, .xgen-markdown ol { padding-left: 24px; }
    .xgen-markdown li { margin: 4px 0; }
    .xgen-markdown pre { background: ${t.bg}; border: 1px solid ${t.border}; border-radius: 8px; padding: 16px; overflow: auto; margin: 12px 0; }
    .xgen-markdown blockquote { border-left: 3px solid ${t.accent}; padding-left: 12px; color: ${t.textSecondary}; margin: 12px 0; }
    .xgen-markdown table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    .xgen-markdown th, .xgen-markdown td { border: 1px solid ${t.border}; padding: 8px 12px; text-align: left; }
    .xgen-markdown th { background: ${t.bgCard}; font-weight: 600; }
    .xgen-markdown hr { border: none; border-top: 1px solid ${t.border}; margin: 16px 0; }
  `;
}
