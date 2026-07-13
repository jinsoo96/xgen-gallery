import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";
import { PocDemos } from "@/components/poc-demos";

const OG_TITLE = "실증 데모 — Proof in Action · Plateer Labs";
const OG_DESC =
    "백마디 말보다 실행으로 — XGEN Agentic AI 플랫폼의 핵심 기능이 실제로 실행되는 모습을 영상으로 확인하는 실증 데모.";
// 대표 영상(XGEN 실증 데모) 썸네일 — 링크 미리보기 이미지로 사용(1280×720).
const OG_IMAGE = "https://i.ytimg.com/vi/3vkbqk7b5WY/maxresdefault.jpg";

export const metadata = {
    title: "실증 데모 — Proof in Action",
    description:
        "백마디 말보다 실행으로 — XGEN Agentic AI 플랫폼의 핵심 기능이 실제로 실행되는 모습을 영상으로 확인하는 실증 데모.",
    alternates: { canonical: "/proof-in-action" },
    // 페이지 전용 OG — 없으면 링크 미리보기가 사이트 공통 기본값으로 뜬다.
    openGraph: {
        type: "website",
        title: OG_TITLE,
        description: OG_DESC,
        url: "/proof-in-action",
        images: [{ url: OG_IMAGE, width: 1280, height: 720 }],
    },
    twitter: {
        card: "summary_large_image",
        title: OG_TITLE,
        description: OG_DESC,
        images: [OG_IMAGE],
    },
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
                        백마디 말보다 실행으로 — XGEN의 핵심 기능이 실제로 실행되는
                        모습을 영상으로 확인하세요
                    </p>
                    <p className="mt-3 text-[17px] leading-relaxed text-white/60">
                        성능을 주장하는 대신, 실행하는 결과로 증명합니다
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
