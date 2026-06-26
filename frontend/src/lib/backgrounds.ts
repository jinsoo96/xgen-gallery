/**
 * Per-menu background concepts. Each route/menu gets a distinct "scene" — a deep
 * base color with two accent glows — so navigating the site feels like moving
 * between different atmospheres. Add a concept here and reference it from a page;
 * the structure is data-driven so swapping/extending concepts is trivial.
 */
export type ConceptId =
    | "home"
    | "tools"
    | "members"
    | "releases"
    | "tool"
    | "usecases"
    | "research"
    | "architecture"
    | "technology"
    | "products"
    | "solutions"
    | "insights"
    | "resources"
    | "about";

export interface BgConcept {
    /** human label (for reference) */
    label: string;
    /** base background color */
    base: string;
    /** primary glow (top) — rgba */
    glow1: string;
    /** secondary glow (bottom-right) — rgba */
    glow2: string;
}

export const CONCEPTS: Record<ConceptId, BgConcept> = {
    home: {
        label: "Aurora · Intelligence",
        base: "#070b1c",
        glow1: "rgba(47,123,255,0.30)",
        glow2: "rgba(120,90,255,0.22)",
    },
    tools: {
        label: "Ember · Toolkit",
        base: "#0c0a06",
        glow1: "rgba(245,158,11,0.26)",
        glow2: "rgba(244,114,22,0.18)",
    },
    members: {
        label: "Constellation · People",
        base: "#0a0a18",
        glow1: "rgba(124,92,255,0.30)",
        glow2: "rgba(236,72,153,0.18)",
    },
    releases: {
        label: "Pulse · Changelog",
        base: "#06120f",
        glow1: "rgba(16,185,129,0.28)",
        glow2: "rgba(45,212,191,0.18)",
    },
    tool: {
        label: "Flow · Demo",
        base: "#04121a",
        glow1: "rgba(34,211,238,0.28)",
        glow2: "rgba(59,130,246,0.18)",
    },
    usecases: {
        label: "Compose · Pipelines",
        base: "#0a0712",
        glow1: "rgba(168,85,247,0.26)",
        glow2: "rgba(59,130,246,0.18)",
    },
    research: {
        label: "Frontier · Research",
        base: "#080b1e",
        glow1: "rgba(99,102,241,0.30)",
        glow2: "rgba(56,189,248,0.18)",
    },
    architecture: {
        label: "Blueprint · Architecture",
        base: "#0a0f14",
        glow1: "rgba(34,211,238,0.26)",
        glow2: "rgba(148,163,184,0.18)",
    },
    technology: {
        label: "Circuit · Technology",
        base: "#041018",
        glow1: "rgba(34,211,238,0.28)",
        glow2: "rgba(59,130,246,0.20)",
    },
    products: {
        label: "Signal · Products",
        base: "#050a1c",
        glow1: "rgba(47,123,255,0.32)",
        glow2: "rgba(120,90,255,0.20)",
    },
    solutions: {
        label: "Lattice · Solutions",
        base: "#04130f",
        glow1: "rgba(16,185,129,0.26)",
        glow2: "rgba(45,212,191,0.18)",
    },
    insights: {
        label: "Beacon · Insights",
        base: "#0c0a06",
        glow1: "rgba(245,158,11,0.26)",
        glow2: "rgba(244,114,22,0.18)",
    },
    resources: {
        label: "Atlas · Resources",
        base: "#0a0f14",
        glow1: "rgba(148,163,184,0.24)",
        glow2: "rgba(16,185,129,0.16)",
    },
    about: {
        label: "Constellation · PLEX",
        base: "#0a0a18",
        glow1: "rgba(124,92,255,0.30)",
        glow2: "rgba(236,72,153,0.18)",
    },
};

export function getConcept(id: ConceptId): BgConcept {
    return CONCEPTS[id] ?? CONCEPTS.home;
}
