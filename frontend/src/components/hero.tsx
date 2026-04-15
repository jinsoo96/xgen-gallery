import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden border-b border-[var(--color-line)]">
            <div className="absolute inset-0 bg-grid mask-fade-b opacity-60" />
            <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-28 md:pt-32 md:pb-36">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-3 py-1 font-mono text-[11px] text-[var(--color-ink-muted)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    8 libraries · live in your browser
                </div>

                <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-[var(--color-ink)] md:text-6xl lg:text-7xl">
                    The AI toolkit
                    <br />
                    behind{" "}
                    <span className="relative inline-block">
                        XGEN
                        <span className="absolute -bottom-1 left-0 right-0 h-[6px] bg-[var(--color-ink)]/10" />
                    </span>
                    .
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-ink-muted)]">
                    Eight open-source libraries powering the XGEN platform.
                    Install them with pip, or try every tool right here in your
                    browser.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-3">
                    <Link
                        href="/#tools"
                        className="group inline-flex items-center gap-2 rounded-md bg-[var(--color-ink)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-ink)]/90"
                    >
                        Browse tools
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                        href="https://github.com/PlateerLab"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                    >
                        View on GitHub
                    </Link>
                </div>
            </div>
        </section>
    );
}
