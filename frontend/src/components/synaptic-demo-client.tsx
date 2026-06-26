"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Eraser,
    FileText,
    FileUp,
    Loader2,
    MessageSquare,
    Search as SearchIcon,
    Sparkles,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import type { Tool } from "@/lib/tools";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";
import { SynapticGraph, type GraphEdge, type GraphNode } from "./synaptic-graph";
import { CopyCommand } from "./copy-command";
import {
    NodeDetailPanel,
    type ExploreContext,
} from "./node-detail-panel";

const API_URL =
    process.env.NEXT_PUBLIC_GALLERY_API_URL || "http://localhost:8800";
const MCP_BASE = `${API_URL}/api/mcp/synaptic-memory`;

/* ----------------------------- types -------------------------------- */

interface Stats {
    total_nodes?: number;
    cache_hit_rate?: number;
    cache_size?: number;
    [key: string]: unknown;
}

interface SearchHit {
    id: string;
    title: string;
    content?: string;
    score?: number;
}

interface SearchResponse {
    success?: boolean;
    results?: SearchHit[];
    total_candidates?: number;
    search_time_ms?: number;
    stages_used?: string[];
    message?: string;
}

interface AskSource {
    id: string;
    title: string;
    score: number;
    content?: string;
}

interface AskResponse {
    answer: string;
    sources: AskSource[];
    model: string;
    is_overview?: boolean;
}

type InteractionMode = "search" | "ask";

interface DocumentRecord {
    source: string;
    title: string;
    chunkCount: number;
    addedAt: number;
}

// Deterministic palette for source coloring (order of insertion into Map)
const SOURCE_PALETTE = [
    "#0a0a0a", // ink
    "#2563eb", // blue
    "#059669", // emerald
    "#dc2626", // red
    "#ea580c", // orange
    "#7c3aed", // violet
    "#0891b2", // cyan
    "#ca8a04", // yellow-dark
];

interface AddDocResult {
    success: boolean;
    title: string;
    chunks: number;
    first_node_id: string;
}

interface IngestSummary {
    title: string;
    chunks: number;
    elapsedMs: number;
}

/** Rough chunk count estimate based on content length + configured size.
 *  The real count is determined server-side by Synaptic's chunker, but
 *  this gives the UI something to show while the request is in flight. */
function estimateChunks(content: string, chunkSize: number): number {
    if (!content) return 0;
    return Math.max(1, Math.ceil(content.length / Math.max(100, chunkSize)));
}

interface ContextifierResult {
    text?: string;
    chunks?: { text?: string }[];
    metadata?: Record<string, unknown>;
}

const TEXT_EXTENSIONS = new Set([
    "txt",
    "md",
    "markdown",
    "rst",
    "json",
    "csv",
    "tsv",
    "html",
    "htm",
    "log",
]);

const CONTEXTIFIER_ENDPOINT = `${API_URL}/api/demo/contextifier/run`;

const ACCEPT_EXTENSIONS =
    ".txt,.md,.markdown,.rst,.json,.csv,.tsv,.html,.htm,.log," +
    ".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.hwp,.hwpx,.rtf,.odt,.epub";

/** Fast set of accepted file extensions (lowercase, no leading dot). */
const ACCEPTED_EXTENSION_SET: ReadonlySet<string> = new Set(
    ACCEPT_EXTENSIONS.split(",").map((e) =>
        e.trim().replace(/^\./, "").toLowerCase(),
    ),
);

function isAcceptedFile(filename: string): boolean {
    if (!filename || filename.startsWith(".")) return false; // skip hidden files
    const ext = filename.split(".").pop()?.toLowerCase();
    return !!ext && ACCEPTED_EXTENSION_SET.has(ext);
}

/** Recursively walk a FileSystemEntry (produced by
 *  `DataTransferItem.webkitGetAsEntry()`) and collect every File inside. */
async function walkFileSystemEntry(
    entry: FileSystemEntry,
    out: File[],
): Promise<void> {
    if (entry.isFile) {
        const file = await new Promise<File>((resolve, reject) => {
            (entry as FileSystemFileEntry).file(resolve, reject);
        });
        out.push(file);
    } else if (entry.isDirectory) {
        const reader = (entry as FileSystemDirectoryEntry).createReader();
        // readEntries() returns entries in batches — keep reading until empty.
        const readBatch = (): Promise<FileSystemEntry[]> =>
            new Promise((resolve, reject) =>
                reader.readEntries(resolve, reject),
            );
        let batch: FileSystemEntry[];
        do {
            batch = await readBatch();
            for (const child of batch) {
                await walkFileSystemEntry(child, out);
            }
        } while (batch.length > 0);
    }
}

async function extractViaContextifier(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("mode", "extract");
    fd.append("chunk_size", "2000");

    const res = await fetch(CONTEXTIFIER_ENDPOINT, {
        method: "POST",
        body: fd,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(
            `Contextifier failed (${res.status}): ${text.slice(0, 200)}`,
        );
    }
    const data: ContextifierResult = await res.json();

    if (typeof data.text === "string" && data.text.trim().length > 0) {
        return data.text;
    }
    if (Array.isArray(data.chunks) && data.chunks.length > 0) {
        return data.chunks
            .map((c) => c.text ?? "")
            .filter(Boolean)
            .join("\n\n");
    }
    throw new Error("Contextifier returned empty text");
}

/* ---------------------------- sample data ---------------------------- */

const SAMPLE_DOC = {
    title: "XGEN Platform Guide",
    content: `# XGEN 2.0 Platform Guide

## Overview
XGEN is a next-generation enterprise AI platform. It provides document processing, knowledge graphs, and agent runtimes as an integrated suite.

## Architecture
The platform consists of three layers. The ingestion layer converts documents into AI-ready text. The knowledge layer maintains long-term memory via TreeRAG and synaptic graphs. The agent layer executes workflows.

## Refund Policy
Refunds are available within 7 days of purchase. Opened products cannot be refunded. Refund processing takes 3 to 5 business days.

## Shipping Policy
Standard shipping 2-3 days. Remote areas 5-7 days. Free shipping for orders over 50,000 KRW.

## Customer Support
Weekdays 09:00-18:00. Chat, phone, and email support. Weekend inquiries are processed on the next business day.

## Security
All endpoints require Bearer token authentication. Rate limits apply per organization. On-premises deployment is available.`,
};

/* -------------------------- MCP call helper --------------------------- */

async function callTool<T = unknown>(
    tool: string,
    args: Record<string, unknown>,
): Promise<T> {
    const res = await fetch(`${MCP_BASE}/call/${tool}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status} — ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    if (data.is_error) {
        const first = data.content?.[0];
        throw new Error(first?.text || "tool call failed");
    }
    const first = data.content?.[0];
    if (first?.type === "text" && typeof first.text === "string") {
        try {
            return JSON.parse(first.text) as T;
        } catch {
            return first.text as unknown as T;
        }
    }
    return data as T;
}

async function fetchGraph(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    interface RawNode {
        id: string;
        title: string;
        kind?: string;
        content?: string;
        level?: string;
        vitality?: number;
        source?: string;
    }
    interface RawEdge {
        id?: string;
        source_id?: string;
        target_id?: string;
        kind?: string;
        weight?: number;
    }
    type ExportResult =
        | { nodes: RawNode[]; edges: RawEdge[] }
        | { content: string; format: string };

    const result = await callTool<ExportResult>("knowledge_export", {
        output_format: "json",
    });

    let inner: { nodes: RawNode[]; edges: RawEdge[] };
    if ("content" in result && typeof result.content === "string") {
        inner = JSON.parse(result.content);
    } else {
        inner = result as { nodes: RawNode[]; edges: RawEdge[] };
    }

    const nodes: GraphNode[] = (inner.nodes || []).map((n) => ({
        id: n.id,
        title: n.title,
        kind: n.kind,
        content: n.content,
        level: n.level,
        vitality: n.vitality,
        source: n.source || undefined,
    }));
    const edges: GraphEdge[] = (inner.edges || []).map((e) => ({
        source: e.source_id ?? "",
        target: e.target_id ?? "",
        kind: e.kind,
        weight: e.weight,
    }));

    return { nodes, edges };
}

function randomSourceId(): string {
    return `doc_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** Structural equality for the graph snapshots returned by fetchGraph.
 *  Same-length + same ordered ids is a cheap proxy for "graph unchanged"
 *  — if contents mutated under an unchanged id set the UI can still
 *  re-render on its own derived state (we don't need exact deep equality). */
function sameGraphNodes(a: GraphNode[], b: GraphNode[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i].id !== b[i].id) return false;
    }
    return true;
}

function sameGraphEdges(a: GraphEdge[], b: GraphEdge[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (
            a[i].source !== b[i].source ||
            a[i].target !== b[i].target ||
            a[i].kind !== b[i].kind
        )
            return false;
    }
    return true;
}

function sameStats(a: Stats | null, b: Stats | null): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (ka.length !== kb.length) return false;
    for (let i = 0; i < ka.length; i++) {
        if (ka[i] !== kb[i]) return false;
        if ((a as Record<string, unknown>)[ka[i]] !== (b as Record<string, unknown>)[kb[i]])
            return false;
    }
    return true;
}

/** Strip the "[n/m]" chunk suffix that knowledge_add_document appends so
 *  we can recover a clean document title from any chunk node. */
function extractDocTitle(nodeTitle: string | undefined): string {
    if (!nodeTitle) return "(untitled)";
    return nodeTitle.replace(/\s*\[\d+\/\d+\]\s*$/, "").trim() || "(untitled)";
}

/* =================================================================== */
/*                              Main                                    */
/* =================================================================== */

export function SynapticDemoClient({ tool }: { tool: Tool }) {
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [edges, setEdges] = useState<GraphEdge[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    // source → DocumentRecord. Map preserves insertion order for palette indexing.
    const [documents, setDocuments] = useState<Map<string, DocumentRecord>>(
        () => new Map(),
    );

    const [docTitle, setDocTitle] = useState(SAMPLE_DOC.title);
    const [docContent, setDocContent] = useState("");
    const [chunkSize, setChunkSize] = useState(300);
    const [ingesting, setIngesting] = useState(false);
    const [ingestError, setIngestError] = useState<string | null>(null);
    const [lastIngest, setLastIngest] = useState<IngestSummary | null>(null);
    // Ingest start timestamp (null when not running). The live ticking
    // counter UI lives inside <ElapsedCounter> so its 100ms setState
    // doesn't cascade through this entire component.
    const [ingestStartedAt, setIngestStartedAt] = useState<number | null>(null);

    const [mode, setMode] = useState<InteractionMode>("search");
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchResponse, setSearchResponse] =
        useState<SearchResponse | null>(null);
    const [lastQuery, setLastQuery] = useState("");

    const [asking, setAsking] = useState(false);
    const [askError, setAskError] = useState<string | null>(null);
    const [askResponse, setAskResponse] = useState<AskResponse | null>(null);

    // Explore state. The earlier k-hop navigation (breadcrumb + back)
    // was removed when we dropped the neighbor list from NodeDetailPanel;
    // users now explore by clicking nodes directly in the graph.
    const [exploreContext, setExploreContext] = useState<ExploreContext | null>(
        null,
    );
    const [exploreLoading, setExploreLoading] = useState(false);
    const [exploreError, setExploreError] = useState<string | null>(null);
    const [reinforcing, setReinforcing] = useState(false);

    const [resetting, setResetting] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [sourceInfo, setSourceInfo] = useState<string | null>(null);
    const [batchProgress, setBatchProgress] = useState<{
        current: number;
        total: number;
        label: string;
    } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const graphSectionRef = useRef<HTMLElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const mountedRef = useRef(false);

    const refreshGraphAndStats = useCallback(async () => {
        try {
            const [g, s] = await Promise.all([
                fetchGraph(),
                callTool<Stats>("knowledge_stats", {}),
            ]);
            // Short-circuit identity updates when the fetched graph is
            // equivalent to the one already in state. React compares by
            // reference, so naive setNodes(g.nodes) always triggers a
            // re-render even when nothing changed — which in turn
            // restarts the d3-force simulation and causes visual jitter.
            setNodes((prev) =>
                sameGraphNodes(prev, g.nodes) ? prev : g.nodes,
            );
            setEdges((prev) =>
                sameGraphEdges(prev, g.edges) ? prev : g.edges,
            );
            setStats((prev) => (sameStats(prev, s) ? prev : s));

            // Sync documents state with the graph:
            //   1. Drop entries whose source no longer has any nodes.
            //   2. Update chunk counts for existing entries.
            //   3. Auto-add entries for sources found in the graph that
            //      aren't registered yet (e.g. nodes left over from a
            //      previous session where the user didn't go through
            //      handleIngest).
            setDocuments((prev) => {
                const counts = new Map<string, number>();
                const derivedTitles = new Map<string, string>();
                for (const n of g.nodes) {
                    if (!n.source) continue;
                    if ((n.kind ?? "").toLowerCase() !== "chunk") continue;
                    counts.set(n.source, (counts.get(n.source) ?? 0) + 1);
                    if (!derivedTitles.has(n.source)) {
                        derivedTitles.set(n.source, extractDocTitle(n.title));
                    }
                }

                // Detect no-op: same keys + same counts ⇒ keep old Map
                // reference so useMemo consumers don't invalidate.
                let changed = prev.size !== counts.size;
                if (!changed) {
                    for (const [src, count] of counts.entries()) {
                        const existing = prev.get(src);
                        if (!existing || existing.chunkCount !== count) {
                            changed = true;
                            break;
                        }
                    }
                }
                if (!changed) return prev;

                const next = new Map(prev);
                for (const key of Array.from(next.keys())) {
                    if (!counts.has(key)) next.delete(key);
                }
                for (const [src, count] of counts.entries()) {
                    const existing = next.get(src);
                    if (existing) {
                        next.set(src, { ...existing, chunkCount: count });
                    } else {
                        next.set(src, {
                            source: src,
                            title: derivedTitles.get(src) ?? src,
                            chunkCount: count,
                            addedAt: Date.now(),
                        });
                    }
                }
                return next;
            });
        } catch (e) {
            console.warn("refresh failed:", e);
        }
    }, []);

    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;
        refreshGraphAndStats();
    }, [refreshGraphAndStats]);

    /* --------------------------- file upload ------------------------ */

    /** Extract plain text from a single File. Text formats are read
     *  directly in the browser; binary formats round-trip through the
     *  Contextifier backend which normalises 80+ formats. */
    const extractTextFromFile = useCallback(
        async (file: File): Promise<string> => {
            const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
            if (TEXT_EXTENSIONS.has(ext)) {
                return await file.text();
            }
            return await extractViaContextifier(file);
        },
        [],
    );

    /** Low-level ingest that bypasses the staging UI state. Used for
     *  batch uploads where each file becomes its own document without
     *  needing user-facing title/chunk-size tweaks. */
    const ingestOne = useCallback(
        async (title: string, content: string): Promise<AddDocResult> => {
            const sourceId = randomSourceId();
            const result = await callTool<AddDocResult>(
                "knowledge_add_document",
                {
                    title,
                    content,
                    chunk_size: chunkSize,
                    chunk_overlap: Math.floor(chunkSize * 0.2),
                    tags: "",
                    source: sourceId,
                },
            );
            setDocuments((prev) => {
                const next = new Map(prev);
                next.set(sourceId, {
                    source: sourceId,
                    title,
                    chunkCount: result.chunks,
                    addedAt: Date.now(),
                });
                return next;
            });
            return result;
        },
        [chunkSize],
    );

    /** Read a single file into the staging UI — used when exactly one
     *  file is selected so the user can tweak title/chunk size before
     *  pressing Ingest. */
    const loadFileIntoStaging = useCallback(
        async (file: File) => {
            setIngestError(null);
            const base = file.name.replace(/\.[^.]+$/, "");
            setDocTitle(base);

            const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
            if (TEXT_EXTENSIONS.has(ext)) {
                try {
                    const text = await file.text();
                    setDocContent(text);
                    setSourceInfo(
                        `${file.name} · ${formatBytes(file.size)} · read locally`,
                    );
                } catch (e) {
                    setIngestError(
                        e instanceof Error ? e.message : "failed to read file",
                    );
                }
                return;
            }

            // Binary format → Contextifier
            setExtracting(true);
            setDocContent("");
            setSourceInfo(
                `${file.name} · ${formatBytes(file.size)} · extracting via Contextifier…`,
            );
            try {
                const text = await extractViaContextifier(file);
                setDocContent(text);
                setSourceInfo(
                    `${file.name} · ${formatBytes(file.size)} · parsed by Contextifier (${text.length.toLocaleString()} chars)`,
                );
            } catch (e) {
                setIngestError(
                    e instanceof Error ? e.message : "extraction failed",
                );
                setSourceInfo(null);
            } finally {
                setExtracting(false);
            }
        },
        [],
    );

    /** Ingest multiple files sequentially. Skips staging entirely:
     *  each file becomes a document with its filename as title. */
    const batchIngestFiles = useCallback(
        async (files: File[]) => {
            setIngestError(null);
            setSearchResponse(null);
            setAskResponse(null);
            setLastQuery("");
            setDocContent("");
            setSourceInfo(null);
            setLastIngest(null);

            const started = Date.now();
            setIngestStartedAt(started);

            let totalChunks = 0;
            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                const base = f.name.replace(/\.[^.]+$/, "");
                setBatchProgress({
                    current: i + 1,
                    total: files.length,
                    label: `extracting ${f.name}`,
                });
                try {
                    const text = await extractTextFromFile(f);
                    if (!text.trim()) {
                        throw new Error("empty content");
                    }
                    setBatchProgress({
                        current: i + 1,
                        total: files.length,
                        label: `embedding ~${estimateChunks(text, chunkSize)} chunks · ${f.name}`,
                    });
                    const r = await ingestOne(base, text);
                    totalChunks += r.chunks;
                } catch (e) {
                    console.warn(`failed to ingest ${f.name}:`, e);
                    setIngestError(
                        `${f.name}: ${e instanceof Error ? e.message : "failed"}`,
                    );
                }
            }

            setBatchProgress(null);
            setIngestStartedAt(null);
            setLastIngest({
                title: `${files.length} file${files.length === 1 ? "" : "s"}`,
                chunks: totalChunks,
                elapsedMs: Date.now() - started,
            });
            await refreshGraphAndStats();
        },
        [extractTextFromFile, ingestOne, refreshGraphAndStats, chunkSize],
    );

    /** Dispatch: 1 file → staging (user can tweak title/chunk size),
     *  N files → batch ingest directly. */
    const handleFilesSelected = useCallback(
        (files: File[]) => {
            if (files.length === 0) return;
            if (files.length === 1) {
                loadFileIntoStaging(files[0]);
            } else {
                batchIngestFiles(files);
            }
        },
        [loadFileIntoStaging, batchIngestFiles],
    );

    const onDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);

            const items = e.dataTransfer.items;
            const supportsEntryApi =
                items &&
                items.length > 0 &&
                typeof items[0].webkitGetAsEntry === "function";

            if (!supportsEntryApi) {
                // Legacy fallback: plain files only, no folder support.
                const files = Array.from(e.dataTransfer.files).filter((f) =>
                    isAcceptedFile(f.name),
                );
                handleFilesSelected(files);
                return;
            }

            // Modern path: support both loose files AND dropped folders.
            const entries: FileSystemEntry[] = [];
            for (let i = 0; i < items.length; i++) {
                const entry = items[i].webkitGetAsEntry?.();
                if (entry) entries.push(entry);
            }
            const collected: File[] = [];
            try {
                for (const entry of entries) {
                    await walkFileSystemEntry(entry, collected);
                }
            } catch (err) {
                console.warn("folder walk failed:", err);
            }
            const accepted = collected.filter((f) => isAcceptedFile(f.name));
            if (accepted.length === 0 && collected.length > 0) {
                setIngestError(
                    `Dropped ${collected.length} file(s) but none matched supported formats.`,
                );
                return;
            }
            handleFilesSelected(accepted);
        },
        [handleFilesSelected],
    );

    const loadSample = useCallback(() => {
        setDocTitle(SAMPLE_DOC.title);
        setDocContent(SAMPLE_DOC.content);
        setSourceInfo("sample document · loaded");
        setIngestError(null);
    }, []);

    /* ----------------------------- ingest --------------------------- */

    const handleIngest = useCallback(async () => {
        if (!docTitle.trim() || !docContent.trim()) {
            setIngestError("Title and content are required.");
            return;
        }
        setIngesting(true);
        setIngestError(null);
        setSearchResponse(null);
        setAskResponse(null);
        setLastQuery("");
        setLastIngest(null);
        const started = Date.now();
        setIngestStartedAt(started);
        try {
            const result = await ingestOne(docTitle, docContent);
            setLastIngest({
                title: result.title,
                chunks: result.chunks,
                elapsedMs: Date.now() - started,
            });
            setDocContent("");
            setSourceInfo(null);
            await refreshGraphAndStats();
        } catch (e) {
            setIngestError(e instanceof Error ? e.message : "ingest failed");
        } finally {
            setIngesting(false);
            setIngestStartedAt(null);
        }
    }, [docTitle, docContent, ingestOne, refreshGraphAndStats]);

    const handleDeleteDocument = useCallback(
        async (source: string) => {
            // Collect ids for this source from the current graph snapshot.
            const idsToRemove = nodes
                .filter((n) => n.source === source)
                .map((n) => n.id);
            if (idsToRemove.length === 0) {
                // Nothing to delete on the server, just drop locally.
                setDocuments((prev) => {
                    const next = new Map(prev);
                    next.delete(source);
                    return next;
                });
                return;
            }
            for (const id of idsToRemove) {
                try {
                    await callTool("knowledge_remove", { node_id: id });
                } catch {
                    // keep going even if individual removals fail
                }
            }
            // Clear derived state that may reference removed ids.
            setExploreContext(null);
            setSearchResponse(null);
            setAskResponse(null);
            await refreshGraphAndStats();
        },
        [nodes, refreshGraphAndStats],
    );

    /* ------------------------------ search -------------------------- */

    const handleSearch = useCallback(async () => {
        const q = query.trim();
        if (!q) {
            setSearchError("Enter a query.");
            return;
        }
        setSearching(true);
        setSearchError(null);
        setSearchResponse(null);
        setAskResponse(null);
        setAskError(null);
        setLastQuery(q);
        try {
            const result = await callTool<SearchResponse | SearchHit[]>(
                "knowledge_search",
                { query: q, limit: 10 },
            );
            const normalized: SearchResponse = Array.isArray(result)
                ? { results: result }
                : result;
            setSearchResponse(normalized);
        } catch (e) {
            setSearchError(e instanceof Error ? e.message : "search failed");
        } finally {
            setSearching(false);
        }
    }, [query]);

    const handleAsk = useCallback(async () => {
        const q = query.trim();
        if (!q) {
            setAskError("Enter a question.");
            return;
        }
        setAsking(true);
        setAskError(null);
        setAskResponse(null);
        setSearchResponse(null);
        setSearchError(null);
        setLastQuery(q);
        try {
            const res = await fetch(`${API_URL}/api/demo/synaptic-memory/ask`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: q, limit: 5 }),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`${res.status} — ${txt.slice(0, 200)}`);
            }
            const data = (await res.json()) as AskResponse;
            setAskResponse(data);
        } catch (e) {
            setAskError(e instanceof Error ? e.message : "ask failed");
        } finally {
            setAsking(false);
        }
    }, [query]);

    const submit = useCallback(() => {
        if (mode === "search") handleSearch();
        else handleAsk();
    }, [mode, handleSearch, handleAsk]);

    /* ----------------------------- explore ------------------------- */

    const loadExplore = useCallback(async (nodeId: string) => {
        setExploreLoading(true);
        setExploreError(null);
        try {
            const result = await callTool<{
                success?: boolean;
                center: ExploreContext["center"];
            }>("agent_explore_context", { node_id: nodeId, depth: 2 });
            setExploreContext({ center: result.center });
        } catch (e) {
            setExploreError(
                e instanceof Error ? e.message : "explore failed",
            );
            setExploreContext(null);
        } finally {
            setExploreLoading(false);
        }
    }, []);

    const handleNodeClick = useCallback(
        (node: GraphNode) => {
            loadExplore(node.id);
        },
        [loadExplore],
    );

    /** Open the detail panel for a given node id (typically a search hit
     *  or Ask source) and scroll the graph section into view so the user
     *  doesn't have to hunt for the panel. */
    const openDetailFromResult = useCallback(
        (nodeId: string) => {
            loadExplore(nodeId);
            requestAnimationFrame(() => {
                graphSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            });
        },
        [loadExplore],
    );

    const handleCloseExplore = useCallback(() => {
        setExploreContext(null);
        setExploreError(null);
    }, []);

    const handleReinforce = useCallback(async () => {
        if (!exploreContext) return;
        setReinforcing(true);
        try {
            await callTool("knowledge_reinforce", {
                node_ids: exploreContext.center.id,
                success: true,
            });
            // reload to reflect vitality/access changes
            await loadExplore(exploreContext.center.id);
            refreshGraphAndStats();
        } catch (e) {
            setExploreError(
                e instanceof Error ? e.message : "reinforce failed",
            );
        } finally {
            setReinforcing(false);
        }
    }, [exploreContext, loadExplore, refreshGraphAndStats]);

    /* ------------------------------ reset --------------------------- */

    const handleReset = useCallback(async () => {
        setResetting(true);
        try {
            const snapshot = await fetchGraph();
            for (const n of snapshot.nodes) {
                try {
                    await callTool("knowledge_remove", { node_id: n.id });
                } catch {
                    // keep going
                }
            }
            setSearchResponse(null);
            setAskResponse(null);
            setLastQuery("");
            setLastIngest(null);
            setDocuments(new Map());
            setExploreContext(null);
            await refreshGraphAndStats();
        } finally {
            setResetting(false);
        }
    }, [refreshGraphAndStats]);

    /* ------------------------------ UI ------------------------------ */

    // Memoize derived lookup maps so child components (SynapticGraph,
    // NodeDetailPanel, SourceBadge) don't see new Map/Set identities on
    // every parent render. Without this the force simulation inside
    // SynapticGraph re-runs its useMemo on each tick-induced re-render.
    const sourceColors = useMemo(() => {
        const m = new Map<string, string>();
        let idx = 0;
        for (const doc of documents.values()) {
            m.set(doc.source, SOURCE_PALETTE[idx % SOURCE_PALETTE.length]);
            idx++;
        }
        return m;
    }, [documents]);

    const nodeSourceLookup = useMemo(() => {
        const m = new Map<string, string>();
        for (const n of nodes) if (n.source) m.set(n.id, n.source);
        return m;
    }, [nodes]);

    const nodeContentLookup = useMemo(() => {
        const m = new Map<string, string>();
        for (const n of nodes) if (n.content) m.set(n.id, n.content);
        return m;
    }, [nodes]);

    const searchHits = searchResponse?.results ?? null;

    const highlightIds = useMemo(() => {
        const s = new Set<string>();
        if (exploreContext) {
            s.add(exploreContext.center.id);
        } else if (mode === "search" && searchHits) {
            searchHits.forEach((h) => s.add(h.id));
        } else if (mode === "ask" && askResponse) {
            askResponse.sources.forEach((src) => s.add(src.id));
        }
        return s;
    }, [exploreContext, mode, searchHits, askResponse]);

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
                            / knowledge
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-ink)] bg-[var(--color-ink)] px-2 py-0.5 font-mono text-[12px] text-white">
                            <Sparkles className="h-2.5 w-2.5" />
                            powered by MCP
                        </span>
                    </div>
                    <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                        {tool.name}
                    </h1>
                    <p className="mt-3 max-w-2xl text-[18px] leading-relaxed text-[var(--color-ink-muted)]">
                        Upload a document, watch Synaptic build a knowledge
                        graph automatically, then search it with hybrid FTS +
                        embedding rerank.
                    </p>
                </div>
                <CopyCommand value={tool.install} />
            </header>

            {/* Stats bar */}
            <StatsBar stats={stats} edgeCount={edges.length} onReset={handleReset} resetting={resetting} />

            {/* Documents list — shows up once at least one document has been ingested */}
            {documents.size > 0 && (
                <DocumentList
                    documents={documents}
                    sourceColors={sourceColors}
                    onDelete={handleDeleteDocument}
                />
            )}

            {/* Step 1 — Upload */}
            <section className="mt-6 rounded-2xl border border-[var(--color-line)] bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-[16px] font-semibold tracking-tight">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-ink)] font-mono text-[12px] text-white">
                            1
                        </span>
                        Upload document
                    </h2>
                    <button
                        onClick={loadSample}
                        className="text-[14px] text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]"
                    >
                        ↓ Load sample document
                    </button>
                </div>

                <div
                    onClick={() => !extracting && !batchProgress && fileRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        if (!extracting && !batchProgress) setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={cn(
                        "rounded-md border-2 border-dashed p-6 text-center transition",
                        extracting || batchProgress
                            ? "cursor-wait border-[var(--color-line)] bg-[var(--color-surface-alt)]"
                            : dragOver
                              ? "cursor-pointer border-[var(--color-ink)] bg-[var(--color-surface-hover)]"
                              : "cursor-pointer border-[var(--color-line)] bg-[var(--color-surface-alt)]",
                    )}
                >
                    <input
                        ref={fileRef}
                        type="file"
                        accept={ACCEPT_EXTENSIONS}
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            const files = Array.from(e.target.files ?? []).filter((f) =>
                                isAcceptedFile(f.name),
                            );
                            handleFilesSelected(files);
                            // Reset the input so picking the same file twice still fires.
                            e.target.value = "";
                        }}
                    />
                    {extracting || batchProgress ? (
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[var(--color-ink-subtle)]" />
                    ) : (
                        <Upload className="mx-auto h-6 w-6 text-[var(--color-ink-subtle)]" />
                    )}
                    <div className="mt-2 text-[15px] text-[var(--color-ink-muted)]">
                        {batchProgress ? (
                            <>
                                {batchProgress.label} · {batchProgress.current}{" "}
                                / {batchProgress.total} ·{" "}
                                {ingestStartedAt !== null && (
                                    <ElapsedCounter startedAt={ingestStartedAt} />
                                )}
                            </>
                        ) : extracting ? (
                            "Parsing document via Contextifier…"
                        ) : docContent ? (
                            `Loaded ${docContent.length.toLocaleString()} chars · ~${estimateChunks(docContent, chunkSize)} chunks expected`
                        ) : (
                            "Click to pick files, or drop files/folder here"
                        )}
                    </div>
                    <div className="mt-1 font-mono text-[12px] text-[var(--color-ink-subtle)]">
                        pdf · docx · pptx · xlsx · hwp · hwpx · md · txt · csv · html
                    </div>
                    {sourceInfo && !extracting && !batchProgress && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-white px-2.5 py-1 font-mono text-[12px] text-[var(--color-ink-muted)]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {sourceInfo}
                        </div>
                    )}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div>
                        <label className="mb-1 block text-[13px] font-medium text-[var(--color-ink)]">
                            Title
                        </label>
                        <input
                            type="text"
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            placeholder="Document title"
                            className="w-full rounded-md border border-[var(--color-line)] bg-white px-3 py-2 text-[15px] outline-none transition focus:border-[var(--color-ink)]"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-[13px] font-medium text-[var(--color-ink)]">
                            Chunk size
                        </label>
                        <div className="flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-white px-3 py-2">
                            <input
                                type="range"
                                min={100}
                                max={1000}
                                step={50}
                                value={chunkSize}
                                onChange={(e) =>
                                    setChunkSize(Number(e.target.value))
                                }
                                className="flex-1 accent-[var(--color-ink)]"
                            />
                            <span className="w-10 text-right font-mono text-[14px]">
                                {chunkSize}
                            </span>
                        </div>
                    </div>
                </div>

                {docContent && (
                    <details className="mt-3">
                        <summary className="cursor-pointer text-[13px] text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]">
                            Preview content
                        </summary>
                        <pre className="mt-2 max-h-40 overflow-auto rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-3 font-mono text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
                            {docContent.slice(0, 800)}
                            {docContent.length > 800 && "…"}
                        </pre>
                    </details>
                )}

                {ingestError && (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 font-mono text-[13px] text-red-700">
                        {ingestError}
                    </div>
                )}

                <button
                    onClick={handleIngest}
                    disabled={ingesting || !docContent}
                    className={cn(
                        "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[16px] font-medium transition",
                        ingesting || !docContent
                            ? "cursor-not-allowed bg-[var(--color-line)] text-[var(--color-ink-muted)]"
                            : "bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink)]/90",
                    )}
                >
                    {ingesting ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Building graph · embedding ~
                            {estimateChunks(docContent, chunkSize)} chunks ·{" "}
                            {ingestStartedAt !== null && (
                                <ElapsedCounter startedAt={ingestStartedAt} />
                            )}
                        </>
                    ) : (
                        <>
                            <FileUp className="h-3.5 w-3.5" />
                            Ingest to knowledge graph
                        </>
                    )}
                </button>

                {lastIngest && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 font-mono text-[13px] text-emerald-700"
                    >
                        <span>
                            ✓ Ingested &quot;{lastIngest.title}&quot; ·{" "}
                            {lastIngest.chunks} chunk
                            {lastIngest.chunks === 1 ? "" : "s"}
                        </span>
                        <span className="text-emerald-600/70">
                            {(lastIngest.elapsedMs / 1000).toFixed(2)}s ·{" "}
                            {lastIngest.chunks > 0
                                ? `${Math.round(lastIngest.elapsedMs / lastIngest.chunks)}ms/chunk`
                                : ""}
                        </span>
                    </motion.div>
                )}
            </section>

            {/* Step 2 — Graph (+ NodeDetailPanel when exploring) */}
            <section
                ref={graphSectionRef}
                className="mt-4 scroll-mt-20 rounded-2xl border border-[var(--color-line)] bg-white p-6"
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-[16px] font-semibold tracking-tight">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-ink)] font-mono text-[12px] text-white">
                            2
                        </span>
                        Knowledge graph
                    </h2>
                    <div className="flex items-center gap-3 font-mono text-[12px] text-[var(--color-ink-subtle)]">
                        <span>{nodes.length} nodes</span>
                        <span>·</span>
                        <span>{edges.length} edges</span>
                        {highlightIds.size > 0 && (
                            <>
                                <span>·</span>
                                <span className="text-emerald-600">
                                    {highlightIds.size} highlighted
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <div
                    className={cn(
                        "grid gap-4",
                        exploreContext || exploreLoading || exploreError
                            ? "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
                            : "grid-cols-1",
                    )}
                >
                    <div className="relative">
                        <SynapticGraph
                            nodes={nodes}
                            edges={edges}
                            highlightIds={highlightIds}
                            centerNodeId={exploreContext?.center.id}
                            onNodeClick={handleNodeClick}
                            sourceColors={sourceColors}
                        />
                        {/* Floating doc→color legend. Anchored near the top
                             so it doesn't collide with the bottom edge
                             legend row and is close to the zoom indicator. */}
                        {documents.size > 0 && (
                            <div className="pointer-events-none absolute left-3 top-14 z-10 max-w-[240px] rounded-md border border-[var(--color-line)] bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm">
                                <div className="mb-1 font-mono text-[11px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                                    documents
                                </div>
                                <div className="space-y-0.5">
                                    {Array.from(documents.values())
                                        .sort((a, b) => a.addedAt - b.addedAt)
                                        .map((doc) => (
                                            <div
                                                key={doc.source}
                                                className="flex items-center gap-1.5 text-[12px] text-[var(--color-ink)]"
                                            >
                                                <span
                                                    className="h-2 w-2 shrink-0 rounded-full"
                                                    style={{
                                                        background:
                                                            sourceColors.get(
                                                                doc.source,
                                                            ) ?? "#999",
                                                    }}
                                                />
                                                <span className="truncate">
                                                    {doc.title}
                                                </span>
                                                <span className="shrink-0 font-mono text-[11px] text-[var(--color-ink-subtle)]">
                                                    {doc.chunkCount}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {(exploreContext || exploreLoading || exploreError) && (
                        <NodeDetailPanel
                            context={exploreContext}
                            loading={exploreLoading}
                            error={exploreError}
                            onClose={handleCloseExplore}
                            onReinforce={handleReinforce}
                            reinforcing={reinforcing}
                            contentLookup={nodeContentLookup}
                        />
                    )}
                </div>

                <div className="mt-3 flex items-center gap-4 font-mono text-[12px] text-[var(--color-ink-subtle)]">
                    <LegendDot color="#fff" label="chunk" border />
                    <LegendDot color="#a855f7" label="cross-doc bridge" />
                    <LegendDot color="#10b981" label="highlighted" />
                    <LegendLine label="next_chunk" kind="solid" />
                    <LegendLine label="part_of" kind="dashed" />
                    <LegendLine label="contains" kind="purple" />
                    <span className="ml-auto text-[var(--color-ink-subtle)]">
                        click any node to explore
                    </span>
                </div>
            </section>

            {/* Step 3 — Search / Ask */}
            <section className="mt-4 rounded-2xl border border-[var(--color-line)] bg-white p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-[16px] font-semibold tracking-tight">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-ink)] font-mono text-[12px] text-white">
                            3
                        </span>
                        {mode === "search" ? "Semantic search" : "Ask with context"}
                    </h2>

                    {/* mode toggle */}
                    <div className="inline-flex rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-0.5 text-[13px]">
                        <button
                            onClick={() => setMode("search")}
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition",
                                mode === "search"
                                    ? "bg-white text-[var(--color-ink)] shadow-sm"
                                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
                            )}
                        >
                            <SearchIcon className="h-3 w-3" />
                            Search
                        </button>
                        <button
                            onClick={() => setMode("ask")}
                            className={cn(
                                "inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition",
                                mode === "ask"
                                    ? "bg-white text-[var(--color-ink)] shadow-sm"
                                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
                            )}
                        >
                            <MessageSquare className="h-3 w-3" />
                            Ask
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        {mode === "search" ? (
                            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                        ) : (
                            <MessageSquare className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-ink-subtle)]" />
                        )}
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") submit();
                            }}
                            placeholder={
                                nodes.length === 0
                                    ? "ingest a document first…"
                                    : mode === "search"
                                      ? "type any word from the document"
                                      : "ask a natural language question…"
                            }
                            className="w-full rounded-md border border-[var(--color-line)] bg-white py-2 pl-9 pr-3 text-[15px] outline-none transition focus:border-[var(--color-ink)]"
                        />
                    </div>
                    <button
                        onClick={submit}
                        disabled={searching || asking || nodes.length === 0}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-[16px] font-medium transition",
                            searching || asking || nodes.length === 0
                                ? "cursor-not-allowed bg-[var(--color-line)] text-[var(--color-ink-muted)]"
                                : "bg-[var(--color-ink)] text-white hover:bg-[var(--color-ink)]/90",
                        )}
                    >
                        {searching || asking ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : mode === "search" ? (
                            "Search"
                        ) : (
                            "Ask"
                        )}
                    </button>
                    {(searchResponse || askResponse) && (
                        <button
                            onClick={() => {
                                setSearchResponse(null);
                                setAskResponse(null);
                                setLastQuery("");
                                setQuery("");
                            }}
                            className="rounded-md border border-[var(--color-line)] bg-white p-2 text-[var(--color-ink-muted)] transition hover:border-[var(--color-ink)]"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {searchError && mode === "search" && (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 font-mono text-[13px] text-red-700">
                        {searchError}
                    </div>
                )}
                {askError && mode === "ask" && (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 font-mono text-[13px] text-red-700">
                        {askError}
                    </div>
                )}

                {/* ─── Ask mode answer ─── */}
                {mode === "ask" && askResponse && (
                    <div className="mt-4 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-5"
                        >
                            <div className="mb-2 flex items-center gap-2 font-mono text-[12px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                                <Sparkles className="h-3 w-3" />
                                answer · {askResponse.model}
                                {askResponse.is_overview && (
                                    <span className="rounded-sm bg-[var(--color-ink)] px-1.5 py-0.5 font-mono text-[11px] text-white">
                                        overview
                                    </span>
                                )}
                            </div>
                            <div className="whitespace-pre-wrap text-[16px] leading-relaxed text-[var(--color-ink)]">
                                {askResponse.answer}
                            </div>
                        </motion.div>

                        {askResponse.sources.length > 0 && (
                            <div>
                                <div className="mb-2 font-mono text-[12px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                                    sources ({askResponse.sources.length})
                                </div>
                                <div className="space-y-2">
                                    {askResponse.sources.map((s, i) => (
                                        <motion.button
                                            key={`${s.id}-${i}`}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + i * 0.04 }}
                                            onClick={() => openDetailFromResult(s.id)}
                                            className="group block w-full rounded-md border border-[var(--color-line)] bg-white p-3 text-left transition hover:border-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="flex items-center gap-2 text-[14px] font-semibold text-[var(--color-ink)]">
                                                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-ink)] font-mono text-[11px] text-white">
                                                        {i + 1}
                                                    </span>
                                                    {s.title}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <SourceBadge
                                                        nodeId={s.id}
                                                        nodeSourceLookup={nodeSourceLookup}
                                                        documents={documents}
                                                        sourceColors={sourceColors}
                                                    />
                                                    {typeof s.score === "number" && (
                                                        <span className="font-mono text-[12px] text-[var(--color-ink-subtle)]">
                                                            {s.score.toFixed(3)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {s.content && (
                                                <div className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
                                                    {s.content}
                                                </div>
                                            )}
                                            <div className="mt-1.5 font-mono text-[11px] text-[var(--color-ink-subtle)] transition group-hover:text-[var(--color-ink-muted)]">
                                                click to open full chunk →
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mode === "search" && searchResponse && (
                    <>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-[var(--color-ink-subtle)]">
                            <span>
                                query{" "}
                                <span className="text-[var(--color-ink)]">
                                    &quot;{lastQuery}&quot;
                                </span>
                            </span>
                            <span>·</span>
                            <span>
                                {searchHits?.length ?? 0} result
                                {(searchHits?.length ?? 0) === 1 ? "" : "s"}
                            </span>
                            {typeof searchResponse.total_candidates ===
                                "number" && (
                                <>
                                    <span>·</span>
                                    <span>
                                        {searchResponse.total_candidates}{" "}
                                        candidates
                                    </span>
                                </>
                            )}
                            {searchResponse.stages_used &&
                                searchResponse.stages_used.length > 0 && (
                                    <>
                                        <span>·</span>
                                        <span>
                                            stages [
                                            {searchResponse.stages_used.join(
                                                ", ",
                                            )}
                                            ]
                                        </span>
                                    </>
                                )}
                            {typeof searchResponse.search_time_ms ===
                                "number" && (
                                <>
                                    <span>·</span>
                                    <span>
                                        {searchResponse.search_time_ms.toFixed(
                                            1,
                                        )}{" "}
                                        ms
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="mt-3 space-y-2">
                            {(searchHits?.length ?? 0) === 0 ? (
                                <div className="rounded-md border border-dashed border-[var(--color-line)] bg-[var(--color-surface-alt)] p-4 text-[14px] text-[var(--color-ink-muted)]">
                                    <div className="font-medium text-[var(--color-ink)]">
                                        No matches for &quot;{lastQuery}&quot;
                                    </div>
                                    <div className="mt-1 text-[13px] text-[var(--color-ink-subtle)]">
                                        {searchResponse.message ||
                                            "Synaptic uses hybrid search (FTS → vector rerank). Your query needs to share at least one token with the document so FTS can surface candidates — then embeddings handle the semantic ranking."}
                                    </div>
                                </div>
                            ) : (
                                searchHits!.map((hit, i) => (
                                    <motion.button
                                        key={`${hit.id}-${i}`}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        onClick={() => openDetailFromResult(hit.id)}
                                        className="group block w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-3 text-left transition hover:border-[var(--color-ink)] hover:bg-white"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-[14px] font-semibold text-[var(--color-ink)]">
                                                {hit.title}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <SourceBadge
                                                    nodeId={hit.id}
                                                    nodeSourceLookup={nodeSourceLookup}
                                                    documents={documents}
                                                    sourceColors={sourceColors}
                                                />
                                                {typeof hit.score === "number" && (
                                                    <span className="font-mono text-[12px] text-[var(--color-ink-subtle)]">
                                                        score {hit.score.toFixed(3)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {hit.content && (
                                            <div className="mt-1 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
                                                {hit.content.slice(0, 220)}
                                            </div>
                                        )}
                                        <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-[var(--color-ink-subtle)]">
                                            <span>#{hit.id.slice(0, 8)}</span>
                                            <span className="transition group-hover:text-[var(--color-ink-muted)]">
                                                click to open full chunk →
                                            </span>
                                        </div>
                                    </motion.button>
                                ))
                            )}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}

/* ------------------------------- pieces ------------------------------ */

/** Self-contained elapsed-time display. The 100 ms interval is scoped
 *  to this tiny leaf so the parent (1500+ line demo client) doesn't
 *  re-render 10 times per second while an ingest is running. */
function ElapsedCounter({ startedAt }: { startedAt: number }) {
    const [elapsed, setElapsed] = useState(() => Date.now() - startedAt);
    useEffect(() => {
        const id = setInterval(() => setElapsed(Date.now() - startedAt), 100);
        return () => clearInterval(id);
    }, [startedAt]);
    return <>{(elapsed / 1000).toFixed(1)}s</>;
}

function DocumentList({
    documents,
    sourceColors,
    onDelete,
}: {
    documents: Map<string, DocumentRecord>;
    sourceColors: Map<string, string>;
    onDelete: (source: string) => void;
}) {
    const items = Array.from(documents.values()).sort(
        (a, b) => a.addedAt - b.addedAt,
    );
    return (
        <section className="mt-4 rounded-2xl border border-[var(--color-line)] bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-mono text-[12px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                    documents in graph · {items.length}
                </h3>
            </div>
            <div className="flex flex-wrap gap-2">
                {items.map((doc) => {
                    const color = sourceColors.get(doc.source) ?? "#0a0a0a";
                    return (
                        <div
                            key={doc.source}
                            className="group inline-flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-3 py-1.5"
                        >
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ background: color }}
                            />
                            <FileText className="h-3 w-3 text-[var(--color-ink-muted)]" />
                            <span className="text-[14px] font-medium text-[var(--color-ink)]">
                                {doc.title}
                            </span>
                            <span className="font-mono text-[12px] text-[var(--color-ink-subtle)]">
                                {doc.chunkCount} chunk
                                {doc.chunkCount === 1 ? "" : "s"}
                            </span>
                            <button
                                onClick={() => onDelete(doc.source)}
                                aria-label={`Remove ${doc.title}`}
                                className="ml-1 rounded p-0.5 text-[var(--color-ink-subtle)] transition hover:bg-white hover:text-red-600"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function SourceBadge({
    nodeId,
    nodeSourceLookup,
    documents,
    sourceColors,
}: {
    nodeId: string | undefined;
    nodeSourceLookup: Map<string, string>;
    documents: Map<string, DocumentRecord>;
    sourceColors: Map<string, string>;
}) {
    if (!nodeId) return null;
    const source = nodeSourceLookup.get(nodeId);
    if (!source) return null;
    const doc = documents.get(source);
    if (!doc) return null;
    const color = sourceColors.get(source) ?? "#0a0a0a";
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-white px-2 py-0.5 font-mono text-[11px] text-[var(--color-ink-muted)]">
            <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: color }}
            />
            {doc.title}
        </span>
    );
}

function StatsBar({
    stats,
    edgeCount,
    onReset,
    resetting,
}: {
    stats: Stats | null;
    edgeCount: number;
    onReset: () => void;
    resetting: boolean;
}) {
    const items = [
        { label: "nodes", value: String(stats?.total_nodes ?? 0) },
        { label: "edges", value: String(edgeCount) },
        {
            label: "cache hit",
            value:
                typeof stats?.cache_hit_rate === "number"
                    ? `${(stats.cache_hit_rate * 100).toFixed(0)}%`
                    : "—",
        },
        { label: "cache size", value: String(stats?.cache_size ?? 0) },
    ];
    return (
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="grid flex-1 grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-4">
                {items.map((it) => (
                    <div key={it.label} className="bg-white px-4 py-3">
                        <div className="font-mono text-[12px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                            {it.label}
                        </div>
                        <div className="mt-1 font-mono text-[19px] font-semibold tracking-tight text-[var(--color-ink)]">
                            {it.value}
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={onReset}
                disabled={resetting || (stats?.total_nodes ?? 0) === 0}
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-[14px] font-medium transition",
                    resetting || (stats?.total_nodes ?? 0) === 0
                        ? "cursor-not-allowed border-[var(--color-line)] text-[var(--color-ink-subtle)]"
                        : "border-[var(--color-line)] bg-white text-[var(--color-ink-muted)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]",
                )}
            >
                {resetting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <Eraser className="h-3 w-3" />
                )}
                Reset graph
            </button>
        </div>
    );
}

function LegendDot({
    color,
    label,
    border,
}: {
    color: string;
    label: string;
    border?: boolean;
}) {
    return (
        <span className="flex items-center gap-1.5">
            <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                    background: color,
                    border: border ? "1px solid #0a0a0a" : "none",
                }}
            />
            {label}
        </span>
    );
}

function LegendLine({
    label,
    kind = "solid",
}: {
    label: string;
    kind?: "solid" | "dashed" | "purple";
}) {
    let stroke = "rgba(0,0,0,0.75)";
    let dash: string | undefined;
    let width = 1.6;
    if (kind === "dashed") {
        stroke = "rgba(0,0,0,0.45)";
        dash = "5 5";
        width = 1;
    } else if (kind === "purple") {
        stroke = "rgba(168,85,247,0.7)";
        dash = "2 4";
        width = 1.2;
    }
    return (
        <span className="flex items-center gap-1.5">
            <svg width="20" height="6">
                <line
                    x1="0"
                    y1="3"
                    x2="20"
                    y2="3"
                    stroke={stroke}
                    strokeWidth={width}
                    strokeDasharray={dash}
                />
            </svg>
            {label}
        </span>
    );
}

