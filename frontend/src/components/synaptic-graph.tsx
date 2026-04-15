"use client";

import {
    forceCenter,
    forceCollide,
    forceLink,
    forceManyBody,
    forceSimulation,
    type SimulationLinkDatum,
    type SimulationNodeDatum,
} from "d3-force";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";

export interface GraphNode extends SimulationNodeDatum {
    id: string;
    title: string;
    kind?: string;
    content?: string;
    level?: string;
    vitality?: number;
    source?: string;
}

export interface GraphEdge {
    source: string;
    target: string;
    kind?: string;
    weight?: number;
}

type SimLink = SimulationLinkDatum<GraphNode> & GraphEdge;

interface SynapticGraphProps {
    nodes: GraphNode[];
    edges: GraphEdge[];
    highlightIds?: Set<string>;
    /** The explicitly focused node (e.g. the one being explored). Rendered
     *  differently from regular highlighted neighbors. */
    centerNodeId?: string;
    onNodeClick?: (node: GraphNode) => void;
    /** Map of source → hex color. Nodes whose source matches get colored. */
    sourceColors?: Map<string, string>;
}

export function SynapticGraph({
    nodes,
    edges,
    highlightIds,
    centerNodeId,
    onNodeClick,
    sourceColors,
}: SynapticGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tick, setTick] = useState(0);
    const [hoverId, setHoverId] = useState<string | null>(null);
    const [viewBox, setViewBox] = useState({ x: -300, y: -200, w: 600, h: 400 });

    // Zoom & pan state — applied via an SVG <g transform="...">
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
        null,
    );
    const [isDragging, setIsDragging] = useState(false);

    const resetView = useCallback(() => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    }, []);

    const zoomBy = useCallback((factor: number) => {
        setZoom((z) => Math.max(0.3, Math.min(4, z * factor)));
    }, []);

    const onWheel = useCallback(
        (e: React.WheelEvent<SVGSVGElement>) => {
            e.preventDefault();
            const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
            // Zoom toward the cursor: we need to know cursor in svg coords,
            // but a simple "zoom at center" is good enough for small graphs.
            setZoom((z) => Math.max(0.3, Math.min(4, z * factor)));
        },
        [],
    );

    const onMouseDown = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            // Start panning on the svg itself OR the grid rect. Nodes,
            // labels, and tooltip foreign objects do not start a pan.
            const t = e.target as SVGElement;
            const isSvg = t === svgRef.current;
            const isPanCatcher =
                t.getAttribute && t.getAttribute("data-pan-catcher") === "true";
            if (!isSvg && !isPanCatcher) return;
            e.preventDefault();
            dragRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                origX: pan.x,
                origY: pan.y,
            };
            setIsDragging(true);
        },
        [pan],
    );

    useEffect(() => {
        if (!isDragging) return;
        const onMove = (e: MouseEvent) => {
            if (!dragRef.current) return;
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            setPan({
                x: dragRef.current.origX + dx,
                y: dragRef.current.origY + dy,
            });
        };
        const onUp = () => {
            setIsDragging(false);
            dragRef.current = null;
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
        };
    }, [isDragging]);

    // Build a display graph that keeps only the structurally meaningful
    // nodes: chunks (the actual content) + cross-doc bridge entities
    // (phrase hubs connecting ≥2 documents). Single-document entities
    // are dropped because they add hundreds of noise points without
    // conveying structure.
    const { simNodes, simLinks, bridgeInfo } = useMemo(() => {
        const fullNodeMap = new Map(nodes.map((n) => [n.id, n]));

        // Pass 1: compute per-entity source set from CONTAINS edges.
        const entitySources = new Map<string, Set<string>>();
        for (const n of nodes) {
            if ((n.kind ?? "").toLowerCase() === "entity") {
                entitySources.set(n.id, new Set());
            }
        }
        for (const e of edges) {
            if ((e.kind ?? "").toLowerCase() !== "contains") continue;
            const sNode = fullNodeMap.get(e.source);
            const tNode = fullNodeMap.get(e.target);
            if (!sNode || !tNode) continue;
            const sKind = (sNode.kind ?? "").toLowerCase();
            const tKind = (tNode.kind ?? "").toLowerCase();
            let entityNode: GraphNode | undefined;
            let chunkNode: GraphNode | undefined;
            if (sKind === "chunk" && tKind === "entity") {
                chunkNode = sNode;
                entityNode = tNode;
            } else if (sKind === "entity" && tKind === "chunk") {
                entityNode = sNode;
                chunkNode = tNode;
            }
            if (entityNode && chunkNode && chunkNode.source) {
                entitySources.get(entityNode.id)?.add(chunkNode.source);
            }
        }

        const bridgeInfo = new Map<
            string,
            { sourceCount: number; isBridge: boolean }
        >();
        entitySources.forEach((sources, entId) => {
            bridgeInfo.set(entId, {
                sourceCount: sources.size,
                isBridge: sources.size >= 2,
            });
        });

        // Pass 2: filter — keep chunks and bridge entities only.
        const visibleIds = new Set<string>();
        const simNodes: GraphNode[] = [];
        for (const n of nodes) {
            const kind = (n.kind ?? "").toLowerCase();
            if (kind === "chunk") {
                visibleIds.add(n.id);
                simNodes.push({ ...n });
            } else if (kind === "entity" && bridgeInfo.get(n.id)?.isBridge) {
                visibleIds.add(n.id);
                simNodes.push({ ...n });
            }
        }

        // Pass 3: keep only edges whose both endpoints are still visible.
        const simLinks: SimLink[] = edges
            .filter(
                (e) => visibleIds.has(e.source) && visibleIds.has(e.target),
            )
            .map((e) => ({ ...e }));

        return { simNodes, simLinks, bridgeInfo };
    }, [nodes, edges]);

    // Run force simulation when data changes. The tick handler uses
    // requestAnimationFrame to coalesce updates so we never re-render
    // faster than the browser paints — otherwise React sees a tight
    // setState loop and bails with "Maximum update depth exceeded".
    useEffect(() => {
        if (simNodes.length === 0) return;

        // Per-edge distance/strength so sequential chunks (next_chunk)
        // cluster tightly while cross-doc bridge entities (contains)
        // float at a longer distance between clusters.
        const sim = forceSimulation(simNodes)
            .force(
                "link",
                forceLink<GraphNode, SimLink>(simLinks)
                    .id((d) => d.id)
                    .distance((l) => {
                        const kind = (l as SimLink).kind?.toLowerCase();
                        if (kind === "next_chunk") return 32; // tight chain
                        if (kind === "part_of") return 55;
                        if (kind === "contains") return 110; // bridge reach
                        return 70;
                    })
                    .strength((l) => {
                        const kind = (l as SimLink).kind?.toLowerCase();
                        if (kind === "next_chunk") return 1.2; // dominates
                        if (kind === "part_of") return 0.7;
                        if (kind === "contains") return 0.25;
                        return 0.5;
                    }),
            )
            .force("charge", forceManyBody().strength(-160))
            .force("center", forceCenter(0, 0))
            .force("collide", forceCollide(22))
            .alpha(1)
            .alphaDecay(0.035);

        let rafPending = false;
        const scheduleTick = () => {
            if (rafPending) return;
            rafPending = true;
            requestAnimationFrame(() => {
                rafPending = false;
                setTick((t) => t + 1);
            });
        };

        sim.on("tick", scheduleTick);
        sim.on("end", () => {
            // Fit viewBox to final layout — once per simulation run.
            const padding = 60;
            let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity;
            simNodes.forEach((n) => {
                if (n.x == null || n.y == null) return;
                if (n.x < minX) minX = n.x;
                if (n.y < minY) minY = n.y;
                if (n.x > maxX) maxX = n.x;
                if (n.y > maxY) maxY = n.y;
            });
            if (isFinite(minX)) {
                const w = Math.max(maxX - minX + padding * 2, 400);
                const h = Math.max(maxY - minY + padding * 2, 300);
                setViewBox({ x: minX - padding, y: minY - padding, w, h });
            }
            setTick((t) => t + 1);
        });

        return () => {
            sim.stop();
        };
    }, [simNodes, simLinks]);

    if (nodes.length === 0) {
        return (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-surface-alt)] p-12 text-center">
                <div>
                    <div className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                        empty graph
                    </div>
                    <div className="mt-2 text-[13px] text-[var(--color-ink-muted)]">
                        Upload a document to build the knowledge graph.
                    </div>
                </div>
            </div>
        );
    }

    const hasHighlight = highlightIds && highlightIds.size > 0;

    return (
        <div className="relative">
            {/* Zoom controls */}
            <div className="absolute right-3 top-3 z-10 flex flex-col gap-1 rounded-md border border-[var(--color-line)] bg-white p-1 shadow-sm">
                <button
                    onClick={() => zoomBy(1.25)}
                    className="rounded p-1 text-[var(--color-ink-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]"
                    aria-label="Zoom in"
                >
                    <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={() => zoomBy(1 / 1.25)}
                    className="rounded p-1 text-[var(--color-ink-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]"
                    aria-label="Zoom out"
                >
                    <Minus className="h-3.5 w-3.5" />
                </button>
                <div className="mx-auto my-0.5 h-px w-4 bg-[var(--color-line)]" />
                <button
                    onClick={resetView}
                    className="rounded p-1 text-[var(--color-ink-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]"
                    aria-label="Reset view"
                >
                    <Maximize2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Zoom level indicator */}
            <div className="absolute left-3 top-3 z-10 rounded border border-[var(--color-line)] bg-white px-2 py-0.5 font-mono text-[10px] text-[var(--color-ink-subtle)]">
                {(zoom * 100).toFixed(0)}%
            </div>

            <svg
                ref={svgRef}
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
                className={`h-[480px] w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                preserveAspectRatio="xMidYMid meet"
                onWheel={onWheel}
                onMouseDown={onMouseDown}
            >
                {/* subtle grid (outside the zoom group so it stays constant) */}
                <defs>
                    <pattern
                        id="grid"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                    >
                        <circle cx="0" cy="0" r="0.6" fill="rgba(0,0,0,0.08)" />
                    </pattern>
                </defs>
                <rect
                    data-pan-catcher="true"
                    x={viewBox.x}
                    y={viewBox.y}
                    width={viewBox.w}
                    height={viewBox.h}
                    fill="url(#grid)"
                />

                {/* zoom/pan group — everything interactive goes inside */}
                <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* edges */}
            <g>
                {simLinks.map((link, i) => {
                    const s = link.source as unknown as GraphNode;
                    const t = link.target as unknown as GraphNode;
                    if (s?.x == null || t?.x == null) return null;
                    const muted = hasHighlight;
                    const kind = (link.kind ?? "").toLowerCase();
                    let stroke = "rgba(0,0,0,0.2)";
                    let strokeWidth = 1;
                    let dash: string | undefined;
                    if (kind === "next_chunk") {
                        stroke = "rgba(0,0,0,0.75)"; // solid black, prominent
                        strokeWidth = 1.6;
                    } else if (kind === "part_of") {
                        stroke = "rgba(0,0,0,0.35)";
                        strokeWidth = 0.9;
                        dash = "5 5"; // clearer dash pattern
                    } else if (kind === "contains") {
                        stroke = "rgba(168,85,247,0.5)"; // purple for bridge connection
                        strokeWidth = 1.1;
                        dash = "2 4";
                    }
                    return (
                        <line
                            key={i}
                            x1={s.x}
                            y1={s.y}
                            x2={t.x}
                            y2={t.y}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                            strokeDasharray={dash}
                            opacity={muted ? 0.25 : 1}
                        />
                    );
                })}
            </g>

            {/* nodes */}
            <g>
                {simNodes.map((n) => {
                    if (n.x == null || n.y == null) return null;
                    const isEntity = (n.kind ?? "").toLowerCase() === "entity";
                    const isCenter = centerNodeId === n.id;
                    const isHighlighted = highlightIds?.has(n.id) ?? false;
                    const isHovered = hoverId === n.id;
                    const isDim = hasHighlight && !isHighlighted && !isCenter;
                    const r = isCenter
                        ? 16
                        : isHighlighted
                          ? 12
                          : isEntity
                            ? 8
                            : 9;
                    // Labels are distracting on chunk nodes — "[14/70]"
                    // repeated 70 times doesn't convey anything. Show labels
                    // only for (a) bridge entities whose phrase is the whole
                    // point, (b) the currently centered/clicked node, and
                    // (c) highlighted search/Ask results.
                    const showLabel = isEntity || isCenter || isHighlighted;
                    const label = showLabel ? shortTitle(n.title) : "";

                    return (
                        <g
                            key={n.id}
                            transform={`translate(${n.x},${n.y})`}
                            onMouseEnter={() => setHoverId(n.id)}
                            onMouseLeave={() =>
                                setHoverId((id) => (id === n.id ? null : id))
                            }
                            onClick={() => onNodeClick?.(n)}
                            style={{ cursor: onNodeClick ? "pointer" : "default" }}
                        >
                            {(isHighlighted || isCenter) && (
                                <circle
                                    r={r + 8}
                                    fill="none"
                                    stroke={
                                        isCenter
                                            ? "rgba(245,158,11,0.5)"
                                            : "rgba(16,185,129,0.35)"
                                    }
                                    strokeWidth={3}
                                >
                                    <animate
                                        attributeName="r"
                                        from={r + 4}
                                        to={r + 14}
                                        dur="1.5s"
                                        repeatCount="indefinite"
                                    />
                                    <animate
                                        attributeName="opacity"
                                        from="0.6"
                                        to="0"
                                        dur="1.5s"
                                        repeatCount="indefinite"
                                    />
                                </circle>
                            )}
                            <circle
                                r={r}
                                fill={
                                    isCenter
                                        ? "#f59e0b"
                                        : isHighlighted
                                          ? "#10b981"
                                          : isHovered
                                            ? "#0a0a0a"
                                            : isEntity
                                              ? "#a855f7" // bridge entity
                                              : sourceColors && n.source
                                                ? (sourceColors.get(n.source) ??
                                                    "#fff")
                                                : "#fff"
                                }
                                stroke={isCenter ? "#b45309" : "#0a0a0a"}
                                strokeWidth={
                                    isCenter
                                        ? 2
                                        : isHighlighted
                                          ? 0
                                          : isEntity
                                            ? 0
                                            : 1.5
                                }
                                opacity={isDim ? 0.18 : 1}
                            />
                            {label && (
                                <text
                                    x={0}
                                    y={r + 14}
                                    fontSize={isEntity ? 10 : 11}
                                    fontFamily="var(--font-sans)"
                                    fontWeight={
                                        isHighlighted || isEntity ? 600 : 500
                                    }
                                    fill={
                                        isDim
                                            ? "rgba(0,0,0,0.35)"
                                            : isEntity
                                              ? "#7c3aed"
                                              : sourceColors && n.source
                                                ? (sourceColors.get(n.source) ??
                                                    "#0a0a0a")
                                                : "#0a0a0a"
                                    }
                                    textAnchor="middle"
                                    pointerEvents="none"
                                >
                                    {label}
                                </text>
                            )}
                        </g>
                    );
                })}
            </g>

            {/* hover tooltip */}
            {hoverId &&
                (() => {
                    const n = simNodes.find((x) => x.id === hoverId);
                    if (!n || n.x == null || n.y == null) return null;
                    const preview = (n.content || "").slice(0, 120);
                    return (
                        <foreignObject x={n.x + 16} y={n.y - 30} width={240} height={90}>
                            <div className="rounded-md border border-[var(--color-line)] bg-white px-3 py-2 shadow-lg">
                                <div className="truncate text-[11px] font-semibold text-[var(--color-ink)]">
                                    {n.title}
                                </div>
                                {preview && (
                                    <div className="mt-1 line-clamp-2 text-[10px] leading-snug text-[var(--color-ink-muted)]">
                                        {preview}
                                    </div>
                                )}
                            </div>
                        </foreignObject>
                    );
                })()}
                </g>
            </svg>
        </div>
    );
}

function shortTitle(t: string): string {
    // Docs ingested via knowledge_add_document get titles like
    //   "Some Long Document Title [3/72]"
    // Chunks share the base title, so the chunk marker is the most
    // compact distinguishing label inside one doc. When multiple docs
    // are in the graph we color the label by source to disambiguate.
    const chunkMatch = t.match(/\[(\d+\/\d+)\]$/);
    if (chunkMatch) return `[${chunkMatch[1]}]`;
    if (t.length <= 18) return t;
    return t.slice(0, 16) + "…";
}
