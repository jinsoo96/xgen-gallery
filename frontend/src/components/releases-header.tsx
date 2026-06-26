"use client";

import { useI18n } from "@/components/i18n-provider";

export function ReleasesHeader() {
    const { t } = useI18n();
    return (
        <>
            <p className="mb-3 text-[14px] font-medium uppercase tracking-[0.18em] text-white/55">
                {t.releasesPage.eyebrow}
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {t.releasesPage.title}
            </h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/70">
                {t.releasesPage.desc}
            </p>
        </>
    );
}
