import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";
import { ResearchContent2 } from "@/components/research-content2";

/**
 * /research-areas2 — 사내 위키 "03. R&D/연구"를 B2B 고객 눈높이로 재작성한
 * 연구 분야 콘텐츠의 새 버전(미리보기). 기존 /research#research-areas 는 백업으로
 * 보존한다. 정식 전환 전까지는 중복 색인 방지를 위해 noindex.
 */
export const metadata = {
    title: "Research Areas · R&D",
    description:
        "Plateer Labs R&D — 온톨로지 기반 지식(OGRAG), 에이전트 하네스 실행 제어, AI 개발 생산성, 인프라·모델 최적화 연구.",
    alternates: { canonical: "/research-areas2" },
    robots: { index: false, follow: true },
};

export default function ResearchAreas2Page() {
    return (
        <>
            <SiteNav overlay />
            <section className="relative flex min-h-[520px] items-center overflow-hidden border-b border-white/10 py-28 text-white">
                <SceneBackground concept="research" />
                <div className="relative mx-auto w-full max-w-6xl px-6 pt-16">
                    <p className="text-[16px] font-semibold tracking-tight text-[#7dd3fc]">
                        Research · R&amp;D
                    </p>
                    <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">
                        Research that makes Enterprise AI real
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
                        기업 환경의 AI는 모델 성능만으로 결정되지 않습니다 — 지식·추론·
                        실행·운영을 하나의 체계로 연구합니다
                    </p>
                </div>
            </section>
            <main>
                <section className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
                    <div className="mx-auto max-w-6xl px-6 py-20">
                        <ResearchContent2 />
                    </div>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
