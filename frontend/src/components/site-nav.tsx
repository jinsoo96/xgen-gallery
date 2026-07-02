"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { LanguageToggle } from "@/components/language-toggle";
import { SiteSearch } from "@/components/site-search";
import { useI18n } from "@/components/i18n-provider";
import { NAV_GROUPS, DEMO_CTA, sectionHref, type NavLeaf } from "@/lib/nav";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/cn";

function GithubIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            aria-hidden="true"
        >
            <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.38-3.87-1.38-.52-1.32-1.28-1.67-1.28-1.67-1.05-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.77 2.7 1.26 3.36.97.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.3-.51-1.48.11-3.08 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.8 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.6.24 2.78.12 3.08.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.77 1.07.77 2.16v3.2c0 .32.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
        </svg>
    );
}

/**
 * Split dropdown items into columns for a `wide` layout. If any item sets
 * `colBreak`, columns break explicitly at those items; otherwise items are
 * distributed evenly across `cols` columns.
 */
function buildColumns(items: NavLeaf[], cols: number): NavLeaf[][] {
    if (items.some((it) => it.colBreak)) {
        const out: NavLeaf[][] = [];
        items.forEach((it, idx) => {
            if (idx === 0 || it.colBreak) out.push([it]);
            else out[out.length - 1].push(it);
        });
        return out;
    }
    const per = Math.ceil(items.length / cols);
    return Array.from({ length: cols }, (_, c) =>
        items.slice(c * per, (c + 1) * per),
    );
}

/** One entry (and its nested children) inside a GNB dropdown. */
function DropdownItem({
    item,
    groupKey,
    onClose,
}: {
    item: NavLeaf;
    groupKey: string;
    onClose: () => void;
}) {
    const parentCls =
        "block rounded-lg px-3 py-2 text-[16px] font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface-hover)]";
    const childCls =
        "block rounded-lg px-3 py-1.5 text-[15px] font-medium text-[var(--color-ink-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]";
    return (
        <div>
            {item.external ? (
                <a
                    href={item.external}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className={cn(parentCls, "flex items-center gap-1")}
                >
                    {item.label}
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-ink-subtle)]" />
                </a>
            ) : (
                <Link
                    href={item.route ?? sectionHref(groupKey, item.id)}
                    onClick={onClose}
                    className={parentCls}
                >
                    {item.label}
                </Link>
            )}
            {item.children && (
                <div className="mb-1 ml-3 border-l border-[var(--color-line)] pl-2">
                    {item.children.map((c) =>
                        c.external ? (
                            <a
                                key={c.id}
                                href={c.external}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={onClose}
                                className={cn(childCls, "flex items-center gap-1")}
                            >
                                {c.label}
                                <ArrowUpRight className="h-3 w-3 text-[var(--color-ink-subtle)]" />
                            </a>
                        ) : (
                            <Link
                                key={c.id}
                                href={c.route ?? sectionHref(groupKey, c.id)}
                                onClick={onClose}
                                className={childCls}
                            >
                                {c.label}
                            </Link>
                        ),
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Global nav. Top-level groups (Research, Technology, …) each open a dropdown of
 * their sections, which deep-link to the group's one-page (/{group}#{section}).
 *
 * With `overlay`, the bar floats transparent over a dark hero, then turns solid
 * white on scroll. Without it, it's the regular sticky white bar.
 */
export function SiteNav({ overlay = false }: { overlay?: boolean }) {
    const { locale, t } = useI18n();
    const [scrolled, setScrolled] = useState(false);
    const [openKey, setOpenKey] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileGroup, setMobileGroup] = useState<string | null>(null);

    // 드롭다운 닫힘을 살짝 지연한다. 트리거 → 하위 항목으로 마우스를 옮기는 도중
    // 경로가 잠깐 헤더를 벗어나도 즉시 닫히지 않아, 첫 클릭이 빈 공간에 떨어지는
    // 문제(두 번 클릭해야 하는 현상)를 막는다. 다시 들어오면 예약된 닫힘을 취소한다.
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const openMenu = (key: string) => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
        setOpenKey(key);
    };
    const scheduleClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setOpenKey(null), 160);
    };
    const closeNow = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
        setOpenKey(null);
    };
    useEffect(() => {
        return () => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
        };
    }, []);

    useEffect(() => {
        if (!overlay) return;
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [overlay]);

    // light = transparent nav over the dark hero (top of an overlay page).
    // The bar turns solid white only on scroll — not when a dropdown opens.
    const light = overlay && !scrolled;

    const headerCls = overlay
        ? cn(
              "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
              scrolled
                  ? "border-b border-[var(--color-line)] bg-white/90 backdrop-blur-md"
                  : "border-b border-transparent bg-transparent",
          )
        : "sticky top-0 z-50 border-b border-[var(--color-line)] bg-white/90 backdrop-blur-md";

    const groupCls = cn(
        "inline-flex items-center gap-1 transition",
        light
            ? "text-white/80 hover:text-white"
            : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
    );

    const demoLabel = locale === "en" ? DEMO_CTA.en : DEMO_CTA.ko;

    return (
        <header className={headerCls} onMouseLeave={scheduleClose}>
            <div className="flex h-[84px] w-full items-center justify-between px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 leading-none min-[1152px]:ml-[calc((100vw-72rem)/2)]"
                >
                    <BrandMark
                        className={cn(
                            "h-[21px] w-auto transition",
                            light && "brightness-0 invert",
                        )}
                    />
                    <span
                        className="text-[28px] font-extrabold leading-none tracking-tight text-[#00adee] transition-colors"
                    >
                        LABS
                    </span>
                </Link>

                {/* desktop groups */}
                <nav className="hidden items-center gap-9 text-[19px] font-extrabold lg:flex">
                    {NAV_GROUPS.filter((g) => !g.hidden).map((g) => {
                        const menuItems = g.items.filter((it) => !it.hidden);
                        const hasMenu = !g.flat && menuItems.length > 0;
                        return (
                        <div
                            key={g.key}
                            className="relative"
                            onMouseEnter={() => openMenu(g.key)}
                        >
                            {g.external ? (
                                <a
                                    href={g.external}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[#5ec8f5] transition hover:text-[#8ddbf8]"
                                >
                                    {g.label}
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </a>
                            ) : (
                                <Link
                                    href={`/${g.key}`}
                                    className={groupCls}
                                    onClick={closeNow}
                                >
                                    {g.label}
                                    {hasMenu && (
                                        <ChevronDown
                                            className={cn(
                                                "h-3.5 w-3.5 transition",
                                                openKey === g.key &&
                                                    "rotate-180",
                                            )}
                                        />
                                    )}
                                </Link>
                            )}

                            {hasMenu && openKey === g.key && (
                                <div className="absolute left-0 top-full pt-3">
                                    {g.wide ? (
                                        <div className="flex gap-8 rounded-xl border border-[var(--color-line)] bg-white p-4 shadow-xl">
                                            {buildColumns(
                                                menuItems,
                                                g.cols ?? 3,
                                            ).map((slice, col) =>
                                                slice.length === 0 ? null : (
                                                    <div
                                                        key={col}
                                                        className="min-w-[180px]"
                                                    >
                                                        {slice.map((it) => (
                                                            <DropdownItem
                                                                key={it.id}
                                                                item={it}
                                                                groupKey={g.key}
                                                                onClose={closeNow}
                                                            />
                                                        ))}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <div className="min-w-[230px] rounded-xl border border-[var(--color-line)] bg-white p-2 shadow-xl">
                                            {menuItems.map((it) => (
                                                <DropdownItem
                                                    key={it.id}
                                                    item={it}
                                                    groupKey={g.key}
                                                    onClose={closeNow}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        );
                    })}
                </nav>

                <div className="flex items-center justify-end gap-3">
                    <div className="w-[150px] sm:w-[180px] lg:w-[210px]">
                        <SiteSearch light={light} />
                    </div>
                    {/* utility icons — language + github (desktop only) */}
                    <div className="hidden items-center gap-3 lg:flex">
                        <LanguageToggle light={light} />
                        <Link
                            href={SITE.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                            className={cn(
                                "inline-flex transition",
                                light
                                    ? "text-white/80 hover:text-white"
                                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
                            )}
                        >
                            <GithubIcon className="h-5 w-5" />
                        </Link>
                    </div>

                    {/* primary CTA — 임시 숨김 (요청: 검색바 확장). false && 로 비활성화. */}
                    {false && (
                        <>
                            <span
                                className={cn(
                                    "hidden h-5 w-px lg:block",
                                    light ? "bg-white/20" : "bg-[var(--color-line)]",
                                )}
                                aria-hidden
                            />
                            <Link
                                href={DEMO_CTA.href}
                                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(45deg,#00acee_20%,#185aea_80%)] px-5 py-2.5 text-[16px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(47,123,255,0.6)] transition hover:brightness-110"
                            >
                                {demoLabel}
                            </Link>
                        </>
                    )}

                    {/* mobile hamburger */}
                    <button
                        type="button"
                        aria-label="Menu"
                        onClick={() => setMobileOpen((v) => !v)}
                        className={cn(
                            "inline-flex lg:hidden",
                            light
                                ? "text-white"
                                : "text-[var(--color-ink)]",
                        )}
                    >
                        {mobileOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* mobile drawer — full-width accordion rows */}
            {mobileOpen && (
                <div className="border-t border-[var(--color-line)] bg-white lg:hidden">
                    <div className="mx-auto max-h-[80vh] max-w-6xl divide-y divide-[var(--color-line)] overflow-y-auto px-6">
                        {NAV_GROUPS.filter((g) => !g.hidden).map((g) => {
                            const items = g.items.filter((it) => !it.hidden);
                            const hasMenu = !g.flat && items.length > 0;
                            const open = mobileGroup === g.key;
                            const close = () => {
                                setMobileOpen(false);
                                setMobileGroup(null);
                            };
                            return (
                                <div key={g.key}>
                                    {g.external ? (
                                        <a
                                            href={g.external}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={close}
                                            className="flex w-full items-center justify-between py-5 text-lg font-bold text-[var(--color-ink)]"
                                        >
                                            {g.label}
                                            <ArrowUpRight className="h-5 w-5 text-[var(--color-ink-subtle)]" />
                                        </a>
                                    ) : hasMenu ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMobileGroup(
                                                    open ? null : g.key,
                                                )
                                            }
                                            aria-expanded={open}
                                            className="flex w-full items-center justify-between py-5 text-left text-lg font-bold text-[var(--color-ink)]"
                                        >
                                            {g.label}
                                            <ChevronDown
                                                className={cn(
                                                    "h-5 w-5 text-[var(--color-ink-subtle)] transition",
                                                    open && "rotate-180",
                                                )}
                                            />
                                        </button>
                                    ) : (
                                        <Link
                                            href={`/${g.key}`}
                                            onClick={close}
                                            className="flex w-full items-center justify-between py-5 text-lg font-bold text-[var(--color-ink)]"
                                        >
                                            {g.label}
                                        </Link>
                                    )}

                                    {hasMenu && (open || g.external) && (
                                        <div className="pb-3">
                                            {items.map((it) => (
                                                <div key={it.id}>
                                                    {it.external ? (
                                                        <a
                                                            href={it.external}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={close}
                                                            className="flex items-center gap-1 py-2.5 text-[17px] font-medium text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]"
                                                        >
                                                            {it.label}
                                                            <ArrowUpRight className="h-4 w-4 text-[var(--color-ink-subtle)]" />
                                                        </a>
                                                    ) : (
                                                        <Link
                                                            href={
                                                                it.route ??
                                                                sectionHref(
                                                                    g.key,
                                                                    it.id,
                                                                )
                                                            }
                                                            onClick={close}
                                                            className="block py-2.5 text-[17px] font-medium text-[var(--color-ink-muted)] transition hover:text-[var(--color-ink)]"
                                                        >
                                                            {it.label}
                                                        </Link>
                                                    )}
                                                    {it.children && (
                                                        <div className="ml-3 border-l border-[var(--color-line)] pl-3">
                                                            {it.children.map(
                                                                (c) =>
                                                                    c.external ? (
                                                                        <a
                                                                            key={c.id}
                                                                            href={c.external}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            onClick={close}
                                                                            className="flex items-center gap-1 py-1.5 text-[15px] text-[var(--color-ink-subtle)] transition hover:text-[var(--color-ink)]"
                                                                        >
                                                                            {c.label}
                                                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                                                        </a>
                                                                    ) : (
                                                                        <Link
                                                                            key={c.id}
                                                                            href={
                                                                                c.route ??
                                                                                sectionHref(
                                                                                    g.key,
                                                                                    c.id,
                                                                                )
                                                                            }
                                                                            onClick={
                                                                                close
                                                                            }
                                                                            className="block py-1.5 text-[15px] text-[var(--color-ink-subtle)] transition hover:text-[var(--color-ink)]"
                                                                        >
                                                                            {c.label}
                                                                        </Link>
                                                                    ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </header>
    );
}
