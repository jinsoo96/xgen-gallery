"use client";

import { useI18n } from "@/components/i18n-provider";

export function ReleasesHeader() {
    const { t } = useI18n();
    return (
        <>
            <p className="mb-3 text-[16px] font-semibold tracking-tight text-[#5eead4]">
                {t.releasesPage.eyebrow.replace(/^\/\s*/, "")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
                {t.releasesPage.title}
            </h1>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/70">
                {t.releasesPage.desc}
            </p>
        </>
    );
}
