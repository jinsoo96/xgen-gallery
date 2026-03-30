export const themes = {
  dark: {
    bg: "#0a0a0f",
    bgCard: "#12121a",
    bgCardHover: "#1a1a25",
    border: "#1e1e2e",
    text: "#e8e8f0",
    textSecondary: "#a0a0b8",
    textMuted: "#6b6b80",
    accent: "#6c63ff",
    accentLight: "#8b83ff",
    accentGlow: "rgba(108,99,255,0.15)",
    shadowHover: "0 0 20px rgba(108,99,255,0.2)",
    bgBadge: "rgba(108,99,255,0.15)",
    textBadge: "#a0a0b8",
  },
  light: {
    bg: "#f8fafc",
    bgCard: "#ffffff",
    bgCardHover: "#ffffff",
    border: "rgba(0,0,0,0.08)",
    text: "#1e293b",
    textSecondary: "#4b5563",
    textMuted: "#6b7280",
    accent: "#2563eb",
    accentLight: "#2563eb",
    accentGlow: "rgba(37,99,235,0.08)",
    shadowHover: "0 8px 20px rgba(0,0,0,0.08)",
    bgBadge: "#f1f5f9",
    textBadge: "#475569",
  },
};

export type Theme = {
  bg: string; bgCard: string; bgCardHover: string; border: string;
  text: string; textSecondary: string; textMuted: string;
  accent: string; accentLight: string; accentGlow: string;
  shadowHover: string; bgBadge: string; textBadge: string;
};

export const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Go: "#00ADD8",
  Shell: "#89e051",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
};
