export interface Repo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  fork: boolean;
  archived: boolean;
  updated_at: string;
  homepage: string | null;
}

export interface Member {
  login: string;
  avatar_url: string;
  html_url: string;
  name?: string | null;
  bio?: string | null;
  location?: string | null;
  public_repos?: number;
}

export interface PyPIInfo {
  name: string;
  version: string;
  summary: string;
  project_url: string;
  requires_python: string | null;
}

export const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Go: "#00ADD8",
  Shell: "#89e051",
};

// Known members with extended info (GitHub API doesn't expose org members without auth)
export const KNOWN_MEMBERS: Member[] = [
  {
    login: "CocoRoF",
    avatar_url: "https://github.com/CocoRoF.png",
    html_url: "https://github.com/CocoRoF",
    name: "장하렴 (Jang Haryeom)",
    bio: "Full-stack Developer @ Plateer Inc.",
    location: "Seoul, Korea",
  },
  {
    login: "haesookimDev",
    avatar_url: "https://github.com/haesookimDev.png",
    html_url: "https://github.com/haesookimDev",
    name: "김해수 (Haesoo Kim)",
    bio: "LLM Engineer",
  },
  {
    login: "SonAIengine",
    avatar_url: "https://github.com/SonAIengine.png",
    html_url: "https://github.com/SonAIengine",
    name: "손성준 (Son Seong Jun)",
    bio: "AI Engineer — Search, LLM, DevOps",
    location: "Seoul, Korea",
  },
  {
    login: "jinsoo96",
    avatar_url: "https://github.com/jinsoo96.png",
    html_url: "https://github.com/jinsoo96",
    name: "김진수 (Kim Jin Soo)",
    bio: "AI Engineer",
    location: "Seoul, Korea",
  },
  {
    login: "daunle",
    avatar_url: "https://github.com/daunle.png",
    html_url: "https://github.com/daunle",
    name: "daunle",
  },
  {
    login: "master0419",
    avatar_url: "https://github.com/master0419.png",
    html_url: "https://github.com/master0419",
    name: "master0419",
  },
  {
    login: "dlekdns08",
    avatar_url: "https://github.com/dlekdns08.png",
    html_url: "https://github.com/dlekdns08",
    name: "dlekdns08",
  },
  {
    login: "Createyouracccount",
    avatar_url: "https://github.com/Createyouracccount.png",
    html_url: "https://github.com/Createyouracccount",
    name: "Happy",
  },
  {
    login: "yunjaekim00",
    avatar_url: "https://github.com/yunjaekim00.png",
    html_url: "https://github.com/yunjaekim00",
    name: "김윤재 (Yun Jae Kim)",
    location: "Seoul, Korea",
  },
];

// Repos known to have PyPI packages
// Only packages confirmed to exist on PyPI
export const PYPI_PACKAGES: Record<string, string> = {
  "synaptic-memory": "synaptic-memory",
  "mantis-engine": "mantis-engine",
  Toolint: "toolint",
  googer: "googer",
  f2a: "f2a",
};
