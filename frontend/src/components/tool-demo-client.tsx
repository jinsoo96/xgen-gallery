"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Upload, X } from "lucide-react";
import { marked } from "marked";
import {
    getDemoManifest,
    type DemoManifest,
    type InputField,
    type OutputField,
} from "@plateerlab/xgen-gallery";
import type { Tool } from "@/lib/tools";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";
import { CopyCommand } from "./copy-command";

type ChunkViewMode = "raw" | "markdown" | "html";

const API_URL = process.env.NEXT_PUBLIC_GALLERY_API_URL || "http://localhost:8800";

const CATEGORY_LABEL: Record<Tool["category"], string> = {
    ingestion: "Ingestion",
    knowledge: "Knowledge",
    agent: "Agent",
    utility: "Utility",
};

export function ToolDemoClient({ tool }: { tool: Tool }) {
    const manifest = useMemo(() => getDemoManifest(tool.repo), [tool.repo]);

    if (!manifest) {
        return <NoManifest tool={tool} />;
    }

    return <DemoRunner tool={tool} manifest={manifest} />;
}

/* ------------------------------- No manifest -------------------------------- */

function NoManifest({ tool }: { tool: Tool }) {
    return (
        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
            <p className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                / demo unavailable
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                {tool.name}
            </h1>
            <p className="mt-4 text-[var(--color-ink-muted)]">
                An interactive demo hasn't been wired up for this tool yet.
                You can still install it or browse the source.
            </p>
            <div className="mt-8 flex justify-center gap-3">
                <Link
                    href={`https://github.com/PlateerLab/${tool.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-[var(--color-line)] bg-white px-4 py-2 text-[16px] font-medium transition hover:border-[var(--color-ink)]"
                >
                    Open on GitHub
                </Link>
            </div>
        </div>
    );
}

/* --------------------------------- Runner ---------------------------------- */

interface DemoState {
    inputValues: Record<string, unknown>;
    files: Record<string, File | null>;
    outputValues: Record<string, unknown> | null;
    isRunning: boolean;
    error: string | null;
    elapsedMs: number | null;
}

function DemoRunner({ tool, manifest }: { tool: Tool; manifest: DemoManifest }) {
    const initialState = useMemo<DemoState>(() => {
        const inputValues: Record<string, unknown> = {};
        const files: Record<string, File | null> = {};
        for (const inp of manifest.inputs) {
            if (inp.type === "file") {
                files[inp.key] = null;
            } else {
                inputValues[inp.key] = inp.default ?? "";
            }
        }
        return {
            inputValues,
            files,
            outputValues: null,
            isRunning: false,
            error: null,
            elapsedMs: null,
        };
    }, [manifest]);

    const [state, setState] = useState<DemoState>(initialState);

    const setInput = useCallback((key: string, value: unknown) => {
        setState((s) => ({ ...s, inputValues: { ...s.inputValues, [key]: value } }));
    }, []);

    const setFile = useCallback((key: string, file: File | null) => {
        setState((s) => ({ ...s, files: { ...s.files, [key]: file } }));
    }, []);

    const loadSample = useCallback(
        (idx: number) => {
            const sample = manifest.samples[idx];
            if (!sample) return;
            setState((s) => ({
                ...s,
                inputValues: { ...s.inputValues, ...sample.inputs },
                outputValues: sample.mockOutput ?? null,
                error: null,
                elapsedMs: null,
            }));
        },
        [manifest.samples],
    );

    const reset = useCallback(() => setState(initialState), [initialState]);

    const runDemo = useCallback(async () => {
        if (!manifest.apiEndpoint) {
            const sample = manifest.samples[0];
            if (sample?.mockOutput) {
                setState((s) => ({ ...s, outputValues: sample.mockOutput!, error: null }));
            } else {
                setState((s) => ({ ...s, error: "No API endpoint configured." }));
            }
            return;
        }

        setState((s) => ({ ...s, isRunning: true, error: null, outputValues: null, elapsedMs: null }));
        const started = performance.now();
        try {
            const hasFile = Object.values(state.files).some((f) => f !== null);
            let res: Response;
            const url = `${API_URL}${manifest.apiEndpoint}`;

            if (hasFile) {
                const fd = new FormData();
                for (const [k, v] of Object.entries(state.inputValues)) {
                    fd.append(k, String(v));
                }
                for (const [k, f] of Object.entries(state.files)) {
                    if (f) fd.append(k, f);
                }
                res = await fetch(url, { method: "POST", body: fd });
            } else {
                res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(state.inputValues),
                });
            }

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`${res.status} — ${errText.slice(0, 300)}`);
            }
            const data = await res.json();
            setState((s) => ({
                ...s,
                outputValues: data,
                isRunning: false,
                elapsedMs: performance.now() - started,
            }));
        } catch (err) {
            setState((s) => ({
                ...s,
                isRunning: false,
                error: err instanceof Error ? err.message : "Unknown error",
            }));
        }
    }, [manifest.apiEndpoint, manifest.samples, state.files, state.inputValues]);

    return (
        <main className="mx-auto max-w-6xl px-6 pt-8 pb-24">
            <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-[16px] text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to home
            </Link>

            {/* Header */}
            <header className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                            / {CATEGORY_LABEL[tool.category]}
                        </span>
                        {manifest.apiEndpoint && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-line)] px-2 py-0.5 font-mono text-[12px] text-[var(--color-ink-muted)]">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                live
                            </span>
                        )}
                    </div>
                    <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                        {tool.name}
                    </h1>
                    <p className="mt-3 max-w-2xl text-[18px] leading-relaxed text-[var(--color-ink-muted)]">
                        {manifest.description || tool.description}
                    </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 md:items-end">
                    <CopyCommand value={tool.install} />
                    <Link
                        href={`https://github.com/PlateerLab/${tool.repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-[14px] font-medium text-[var(--color-ink)] transition hover:border-[var(--color-ink)]"
                    >
                        View on GitHub
                    </Link>
                </div>
            </header>

            {/* Samples */}
            {manifest.samples.length > 0 && (
                <div className="mt-10 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                        samples
                    </span>
                    {manifest.samples.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => loadSample(i)}
                            className="rounded-full border border-[var(--color-line)] bg-white px-3 py-1 text-[14px] text-[var(--color-ink-muted)] transition hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
                        >
                            {s.label}
                        </button>
                    ))}
                    <button
                        onClick={reset}
                        className="ml-auto text-[14px] text-[var(--color-ink-subtle)] transition hover:text-[var(--color-ink)]"
                    >
                        Reset
                    </button>
                </div>
            )}

            {/* Main two-column */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                {/* Input panel */}
                <section className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[16px] font-semibold tracking-tight">Input</h2>
                        <span className="font-mono text-[12px] text-[var(--color-ink-subtle)]">
                            {manifest.inputs.length} field{manifest.inputs.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                    <div className="mt-5 space-y-5">
                        {manifest.inputs.map((field) => (
                            <InputRenderer
                                key={field.key}
                                field={field}
                                value={state.inputValues[field.key]}
                                file={state.files[field.key]}
                                onChange={(v) => setInput(field.key, v)}
                                onFileChange={(f) => setFile(field.key, f)}
                            />
                        ))}
                    </div>
                    <button
                        onClick={runDemo}
                        disabled={state.isRunning}
                        className={cn(
                            "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[16px] font-medium transition",
                            state.isRunning
                                ? "cursor-not-allowed bg-[var(--color-line)] text-[var(--color-ink-muted)]"
                                : "bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink)]/90",
                        )}
                    >
                        {state.isRunning ? (
                            <>
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-ink-muted)] border-t-transparent" />
                                Running…
                            </>
                        ) : (
                            <>
                                <Play className="h-3.5 w-3.5 fill-current" />
                                Run demo
                            </>
                        )}
                    </button>
                </section>

                {/* Output panel */}
                <section className="rounded-2xl border border-[var(--color-line)] bg-white p-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[16px] font-semibold tracking-tight">Output</h2>
                        {state.elapsedMs !== null && !state.error && (
                            <span className="font-mono text-[12px] text-[var(--color-ink-subtle)]">
                                {(state.elapsedMs / 1000).toFixed(2)}s
                            </span>
                        )}
                    </div>

                    <div className="mt-5">
                        {state.error ? (
                            <div className="rounded-md border border-red-200 bg-red-50 p-4 font-mono text-[14px] text-red-700">
                                {state.error}
                            </div>
                        ) : state.isRunning ? (
                            <div className="flex items-center gap-3 rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-4 font-mono text-[14px] text-[var(--color-ink-muted)]">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                POST {manifest.apiEndpoint}
                            </div>
                        ) : state.outputValues ? (
                            <OutputPanel
                                outputs={manifest.outputs}
                                values={state.outputValues}
                            />
                        ) : (
                            <div className="rounded-md border border-dashed border-[var(--color-line)] bg-[var(--color-surface-alt)] p-8 text-center text-[15px] text-[var(--color-ink-subtle)]">
                                Pick a sample above, or fill inputs and press Run demo.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

/* -------------------------------- Inputs ----------------------------------- */

function InputRenderer({
    field,
    value,
    file,
    onChange,
    onFileChange,
}: {
    field: InputField;
    value: unknown;
    file?: File | null;
    onChange: (v: unknown) => void;
    onFileChange: (f: File | null) => void;
}) {
    const label = (
        <label className="mb-1.5 block text-[14px] font-medium text-[var(--color-ink)]">
            {field.label}
            {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>
    );

    const inputClass =
        "w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-[15px] text-[var(--color-ink)] outline-none transition focus:border-[var(--color-ink)]";

    switch (field.type) {
        case "file":
            return (
                <div>
                    {label}
                    <FileDrop
                        accept={field.accept}
                        file={file ?? null}
                        onFileChange={onFileChange}
                    />
                </div>
            );

        case "text":
            return (
                <div>
                    {label}
                    <input
                        type="text"
                        value={String(value ?? "")}
                        placeholder={field.placeholder}
                        onChange={(e) => onChange(e.target.value)}
                        className={inputClass}
                    />
                </div>
            );

        case "textarea":
            return (
                <div>
                    {label}
                    <textarea
                        value={String(value ?? "")}
                        placeholder={field.placeholder}
                        onChange={(e) => onChange(e.target.value)}
                        rows={5}
                        className={`${inputClass} resize-y font-mono text-[14px] leading-relaxed`}
                    />
                </div>
            );

        case "select":
            return (
                <div>
                    {label}
                    <select
                        value={String(value ?? "")}
                        onChange={(e) => onChange(e.target.value)}
                        className={inputClass}
                    >
                        {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            );

        case "number":
            return (
                <div>
                    {label}
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            value={Number(value ?? field.default ?? 0)}
                            onChange={(e) => onChange(Number(e.target.value))}
                            className="flex-1 accent-[var(--color-ink)]"
                        />
                        <span className="min-w-[60px] text-right font-mono text-[14px] text-[var(--color-ink)]">
                            {String(value ?? field.default ?? 0)}
                        </span>
                    </div>
                </div>
            );

        case "toggle":
            return (
                <div>
                    {label}
                    <button
                        onClick={() => onChange(!value)}
                        className={cn(
                            "rounded-md border px-4 py-1.5 text-[14px] font-medium transition",
                            value
                                ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                                : "border-[var(--color-line)] bg-white text-[var(--color-ink-muted)] hover:border-[var(--color-ink)]",
                        )}
                    >
                        {value ? "ON" : "OFF"}
                    </button>
                </div>
            );

        default:
            return null;
    }
}

function FileDrop({
    accept,
    file,
    onFileChange,
}: {
    accept?: string;
    file: File | null;
    onFileChange: (f: File | null) => void;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    return (
        <div
            onClick={() => ref.current?.click()}
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) onFileChange(f);
            }}
            className={cn(
                "cursor-pointer rounded-md border-2 border-dashed p-5 text-center transition",
                dragOver
                    ? "border-[var(--color-ink)] bg-[var(--color-surface-hover)]"
                    : "border-[var(--color-line)] bg-[var(--color-surface-alt)]",
            )}
        >
            <input
                ref={ref}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
            {file ? (
                <div className="flex items-center justify-between gap-3 text-left">
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] text-[var(--color-ink)]">
                            {file.name}
                        </div>
                        <div className="font-mono text-[13px] text-[var(--color-ink-subtle)]">
                            {formatBytes(file.size)}
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onFileChange(null);
                        }}
                        className="rounded-md p-1 text-[var(--color-ink-subtle)] transition hover:text-[var(--color-ink)]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div>
                    <Upload className="mx-auto h-5 w-5 text-[var(--color-ink-subtle)]" />
                    <div className="mt-2 text-[15px] text-[var(--color-ink-muted)]">
                        Click or drag a file
                    </div>
                    {accept && (
                        <div
                            className="mt-1 truncate font-mono text-[12px] text-[var(--color-ink-subtle)]"
                            title={accept}
                        >
                            {accept}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* -------------------------------- Outputs ---------------------------------- */

function OutputPanel({
    outputs,
    values,
}: {
    outputs: OutputField[];
    values: Record<string, unknown>;
}) {
    return (
        <div className="space-y-5">
            {outputs.map((field) => {
                const v = values[field.key];
                if (v === undefined || v === null) return null;
                return (
                    <div key={field.key}>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-[14px] font-medium text-[var(--color-ink)]">
                                {field.label}
                            </span>
                            <span className="font-mono text-[12px] text-[var(--color-ink-subtle)]">
                                {field.type}
                            </span>
                        </div>
                        <OutputRenderer field={field} value={v} />
                    </div>
                );
            })}
        </div>
    );
}

function OutputRenderer({ field, value }: { field: OutputField; value: unknown }) {
    switch (field.type) {
        case "text":
            return (
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-3 font-mono text-[14px] leading-relaxed text-[var(--color-ink)]">
                    {typeof value === "string" ? value : String(value)}
                </pre>
            );

        case "json":
            return (
                <pre className="max-h-80 overflow-auto rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-3 font-mono text-[13.5px] leading-relaxed text-[var(--color-ink)]">
                    {JSON.stringify(value, null, 2)}
                </pre>
            );

        case "chunks":
            return <ChunkList value={value} />;

        case "search-results":
            return <SearchResults value={value} />;

        case "tree":
            return (
                <pre className="max-h-80 overflow-auto rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-3 font-mono text-[13.5px] leading-relaxed text-[var(--color-ink)]">
                    {JSON.stringify(value, null, 2)}
                </pre>
            );

        case "table":
            return <TableView value={value} />;

        case "html":
            return (
                <div className="max-h-96 overflow-auto rounded-md border border-[var(--color-line)] bg-white p-3 text-[15px]">
                    {typeof value === "string" ? (
                        <div dangerouslySetInnerHTML={{ __html: value }} />
                    ) : (
                        <pre className="font-mono text-[13.5px]">
                            {JSON.stringify(value, null, 2)}
                        </pre>
                    )}
                </div>
            );

        default:
            return (
                <pre className="max-h-80 overflow-auto rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-3 font-mono text-[13.5px] text-[var(--color-ink)]">
                    {JSON.stringify(value, null, 2)}
                </pre>
            );
    }
}

function ChunkList({ value }: { value: unknown }) {
    const [mode, setMode] = useState<ChunkViewMode>("raw");

    if (!Array.isArray(value)) {
        return (
            <pre className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-3 font-mono text-[13.5px]">
                {JSON.stringify(value, null, 2)}
            </pre>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                {(["raw", "markdown", "html"] as const).map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={cn(
                            "rounded-sm border px-2 py-0.5 font-mono text-[12px] uppercase tracking-wide transition",
                            mode === m
                                ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                                : "border-[var(--color-line)] bg-white text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]",
                        )}
                    >
                        {m}
                    </button>
                ))}
            </div>

            <div className="max-h-96 space-y-2 overflow-auto">
                {value.map((c, i) => {
                    const obj = (c as Record<string, unknown>) ?? {};
                    const text = String(
                        obj.text ?? obj.content ?? JSON.stringify(obj),
                    );
                    return (
                        <div
                            key={i}
                            className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-3"
                        >
                            <div className="mb-1.5 font-mono text-[12px] text-[var(--color-ink-subtle)]">
                                #{i}
                            </div>
                            <ChunkBody text={text} mode={mode} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ChunkBody({ text, mode }: { text: string; mode: ChunkViewMode }) {
    if (mode === "raw") {
        return (
            <div className="whitespace-pre-wrap font-mono text-[13.5px] leading-relaxed text-[var(--color-ink)]">
                {text}
            </div>
        );
    }

    const html =
        mode === "markdown"
            ? (marked.parse(text, { async: false }) as string)
            : text;

    return (
        <div
            className="chunk-rendered text-[15px] leading-relaxed text-[var(--color-ink)]"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function SearchResults({ value }: { value: unknown }) {
    if (!Array.isArray(value)) {
        return (
            <pre className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-3 font-mono text-[13.5px]">
                {JSON.stringify(value, null, 2)}
            </pre>
        );
    }
    return (
        <div className="max-h-96 space-y-3 overflow-auto">
            {value.map((r, i) => {
                const obj = (r as Record<string, unknown>) ?? {};
                return (
                    <div
                        key={i}
                        className="rounded-md border border-[var(--color-line)] bg-white p-3"
                    >
                        <div className="text-[15px] font-medium text-[var(--color-ink)]">
                            {String(obj.title ?? `Result ${i + 1}`)}
                        </div>
                        {obj.href || obj.url ? (
                            <div className="mt-0.5 truncate font-mono text-[12px] text-[var(--color-ink-subtle)]">
                                {String(obj.href ?? obj.url)}
                            </div>
                        ) : null}
                        {obj.body ? (
                            <div className="mt-1.5 text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
                                {String(obj.body)}
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

function TableView({ value }: { value: unknown }) {
    const obj = value as { columns?: string[]; rows?: unknown[][] } | undefined;
    if (!obj?.columns || !Array.isArray(obj.rows)) {
        return (
            <pre className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-3 font-mono text-[13.5px]">
                {JSON.stringify(value, null, 2)}
            </pre>
        );
    }
    return (
        <div className="max-h-96 overflow-auto rounded-md border border-[var(--color-line)]">
            <table className="w-full border-collapse text-[14px]">
                <thead className="bg-[var(--color-surface-alt)]">
                    <tr>
                        {obj.columns.map((c, i) => (
                            <th
                                key={i}
                                className="border-b border-[var(--color-line)] px-3 py-2 text-left font-medium text-[var(--color-ink)]"
                            >
                                {c}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {obj.rows.map((row, ri) => (
                        <tr key={ri}>
                            {row.map((cell, ci) => (
                                <td
                                    key={ci}
                                    className="border-b border-[var(--color-line)] px-3 py-2 font-mono text-[13px] text-[var(--color-ink-muted)]"
                                >
                                    {String(cell)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
