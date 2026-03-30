import { useEffect, useState, useCallback } from "react";
import type { Repo, GalleryProps, DemoSnippet } from "./types";
import { fetchRepos, fetchReadme, fetchDemoSnippets } from "./api";
import { themes, LANG_COLORS, Theme } from "./styles";
import { ReadmeView } from "./ReadmeView";

type View = { type: "list" } | { type: "detail"; repo: Repo };

export function XgenGallery({ org, token, theme: themeName = "dark", limit, onRepoClick }: GalleryProps) {
  const t = themes[themeName];
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState<string | null>(null);
  const [view, setView] = useState<View>({ type: "list" });

  useEffect(() => {
    fetchRepos(org, token).then((data) => {
      setRepos(limit ? data.slice(0, limit) : data);
      setLoading(false);
    });
  }, [org, token, limit]);

  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))] as string[];

  const filtered = repos.filter((r) => {
    if (lang && r.language !== lang) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.name.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q);
    }
    return true;
  });

  const handleCardClick = useCallback((repo: Repo) => {
    if (onRepoClick) {
      onRepoClick(repo);
    } else {
      setView({ type: "detail", repo });
    }
  }, [onRepoClick]);

  if (view.type === "detail") {
    return <RepoDetail org={org} repo={view.repo} token={token} t={t} themeName={themeName} onBack={() => setView({ type: "list" })} />;
  }

  return (
    <div data-theme={themeName} style={{ background: t.bg, color: t.text, fontFamily: "system-ui, -apple-system, sans-serif", padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{org}</h2>
        <p style={{ color: t.textMuted, fontSize: 14, margin: "4px 0 0" }}>
          {repos.length} repositories
        </p>
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 8,
            padding: "8px 12px", color: t.text, fontSize: 14, outline: "none", flex: "1 1 200px",
          }}
        />
        <button
          onClick={() => setLang(null)}
          style={{
            padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
            background: !lang ? t.accent : t.bgBadge,
            color: !lang ? "#fff" : t.textBadge,
            border: `1px solid ${!lang ? t.accent : t.border}`,
          }}
        >
          All
        </button>
        {languages.map((l) => (
          <button
            key={l}
            onClick={() => setLang(lang === l ? null : l)}
            style={{
              padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer",
              background: lang === l ? t.accent : t.bgBadge,
              color: lang === l ? "#fff" : t.textBadge,
              border: `1px solid ${lang === l ? t.accent : t.border}`,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: t.textMuted }}>Loading...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map((repo) => (
            <RepoCard key={repo.name} repo={repo} t={t} onClick={() => handleCardClick(repo)} />
          ))}
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: t.textMuted }}>No results</div>
      )}
    </div>
  );
}

/* ---------- RepoCard ---------- */

function RepoCard({ repo, t, onClick }: { repo: Repo; t: Theme; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const langColor = repo.language ? LANG_COLORS[repo.language] || "#888" : null;
  const date = new Date(repo.updated_at).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? t.bgCardHover : t.bgCard,
        border: `1px solid ${hover ? t.accent : t.border}`,
        borderRadius: 12, padding: 20, cursor: "pointer",
        transform: hover ? "translateY(-2px)" : "none",
        boxShadow: hover ? t.shadowHover : "none",
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: t.accent }}>{repo.name}</span>
        <button
          onClick={(e) => { e.stopPropagation(); window.open(repo.html_url, "_blank"); }}
          style={{
            fontSize: 11, padding: "2px 8px", borderRadius: 6, cursor: "pointer",
            border: `1px solid ${t.border}`, background: "transparent", color: t.textMuted,
          }}
        >
          GitHub →
        </button>
      </div>
      <p style={{ fontSize: 13, color: t.textSecondary, margin: "0 0 12px", lineHeight: 1.5, minHeight: 40 }}>
        {repo.description || "No description"}
      </p>
      <div style={{ display: "flex", gap: 12, fontSize: 12, color: t.textMuted }}>
        {langColor && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: langColor, display: "inline-block" }} />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && <span>★ {repo.stargazers_count}</span>}
        {repo.forks_count > 0 && <span>Fork {repo.forks_count}</span>}
        <span>{date}</span>
      </div>
    </div>
  );
}

/* ---------- RepoDetail ---------- */

function RepoDetail({ org, repo, token, t, themeName, onBack }: { org: string; repo: Repo; token?: string; t: Theme; themeName: string; onBack: () => void }) {
  const [tab, setTab] = useState<"readme" | "demo">("readme");
  const [readme, setReadme] = useState<string | null>(null);
  const [snippets, setSnippets] = useState<DemoSnippet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchReadme(org, repo.name, token),
      fetchDemoSnippets(org, repo.name, undefined, token),
    ]).then(([md, s]) => {
      setReadme(md);
      setSnippets(s);
      setLoading(false);
    });
  }, [org, repo.name, token]);

  return (
    <div data-theme={themeName} style={{ background: t.bg, color: t.text, fontFamily: "system-ui, -apple-system, sans-serif", padding: 24 }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          background: "transparent", border: "none", color: t.accent,
          cursor: "pointer", fontSize: 14, padding: 0, marginBottom: 16,
        }}
      >
        ← Back
      </button>

      {/* Header */}
      <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{repo.name}</h1>
            <p style={{ color: t.textSecondary, fontSize: 14, margin: "8px 0" }}>{repo.description || "No description"}</p>
          </div>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500,
              background: t.accent, color: "#fff", textDecoration: "none",
              height: "fit-content",
            }}
          >
            View on GitHub
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${t.border}`, marginBottom: 16 }}>
        {(["readme", ...(snippets.length > 0 ? ["demo"] : [])] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            style={{
              padding: "10px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer",
              background: "transparent", border: "none",
              color: tab === key ? t.accentLight : t.textMuted,
              borderBottom: tab === key ? `2px solid ${t.accent}` : "2px solid transparent",
            }}
          >
            {key === "readme" ? "README" : "Demo"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: t.textMuted }}>Loading...</div>
        ) : tab === "readme" ? (
          <ReadmeView org={org} repoName={repo.name} content={readme} t={t} />
        ) : (
          <DemoView snippets={snippets} t={t} />
        )}
      </div>
    </div>
  );
}

/* ---------- DemoView ---------- */

function DemoView({ snippets, t }: { snippets: DemoSnippet[]; t: Theme }) {
  const [idx, setIdx] = useState(0);
  const snippet = snippets[idx];

  if (!snippet) return null;

  return (
    <div>
      {snippets.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {snippets.map((s, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                padding: "4px 12px", borderRadius: 99, fontSize: 12, cursor: "pointer",
                background: i === idx ? t.accentGlow : t.bgBadge,
                color: i === idx ? t.accent : t.textBadge,
                border: `1px solid ${i === idx ? t.accent : t.border}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      <pre
        style={{
          background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8,
          padding: 16, fontSize: 13, lineHeight: 1.6, overflow: "auto",
          color: t.textSecondary, margin: 0,
        }}
      >
        <code>{snippet.code}</code>
      </pre>
      {snippet.expectedOutput && (
        <div style={{ marginTop: 12 }}>
          <span style={{ fontSize: 12, color: t.textMuted }}>Expected Output:</span>
          <pre
            style={{
              background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8,
              padding: 12, fontSize: 12, color: t.textMuted, margin: "4px 0 0",
            }}
          >
            {snippet.expectedOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
