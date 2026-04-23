/** Format a star count as 1.2k / 12.4k / 1.2M. */
export function formatStars(n: number): string {
    if (n < 1000) return `${n}`;
    if (n < 10_000) return `${(n / 1000).toFixed(1)}k`;
    if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
    return `${(n / 1_000_000).toFixed(1)}M`;
}

/** Format an ISO date as "Apr 23, 2026". */
export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

/** Format an ISO date as "Apr 2026" (joined month). */
export function formatYearMonth(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
}

/** Relative time string from now. e.g. "12 minutes ago". */
export function formatRelative(iso: string, now = Date.now()): string {
    const diffMs = now - new Date(iso).getTime();
    if (diffMs < 0) return "just now";
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
    const d = Math.floor(hr / 24);
    if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
    const mo = Math.floor(d / 30);
    if (mo < 12) return `${mo} month${mo === 1 ? "" : "s"} ago`;
    const y = Math.floor(d / 365);
    return `${y} year${y === 1 ? "" : "s"} ago`;
}

/** Normalize a blog URL — adds https:// if missing. Returns null if invalid. */
export function normalizeBlog(blog: string | null): string | null {
    if (!blog) return null;
    const trimmed = blog.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}

/** Stable color (hex) for a programming language — GitHub-ish palette subset. */
const LANGUAGE_COLORS: Record<string, string> = {
    Python: "#3572A5",
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Rust: "#dea584",
    Go: "#00ADD8",
    Java: "#b07219",
    Kotlin: "#A97BFF",
    Swift: "#F05138",
    "C++": "#f34b7d",
    C: "#555555",
    "C#": "#178600",
    Ruby: "#701516",
    PHP: "#4F5D95",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Dockerfile: "#384d54",
    Vue: "#41b883",
    Svelte: "#ff3e00",
    Markdown: "#083fa1",
    Lua: "#000080",
    Scala: "#c22d40",
    R: "#198CE7",
    Dart: "#00B4AB",
    Haskell: "#5e5086",
    Elixir: "#6e4a7e",
    Jupyter: "#DA5B0B",
    "Jupyter Notebook": "#DA5B0B",
};

export function languageColor(language: string | null | undefined): string {
    if (!language) return "#a1a1aa";
    return LANGUAGE_COLORS[language] ?? "#a1a1aa";
}
