import { pageMetadata } from "@/lib/metadata";
import { Suspense } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { MembersHeader } from "@/components/members-header";
import { SceneBackground } from "@/components/scene-background";
import { MembersSection } from "@/components/members-section";
import {
    SkeletonGrid,
    StatsBarSkeleton,
} from "@/components/members-skeleton";

export const metadata = pageMetadata({
    title: "Lab Members",
    description:
        "Meet the people behind Plateer Labs — the open-source contributors building XGEN.",
    path: "/members",
});

// Render per request and stream: the nav + hero key-visual flush immediately,
// while <MembersSection> resolves inside its Suspense boundary. A slow GitHub
// round-trip only delays the streamed grid chunk, never the first paint.
export const dynamic = "force-dynamic";

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
                <Suspense
                    fallback={
                        <>
                            <StatsBarSkeleton />
                            <SkeletonGrid />
                        </>
                    }
                >
                    <MembersSection />
                </Suspense>
            </main>
            <SiteFooter />
        </>
    );
}
