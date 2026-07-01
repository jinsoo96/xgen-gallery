import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";
import { PocContent } from "@/components/poc-content";

export const metadata = {
    title: "PoC Projects",
    description:
        "Plateer Labs의 PoC 실증 프로젝트 — 고객 현장의 페인포인트에서 출발해 XGEN 기술로 검증한 Enterprise AI 사례.",
    alternates: { canonical: "/poc-projects" },
};

export default function PocProjectsPage() {
    return (
        <>
            <SiteNav overlay />
            <section className="relative flex min-h-[560px] items-center overflow-hidden border-b border-white/10 py-28 text-white">
                <SceneBackground concept="solutions" />
                <div className="relative mx-auto w-full max-w-6xl px-6 pt-16">
                    <p className="text-[16px] font-semibold tracking-tight text-[#5eead4]">
                        Applied AI
                    </p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">
                        PoC Projects
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-white/85">
                        고객 현장의 페인포인트에서 출발해 XGEN 기술로 검증한
                        Enterprise AI 실증 프로젝트
                    </p>
                    <p className="mt-3 text-[17px] leading-relaxed text-white/60">
                        고객이 마주한 문제를 연구소가 함께 파고들어, 검증된 결과로
                        만들어갑니다
                    </p>
                </div>
            </section>

            <main className="mx-auto max-w-6xl px-6 py-24">
                <PocContent />
            </main>
            <SiteFooter />
        </>
    );
}
