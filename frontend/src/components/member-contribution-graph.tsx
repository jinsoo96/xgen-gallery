"use client";

import { useState } from "react";
import type {
    ContributionCalendar,
    ContributionDay,
} from "@/lib/members/types";

const LEVEL_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const PAD_LEFT = 28; // room for day labels
const PAD_TOP = 18; // room for month labels
const MONTH_LABELS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
const WEEKDAY_LABELS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

interface HoverState {
    day: ContributionDay;
    /** Cell center X, in SVG coordinate space. */
    cx: number;
    /** Cell top Y, in SVG coordinate space. */
    cy: number;
    /** Cell bottom Y, in SVG coordinate space. */
    cyBottom: number;
    /** Row index 0..6 — used to flip tooltip below the cell when near top. */
    row: number;
}

export function MemberContributionGraph({
    calendar,
}: {
    calendar: ContributionCalendar;
}) {
    const [hover, setHover] = useState<HoverState | null>(null);
    const weeks = calendar.weeks;
    const width = PAD_LEFT + weeks.length * STEP;
    const height = PAD_TOP + 7 * STEP;

    // Compute month label positions: place a label above the first week whose
    // first day falls in a new month.
    const monthMarks: { x: number; label: string }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
        const firstDay = week[0];
        if (!firstDay) return;
        const m = new Date(firstDay.date).getUTCMonth();
        if (m !== lastMonth) {
            monthMarks.push({
                x: PAD_LEFT + i * STEP,
                label: MONTH_LABELS[m],
            });
            lastMonth = m;
        }
    });

    return (
        <section className="rounded-xl border border-[var(--color-line)] bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-ink-subtle)]">
                        / activity
                    </p>
                    <h2 className="mt-2 text-lg font-semibold tracking-tight">
                        {calendar.totalContributions.toLocaleString()}{" "}
                        contributions in the last year
                    </h2>
                </div>
                <Legend />
            </div>

            <div className="mt-4 overflow-x-auto">
                <div
                    className="relative inline-block"
                    style={{ width, height }}
                >
                    <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    role="img"
                    aria-label={`${calendar.totalContributions} contributions in the last year`}
                    className="block"
                    onMouseLeave={() => setHover(null)}
                >
                    {/* Month labels */}
                    {monthMarks.map((m, idx) => (
                        <text
                            key={`${m.label}-${idx}`}
                            x={m.x}
                            y={11}
                            fontSize={10}
                            fill="var(--color-ink-subtle)"
                        >
                            {m.label}
                        </text>
                    ))}
                    {/* Day labels (Mon, Wed, Fri) */}
                    {[
                        { i: 1, l: "Mon" },
                        { i: 3, l: "Wed" },
                        { i: 5, l: "Fri" },
                    ].map(({ i, l }) => (
                        <text
                            key={l}
                            x={0}
                            y={PAD_TOP + i * STEP + CELL - 1}
                            fontSize={9}
                            fill="var(--color-ink-subtle)"
                        >
                            {l}
                        </text>
                    ))}
                    {/* Cells */}
                    {weeks.map((week, wi) =>
                        week.map((d, di) => {
                            const x = PAD_LEFT + wi * STEP;
                            const y = PAD_TOP + di * STEP;
                            const isHovered =
                                hover !== null && hover.day.date === d.date;
                            return (
                                <rect
                                    key={d.date}
                                    x={x}
                                    y={y}
                                    width={CELL}
                                    height={CELL}
                                    rx={2}
                                    ry={2}
                                    fill={LEVEL_COLORS[d.level]}
                                    stroke={
                                        isHovered
                                            ? "var(--color-ink)"
                                            : "none"
                                    }
                                    strokeWidth={isHovered ? 1 : 0}
                                    onMouseEnter={() =>
                                        setHover({
                                            day: d,
                                            cx: x + CELL / 2,
                                            cy: y,
                                            cyBottom: y + CELL,
                                            row: di,
                                        })
                                    }
                                    onFocus={() =>
                                        setHover({
                                            day: d,
                                            cx: x + CELL / 2,
                                            cy: y,
                                            cyBottom: y + CELL,
                                            row: di,
                                        })
                                    }
                                    tabIndex={0}
                                    style={{
                                        outline: "none",
                                        cursor: "pointer",
                                    }}
                                />
                            );
                        }),
                    )}
                </svg>
                {hover && (
                    <Tooltip
                        hover={hover}
                        svgWidth={width}
                        svgHeight={height}
                    />
                )}
                </div>
            </div>
        </section>
    );
}

function Tooltip({
    hover,
    svgWidth,
    svgHeight,
}: {
    hover: HoverState;
    svgWidth: number;
    svgHeight: number;
}) {
    // Convert SVG-space coords into percentages so the tooltip stays anchored
    // even though the SVG scales responsively.
    const leftPct = (hover.cx / svgWidth) * 100;
    // Flip tooltip below the cell for the top two rows so it doesn't get
    // clipped by the surrounding overflow-x:auto container.
    const flipBelow = hover.row <= 1;
    const anchorY = flipBelow ? hover.cyBottom : hover.cy;
    const topPct = (anchorY / svgHeight) * 100;

    // Horizontal alignment: if anchor is too close to the left/right edge of
    // the SVG, shift the tooltip so it stays on screen. Arrow position moves
    // accordingly so it still points at the cell.
    const EDGE_PCT = 12; // % of SVG width treated as "edge zone"
    let xAlign: "left" | "center" | "right" = "center";
    if (leftPct < EDGE_PCT) xAlign = "left";
    else if (leftPct > 100 - EDGE_PCT) xAlign = "right";

    const translateX =
        xAlign === "left" ? "0%" : xAlign === "right" ? "-100%" : "-50%";
    const arrowLeft =
        xAlign === "left"
            ? "10px"
            : xAlign === "right"
                ? "calc(100% - 10px)"
                : "50%";

    const translateY = flipBelow ? "0%" : "-100%";

    const { count, date } = hover.day;
    const d = new Date(date);
    const weekday = WEEKDAY_LABELS[d.getUTCDay()];
    const formatted = d.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
    const text =
        count === 0
            ? "No contributions"
            : `${count} contribution${count === 1 ? "" : "s"}`;
    return (
        <div
            className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md bg-[var(--color-ink)] px-2.5 py-1.5 text-[11px] leading-tight text-white shadow-lg"
            style={{
                left: `${leftPct}%`,
                top: flipBelow
                    ? `calc(${topPct}% + 6px)`
                    : `calc(${topPct}% - 6px)`,
                transform: `translate(${translateX}, ${translateY})`,
            }}
            role="tooltip"
        >
            <span className="font-semibold">{text}</span>
            <span className="ml-1 text-white/70">
                on {weekday}, {formatted}
            </span>
            {flipBelow ? (
                <span
                    className="absolute bottom-full h-0 w-0 -translate-x-1/2"
                    style={{
                        left: arrowLeft,
                        borderLeft: "4px solid transparent",
                        borderRight: "4px solid transparent",
                        borderBottom: "4px solid var(--color-ink)",
                    }}
                />
            ) : (
                <span
                    className="absolute top-full h-0 w-0 -translate-x-1/2"
                    style={{
                        left: arrowLeft,
                        borderLeft: "4px solid transparent",
                        borderRight: "4px solid transparent",
                        borderTop: "4px solid var(--color-ink)",
                    }}
                />
            )}
        </div>
    );
}

function Legend() {
    return (
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-subtle)]">
            <span>Less</span>
            {LEVEL_COLORS.map((c) => (
                <span
                    key={c}
                    className="inline-block h-2.5 w-2.5 rounded-[2px]"
                    style={{ background: c }}
                />
            ))}
            <span>More</span>
        </div>
    );
}
