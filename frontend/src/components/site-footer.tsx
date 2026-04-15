import Link from "next/link";

export function SiteFooter() {
    return (
        <footer className="border-t border-[var(--color-line)] bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-[var(--color-ink)] font-mono text-[10px] font-bold text-white">
                        P
                    </span>
                    <span>© {new Date().getFullYear()} PlateerLab</span>
                </div>

                <nav className="flex flex-wrap items-center gap-6 text-sm text-[var(--color-ink-muted)]">
                    <Link
                        href="https://github.com/PlateerLab"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition hover:text-[var(--color-ink)]"
                    >
                        GitHub
                    </Link>
                    <Link
                        href="#tools"
                        className="transition hover:text-[var(--color-ink)]"
                    >
                        Tools
                    </Link>
                    <Link
                        href="#xgen"
                        className="transition hover:text-[var(--color-ink)]"
                    >
                        XGEN
                    </Link>
                    <Link
                        href="mailto:hello@plateerlab.com"
                        className="transition hover:text-[var(--color-ink)]"
                    >
                        Contact
                    </Link>
                </nav>
            </div>
        </footer>
    );
}
