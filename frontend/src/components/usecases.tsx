import { ArrowRight } from "lucide-react";

const USE_CASES = [
    {
        title: "RAG Pipeline",
        stack: ["Contextifier", "Doc2Chunk", "Knowtology"],
        description:
            "Ingest documents, chunk them intelligently, then retrieve with tree-shaped knowledge maps.",
    },
    {
        title: "Agent Runtime",
        stack: ["Mantis Engine", "Googer", "Toolint"],
        description:
            "Execute JSON workflows, call typed search tools, and lint your agent tool packages.",
    },
    {
        title: "Long-term Memory",
        stack: ["Synaptic Memory", "Knowtology"],
        description:
            "Brain-inspired knowledge graph plus hierarchical retrieval for agents that remember.",
    },
];

export function UseCases() {
    return (
        <section
            id="usecases"
            className="border-t border-[var(--color-line)] bg-[var(--color-surface-alt)]"
        >
            <div className="mx-auto max-w-6xl px-6 py-24">
                <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                    / build with these blocks
                </p>
                <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
                    Compose them into
                    <br />
                    <span className="text-[var(--color-ink-muted)]">
                        full AI pipelines.
                    </span>
                </h2>

                <div className="mt-12 grid gap-4 md:grid-cols-3">
                    {USE_CASES.map((uc) => (
                        <div
                            key={uc.title}
                            className="group flex flex-col rounded-xl border border-[var(--color-line)] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[var(--color-ink)]"
                        >
                            <h3 className="text-lg font-semibold tracking-tight">
                                {uc.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                                {uc.description}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-1.5">
                                {uc.stack.map((s) => (
                                    <span
                                        key={s}
                                        className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-2 py-1 font-mono text-[10px] text-[var(--color-ink-muted)]"
                                    >
                                        {s}
                                    </span>
                                ))}
                            </div>

                            <button className="mt-6 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-ink)] transition group-hover:gap-2">
                                See recipe
                                <ArrowRight className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
