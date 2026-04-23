import { languageColor } from "@/lib/members/format";
import type { MemberLanguage } from "@/lib/members/types";

export function MemberLanguageBar({
    languages,
    className,
}: {
    languages: MemberLanguage[];
    className?: string;
}) {
    if (!languages.length) return null;
    const total = languages.reduce((s, l) => s + l.count, 0);
    return (
        <div className={className}>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
                {languages.map((l) => (
                    <div
                        key={l.name}
                        style={{
                            width: `${(l.count / total) * 100}%`,
                            background: languageColor(l.name),
                        }}
                        title={`${l.name} · ${l.count}`}
                    />
                ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                {languages.map((l) => (
                    <div
                        key={l.name}
                        className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink-muted)]"
                    >
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: languageColor(l.name) }}
                        />
                        <span className="font-medium text-[var(--color-ink)]">
                            {l.name}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--color-ink-subtle)]">
                            {Math.round((l.count / total) * 100)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
