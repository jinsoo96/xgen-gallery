"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import ReadmeViewer from "@/components/ReadmeViewer";
import PythonPlayground from "@/components/PythonPlayground";
import { Repo, LANGUAGE_COLORS, PYPI_PACKAGES } from "@/lib/types";
import { fetchDemoSnippets, DemoSnippet } from "@/lib/demo";

export default function RepoDetailPage() {
  const params = useParams();
  const name = params.name as string;
  const [repo, setRepo] = useState<Repo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"readme" | "install" | "demo">("readme");
  const [demoSnippets, setDemoSnippets] = useState<DemoSnippet[]>([]);
  const [demoLoading, setDemoLoading] = useState(true);

  const pypiPkg = PYPI_PACKAGES[name];

  useEffect(() => {
    fetch(`https://api.github.com/repos/PlateerLab/${name}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    })
      .then((res) => res.json())
      .then((data) => {
        setRepo(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetchDemoSnippets(name).then((snippets) => {
      setDemoSnippets(snippets);
      setDemoLoading(false);
    });
  }, [name]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div
            className="w-10 h-10 rounded-full border-3 border-t-transparent animate-spin"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
        </div>
      </>
    );
  }

  if (!repo) {
    return (
      <>
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center" style={{ color: "var(--text-muted)" }}>
          Repository not found.
        </div>
      </>
    );
  }

  const langColor = repo.language ? LANGUAGE_COLORS[repo.language] || "#888" : null;

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
          <Link href="/" className="hover:underline" style={{ color: "var(--accent-light)" }}>
            Repositories
          </Link>
          <span>/</span>
          <span style={{ color: "var(--text-primary)" }}>{name}</span>
        </div>

        {/* Repo Header */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {repo.name}
                </h1>
                {repo.archived && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--border)", color: "var(--text-muted)" }}
                  >
                    archived
                  </span>
                )}
                {repo.fork && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--border)", color: "var(--text-muted)" }}
                  >
                    fork
                  </span>
                )}
              </div>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                {repo.description || "No description"}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
                {langColor && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: langColor }} />
                    {repo.language}
                  </span>
                )}
                <span>★ {repo.stargazers_count}</span>
                <span>Forks: {repo.forks_count}</span>
                <span>
                  Updated: {new Date(repo.updated_at).toLocaleDateString("ko-KR")}
                </span>
              </div>

              {/* Topics */}
              {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {repo.topics.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "var(--accent-glow)", color: "var(--accent-light)" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                View on GitHub
              </a>
              {pypiPkg && (
                <a
                  href={`https://pypi.org/project/${pypiPkg}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: "#306998", color: "#FFD43B" }}
                >
                  View on PyPI
                </a>
              )}
              {repo.homepage && (
                <a
                  href={repo.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  Homepage →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <button
            onClick={() => setActiveTab("readme")}
            className="px-4 py-2.5 text-sm font-medium transition-colors relative"
            style={{
              color: activeTab === "readme" ? "var(--accent-light)" : "var(--text-muted)",
            }}
          >
            README
            {activeTab === "readme" && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "var(--accent)" }}
              />
            )}
          </button>
          {pypiPkg && (
            <button
              onClick={() => setActiveTab("install")}
              className="px-4 py-2.5 text-sm font-medium transition-colors relative"
              style={{
                color: activeTab === "install" ? "var(--accent-light)" : "var(--text-muted)",
              }}
            >
              Quick Install
              {activeTab === "install" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
              )}
            </button>
          )}
          {!demoLoading && demoSnippets.length > 0 && (
            <button
              onClick={() => setActiveTab("demo")}
              className="px-4 py-2.5 text-sm font-medium transition-colors relative"
              style={{
                color: activeTab === "demo" ? "var(--accent-light)" : "var(--text-muted)",
              }}
            >
              Demo
              {activeTab === "demo" && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          {activeTab === "readme" && <ReadmeViewer repoName={name} />}
          {activeTab === "install" && pypiPkg && <InstallGuide packageName={pypiPkg} />}
          {activeTab === "demo" && (
            <PythonPlayground packageName={pypiPkg} snippets={demoSnippets} />
          )}
        </div>
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

function InstallGuide({ packageName }: { packageName: string }) {
  const [copied, setCopied] = useState(false);
  const [pypiInfo, setPypiInfo] = useState<{
    version: string;
    summary: string;
    requires_python: string | null;
  } | null>(null);

  useEffect(() => {
    fetch(`https://pypi.org/pypi/${packageName}/json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setPypiInfo({
            version: data.info.version,
            summary: data.info.summary,
            requires_python: data.info.requires_python,
          });
        }
      })
      .catch(() => {});
  }, [packageName]);

  const installCmd = `pip install ${packageName}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
        Installation
      </h3>

      {pypiInfo && (
        <div
          className="rounded-lg p-4 mb-4"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3 text-sm mb-2">
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {packageName}
            </span>
            <span
              className="px-2 py-0.5 rounded text-xs font-mono"
              style={{ background: "var(--accent-glow)", color: "var(--accent-light)" }}
            >
              v{pypiInfo.version}
            </span>
            {pypiInfo.requires_python && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Python {pypiInfo.requires_python}
              </span>
            )}
          </div>
          {pypiInfo.summary && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {pypiInfo.summary}
            </p>
          )}
        </div>
      )}

      <div
        className="rounded-lg p-4 flex items-center justify-between font-mono text-sm"
        style={{ background: "var(--bg-primary)", border: "1px solid var(--border)" }}
      >
        <code style={{ color: "var(--accent-light)" }}>$ {installCmd}</code>
        <button
          onClick={handleCopy}
          className="px-3 py-1 rounded text-xs font-sans transition-colors"
          style={{
            background: copied ? "#22c55e" : "var(--accent)",
            color: "#fff",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          Quick Start
        </h4>
        <div
          className="rounded-lg p-4 font-mono text-sm overflow-x-auto"
          style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <pre>{`# Install\npip install ${packageName}\n\n# Import and use\nimport ${packageName.replace(/-/g, "_")}\n\n# Check version\nprint(${packageName.replace(/-/g, "_")}.__version__)`}</pre>
        </div>
      </div>
    </div>
  );
}
