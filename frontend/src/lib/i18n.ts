/**
 * Lightweight i18n for the whole site. Locale is persisted in a cookie and
 * read on the server (layout) so the first SSR render is already in the right
 * language (good for GEO — no flash, full HTML). A client context then lets
 * both server- and client-rendered components share the active locale.
 *
 * Default locale: Korean. Toggle: KO / EN (see LanguageToggle).
 */
export type Locale = "ko" | "en";

export const LOCALES: Locale[] = ["ko", "en"];
export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE = "locale";

export function isLocale(v: unknown): v is Locale {
    return v === "ko" || v === "en";
}

/** Per-tool localized copy, keyed by tool id. */
export const TOOL_I18N: Record<
    string,
    Record<Locale, { tagline: string; description: string }>
> = {
    contextifier: {
        en: {
            tagline: "Turn any document into AI-ready text",
            description:
                "Extract and chunk 80+ document formats. Tables, code blocks, and structure preserved for retrieval.",
        },
        ko: {
            tagline: "어떤 문서든 AI 친화 텍스트로",
            description:
                "80개 이상 문서 포맷을 추출·청킹합니다. 표, 코드 블록, 구조를 검색에 유리하게 보존합니다.",
        },
    },
    doc2chunk: {
        en: {
            tagline: "Smart chunking for RAG pipelines",
            description:
                "Split documents into context-aware chunks with configurable size and overlap.",
        },
        ko: {
            tagline: "RAG 파이프라인을 위한 스마트 청킹",
            description:
                "문서를 컨텍스트 인식 청크로 분할합니다. 크기와 중첩을 자유롭게 설정할 수 있습니다.",
        },
    },
    f2a: {
        en: {
            tagline: "One-line data analytics with HTML reports",
            description:
                "Point at any file, get full statistics and an interactive HTML report. 24+ formats.",
        },
        ko: {
            tagline: "한 줄로 데이터 분석 + HTML 리포트",
            description:
                "파일 하나만 지정하면 전체 통계와 인터랙티브 HTML 리포트를 생성합니다. 24개 이상 포맷 지원.",
        },
    },
    "synaptic-memory": {
        en: {
            tagline: "Brain-inspired knowledge graph",
            description:
                "Auto-ontology, Hebbian learning, four-stage memory consolidation for long-running agents.",
        },
        ko: {
            tagline: "뇌 영감 지식 그래프",
            description:
                "자동 온톨로지, 헤비안 학습, 4단계 기억 통합으로 오래 실행되는 에이전트의 장기 기억을 지원합니다.",
        },
    },
    googer: {
        en: {
            tagline: "Type-safe Google search, for agents",
            description:
                "Web, images, news, and videos. Typed responses, no scraping gymnastics.",
        },
        ko: {
            tagline: "에이전트를 위한 타입 안전 구글 검색",
            description:
                "웹·이미지·뉴스·동영상 검색. 타입이 보장된 응답으로 스크래핑 고생이 필요 없습니다.",
        },
    },
};

export interface FaqEntry {
    question: string;
    answer: string;
}

export interface UseCaseEntry {
    title: string;
    stack: string[];
    description: string;
}

export interface Dict {
    nav: {
        tools: string;
        members: string;
        useCases: string;
        releases: string;
        github: string;
        star: string;
        tagline: string;
    };
    hero: {
        badge: string;
        // title is composed in the component (highlight on XGEN)
        desc: string;
        browse: string;
        viewGithub: string;
    };
    live: { try: string };
    toolsSection: {
        eyebrow: string;
        titleA: string;
        titleB: string;
    };
    categories: { all: string; ingestion: string; knowledge: string; agent: string };
    toolCard: { liveDemo: string; openDemo: string };
    usecases: {
        eyebrow: string;
        titleA: string;
        titleB: string;
        seeRecipe: string;
        items: UseCaseEntry[];
    };
    faq: { eyebrow: string; title: string; entries: FaqEntry[] };
    footer: { tools: string; contact: string };
    releasesPage: { eyebrow: string; title: string; desc: string };
    membersPage: {
        eyebrow: string;
        title: string;
        descA: string;
        descB: string;
    };
}

const FAQ_KO: FaqEntry[] = [
    {
        question: "Plateer AI Labs는 어떤 일을 하는 곳인가요?",
        answer:
            "Plateer AI Labs는 기업이 신뢰할 수 있는 AI 플랫폼을 만들기 위한 핵심 기술을 연구하고 공유합니다. XGEN을 구성하는 문서 인제스션, 지식그래프, 에이전트 프레임워크 등 검증된 AI 기술을 오픈소스로 공개하여 누구나 쉽게 설치하고, 실험하고, 서비스에 적용할 수 있도록 지원합니다.",
    },
    {
        question: "RAG 파이프라인을 만들려면 어떤 도구를 써야 하나요?",
        answer:
            "문서를 AI 친화 텍스트로 변환하는 Contextifier로 인제스션하고, Doc2Chunk로 컨텍스트 인식 청킹을 한 뒤, 임베딩·검색을 연결하면 RAG 파이프라인이 됩니다. 장기 기억이 필요한 에이전트라면 Synaptic Memory 지식 그래프를 추가합니다.",
    },
    {
        question: "Contextifier는 어떤 문서 포맷을 지원하나요?",
        answer:
            "Contextifier는 PDF, DOCX, PPTX, HWP 등 80개 이상의 문서 포맷을 AI 친화 텍스트로 변환하며, 표·코드 블록·문서 구조를 검색에 유리하게 보존합니다. `pip install contextifier`로 설치합니다.",
    },
    {
        question: "Synaptic Memory는 일반 벡터 DB와 무엇이 다른가요?",
        answer:
            "Synaptic Memory는 자동 온톨로지 구성, 헤비안 학습, 4단계 기억 통합을 갖춘 뇌 영감 지식 그래프입니다. 단순 벡터 유사도 검색을 넘어 노드·엣지로 개념 관계를 저장하므로, 오래 실행되는 에이전트의 장기 기억에 적합합니다. `pip install synaptic-memory`.",
    },
    {
        question: "이 도구들은 무료이고 상업적으로 쓸 수 있나요?",
        answer:
            "네. 모든 라이브러리는 MIT 라이선스의 오픈소스로 무료이며 상업적 사용이 가능합니다. 소스는 github.com/PlateerLab에서 확인할 수 있고 각 도구는 pip로 설치합니다.",
    },
];

const FAQ_EN: FaqEntry[] = [
    {
        question: "What does Plateer AI Labs do?",
        answer:
            "Plateer AI Labs is the open-source AI research lab behind the XGEN platform. It ships document-ingestion tools (Contextifier, Doc2Chunk, f2a), a knowledge graph (Synaptic Memory), and agent tooling (Googer) — all MIT-licensed Python packages you can install with pip or try directly in the browser.",
    },
    {
        question: "Which tools do I use to build a RAG pipeline?",
        answer:
            "Ingest documents with Contextifier (converts files to AI-ready text), chunk them with Doc2Chunk (context-aware), then wire up embeddings and retrieval. For agents that need long-term memory, add the Synaptic Memory knowledge graph.",
    },
    {
        question: "Which document formats does Contextifier support?",
        answer:
            "Contextifier converts 80+ document formats — PDF, DOCX, PPTX, HWP and more — into AI-ready text, preserving tables, code blocks, and document structure for retrieval. Install with `pip install contextifier`.",
    },
    {
        question: "How is Synaptic Memory different from a plain vector DB?",
        answer:
            "Synaptic Memory is a brain-inspired knowledge graph with auto-ontology, Hebbian learning, and four-stage memory consolidation. Beyond vector similarity, it stores concept relationships as nodes and edges, making it well-suited to long-term memory for long-running agents. `pip install synaptic-memory`.",
    },
    {
        question: "Are these tools free and usable commercially?",
        answer:
            "Yes. Every library is free, MIT-licensed open source and can be used commercially. Source is on github.com/PlateerLab and each tool installs via pip.",
    },
];

export const dict: Record<Locale, Dict> = {
    ko: {
        nav: {
            tools: "도구",
            members: "멤버",
            useCases: "활용 사례",
            releases: "릴리스",
            github: "GitHub",
            star: "GitHub에서 별 주기",
            tagline: "Plateer Labs for Enterprise AI·AX",
        },
        hero: {
            badge: "8개 라이브러리 · 브라우저에서 바로 체험",
            desc: "XGEN 플랫폼을 떠받치는 8개의 오픈소스 라이브러리, pip로 설치하거나 모든 도구를 지금 여기 브라우저에서 체험하세요",
            browse: "도구 둘러보기",
            viewGithub: "GitHub에서 보기",
        },
        live: { try: "이 데모 체험하기" },
        toolsSection: {
            eyebrow: "/ 도구",
            titleA: "8개의 라이브러리.",
            titleB: "설치 한 번이면 끝.",
        },
        categories: {
            all: "전체",
            ingestion: "인제스션",
            knowledge: "지식",
            agent: "에이전트",
        },
        toolCard: { liveDemo: "라이브 데모", openDemo: "데모 열기" },
        usecases: {
            eyebrow: "/ 이 블록들로 만들기",
            titleA: "조합을 넘어,",
            titleB: "완전한 AI 파이프라인으로",
            seeRecipe: "레시피 보기",
            items: [
                {
                    title: "RAG 파이프라인",
                    stack: ["Contextifier", "Doc2Chunk", "Knowtology"],
                    description:
                        "문서를 인제스션하고, 지능적으로 청킹한 뒤, 트리형 지식 맵으로 검색합니다.",
                },
                {
                    title: "에이전트 런타임",
                    stack: ["Mantis Engine", "Googer", "Toolint"],
                    description:
                        "JSON 워크플로우를 실행하고, 타입 안전 검색 도구를 호출하며, 에이전트 툴 패키지를 린트합니다.",
                },
                {
                    title: "장기 기억",
                    stack: ["Synaptic Memory", "Knowtology"],
                    description:
                        "뇌 영감 지식 그래프와 계층형 검색으로 기억하는 에이전트를 만듭니다.",
                },
            ],
        },
        faq: { eyebrow: "/ 자주 묻는 질문", title: "자주 묻는 질문", entries: FAQ_KO },
        footer: { tools: "도구", contact: "문의" },
        releasesPage: {
            eyebrow: "Release Notes",
            title: "Better with every release",
            desc: "XGEN 플랫폼의 새 기능, 개선사항, 버그 수정을 정리했습니다 — 최신 변경사항이 먼저 표시됩니다",
        },
        membersPage: {
            eyebrow: "팀",
            title: "Plateer AI Labs를 만드는 사람들.",
            descA: "XGEN 플랫폼과 그 라이브러리 생태계를 만드는 오픈소스 기여자들. 출처: ",
            descB: ".",
        },
    },
    en: {
        nav: {
            tools: "Tools",
            members: "Members",
            useCases: "Use cases",
            releases: "Releases",
            github: "GitHub",
            star: "Star on GitHub",
            tagline: "Plateer Labs for Enterprise AI·AX",
        },
        hero: {
            badge: "8 libraries · live in your browser",
            desc: "Eight open-source libraries powering the XGEN platform — install them with pip, or try every tool right here in your browser",
            browse: "Browse tools",
            viewGithub: "View on GitHub",
        },
        live: { try: "Try this demo" },
        toolsSection: {
            eyebrow: "/ tools",
            titleA: "Eight libraries.",
            titleB: "One install away.",
        },
        categories: {
            all: "All",
            ingestion: "Ingestion",
            knowledge: "Knowledge",
            agent: "Agent",
        },
        toolCard: { liveDemo: "live demo", openDemo: "Open demo" },
        usecases: {
            eyebrow: "/ build with these blocks",
            titleA: "Compose them into",
            titleB: "full AI pipelines.",
            seeRecipe: "See recipe",
            items: [
                {
                    title: "RAG Pipeline",
                    stack: ["Contextifier", "Doc2Chunk", "Knowtology"],
                    description:
                        "Ingest documents, chunk them intelligently, then retrieve with tree-shaped knowledge maps.",
                },
                {
                    title: "Agent Runtime",
                    stack: ["Mantis Engine", "Googer", "Toolint"],
                    description:
                        "Execute JSON workflows, call typed search tools, and lint your agent tool packages.",
                },
                {
                    title: "Long-term Memory",
                    stack: ["Synaptic Memory", "Knowtology"],
                    description:
                        "Brain-inspired knowledge graph plus hierarchical retrieval for agents that remember.",
                },
            ],
        },
        faq: { eyebrow: "/ frequently asked", title: "Frequently asked questions", entries: FAQ_EN },
        footer: { tools: "Tools", contact: "Contact" },
        releasesPage: {
            eyebrow: "Release Notes",
            title: "Better with every release",
            desc: "New features, improvements, and fixes for the XGEN platform — latest changes first",
        },
        membersPage: {
            eyebrow: "Team",
            title: "The people behind Plateer AI Labs.",
            descA: "Open-source contributors building the XGEN platform and its ecosystem of libraries. Synced from ",
            descB: ".",
        },
    },
};

export function getDict(locale: Locale): Dict {
    return dict[locale] ?? dict[DEFAULT_LOCALE];
}
