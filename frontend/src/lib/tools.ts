export type ToolCategory = "ingestion" | "knowledge" | "agent" | "utility";

export interface Tool {
    id: string;
    repo: string;
    name: string;
    tagline: string;
    description: string;
    category: ToolCategory;
    install: string;
    hasDemo: boolean;
    language: string;
}

export const TOOLS: Tool[] = [
    {
        id: "contextifier",
        repo: "Contextifier",
        name: "Contextifier",
        tagline: "Turn any document into AI-ready text",
        description:
            "Extract and chunk 80+ document formats. Tables, code blocks, and structure preserved for retrieval.",
        category: "ingestion",
        install: "pip install contextifier",
        hasDemo: true,
        language: "Python",
    },
    {
        id: "doc2chunk",
        repo: "xgen-doc2chunk",
        name: "Doc2Chunk",
        tagline: "Smart chunking for RAG pipelines",
        description:
            "Split documents into context-aware chunks with configurable size and overlap.",
        category: "ingestion",
        install: "pip install xgen-doc2chunk",
        hasDemo: true,
        language: "Python",
    },
    {
        id: "f2a",
        repo: "f2a",
        name: "f2a",
        tagline: "One-line data analytics with HTML reports",
        description:
            "Point at any file, get full statistics and an interactive HTML report. 24+ formats.",
        category: "ingestion",
        install: "pip install f2a",
        hasDemo: true,
        language: "Python",
    },
    {
        id: "synaptic-memory",
        repo: "synaptic-memory",
        name: "Synaptic Memory",
        tagline: "Brain-inspired knowledge graph",
        description:
            "Auto-ontology, Hebbian learning, four-stage memory consolidation for long-running agents.",
        category: "knowledge",
        install: "pip install synaptic-memory",
        hasDemo: true,
        language: "Python",
    },
    {
        id: "googer",
        repo: "googer",
        name: "Googer",
        tagline: "Type-safe Google search, for agents",
        description:
            "Web, images, news, and videos. Typed responses, no scraping gymnastics.",
        category: "agent",
        install: "pip install googer",
        hasDemo: true,
        language: "Python",
    },
];

export const CATEGORIES: { id: ToolCategory | "all"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "ingestion", label: "Ingestion" },
    { id: "knowledge", label: "Knowledge" },
    { id: "agent", label: "Agent" },
];

export function getToolsByCategory(category: ToolCategory | "all") {
    if (category === "all") return TOOLS;
    return TOOLS.filter((t) => t.category === category);
}
