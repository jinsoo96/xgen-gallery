import type { DemoManifest } from "./types";

/* ────────────────────────────────────────────────────
 *  Per-project demo manifests
 *  Each manifest declares the I/O schema for its demo.
 *  Key = repo name (lowercase, exact match from GitHub)
 * ──────────────────────────────────────────────────── */

const contextifier: DemoManifest = {
  projectName: "Contextifier",
  title: "Contextifier Demo",
  description: "문서를 업로드하면 AI-Ready 구조화 텍스트로 변환합니다. 80+ 포맷 지원.",
  icon: "📄",
  inputs: [
    {
      key: "file",
      type: "file",
      label: "문서 업로드",
      accept: ".pdf,.docx,.doc,.pptx,.xlsx,.xls,.csv,.txt,.md,.html,.hwp,.hwpx,.rtf,.json,.py",
      required: true,
    },
    {
      key: "mode",
      type: "select",
      label: "처리 모드",
      options: [
        { value: "extract", label: "텍스트 추출" },
        { value: "chunk", label: "추출 + 청킹" },
      ],
      default: "chunk",
    },
    {
      key: "chunk_size",
      type: "number",
      label: "청크 크기",
      default: 1000,
      min: 100,
      max: 5000,
      step: 100,
    },
  ],
  outputs: [
    { key: "text", type: "text", label: "추출된 텍스트" },
    { key: "chunks", type: "chunks", label: "청크 결과" },
    { key: "metadata", type: "json", label: "메타데이터" },
  ],
  samples: [
    {
      label: "마크다운 문서",
      description: "기술 문서 샘플 — 테이블, 코드 블록 포함",
      inputs: { mode: "chunk", chunk_size: 1000 },
      mockOutput: {
        text: "# Sample Document\n\nThis is a sample markdown document with tables and code blocks.\n\n## Features\n\n| Feature | Status |\n|---------|--------|\n| Extraction | ✅ |\n| Chunking | ✅ |\n\n```python\nfrom contextifier import DocumentProcessor\nprocessor = DocumentProcessor()\n```",
        chunks: [
          { index: 0, text: "# Sample Document\n\nThis is a sample markdown document with tables and code blocks.", metadata: { type: "header_section" } },
          { index: 1, text: "## Features\n\n| Feature | Status |\n|---------|--------|\n| Extraction | ✅ |\n| Chunking | ✅ |", metadata: { type: "table_section" } },
          { index: 2, text: "```python\nfrom contextifier import DocumentProcessor\nprocessor = DocumentProcessor()\n```", metadata: { type: "code_block" } },
        ],
        metadata: { format: "markdown", pages: 1, encoding: "utf-8", file_size: "2.1 KB" },
      },
    },
  ],
  apiEndpoint: "/api/demo/contextifier/run",
};

const doc2chunk: DemoManifest = {
  projectName: "xgen-doc2chunk",
  title: "Doc2Chunk Demo",
  description: "문서를 AI가 이해할 수 있는 청크로 분할합니다.",
  icon: "✂️",
  inputs: [
    {
      key: "file",
      type: "file",
      label: "문서 업로드",
      accept: ".pdf,.docx,.doc,.pptx,.xlsx,.xls,.csv,.txt,.md,.html,.hwp,.hwpx,.rtf",
      required: true,
    },
    {
      key: "chunk_size",
      type: "number",
      label: "청크 크기",
      default: 1000,
      min: 100,
      max: 5000,
      step: 100,
    },
    {
      key: "chunk_overlap",
      type: "number",
      label: "청크 오버랩",
      default: 200,
      min: 0,
      max: 1000,
      step: 50,
    },
  ],
  outputs: [
    { key: "text", type: "text", label: "추출된 텍스트" },
    { key: "chunks", type: "chunks", label: "청크 결과" },
  ],
  samples: [
    {
      label: "기술 문서",
      description: "PDF 기술 문서 샘플",
      inputs: { chunk_size: 1000, chunk_overlap: 200 },
      mockOutput: {
        text: "XGEN Platform Documentation\n\n1. Overview\nXGEN is a next-generation AI platform...\n\n2. Architecture\nThe system consists of three layers...\n\n3. API Reference\nAll endpoints require authentication...",
        chunks: [
          { index: 0, text: "XGEN Platform Documentation\n\n1. Overview\nXGEN is a next-generation AI platform designed for enterprise...", metadata: { page: 1 } },
          { index: 1, text: "2. Architecture\nThe system consists of three layers: data ingestion, processing pipeline, and serving layer.", metadata: { page: 1 } },
          { index: 2, text: "3. API Reference\nAll endpoints require authentication via Bearer token. Rate limits apply per organization.", metadata: { page: 2 } },
        ],
      },
    },
  ],
  apiEndpoint: "/api/demo/doc2chunk/run",
};

const f2a: DemoManifest = {
  projectName: "f2a",
  title: "f2a Demo",
  description: "파일 한 줄로 전체 통계 분석 + 인터랙티브 HTML 리포트 생성. 24+ 포맷 지원.",
  icon: "📊",
  inputs: [
    {
      key: "file",
      type: "file",
      label: "데이터 파일 업로드",
      accept: ".csv,.json,.parquet,.xlsx,.xls,.orc,.hdf5,.dta,.sav,.sqlite,.tsv",
      required: true,
    },
    {
      key: "language",
      type: "select",
      label: "리포트 언어",
      options: [
        { value: "ko", label: "한국어" },
        { value: "en", label: "English" },
        { value: "ja", label: "日本語" },
        { value: "zh", label: "中文" },
        { value: "es", label: "Español" },
        { value: "fr", label: "Français" },
      ],
      default: "ko",
    },
  ],
  outputs: [
    { key: "report_html", type: "html", label: "분석 리포트" },
    { key: "summary", type: "table", label: "요약 통계" },
    { key: "stats", type: "json", label: "상세 통계" },
  ],
  samples: [
    {
      label: "판매 데이터 (CSV)",
      description: "15행 × 7열 — 제품별 판매 데이터",
      inputs: { language: "ko" },
      mockOutput: {
        summary: {
          columns: ["컬럼", "타입", "결측치", "고유값", "평균", "표준편차"],
          rows: [
            ["product", "string", "0", "5", "-", "-"],
            ["price", "float64", "0", "12", "29,500", "15,200"],
            ["quantity", "int64", "0", "10", "45", "22"],
            ["revenue", "float64", "0", "15", "1,327,500", "685,000"],
            ["date", "datetime", "0", "15", "-", "-"],
            ["region", "string", "1", "4", "-", "-"],
            ["category", "string", "0", "3", "-", "-"],
          ],
        },
        stats: {
          total_rows: 15,
          total_columns: 7,
          numeric_columns: 3,
          categorical_columns: 3,
          datetime_columns: 1,
          missing_values: 1,
          duplicate_rows: 0,
        },
        report_html: "<div style='padding:24px;text-align:center;color:#6b7280;'>HTML 리포트는 백엔드 연결 후 표시됩니다.</div>",
      },
    },
  ],
  apiEndpoint: "/api/demo/f2a/run",
};

const googer: DemoManifest = {
  projectName: "googer",
  title: "Googer Demo",
  description: "타입 안전한 구글 검색 라이브러리. 웹/이미지/뉴스/비디오 검색 지원.",
  icon: "🔍",
  inputs: [
    {
      key: "query",
      type: "text",
      label: "검색어",
      placeholder: "예: python machine learning tutorial",
      required: true,
    },
    {
      key: "search_type",
      type: "select",
      label: "검색 유형",
      options: [
        { value: "web", label: "웹 검색" },
        { value: "images", label: "이미지 검색" },
        { value: "news", label: "뉴스 검색" },
        { value: "videos", label: "비디오 검색" },
      ],
      default: "web",
    },
    {
      key: "max_results",
      type: "number",
      label: "최대 결과 수",
      default: 10,
      min: 1,
      max: 50,
    },
    {
      key: "region",
      type: "select",
      label: "검색 지역",
      options: [
        { value: "kr", label: "한국" },
        { value: "us", label: "미국" },
        { value: "jp", label: "일본" },
        { value: "global", label: "전체" },
      ],
      default: "kr",
    },
  ],
  outputs: [
    { key: "results", type: "search-results", label: "검색 결과" },
    { key: "raw", type: "json", label: "원시 데이터" },
  ],
  samples: [
    {
      label: "웹 검색",
      description: "Python 관련 웹 검색 결과 예시",
      inputs: { query: "python machine learning tutorial", search_type: "web", max_results: 5, region: "kr" },
      mockOutput: {
        results: [
          { title: "Machine Learning with Python — scikit-learn Tutorial", href: "https://scikit-learn.org/stable/tutorial/", body: "scikit-learn을 사용한 머신러닝 입문 가이드. 분류, 회귀, 클러스터링 예제 포함." },
          { title: "Python Machine Learning 완벽 가이드 — WikiDocs", href: "https://wikidocs.net/book/587", body: "파이썬 머신러닝 완벽 가이드. 넘파이, 판다스, Scikit-Learn 기반 실습." },
          { title: "TensorFlow 튜토리얼 — 초보자를 위한 ML", href: "https://www.tensorflow.org/tutorials", body: "TensorFlow를 사용한 머신러닝 및 딥러닝 튜토리얼 모음." },
          { title: "PyTorch로 시작하는 딥러닝 — 공식 튜토리얼", href: "https://pytorch.org/tutorials/", body: "PyTorch 공식 튜토리얼. 기초부터 고급 주제까지." },
          { title: "Kaggle Learn — Intro to Machine Learning", href: "https://www.kaggle.com/learn", body: "Kaggle에서 제공하는 무료 머신러닝 입문 코스." },
        ],
        raw: { query: "python machine learning tutorial", type: "web", count: 5, region: "kr" },
      },
    },
  ],
  apiEndpoint: "/api/demo/googer/run",
};

const knowtology: DemoManifest = {
  projectName: "Knowtology",
  title: "Knowtology Demo",
  description: "트리 구조 지식 맵. LLM 에이전트를 위한 4-tool TreeRAG 시스템.",
  icon: "🌳",
  inputs: [
    {
      key: "text",
      type: "textarea",
      label: "지식 텍스트 입력",
      placeholder: "지식 맵으로 구조화할 텍스트를 입력하세요...",
      required: true,
    },
    {
      key: "collection_id",
      type: "text",
      label: "컬렉션 ID",
      placeholder: "예: company_docs",
      default: "demo_collection",
    },
  ],
  outputs: [
    { key: "tree", type: "tree", label: "지식 트리" },
    { key: "stats", type: "json", label: "빌드 통계" },
  ],
  samples: [
    {
      label: "회사 정책 문서",
      description: "환불/배송/고객지원 정책 트리 구조화",
      inputs: {
        text: "환불 정책: 구매 후 7일 이내 환불 가능. 개봉 상품은 환불 불가.\n배송 정책: 기본 배송 2-3일. 도서산간 5-7일. 무료배송 기준 50,000원.\n고객 지원: 평일 09:00-18:00. 채팅/전화/이메일 지원.",
        collection_id: "company_docs",
      },
      mockOutput: {
        tree: {
          name: "company_docs",
          children: [
            {
              name: "환불 정책",
              children: [
                { name: "기간: 구매 후 7일 이내", children: [] },
                { name: "제외: 개봉 상품 환불 불가", children: [] },
              ],
            },
            {
              name: "배송 정책",
              children: [
                { name: "기본 배송: 2-3일", children: [] },
                { name: "도서산간: 5-7일", children: [] },
                { name: "무료배송: 50,000원 이상", children: [] },
              ],
            },
            {
              name: "고객 지원",
              children: [
                { name: "운영시간: 평일 09:00-18:00", children: [] },
                { name: "채널: 채팅/전화/이메일", children: [] },
              ],
            },
          ],
        },
        stats: { tree_count: 3, mapping_count: 8, depth: 2 },
      },
    },
  ],
  apiEndpoint: "/api/demo/knowtology/run",
};

const synapticMemory: DemoManifest = {
  projectName: "synaptic-memory",
  title: "Synaptic Memory Demo",
  description: "뇌 영감 지식 그래프. 자동 온톨로지, 헤비안 학습, 4단계 기억 통합.",
  icon: "🧠",
  inputs: [
    {
      key: "action",
      type: "select",
      label: "작업",
      options: [
        { value: "add", label: "지식 추가" },
        { value: "search", label: "지식 검색" },
      ],
      default: "add",
    },
    {
      key: "title",
      type: "text",
      label: "제목",
      placeholder: "예: 환불 정책",
    },
    {
      key: "content",
      type: "textarea",
      label: "내용",
      placeholder: "지식 내용을 입력하세요...",
      required: true,
    },
  ],
  outputs: [
    { key: "node", type: "json", label: "생성된 노드" },
    { key: "results", type: "json", label: "검색 결과" },
  ],
  samples: [
    {
      label: "지식 추가 예시",
      description: "환불 정책을 지식 그래프에 추가",
      inputs: {
        action: "add",
        title: "환불 정책",
        content: "구매 후 7일 이내 환불 가능. 개봉 상품은 환불 불가. 환불 처리는 3-5 영업일 소요.",
      },
      mockOutput: {
        node: {
          id: "node_a1b2c3",
          title: "환불 정책",
          kind: "RULE",
          tags: ["환불", "정책", "고객"],
          search_keywords: ["환불", "반품", "구매취소"],
          relations: [
            { target: "고객 서비스", type: "BELONGS_TO" },
            { target: "주문 관리", type: "RELATES_TO" },
          ],
          resonance_score: 0.85,
        },
        results: null,
      },
    },
  ],
  apiEndpoint: "/api/demo/synaptic-memory/run",
};

const mantisEngine: DemoManifest = {
  projectName: "mantis-engine",
  title: "Mantis Engine Demo",
  description: "AI 에이전트 워크플로우 실행 엔진. JSON 그래프 → 4단계 파이프라인 실행.",
  icon: "⚙️",
  inputs: [
    {
      key: "prompt",
      type: "textarea",
      label: "에이전트 프롬프트",
      placeholder: "에이전트에게 실행할 작업을 입력하세요...",
      required: true,
    },
    {
      key: "model",
      type: "select",
      label: "LLM 모델",
      options: [
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4o-mini", label: "GPT-4o Mini" },
        { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
      ],
      default: "gpt-4o-mini",
    },
  ],
  outputs: [
    { key: "events", type: "json", label: "실행 이벤트 로그" },
    { key: "result", type: "text", label: "최종 결과" },
  ],
  samples: [
    {
      label: "간단한 계산",
      description: "에이전트가 계산 도구를 사용하는 예시",
      inputs: { prompt: "42 × 17은 얼마인가요?", model: "gpt-4o-mini" },
      mockOutput: {
        events: [
          { type: "workflow_start", timestamp: "00:00.000" },
          { type: "node_start", node: "agent", timestamp: "00:00.012" },
          { type: "agent_tool_call", tool: "calculator", args: { expression: "42 * 17" }, timestamp: "00:00.523" },
          { type: "node_complete", node: "agent", result: "714", timestamp: "00:01.102" },
          { type: "workflow_complete", timestamp: "00:01.105" },
        ],
        result: "42 × 17 = 714 입니다.",
      },
    },
  ],
  apiEndpoint: "/api/demo/mantis-engine/run",
};

const toolint: DemoManifest = {
  projectName: "Toolint",
  title: "Toolint Demo",
  description: "Python 에이전트 도구 패키지를 위한 구조 린터. AST 기반 정적 분석.",
  icon: "🔧",
  inputs: [
    {
      key: "code",
      type: "textarea",
      label: "Python 코드",
      placeholder: "린트할 Python 코드를 입력하세요...",
      required: true,
    },
    {
      key: "rules",
      type: "text",
      label: "선택 규칙 (쉼표 구분)",
      placeholder: "예: ATL101,ATL201 (빈칸이면 전체 검사)",
    },
  ],
  outputs: [
    { key: "issues", type: "json", label: "린트 결과" },
    { key: "summary", type: "text", label: "요약" },
  ],
  samples: [
    {
      label: "구조 위반 코드",
      description: "의존성 규칙을 위반하는 코드 예시",
      inputs: {
        code: 'import requests\nimport pandas as pd\nfrom my_tool.lib.core import process\n\ndef my_tool_func(data: str) -> dict:\n    """Process data."""\n    response = requests.get("https://api.example.com")\n    df = pd.DataFrame(response.json())\n    return process(df)',
        rules: "",
      },
      mockOutput: {
        issues: [
          { file: "tool.py", line: 1, rule: "ATL101", severity: "error", message: "External dependency 'requests' not allowed in tool layer" },
          { file: "tool.py", line: 2, rule: "ATL101", severity: "error", message: "External dependency 'pandas' not allowed in tool layer" },
          { file: "tool.py", line: 3, rule: "ATL201", severity: "warn", message: "Tool layer should not import from lib layer directly" },
        ],
        summary: "3 issues found (2 errors, 1 warning)",
      },
    },
  ],
  apiEndpoint: "/api/demo/toolint/run",
};

/* ── Registry ── */

export const demoRegistry: Record<string, DemoManifest> = {
  "Contextifier": contextifier,
  "xgen-doc2chunk": doc2chunk,
  "f2a": f2a,
  "googer": googer,
  "Knowtology": knowtology,
  "synaptic-memory": synapticMemory,
  "mantis-engine": mantisEngine,
  "Toolint": toolint,
};

export function getDemoManifest(repoName: string): DemoManifest | null {
  return demoRegistry[repoName] ?? null;
}

export function hasDemoManifest(repoName: string): boolean {
  return repoName in demoRegistry;
}
