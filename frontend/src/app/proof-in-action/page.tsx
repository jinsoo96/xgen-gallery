import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";
import { PocDemos } from "@/components/poc-demos";

export const metadata = {
    title: "실증 데모 — Proof in Action",
    description:
        "말보다 동작으로 — XGEN Agentic AI 플랫폼의 핵심 기능이 실제로 실행되는 모습을 영상으로 확인하는 실증 데모.",
    alternates: { canonical: "/proof-in-action" },
};

export default function ProofInActionPage() {
    return (
        <>
            <SiteNav overlay />
            <section className="relative flex min-h-[460px] items-center overflow-hidden border-b border-white/10 py-28 text-white">
                <SceneBackground concept="solutions" />
                <div className="relative mx-auto w-full max-w-6xl px-6 pt-16">
                    <p className="text-[16px] font-semibold tracking-tight text-[#5eead4]">
                        Applied AI · Proof in Action
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">
                        실증 데모
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-white/85">
                        말보다 동작으로 — XGEN의 핵심 기능이 실제로 실행되는 모습을
                        영상으로 확인하세요
                    </p>
                    <p className="mt-3 text-[17px] leading-relaxed text-white/60">
                        성능을 주장하는 대신, 동작하는 결과로 증명합니다
                    </p>
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-6 py-24">
                <PocDemos />
            </main>
            <SiteFooter />
        </>
    );
}
