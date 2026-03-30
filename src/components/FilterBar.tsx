"use client";

interface FilterBarProps {
  languages: string[];
  selectedLanguage: string | null;
  onLanguageChange: (lang: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showForks: boolean;
  onShowForksChange: (show: boolean) => void;
}

export default function FilterBar({
  languages,
  selectedLanguage,
  onLanguageChange,
  searchQuery,
  onSearchChange,
  showForks,
  onShowForksChange,
}: FilterBarProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-3 p-4 rounded-xl mb-6"
      style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="var(--text-muted)"
        >
          <path d="M10.68 11.74a6 6 0 01-7.922-8.982 6 6 0 018.982 7.922l3.04 3.04a.749.749 0 01-.326 1.275.749.749 0 01-.734-.215l-3.04-3.04zM11.5 7a4.499 4.499 0 10-8.997 0A4.499 4.499 0 0011.5 7z" />
        </svg>
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-colors"
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Language filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => onLanguageChange(null)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: selectedLanguage === null ? "var(--accent)" : "transparent",
            color: selectedLanguage === null ? "#fff" : "var(--text-secondary)",
            border: `1px solid ${selectedLanguage === null ? "var(--accent)" : "var(--border)"}`,
          }}
        >
          All
        </button>
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: selectedLanguage === lang ? "var(--accent)" : "transparent",
              color: selectedLanguage === lang ? "#fff" : "var(--text-secondary)",
              border: `1px solid ${selectedLanguage === lang ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Fork toggle */}
      <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: "var(--text-secondary)" }}>
        <input
          type="checkbox"
          checked={showForks}
          onChange={(e) => onShowForksChange(e.target.checked)}
          className="accent-[var(--accent)]"
        />
        Include forks
      </label>
    </div>
  );
}
