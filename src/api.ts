import type { Repo, DemoSnippet } from "./types";

const API = "https://api.github.com";

function headers(token?: string): HeadersInit {
  const h: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function fetchRepos(org: string, token?: string): Promise<Repo[]> {
  try {
    const res = await fetch(`${API}/orgs/${org}/repos?per_page=100&sort=updated`, {
      headers: headers(token),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchReadme(org: string, repo: string, token?: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}/repos/${org}/${repo}/readme`, {
      headers: { ...headers(token), Accept: "application/vnd.github.v3.raw" },
    });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

export async function fetchDemoSnippets(
  org: string,
  repo: string,
  readme?: string | null,
  token?: string,
): Promise<DemoSnippet[]> {
  // 1. demo.json
  for (const path of [".xgen-gallery/demo.json", "demo.json"]) {
    try {
      const res = await fetch(`${API}/repos/${org}/${repo}/contents/${path}`, {
        headers: { ...headers(token), Accept: "application/vnd.github.v3.raw" },
      });
      if (!res.ok) continue;
      const data = await res.json();
      if (data.snippets?.length) return data.snippets;
    } catch {
      continue;
    }
  }

  // 2. examples/
  try {
    const res = await fetch(`${API}/repos/${org}/${repo}/contents/examples`, {
      headers: headers(token),
    });
    if (res.ok) {
      const files: { name: string; download_url: string }[] = await res.json();
      const pyFiles = files.filter((f) => f.name.endsWith(".py")).slice(0, 5);
      const snippets: DemoSnippet[] = [];
      for (const f of pyFiles) {
        try {
          const r = await fetch(f.download_url);
          if (r.ok) {
            const code = await r.text();
            snippets.push({ label: f.name.replace(/\.py$/, "").replace(/[_-]/g, " "), code: code.trim() });
          }
        } catch { continue; }
      }
      if (snippets.length) return snippets;
    }
  } catch { /* ignore */ }

  // 3. README python blocks
  let md = readme;
  if (!md) md = await fetchReadme(org, repo, token);
  if (md) {
    const blocks = extractPythonBlocks(md);
    if (blocks.length) return blocks;
  }

  return [];
}

function extractPythonBlocks(readme: string): DemoSnippet[] {
  const snippets: DemoSnippet[] = [];
  const lines = readme.split("\n");
  let i = 0;
  while (i < lines.length) {
    if (/^```(?:python|py)\s*$/i.test(lines[i].trim())) {
      let label = "";
      for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
        const prev = lines[j].trim();
        if (/^#{1,4}\s+/.test(prev)) { label = prev.replace(/^#+\s+/, ""); break; }
        if (prev && !label) label = prev;
      }
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) { codeLines.push(lines[i]); i++; }
      const code = codeLines.join("\n").trim();
      if (code && code.split("\n").length >= 2 && !code.startsWith("pip ") && !code.startsWith("$ pip")) {
        snippets.push({ label: label || `Example ${snippets.length + 1}`, code });
      }
    }
    i++;
  }
  return snippets;
}
