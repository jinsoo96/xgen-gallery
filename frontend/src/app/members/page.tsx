import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { MembersHeader } from "@/components/members-header";
import { SceneBackground } from "@/components/scene-background";
import { MembersLazy } from "@/components/members-lazy";

export const metadata = {
    title: "Lab Members",
    description:
        "Meet the people behind Plateer Labs — the open-source contributors building XGEN.",
    alternates: { canonical: "/members" },
};

/**
 * The page shell (nav + hero key-visual) is static so it renders instantly on
 * navigation. Member data is fetched client-side by <MembersLazy /> as the grid
 * scrolls into view, so a slow GitHub round-trip never blocks the first paint.
 */
export default function MembersPage() {
    return (
        <>
            <SiteNav overlay />
            <section className="relative flex h-[560px] items-center overflow-hidden border-b border-white/10 text-white">
                <SceneBackground concept="members" />
                <div className="relative mx-auto w-full max-w-6xl px-6 pt-16">
                    <MembersHeader />
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-6 pb-24 pt-12">
                <MembersLazy />
            </main>
            <SiteFooter />
        </>
    );
}
