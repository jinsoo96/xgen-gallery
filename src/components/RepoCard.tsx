"use client";

import Link from "next/link";
import { Repo, LANGUAGE_COLORS, PYPI_PACKAGES } from "@/lib/types";

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
    </svg>
  );
}

function ForkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
    </svg>
  );
}

export default function RepoCard({ repo }: { repo: Repo }) {
  const langColor = repo.language ? LANGUAGE_COLORS[repo.language] || "#888" : null;
  const pypiPkg = PYPI_PACKAGES[repo.name];
  const updatedDate = new Date(repo.updated_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/repo/${repo.name}`}
      className="group rounded-xl p-5 transition-all duration-300 cursor-pointer relative block no-underline"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        color: "inherit",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.background = "var(--bg-card-hover)";
        e.currentTarget.style.boxShadow = "0 0 20px var(--accent-glow)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.background = "var(--bg-card)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-semibold truncate"
              style={{ color: "var(--accent-light)" }}
            >
              {repo.name}
            </span>
            {repo.archived && (
              <span
                className="text-xs px-2 py-0.5 rounded-full shrink-0"
                style={{ background: "var(--border)", color: "var(--text-muted)" }}
              >
                archived
              </span>
            )}
            {repo.fork && (
              <span
                className="text-xs px-2 py-0.5 rounded-full shrink-0"
                style={{ background: "var(--border)", color: "var(--text-muted)" }}
              >
                fork
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {pypiPkg && (
            <button
              className="text-xs px-2.5 py-1 rounded-md font-medium transition-colors"
              style={{
                background: "#306998",
                color: "#FFD43B",
              }}
              onClick={(e) => {
                e.preventDefault();
                window.open(`https://pypi.org/project/${pypiPkg}/`, "_blank");
              }}
            >
              PyPI
            </button>
          )}
          <button
            className="text-xs px-2.5 py-1 rounded-md font-medium transition-colors"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
            onClick={(e) => {
              e.preventDefault();
              window.open(repo.html_url, "_blank");
            }}
          >
            GitHub →
          </button>
        </div>
      </div>

      {/* Description */}
      <p
        className="text-sm mb-4 line-clamp-2 min-h-[2.5rem]"
        style={{ color: "var(--text-secondary)" }}
      >
        {repo.description || "No description"}
      </p>

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {repo.topics.slice(0, 5).map((topic) => (
            <span
              key={topic}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "var(--accent-glow)",
                color: "var(--accent-light)",
              }}
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-3 text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
        {langColor && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ background: langColor }}
            />
            {repo.language}
          </span>
        )}
        {repo.stargazers_count > 0 && (
          <span className="flex items-center gap-1">
            <StarIcon />
            {repo.stargazers_count}
          </span>
        )}
        {repo.forks_count > 0 && (
          <span className="flex items-center gap-1">
            <ForkIcon />
            {repo.forks_count}
          </span>
        )}
        <span>{updatedDate}</span>
      </div>
    </Link>
  );
}
