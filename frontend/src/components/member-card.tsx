import Link from "next/link";
import { Activity, ArrowUpRight, MapPin, Star, GitBranch, PenLine, type LucideIcon } from "lucide-react";
import { formatStars, languageColor } from "@/lib/members/format";
import type { MemberSummary } from "@/lib/members/types";
import { contributedReposFor } from "@/lib/members/contributions";
import { cn } from "@/lib/cn";

/** 멤버가 작성한 블로그 글 요약 — 최근 1건 + 총 글 수(멤버 카드에 노출). */
export interface RecentPost {
    slug: string;
    title: string;
    date: string;
    count: number;
}

/** One metric in the 3-column stat strip. */
function Stat({
    icon: Icon,
    value,
    label,
    title,
}: {
    icon: LucideIcon;
    value: React.ReactNode;
    label: string;
    title?: string;
}) {
    return (
        <div className="flex flex-col items-center gap-0.5 py-2.5" title={title}>
            <span className="inline-flex items-center gap-1 text-[15px] font-bold tracking-tight text-[var(--color-ink)]">
                <Icon className="h-3.5 w-3.5 text-[var(--color-ink-subtle)]" />
                {value}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-ink-subtle)]">
                {label}
            </span>
        </div>
    );
}

export function MemberCard({
    member,
    isTop = false,
    recent,
}: {
    member: MemberSummary;
    isTop?: boolean;
    recent?: RecentPost;
}) {
    const displayName = member.name ?? member.login;
    // 카드 repos = 공개 소유 레포 + 큐레이션된 조직 기여(예: PlateerLab/xgen-gallery).
    const contribCount = contributedReposFor(member.login).length;
    const repoCount = member.publicRepos + contribCount;
    return (
        <div className="group relative isolate flex flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#bcd0f5] hover:shadow-[0_20px_44px_-22px_rgba(20,40,80,0.28)]">
            {/* 카드 전체를 덮는 프로필 링크(오버레이). 내부 링크는 z-10로 위에 둔다 */}
            <Link
                href={`/members/${member.login}`}
                aria-label={`${displayName} 프로필 보기`}
                className="absolute inset-0 z-0"
            >
                <span className="sr-only">프로필 보기</span>
            </Link>

            {/* 상단 헤더 — 그라데이션 배너 위에 아바타 + 이름/계정을 1행으로 */}
            <div
                className={cn(
                    "relative flex items-center gap-3 bg-gradient-to-br px-5 py-4",
                    isTop
                        ? "from-[#fff4d6] via-[#fdecc2] to-[#fbe3b0]"
                        : "from-[#eaf1ff] via-[#eef0ff] to-[#f2ecff]",
                )}
            >
                {/* 아바타 */}
                <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={member.avatarUrl}
                        alt={`${member.login} avatar`}
                        width={56}
                        height={56}
                        loading={isTop ? "eager" : "lazy"}
                        fetchPriority={isTop ? "high" : "auto"}
                        className={cn(
                            "h-14 w-14 rounded-2xl border-[3px] border-white bg-[var(--color-surface-alt)] object-cover shadow-sm",
                            isTop && "ring-2 ring-amber-300",
                        )}
                    />
                    {isTop && (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/vecteezy_gradient-gold-royal-crown_20774605.svg"
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none absolute -top-[18px] -left-[10px] h-[30px] w-[60px] -rotate-[14deg] select-none drop-shadow-[0_2px_3px_rgba(180,120,0,0.45)]"
                            />
                            <span className="sr-only">Top contributor</span>
                        </>
                    )}
                </div>

                {/* 이름 + 계정 */}
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[18px] font-bold tracking-tight text-[var(--color-ink)]">
                        {displayName}
                    </h3>
                    <p className="truncate font-mono text-[13px] text-[var(--color-ink-muted)]">
                        @{member.login}
                    </p>
                </div>

                {/* 우측: GitHub 화살표 + 그 아래 View Profile */}
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <a
                        href={member.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${member.login} on GitHub`}
                        className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-[var(--color-ink-muted)] backdrop-blur transition hover:bg-white hover:text-[var(--color-ink)]"
                    >
                        <ArrowUpRight className="h-4 w-4" />
                    </a>
                    <Link
                        href={`/members/${member.login}`}
                        className="relative z-10 whitespace-nowrap text-[12.5px] font-semibold text-[#2461d8] transition hover:text-[#1b4fb0]"
                    >
                        View Profile
                    </Link>
                </div>
            </div>

            <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                {/* 소개 */}
                <p className="mt-3 line-clamp-2 h-[2.6em] text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                    {member.bio || "—"}
                </p>

                {/* 지표 스트립 */}
                <div className="mt-4 grid grid-cols-3 divide-x divide-[var(--color-line)] rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-alt)]">
                    <Stat icon={Star} value={formatStars(member.totalStars)} label="stars" />
                    <Stat
                        icon={GitBranch}
                        value={repoCount}
                        label="repos"
                        title={
                            contribCount
                                ? `공개 ${member.publicRepos} + 조직 기여 ${contribCount} (예: PlateerLab/xgen-gallery)`
                                : undefined
                        }
                    />
                    <Stat
                        icon={Activity}
                        value={member.recentActivityCount}
                        label="3d"
                        title={`${member.recentActivityCount} public event${member.recentActivityCount === 1 ? "" : "s"} in the last 3 days`}
                    />
                </div>

                {/* 위치 (없으면 높이만 유지해 그리드 정렬) */}
                {member.location ? (
                    <p className="mt-3 flex items-center gap-1 text-[13px] text-[var(--color-ink-subtle)]">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{member.location}</span>
                    </p>
                ) : (
                    <div className="mt-3 h-[1.05rem]" aria-hidden />
                )}

                {/* 주요 언어 칩 */}
                <div className="mt-3 flex h-[1.6rem] flex-nowrap gap-1.5 overflow-hidden">
                    {member.topLanguages.slice(0, 3).map((l) => (
                        <span
                            key={l.name}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-line)] bg-white px-2 py-0.5 font-mono text-[12px] text-[var(--color-ink-muted)]"
                        >
                            <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: languageColor(l.name) }}
                            />
                            {l.name}
                        </span>
                    ))}
                </div>

                {/* 이 멤버가 작성한 최근 블로그 글 (있을 때만) */}
                {recent && (
                    <div className="relative z-10 mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink-subtle)]">
                                <PenLine className="h-3 w-3" /> 최근 글
                            </span>
                            <Link
                                href={`/blog?author=${encodeURIComponent(displayName)}`}
                                className="text-[12.5px] font-semibold text-[#2461d8] transition hover:text-[#1b4fb0]"
                            >
                                더보기{recent.count > 1 ? ` (${recent.count})` : ""}
                            </Link>
                        </div>
                        <Link
                            href={`/blog/${recent.slug}`}
                            title={recent.title}
                            className="mt-1 block truncate text-[13.5px] font-semibold text-[var(--color-ink)] transition hover:text-[#2461d8]"
                        >
                            {recent.title}
                        </Link>
                        <time
                            dateTime={recent.date}
                            className="text-[12px] text-[var(--color-ink-subtle)]"
                        >
                            {recent.date.replaceAll("-", ".")}
                        </time>
                    </div>
                )}
            </div>
        </div>
    );
}
