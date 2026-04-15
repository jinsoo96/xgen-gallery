"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Pause, Play, Search } from "lucide-react";
import { TOOLS, type Tool } from "@/lib/tools";
import { cn } from "@/lib/cn";

const SLIDE_DURATION = 7000;

export function LivePreview() {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) return;
        const id = setInterval(
            () => setIndex((i) => (i + 1) % TOOLS.length),
            SLIDE_DURATION,
        );
        return () => clearInterval(id);
    }, [paused]);

    const tool = TOOLS[index];

    return (
        <section className="mx-auto max-w-6xl px-6 pt-12 pb-20">
            <div
                className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                <div className="grid min-h-[360px] grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
                    {/* Left: text */}
                    <motion.div
                        key={`text-${index}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="flex flex-col justify-between border-b border-[var(--color-line)] p-8 md:border-b-0 md:border-r md:p-10"
                    >
                        <div>
                            <div className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                                / {tool.category}
                            </div>
                            <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-[34px]">
                                {tool.name}
                            </h3>
                            <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
                                {tool.description}
                            </p>
                        </div>
                        <Link
                            href={`/tool/${tool.id}`}
                            className="group mt-8 inline-flex w-fit items-center gap-1.5 rounded-md bg-[var(--color-ink)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-ink)]/90"
                        >
                            Try this demo
                            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </Link>
                    </motion.div>

                    {/* Right: animation */}
                    <div
                        key={`viz-${index}`}
                        className="flex items-center justify-center bg-[var(--color-surface-alt)] p-8 md:p-12"
                    >
                        <div className="w-full max-w-md">
                            <Visual tool={tool} />
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between border-t border-[var(--color-line)] px-6 py-3">
                    <div className="flex items-center gap-1.5">
                        {TOOLS.map((t, i) => (
                            <button
                                key={t.id}
                                onClick={() => setIndex(i)}
                                aria-label={`Show ${t.name}`}
                                className={cn(
                                    "h-1 rounded-full transition-all",
                                    i === index
                                        ? "w-8 bg-[var(--color-ink)]"
                                        : "w-4 bg-[var(--color-line)] hover:bg-[var(--color-ink-subtle)]",
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[10px] text-[var(--color-ink-subtle)]">
                        <span>
                            {String(index + 1).padStart(2, "0")} /{" "}
                            {String(TOOLS.length).padStart(2, "0")}
                        </span>
                        <button
                            onClick={() => setPaused((p) => !p)}
                            className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-ink-muted)] transition hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
                            aria-label={paused ? "Play" : "Pause"}
                        >
                            {paused ? (
                                <Play className="h-2.5 w-2.5 fill-current" />
                            ) : (
                                <Pause className="h-2.5 w-2.5 fill-current" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ============================================================================
 *  Per-tool visuals — scripted animations that convey what each library does.
 *  Animations restart automatically on slide change via `key` on parent.
 * ========================================================================= */

function Visual({ tool }: { tool: Tool }) {
    switch (tool.id) {
        case "contextifier":
            return <ContextifierViz />;
        case "doc2chunk":
            return <Doc2ChunkViz />;
        case "f2a":
            return <F2aViz />;
        case "knowtology":
            return <KnowtologyViz />;
        case "synaptic-memory":
            return <SynapticViz />;
        case "mantis-engine":
            return <MantisViz />;
        case "googer":
            return <GoogerViz />;
        case "toolint":
            return <ToolintViz />;
        default:
            return null;
    }
}

const fadeIn = (delay = 0) => ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
});

/* ── Contextifier: file → parsed (text + table + image) ─────────────── */
function ContextifierViz() {
    return (
        <div className="space-y-3">
            {/* Source file */}
            <motion.div
                {...fadeIn(0)}
                className="flex items-center justify-between rounded-md border border-[var(--color-line)] bg-white px-3 py-2.5 font-mono text-[11px]"
            >
                <span className="flex items-center gap-2">
                    <span>📄</span>
                    <span className="text-[var(--color-ink)]">
                        q4_report.pdf
                    </span>
                </span>
                <span className="text-[var(--color-ink-subtle)]">2.1 MB</span>
            </motion.div>

            <motion.div
                {...fadeIn(0.35)}
                className="flex items-center gap-2 text-[10px] text-[var(--color-ink-subtle)]"
            >
                <span className="h-px flex-1 bg-[var(--color-line)]" />
                <span className="font-mono">parsed</span>
                <span className="h-px flex-1 bg-[var(--color-line)]" />
            </motion.div>

            {/* Text block */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.35 }}
                className="rounded-md border border-[var(--color-line)] bg-white p-3"
            >
                <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[var(--color-ink)]">
                        Q4 Revenue Highlights
                    </span>
                    <span className="rounded-sm bg-[var(--color-ink)] px-1.5 py-0.5 font-mono text-[8px] text-white">
                        TEXT
                    </span>
                </div>
                <p className="text-[10px] leading-relaxed text-[var(--color-ink-muted)]">
                    Enterprise adoption drove 23% YoY growth, led by expansion
                    in the US and EU markets.
                </p>
            </motion.div>

            {/* Table with merged cells */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.35 }}
                className="overflow-hidden rounded-md border border-[var(--color-line)] bg-white"
            >
                <div className="flex items-center justify-between border-b border-[var(--color-line)] px-3 py-1.5">
                    <span className="text-[10px] text-[var(--color-ink-subtle)]">
                        table · merged headers preserved
                    </span>
                    <span className="rounded-sm bg-[var(--color-ink)] px-1.5 py-0.5 font-mono text-[8px] text-white">
                        TABLE
                    </span>
                </div>
                <table className="w-full border-collapse text-[10px]">
                    <thead className="bg-[var(--color-surface-alt)] text-[var(--color-ink)]">
                        <tr>
                            <th
                                rowSpan={2}
                                className="border-b border-[var(--color-line)] px-2 py-1 text-left align-middle font-medium"
                            >
                                Region
                            </th>
                            <th
                                colSpan={2}
                                className="border-b border-l border-[var(--color-line)] px-2 py-1 text-center font-medium"
                            >
                                Revenue ($M)
                            </th>
                            <th
                                rowSpan={2}
                                className="border-b border-l border-[var(--color-line)] px-2 py-1 text-right align-middle font-medium"
                            >
                                Growth
                            </th>
                        </tr>
                        <tr>
                            <th className="border-b border-l border-[var(--color-line)] px-2 py-1 text-right font-medium text-[var(--color-ink-muted)]">
                                Q3
                            </th>
                            <th className="border-b border-l border-[var(--color-line)] px-2 py-1 text-right font-medium text-[var(--color-ink-muted)]">
                                Q4
                            </th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-[var(--color-ink-muted)]">
                        <tr>
                            <td className="px-2 py-1">US</td>
                            <td className="border-l border-[var(--color-line)] px-2 py-1 text-right">
                                1.2
                            </td>
                            <td className="border-l border-[var(--color-line)] px-2 py-1 text-right text-[var(--color-ink)]">
                                1.5
                            </td>
                            <td className="border-l border-[var(--color-line)] px-2 py-1 text-right text-emerald-600">
                                +25%
                            </td>
                        </tr>
                        <tr className="border-t border-[var(--color-line)]">
                            <td className="px-2 py-1">EU</td>
                            <td className="border-l border-[var(--color-line)] px-2 py-1 text-right">
                                0.8
                            </td>
                            <td className="border-l border-[var(--color-line)] px-2 py-1 text-right text-[var(--color-ink)]">
                                1.1
                            </td>
                            <td className="border-l border-[var(--color-line)] px-2 py-1 text-right text-emerald-600">
                                +37%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </motion.div>

            {/* Image */}
            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.15, duration: 0.35 }}
                className="flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-white p-3"
            >
                {/* SVG placeholder with bars resembling a chart */}
                <div className="flex h-10 w-14 shrink-0 items-end gap-0.5 rounded-sm border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-1">
                    {[50, 70, 40, 85, 60].map((h, i) => (
                        <div
                            key={i}
                            className="flex-1 rounded-t-[1px] bg-[var(--color-ink)]"
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <span className="truncate text-[11px] font-semibold text-[var(--color-ink)]">
                            figure-01.png
                        </span>
                        <span className="shrink-0 rounded-sm bg-[var(--color-ink)] px-1.5 py-0.5 font-mono text-[8px] text-white">
                            IMAGE
                        </span>
                    </div>
                    <div className="mt-0.5 font-mono text-[9px] text-[var(--color-ink-subtle)]">
                        extracted · 280 × 180
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/* ── Doc2Chunk: text → numbered chunks ────────────────────────────────── */
function Doc2ChunkViz() {
    const chunks = [
        "XGEN Platform Documentation · Overview — a next-generation AI platform for enterprises.",
        "Architecture · three layers: ingestion, processing pipeline, serving layer.",
        "API Reference · all endpoints require authentication via Bearer token.",
    ];
    return (
        <div className="space-y-2">
            {chunks.map((text, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.35 }}
                    className="flex gap-3 rounded-md border border-[var(--color-line)] bg-white p-3"
                >
                    <span className="w-6 shrink-0 font-mono text-[10px] text-[var(--color-ink-subtle)]">
                        #{i}
                    </span>
                    <span className="font-mono text-[11px] leading-relaxed text-[var(--color-ink)]">
                        {text}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}

/* ── f2a: bars growing + stats ────────────────────────────────────────── */
function F2aViz() {
    const heights = [40, 65, 35, 80, 55, 90, 60, 75, 50];
    return (
        <div className="space-y-4">
            <motion.div
                {...fadeIn(0)}
                className="flex items-center justify-between font-mono text-[10px] text-[var(--color-ink-subtle)]"
            >
                <span>sales_data.csv</span>
                <span>15 rows × 7 cols</span>
            </motion.div>

            <div className="flex h-32 items-end gap-1.5">
                {heights.map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{
                            delay: 0.3 + i * 0.05,
                            duration: 0.5,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex-1 rounded-t-sm bg-[var(--color-ink)]"
                    />
                ))}
            </div>

            <motion.div
                {...fadeIn(0.9)}
                className="flex gap-4 font-mono text-[10px] text-[var(--color-ink-muted)]"
            >
                <span>avg 29,500</span>
                <span className="text-[var(--color-ink-subtle)]">·</span>
                <span>std 15,200</span>
                <span className="text-[var(--color-ink-subtle)]">·</span>
                <span>missing 1</span>
            </motion.div>
        </div>
    );
}

/* ── Knowtology: tree building ────────────────────────────────────────── */
function KnowtologyViz() {
    const nodes = [
        "company_docs/",
        "├── refund_policy",
        "│   ├── 7 days only",
        "│   └── no opened items",
        "├── shipping",
        "│   ├── 2–3 days standard",
        "│   └── free over 50,000",
        "└── support",
        "    └── weekdays 9–18",
    ];
    return (
        <div className="font-mono text-[11px] leading-[1.7] text-[var(--color-ink)]">
            {nodes.map((n, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.12 }}
                >
                    {n}
                </motion.div>
            ))}
        </div>
    );
}

/* ── Synaptic Memory: graph with edges + nodes pulsing ────────────────── */
function SynapticViz() {
    const nodes = [
        { x: 40, y: 100, label: "refund", delay: 0.2 },
        { x: 150, y: 40, label: "policy", delay: 0.4 },
        { x: 150, y: 160, label: "order", delay: 0.6 },
        { x: 260, y: 100, label: "customer", delay: 0.8 },
    ];
    const edges = [
        { x1: 40, y1: 100, x2: 150, y2: 40, delay: 0.5 },
        { x1: 40, y1: 100, x2: 150, y2: 160, delay: 0.7 },
        { x1: 150, y1: 40, x2: 260, y2: 100, delay: 0.9 },
        { x1: 150, y1: 160, x2: 260, y2: 100, delay: 1.1 },
    ];

    return (
        <svg
            viewBox="0 0 300 200"
            className="h-48 w-full text-[var(--color-ink)]"
        >
            {edges.map((e, i) => (
                <motion.line
                    key={i}
                    x1={e.x1}
                    y1={e.y1}
                    x2={e.x2}
                    y2={e.y2}
                    stroke="currentColor"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.4 }}
                    transition={{ delay: e.delay, duration: 0.5 }}
                />
            ))}
            {nodes.map((n, i) => (
                <g key={i}>
                    <motion.circle
                        cx={n.x}
                        cy={n.y}
                        r="6"
                        fill="currentColor"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            delay: n.delay,
                            type: "spring",
                            stiffness: 300,
                        }}
                    />
                    <motion.text
                        x={n.x}
                        y={n.y - 12}
                        textAnchor="middle"
                        fontSize="10"
                        fontFamily="var(--font-mono)"
                        fill="currentColor"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: n.delay + 0.15 }}
                    >
                        {n.label}
                    </motion.text>
                </g>
            ))}
        </svg>
    );
}

/* ── Mantis: scripted terminal log ────────────────────────────────────── */
function MantisViz() {
    const events = [
        { text: "▸ workflow_start", time: "00:00.000", success: false },
        { text: "▸ node_start: agent", time: "00:00.012", success: false },
        { text: "▸ tool_call: calculator(42*17)", time: "00:00.523", success: false },
        { text: "▸ tool_result: 714", time: "00:00.892", success: false },
        { text: "▸ node_complete: agent", time: "00:01.102", success: false },
        { text: "✓ workflow_complete", time: "00:01.105", success: true },
    ];
    return (
        <div className="space-y-1 font-mono text-[11px]">
            {events.map((e, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.28 }}
                    className={cn(
                        "flex items-center justify-between gap-3",
                        e.success
                            ? "text-emerald-600"
                            : "text-[var(--color-ink-muted)]",
                    )}
                >
                    <span className="truncate">{e.text}</span>
                    <span className="shrink-0 text-[10px] text-[var(--color-ink-subtle)]">
                        {e.time}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}

/* ── Googer: search bar → results fade in ─────────────────────────────── */
function GoogerViz() {
    const results = [
        {
            title: "Machine Learning with Python — scikit-learn",
            body: "분류, 회귀, 클러스터링 예제 포함.",
        },
        {
            title: "TensorFlow 튜토리얼 — 초보자를 위한 ML",
            body: "딥러닝 기본부터 응용까지.",
        },
        {
            title: "PyTorch 공식 튜토리얼",
            body: "기초부터 고급 주제까지.",
        },
    ];
    return (
        <div className="space-y-2.5">
            <motion.div
                {...fadeIn(0)}
                className="flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-white px-3 py-2 font-mono text-[11px]"
            >
                <Search className="h-3 w-3 text-[var(--color-ink-subtle)]" />
                <span className="text-[var(--color-ink-muted)]">
                    python machine learning
                </span>
            </motion.div>
            {results.map((r, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.22 }}
                    className="rounded-md border border-[var(--color-line)] bg-white p-2.5"
                >
                    <div className="text-[11.5px] font-medium text-[var(--color-ink)]">
                        {r.title}
                    </div>
                    <div className="mt-0.5 text-[10px] text-[var(--color-ink-muted)]">
                        {r.body}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

/* ── Toolint: code with rule violation badges ─────────────────────────── */
function ToolintViz() {
    const lines = [
        { num: 1, code: "import requests", issue: "ATL101" },
        { num: 2, code: "import pandas as pd", issue: "ATL101" },
        { num: 3, code: "from my_tool.lib.core import process", issue: "ATL201" },
        { num: 4, code: "", issue: null },
        { num: 5, code: "def tool_fn(data: str) -> dict:", issue: null },
        { num: 6, code: "    return process(data)", issue: null },
    ];
    return (
        <div className="space-y-1">
            <div className="space-y-0.5 font-mono text-[11px]">
                {lines.map((l, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 + i * 0.1 }}
                        className="flex items-center gap-3"
                    >
                        <span className="w-4 text-right text-[10px] text-[var(--color-ink-subtle)]">
                            {l.num}
                        </span>
                        <span className="flex-1 text-[var(--color-ink)]">
                            {l.code || "\u00A0"}
                        </span>
                        {l.issue && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + i * 0.12 }}
                                className="rounded-sm bg-red-50 px-1.5 py-0.5 text-[9px] text-red-600"
                            >
                                {l.issue}
                            </motion.span>
                        )}
                    </motion.div>
                ))}
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="pt-2 font-mono text-[10px] text-red-600"
            >
                2 errors · 1 warning
            </motion.div>
        </div>
    );
}
