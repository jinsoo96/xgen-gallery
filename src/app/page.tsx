"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import RepoCard from "@/components/RepoCard";
import FilterBar from "@/components/FilterBar";
import { Repo } from "@/lib/types";

export default function Home() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showForks, setShowForks] = useState(false);

  useEffect(() => {
    fetch("https://api.github.com/orgs/PlateerLab/repos?per_page=100&sort=updated", {
      headers: { Accept: "application/vnd.github.v3+json" },
    })
      .then((res) => res.json())
      .then((data) => {
        setRepos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))] as string[];

  const filtered = repos.filter((repo) => {
    if (!showForks && repo.fork) return false;
    if (selectedLanguage && repo.language !== selectedLanguage) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        repo.name.toLowerCase().includes(q) ||
        (repo.description || "").toLowerCase().includes(q) ||
        (repo.topics || []).some((t) => t.includes(q))
      );
    }
    return true;
  });

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">
        {/* Hero */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Repositories
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            PlateerLab에서 개발한 오픈소스 프로젝트를 탐색하세요
          </p>
          <div className="flex items-center gap-6 mt-4 text-sm" style={{ color: "var(--text-muted)" }}>
            <span>{repos.length} repositories</span>
            <span>{repos.reduce((sum, r) => sum + r.stargazers_count, 0)} total stars</span>
          </div>
        </div>

        {/* Filter */}
        <FilterBar
          languages={languages}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showForks={showForks}
          onShowForksChange={setShowForks}
        />

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((repo) => (
              <RepoCard key={repo.name} repo={repo} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
            검색 결과가 없습니다.
          </div>
        )}
      </main>

      <footer
        className="py-6 text-center text-xs"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
      >
        XGEN Gallery — PlateerLab &copy; {new Date().getFullYear()}
      </footer>
    </>
  );
}
