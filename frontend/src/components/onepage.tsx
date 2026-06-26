import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";
import type { NavGroup, NavLeaf } from "@/lib/nav";
import { cn } from "@/lib/cn";

/**
 * Dark, full-bleed hero for a group one-page. Mirrors the releases/members
 * header pattern so every top-level area shares one visual language.
 */
function GroupHero({
    group,
    content,
}: {
    group: NavGroup;
    content?: ReactNode;
}) {
    return (
        <section className="relative flex min-h-[560px] items-center overflow-hidden border-b border-white/10 py-28 text-white">
            <SceneBackground concept={group.concept} />
            <div className="relative mx-auto w-full max-w-6xl px-6 pt-16">
                {content ?? (
                    <DefaultGroupHero group={group} />
                )}
            </div>
        </section>
    );
}

function DefaultGroupHero({ group }: { group: NavGroup }) {
    return (
        <>
            <p className="font-mono text-[13px] uppercase tracking-widest text-white/55">
                / {group.label}
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                {group.label}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/65">
                {group.blurb}
            </p>

            {/* quick jump to sections */}
            <nav className="mt-8 flex flex-wrap gap-2">
                    {group.items
                        .filter((it) => !it.hidden)
                        .map((it) =>
                            it.external ? (
                                <a
                                    key={it.id}
                                    href={it.external}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[14px] font-medium text-white/75 backdrop-blur-sm transition hover:border-white/40 hover:text-white"
                                >
                                    {it.label}
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </a>
                            ) : it.route ? (
                                <Link
                                    key={it.id}
                                    href={it.route}
                                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[14px] font-medium text-white/75 backdrop-blur-sm transition hover:border-white/40 hover:text-white"
                                >
                                    {it.label}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            ) : (
                                <a
                                    key={it.id}
                                    href={`#${it.id}`}
                                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[14px] font-medium text-white/75 backdrop-blur-sm transition hover:border-white/40 hover:text-white"
                                >
                                    {it.label}
                                </a>
                            ),
                        )}
            </nav>
        </>
    );
}

/**
 * One anchored section on a group page. `scroll-mt-24` keeps the heading clear
 * of the fixed nav when jumped to via an anchor. Renders `children` when content
 * exists, otherwise a "coming soon" placeholder so the skeleton is navigable.
 */
export function Section({
    item,
    tone = "default",
    children,
}: {
    item: NavLeaf;
    tone?: "default" | "alt";
    children?: ReactNode;
}) {
    return (
        <section
            id={item.id}
            className={cn(
                "scroll-mt-24 border-t border-[var(--color-line)]",
                tone === "alt"
                    ? "bg-[var(--color-surface-alt)]"
                    : "bg-[var(--color-surface)]",
            )}
        >
            <div className="mx-auto max-w-6xl px-6 py-24">
                <p className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                    / {item.label}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                    {item.label}
                </h2>

                {/* 자식 칩은 앵커 타깃 역할 — 주입 콘텐츠가 자체 id를 소유하는
                    섹션(예: research-areas)에서는 중복 id를 피하려고 렌더하지 않는다.
                    GNB 드롭다운의 하위 메뉴는 별도로 동작한다. */}
                {!children && item.children && item.children.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                        {item.children.map((c) => (
                            <a
                                key={c.id}
                                id={c.id}
                                href={`#${c.id}`}
                                className="scroll-mt-24 rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5 text-[14px] font-medium text-[var(--color-ink-muted)] transition hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
                            >
                                {c.label}
                            </a>
                        ))}
                    </div>
                )}

                <div className="mt-8">{children ?? <ComingSoon />}</div>
            </div>
        </section>
    );
}

function ComingSoon() {
    return (
        <div className="rounded-xl border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-alt)] p-10 text-center">
            <p className="text-[16px] text-[var(--color-ink-muted)]">
                콘텐츠 준비 중입니다.
            </p>
        </div>
    );
}

/** Brief intro + link to a standalone page (for `route` items). */
function RouteIntro({ item }: { item: NavLeaf }) {
    return (
        <div className="flex flex-col items-start gap-5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-8">
            <p className="max-w-xl text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                {item.blurb ??
                    `${item.label} 전체 내용을 별도 페이지에서 확인하세요.`}
            </p>
            <Link
                href={item.route!}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--color-ink)] px-4 py-2.5 text-[16px] font-semibold text-white transition hover:opacity-90"
            >
                {item.label} 바로가기
                <ArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}

/**
 * Full group one-page: nav + hero + every section. Pass `content` keyed by
 * section id to inject real content into specific sections; the rest fall back
 * to the placeholder.
 */
export function GroupPage({
    group,
    content,
    hero,
}: {
    group: NavGroup;
    content?: Record<string, ReactNode>;
    /** Custom hero key-visual content; falls back to the default title+blurb. */
    hero?: ReactNode;
}) {
    return (
        <>
            <SiteNav overlay />
            <GroupHero group={group} content={hero} />
            <main>
                {group.items
                    .filter((it) => !it.external)
                    .map((it, i) => (
                        <Section
                            key={it.id}
                            item={it}
                            tone={i % 2 === 1 ? "alt" : "default"}
                        >
                            {it.route ? (
                                <RouteIntro item={it} />
                            ) : (
                                content?.[it.id]
                            )}
                        </Section>
                    ))}
            </main>
            <SiteFooter />
        </>
    );
}
