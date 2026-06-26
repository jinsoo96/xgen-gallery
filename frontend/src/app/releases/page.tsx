import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ReleasesView } from "@/components/releases-view";
import { ReleasesHeader } from "@/components/releases-header";
import { SceneBackground } from "@/components/scene-background";
import { JsonLd } from "@/components/json-ld";
import { RELEASES } from "@/lib/releases";
import { itemListLd } from "@/lib/structured-data";

export const metadata = {
    title: "Release notes",
    description:
        "XGEN 플랫폼의 주요 업데이트 및 릴리스 이력. 신규 기능, 개선사항, 버그 수정을 한 곳에서 확인하세요.",
    alternates: { canonical: "/releases" },
};

export default function ReleasesPage() {
    return (
        <>
            <JsonLd
                data={itemListLd(
                    "XGEN Platform release notes",
                    RELEASES.map((r) => ({
                        name: `${r.version} — ${r.tagline} (${r.date})`,
                        url: `/releases#${r.version}`,
                        description: r.summary,
                    })),
                )}
            />
            <SiteNav overlay />
            <section className="relative flex h-[560px] items-center overflow-hidden border-b border-white/10 text-white">
                <SceneBackground concept="releases" />
                <div className="relative mx-auto w-full max-w-5xl px-6 pt-16">
                    <ReleasesHeader />
                </div>
            </section>
            <main className="mx-auto max-w-5xl px-6 pb-24 pt-12">
                <ReleasesView releases={RELEASES} />
            </main>
            <SiteFooter />
        </>
    );
}
