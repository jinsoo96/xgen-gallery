"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { LanguageToggle } from "@/components/language-toggle";
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
    if (item.external) {
        return (
            <a
                href={item.external}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-[16px] font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface-hover)]"
            >
                {item.label}
                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--color-ink-subtle)]" />
            </a>
        );
    }
    return (
        <div>
            <Link
                href={item.route ?? sectionHref(groupKey, item.id)}
                onClick={onClose}
                className="block rounded-lg px-3 py-2 text-[16px] font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface-hover)]"
            >
                {item.label}
            </Link>
            {item.children && (
                <div className="mb-1 ml-3 border-l border-[var(--color-line)] pl-2">
                    {item.children.map((c) => (
                        <Link
                            key={c.id}
                            href={sectionHref(groupKey, c.id)}
                            onClick={onClose}
                            className="block rounded-lg px-3 py-1.5 text-[15px] font-medium text-[var(--color-ink-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-ink)]"
                        >
                            {c.label}
                        </Link>
                    ))}
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
        <header className={headerCls} onMouseLeave={() => setOpenKey(null)}>
            <div className="flex h-[84px] w-full items-center justify-between px-6">
                <Link
                    href="/"
                    className="flex translate-y-[12px] items-baseline gap-2 leading-none min-[1440px]:ml-[calc((100vw-90rem)/2)]"
                >
                    <BrandMark
                        className={cn(
                            "h-[24px] w-auto transition",
                            light && "brightness-0 invert",
                        )}
                    />
                    <span
                        className="text-[21px] font-extrabold leading-none tracking-tight text-[#00adee] transition-colors"
                    >
                        AILabs
                    </span>
                </Link>

                {/* desktop groups */}
                <nav className="hidden translate-x-[3px] translate-y-[12px] items-center gap-10 text-[19px] font-extrabold lg:flex">
                    {NAV_GROUPS.filter((g) => !g.hidden).map((g) => {
                        const menuItems = g.items.filter((it) => !it.hidden);
                        const hasMenu = !g.flat && menuItems.length > 0;
                        return (
                        <div
                            key={g.key}
                            className="relative"
                            onMouseEnter={() => setOpenKey(g.key)}
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
                                    onClick={() => setOpenKey(null)}
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
                                        <div className="flex gap-2 rounded-xl border border-[var(--color-line)] bg-white p-2 shadow-xl">
                                            <div className="min-w-[200px]">
                                                {menuItems
                                                    .slice(
                                                        0,
                                                        Math.ceil(
                                                            menuItems.length / 2,
                                                        ),
                                                    )
                                                    .map((it) => (
                                                        <DropdownItem
                                                            key={it.id}
                                                            item={it}
                                                            groupKey={g.key}
                                                            onClose={() =>
                                                                setOpenKey(null)
                                                            }
                                                        />
                                                    ))}
                                            </div>
                                            <div className="min-w-[200px] border-l border-[var(--color-line)] pl-2">
                                                {menuItems
                                                    .slice(
                                                        Math.ceil(
                                                            menuItems.length / 2,
                                                        ),
                                                    )
                                                    .map((it) => (
                                                        <DropdownItem
                                                            key={it.id}
                                                            item={it}
                                                            groupKey={g.key}
                                                            onClose={() =>
                                                                setOpenKey(null)
                                                            }
                                                        />
                                                    ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="min-w-[230px] rounded-xl border border-[var(--color-line)] bg-white p-2 shadow-xl">
                                            {menuItems.map((it) => (
                                                <DropdownItem
                                                    key={it.id}
                                                    item={it}
                                                    groupKey={g.key}
                                                    onClose={() =>
                                                        setOpenKey(null)
                                                    }
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

                <div className="flex translate-y-[12px] items-center justify-end gap-4">
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

                    <span
                        className={cn(
                            "hidden h-5 w-px lg:block",
                            light ? "bg-white/20" : "bg-[var(--color-line)]",
                        )}
                        aria-hidden
                    />

                    {/* primary CTA — always visible, incl. mobile header */}
                    <Link
                        href={DEMO_CTA.href}
                        className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(45deg,#00acee_20%,#185aea_80%)] px-5 py-2.5 text-[16px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(47,123,255,0.6)] transition hover:brightness-110"
                    >
                        {demoLabel}
                    </Link>

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
                                                                (c) => (
                                                                    <Link
                                                                        key={c.id}
                                                                        href={sectionHref(
                                                                            g.key,
                                                                            c.id,
                                                                        )}
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
