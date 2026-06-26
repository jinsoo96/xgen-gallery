import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";

export const metadata = {
    title: "Documentation",
    description:
        "XGEN 플랫폼과 라이브러리 사용을 위한 가이드와 레퍼런스 문서.",
    alternates: { canonical: "/documentation" },
};

export default function DocumentationPage() {
    return (
        <>
            <SiteNav />
            <section className="relative overflow-hidden border-b border-white/10 text-white">
                <SceneBackground concept="resources" />
                <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-16 md:pt-32 md:pb-20">
                    <p className="font-mono text-[13px] uppercase tracking-widest text-white/55">
                        / Resources · Documentation
                    </p>
                    <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                        Documentation
                    </h1>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/65">
                        XGEN 플랫폼과 라이브러리 사용을 위한 가이드와 레퍼런스.
                    </p>
                </div>
            </section>
            <main className="mx-auto max-w-6xl px-6 py-24">
                <div className="rounded-xl border border-dashed border-[var(--color-line-strong)] bg-[var(--color-surface-alt)] p-10 text-center">
                    <p className="text-[16px] text-[var(--color-ink-muted)]">
                        문서를 준비 중입니다.
                    </p>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
