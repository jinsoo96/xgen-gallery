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

export interface GalleryProps {
  /** GitHub organization name */
  org: string;
  /** GitHub personal access token (optional, raises rate limit) */
  token?: string;
  /** Theme: dark or light */
  theme?: "dark" | "light";
  /** Max repos to show */
  limit?: number;
  /** Callback when a repo card is clicked */
  onRepoClick?: (repo: Repo) => void;
  /** Base URL for playground API server (e.g. "https://api.example.com") */
  apiBaseUrl?: string;
}

export interface DemoSnippet {
  label: string;
  code: string;
  expectedOutput?: string;
}
