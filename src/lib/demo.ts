const GITHUB_API = "https://api.github.com";
const ORG = "PlateerLab";

export interface DemoSnippet {
  label: string;
  code: string;
  expectedOutput?: string;
}

/**
 * demo.json 컨벤션 (레포에 이 파일이 있으면 최우선 사용)
 *
 * 위치: .xgen-gallery/demo.json 또는 demo.json (루트)
 * 형식:
 * {
 *   "snippets": [
 *     { "label": "Basic Usage", "code": "...", "expectedOutput": "..." }
 *   ]
 * }
 */
async function fetchDemoJson(repoName: string): Promise<DemoSnippet[] | null> {
  const paths = [".xgen-gallery/demo.json", "demo.json"];

  for (const path of paths) {
    try {
      const res = await fetch(
        `${GITHUB_API}/repos/${ORG}/${repoName}/contents/${path}`,
        { headers: { Accept: "application/vnd.github.v3.raw" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (data.snippets && Array.isArray(data.snippets)) {
        return data.snippets;
      }
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * README에서 Python 코드블록 자동 추출
 * ```python 또는 ```py 블록을 찾고, 바로 위 heading을 label로 사용
 */
function extractPythonBlocks(readme: string): DemoSnippet[] {
  const snippets: DemoSnippet[] = [];
  const lines = readme.split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // ```python 또는 ```py 블록 시작 감지
    if (/^```(?:python|py)\s*$/i.test(line.trim())) {
      // 바로 위 heading 찾기 (코드블록 위로 최대 5줄 탐색)
      let label = "";
      for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
        const prev = lines[j].trim();
        if (/^#{1,4}\s+/.test(prev)) {
          label = prev.replace(/^#+\s+/, "");
          break;
        }
        // 빈줄이 아닌 텍스트가 있으면 그것도 label 후보
        if (prev && !label) {
          label = prev;
        }
      }

      // 코드블록 끝까지 수집
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }

      const code = codeLines.join("\n").trim();
      // 너무 짧거나(한 줄 import만), pip install 명령만 있는 블록 제외
      if (
        code &&
        code.split("\n").length >= 2 &&
        !code.startsWith("pip ") &&
        !code.startsWith("$ pip")
      ) {
        snippets.push({
          label: label || `Example ${snippets.length + 1}`,
          code,
        });
      }
    }

    i++;
  }

  return snippets;
}

/**
 * examples/ 디렉토리에서 .py 파일 fetch
 */
async function fetchExamples(repoName: string): Promise<DemoSnippet[] | null> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${ORG}/${repoName}/contents/examples`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    );
    if (!res.ok) return null;

    const files: { name: string; download_url: string }[] = await res.json();
    const pyFiles = files.filter((f) => f.name.endsWith(".py")).slice(0, 5);

    const snippets: DemoSnippet[] = [];
    for (const file of pyFiles) {
      try {
        const codeRes = await fetch(file.download_url);
        if (!codeRes.ok) continue;
        const code = await codeRes.text();
        snippets.push({
          label: file.name.replace(/\.py$/, "").replace(/[_-]/g, " "),
          code: code.trim(),
        });
      } catch {
        continue;
      }
    }

    return snippets.length > 0 ? snippets : null;
  } catch {
    return null;
  }
}

/**
 * 데모 데이터 가져오기 (우선순위)
 * 1. demo.json (레포 관리자가 직접 관리)
 * 2. examples/ 디렉토리의 .py 파일
 * 3. README에서 Python 코드블록 추출
 */
export async function fetchDemoSnippets(
  repoName: string,
  readme?: string | null
): Promise<DemoSnippet[]> {
  // 1순위: demo.json
  const demoJson = await fetchDemoJson(repoName);
  if (demoJson && demoJson.length > 0) return demoJson;

  // 2순위: examples/ 디렉토리
  const examples = await fetchExamples(repoName);
  if (examples && examples.length > 0) return examples;

  // 3순위: README 파싱
  let readmeContent = readme;
  if (!readmeContent) {
    try {
      const res = await fetch(
        `${GITHUB_API}/repos/${ORG}/${repoName}/readme`,
        { headers: { Accept: "application/vnd.github.v3.raw" } }
      );
      if (res.ok) readmeContent = await res.text();
    } catch {
      // ignore
    }
  }

  if (readmeContent) {
    const blocks = extractPythonBlocks(readmeContent);
    if (blocks.length > 0) return blocks;
  }

  return [];
}
