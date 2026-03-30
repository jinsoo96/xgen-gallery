import { Repo, PyPIInfo } from "./types";

const GITHUB_API = "https://api.github.com";
const ORG = "PlateerLab";

export async function fetchRepos(): Promise<Repo[]> {
  const res = await fetch(`${GITHUB_API}/orgs/${ORG}/repos?per_page=100&sort=updated`, {
    next: { revalidate: 3600 },
    headers: { Accept: "application/vnd.github.v3+json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch repos: ${res.status}`);
  return res.json();
}

export async function fetchReadme(repoName: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${ORG}/${repoName}/readme`,
      {
        headers: { Accept: "application/vnd.github.v3.raw" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

export async function fetchPyPIInfo(packageName: string): Promise<PyPIInfo | null> {
  try {
    const res = await fetch(`https://pypi.org/pypi/${packageName}/json`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.info.name,
      version: data.info.version,
      summary: data.info.summary,
      project_url: data.info.project_url,
      requires_python: data.info.requires_python,
    };
  } catch {
    return null;
  }
}
