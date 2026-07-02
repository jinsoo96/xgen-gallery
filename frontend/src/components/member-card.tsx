import Link from "next/link";
import { Activity, ArrowUpRight, MapPin, Star, GitBranch, type LucideIcon } from "lucide-react";
import { formatStars, languageColor } from "@/lib/members/format";
import type { MemberSummary } from "@/lib/members/types";
import { contributedReposFor } from "@/lib/members/contributions";
import { cn } from "@/lib/cn";

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

export function MemberCard({ member, isTop = false }: { member: MemberSummary; isTop?: boolean }) {
    const displayName = member.name ?? member.login;
    // 카드 repos = 공개 소유 레포 + 큐레이션된 조직 기여(예: PlateerLab/xgen-gallery).
    const contribCount = contributedReposFor(member.login).length;
    const repoCount = member.publicRepos + contribCount;
    return (
        <Link
            href={`/members/${member.login}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white transition duration-200 hover:-translate-y-1 hover:border-[#bcd0f5] hover:shadow-[0_20px_44px_-22px_rgba(20,40,80,0.28)]"
        >
            {/* 상단 그라데이션 배너 — 상위 기여자는 골드 톤 */}
            <div
                className={cn(
                    "relative h-14 bg-gradient-to-br",
                    isTop
                        ? "from-[#fff4d6] via-[#fdecc2] to-[#fbe3b0]"
                        : "from-[#eaf1ff] via-[#eef0ff] to-[#f2ecff]",
                )}
            >
                <a
                    href={member.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Open ${member.login} on GitHub`}
                    className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-[var(--color-ink-muted)] backdrop-blur transition hover:bg-white hover:text-[var(--color-ink)]"
                >
                    <ArrowUpRight className="h-4 w-4" />
                </a>
            </div>

            <div className="flex flex-1 flex-col px-5 pb-5">
                {/* 배너에 걸친 아바타 */}
                <div className="relative -mt-9 w-fit">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={member.avatarUrl}
                        alt={`${member.login} avatar`}
                        width={64}
                        height={64}
                        loading="lazy"
                        className={cn(
                            "h-16 w-16 rounded-2xl border-[3px] border-white bg-[var(--color-surface-alt)] object-cover shadow-sm",
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
                                className="pointer-events-none absolute -top-[20px] -left-[12px] h-[34px] w-[68px] -rotate-[14deg] select-none drop-shadow-[0_2px_3px_rgba(180,120,0,0.45)]"
                            />
                            <span className="sr-only">Top contributor</span>
                        </>
                    )}
                </div>

                {/* 이름 + 핸들 */}
                <div className="mt-3 min-w-0">
                    <h3 className="truncate text-[18px] font-bold tracking-tight text-[var(--color-ink)]">
                        {displayName}
                    </h3>
                    <p className="truncate font-mono text-[13px] text-[var(--color-ink-muted)]">
                        @{member.login}
                    </p>
                </div>

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

                {/* 하단 CTA — 가벼운 텍스트 링크 */}
                <div className="mt-auto flex items-center justify-end pt-4">
                    <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#2461d8] transition group-hover:gap-1.5">
                        View profile
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
