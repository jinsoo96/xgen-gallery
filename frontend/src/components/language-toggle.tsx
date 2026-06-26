"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/cn";

/**
 * Compact icon-form language switch. A globe icon toggles KO ⇆ EN and shows the
 * current locale as a tiny code, so it sits inline with the GitHub icon and
 * keeps the GNB uncluttered. Pass `light` to match a transparent dark nav.
 */
export function LanguageToggle({
    className,
    light = false,
}: {
    className?: string;
    light?: boolean;
}) {
    const { locale, setLocale } = useI18n();
    const next = locale === "ko" ? "en" : "ko";

    return (
        <button
            type="button"
            onClick={() => setLocale(next)}
            aria-label={locale === "ko" ? "한국어 — 영어로 전환" : "English — switch to Korean"}
            title={locale === "ko" ? "English" : "한국어"}
            className={cn(
                "inline-flex items-center gap-1 transition",
                light
                    ? "text-white/80 hover:text-white"
                    : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
                className,
            )}
        >
            <Globe className="h-5 w-5" />
            <span className="text-[13px] font-semibold uppercase tracking-wide">
                {locale}
            </span>
        </button>
    );
}
