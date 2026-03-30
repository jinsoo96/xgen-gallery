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
  },
  light: {
    bg: "#f8f9fa",
    bgCard: "#ffffff",
    bgCardHover: "#f0f0f5",
    border: "#e0e0e8",
    text: "#1a1a2e",
    textSecondary: "#4a4a5a",
    textMuted: "#8a8a9a",
    accent: "#5b52e0",
    accentLight: "#5b52e0",
    accentGlow: "rgba(91,82,224,0.1)",
  },
};

export type Theme = {
  bg: string; bgCard: string; bgCardHover: string; border: string;
  text: string; textSecondary: string; textMuted: string;
  accent: string; accentLight: string; accentGlow: string;
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
