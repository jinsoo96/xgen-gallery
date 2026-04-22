import Link from "next/link";

function GithubIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.38-3.87-1.38-.52-1.32-1.28-1.67-1.28-1.67-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.77 2.7 1.26 3.36.97.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.3-.51-1.48.11-3.08 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.6.24 2.78.12 3.08.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.77 1.07.77 2.16v3.2c0 .32.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
    );
}

export function SiteNav() {
    return (
        <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-[15px] font-semibold tracking-tight"
                >
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--color-ink)] font-mono text-[11px] font-bold text-white">
                        P
                    </span>
                    PlateerLab
                </Link>

                <nav className="hidden items-center gap-7 text-sm text-[var(--color-ink-muted)] md:flex">
                    <Link
                        href="/#tools"
                        className="transition hover:text-[var(--color-ink)]"
                    >
                        Tools
                    </Link>
                    <Link
                        href="/#usecases"
                        className="transition hover:text-[var(--color-ink)]"
                    >
                        Use cases
                    </Link>
                    <Link
                        href="/releases"
                        className="transition hover:text-[var(--color-ink)]"
                    >
                        Releases
                    </Link>
                    <Link
                        href="https://github.com/PlateerLab"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition hover:text-[var(--color-ink)]"
                    >
                        GitHub
                    </Link>
                </nav>

                <Link
                    href="https://github.com/PlateerLab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] transition hover:border-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                >
                    <GithubIcon className="h-3.5 w-3.5" />
                    Star on GitHub
                </Link>
            </div>
        </header>
    );
}
