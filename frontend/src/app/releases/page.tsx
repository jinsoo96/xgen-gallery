import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ReleasesView } from "@/components/releases-view";
import { RELEASES } from "@/lib/releases";

export const metadata = {
    title: "Release notes · PlateerLab",
    description:
        "XGEN 플랫폼의 주요 업데이트 및 릴리스 이력. 신규 기능, 개선사항, 버그 수정을 한 곳에서 확인하세요.",
};

export default function ReleasesPage() {
    return (
        <>
            <SiteNav />
            <main className="mx-auto max-w-5xl px-6 pb-24 pt-14 md:pt-20">
                <header className="mb-12 md:mb-16">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-ink-subtle)]">
                        Changelog
                    </p>
                    <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                        Release notes
                    </h1>
                    <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                        XGEN 플랫폼의 새 기능, 개선사항, 버그 수정을 정리했습니다.
                        최신 변경사항이 먼저 표시됩니다.
                    </p>
                </header>

                <ReleasesView releases={RELEASES} />
            </main>
            <SiteFooter />
        </>
    );
}
