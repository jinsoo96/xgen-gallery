import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";
import { LivePreview } from "@/components/live-preview";
import { ToolGrid } from "@/components/tool-grid";
import { UseCases } from "@/components/usecases";

export const metadata = {
    title: "Library Gallery",
    description:
        "XGEN 플랫폼을 떠받치는 오픈소스 AI 라이브러리 모음 — 문서 인제스션, 지식 그래프, 에이전트 도구. pip로 설치하거나 브라우저에서 바로 체험하세요.",
    alternates: { canonical: "/library-gallery" },
};

export default function LibraryGalleryPage() {
    return (
        <>
            <SiteNav overlay />
            <section className="relative flex h-[560px] items-center overflow-hidden border-b border-white/10 text-white">
                <SceneBackground concept="tools" />
                <div className="relative mx-auto w-full max-w-6xl px-6 pt-16">
                    <p className="text-[16px] font-semibold tracking-tight text-[#fcd34d]">
                        Open Source · Library Gallery
                    </p>
                    <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
                        Library Gallery
                    </h1>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/65">
                        XGEN을 떠받치는 오픈소스 라이브러리. pip로 설치하거나, 모든
                        도구를 지금 여기 브라우저에서 체험하세요.
                    </p>
                </div>
            </section>
            {/* 메인 페이지(키비주얼 제외)와 동일한 콘텐츠 구성 */}
            <main>
                <LivePreview />
                <ToolGrid />
                <section id="recipes" className="scroll-mt-24">
                    <UseCases />
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
