"use client";

import { useEffect, useRef, useState } from "react";
import { MemberGrid } from "@/components/member-grid";
import { formatRelative, formatStars } from "@/lib/members/format";
import type { MembersPayload } from "@/lib/members/types";

/**
 * 멤버 데이터를 클라이언트에서 지연 로드한다. 페이지의 키 비주얼(히어로)은 정적으로
 * 즉시 렌더되고, 이 그리드가 화면(스크롤)에 가까워지면 /api/members 를 fetch한다.
 * 로드 전에는 스켈레톤을 보여줘 체감 지연을 없앤다.
 */
function SkeletonGrid() {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white"
                >
                    <div className="h-14 animate-pulse bg-[var(--color-surface-alt)]" />
                    <div className="px-5 pb-5">
                        <div className="-mt-9 h-16 w-16 animate-pulse rounded-2xl border-[3px] border-white bg-[var(--color-surface-alt)]" />
                        <div className="mt-3 h-5 w-32 animate-pulse rounded bg-[var(--color-surface-alt)]" />
                        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[var(--color-surface-alt)]" />
                        <div className="mt-4 h-14 animate-pulse rounded-xl bg-[var(--color-surface-alt)]" />
                        <div className="mt-3 flex gap-1.5">
                            <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--color-surface-alt)]" />
                            <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--color-surface-alt)]" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export function MembersLazy() {
    const [payload, setPayload] = useState<MembersPayload | null>(null);
    const [error, setError] = useState(false);
    const sentinel = useRef<HTMLDivElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const el = sentinel.current;
        if (!el) return;
        const io = new IntersectionObserver(
            (entries) => {
                if (
                    entries.some((e) => e.isIntersecting) &&
                    !started.current
                ) {
                    started.current = true;
                    io.disconnect();
                    void load();
                }
            },
            // 그리드에 가까워지면(400px 앞) 미리 로드 시작 → 도달 시 지연 최소화.
            { rootMargin: "400px 0px" },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    async function load() {
        try {
            const res = await fetch("/api/members");
            if (!res.ok) throw new Error("failed");
            setPayload((await res.json()) as MembersPayload);
        } catch {
            setError(true);
        }
    }

    const members = payload?.members ?? [];
    const totalStars = members.reduce((s, m) => s + m.totalStars, 0);
    const totalActivity = members.reduce(
        (s, m) => s + (m.recentActivityCount ?? 0),
        0,
    );

    return (
        <div ref={sentinel}>
            {/* 요약 통계 */}
            {payload ? (
                <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[13px] text-[var(--color-ink-subtle)]">
                    <span>
                        <span className="text-[var(--color-ink)]">
                            {members.length}
                        </span>{" "}
                        members
                    </span>
                    <span>
                        <span className="text-[var(--color-ink)]">
                            ★ {formatStars(totalStars)}
                        </span>{" "}
                        combined stars
                    </span>
                    <span>
                        <span className="text-[var(--color-ink)]">
                            {totalActivity}
                        </span>{" "}
                        events in the last 3 days
                    </span>
                    <span>Updated {formatRelative(payload.fetchedAt)}</span>
                </div>
            ) : (
                <div className="mb-8 h-4 w-96 max-w-full animate-pulse rounded bg-[var(--color-surface-alt)]" />
            )}

            {error ? (
                <div className="rounded-xl border border-[var(--color-line)] bg-white p-10 text-center text-[16px] text-[var(--color-ink-muted)]">
                    멤버를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요
                </div>
            ) : payload ? (
                members.length > 0 ? (
                    <MemberGrid members={members} />
                ) : (
                    <div className="rounded-xl border border-[var(--color-line)] bg-white p-10 text-center text-[16px] text-[var(--color-ink-muted)]">
                        표시할 멤버가 없습니다
                    </div>
                )
            ) : (
                <SkeletonGrid />
            )}
        </div>
    );
}
