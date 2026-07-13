import { pageMetadata } from "@/lib/metadata";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";
import { ArrowUpRight } from "lucide-react";

/** XGEN 사용자 매뉴얼(외부) — Resources › Documentation에서 임베드로 노출. */
const MANUAL_URL =
    "https://sooanc.github.io/xgen-manual/docs/xgen-standard/index.html";

export const metadata = pageMetadata({
    title: "Documentation",
    description:
        "XGEN 플랫폼 사용자 매뉴얼 — 플랫폼과 라이브러리 사용을 위한 가이드와 레퍼런스.",
    path: "/documentation",
});

export default function DocumentationPage() {
    return (
        <>
            <SiteNav />
            <section className="relative overflow-hidden border-b border-white/10 text-white">
                <SceneBackground concept="resources" />
                <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-16 md:pt-32 md:pb-20">
                    <p className="text-[16px] font-semibold tracking-tight text-[#5eead4]">
                        Resources · Documentation
                    </p>
                    <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
                        XGEN 사용자 매뉴얼
                    </h1>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/65">
                        XGEN 플랫폼과 라이브러리 사용을 위한 가이드와 레퍼런스
                    </p>
                    <a
                        href={MANUAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-7 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(45deg,#00acee_20%,#185aea_80%)] px-6 py-3 text-[16px] font-semibold text-white shadow-[0_8px_24px_-6px_rgba(47,123,255,0.5)] transition hover:brightness-110"
                    >
                        매뉴얼 새 탭에서 열기
                        <ArrowUpRight className="h-4 w-4" />
                    </a>
                </div>
            </section>
            <main className="mx-auto max-w-6xl px-6 py-12">
                <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white shadow-sm">
                    <iframe
                        src={MANUAL_URL}
                        title="XGEN 사용자 매뉴얼"
                        className="h-[82vh] w-full"
                        loading="lazy"
                    />
                </div>
                <p className="mt-4 text-center text-[14px] text-[var(--color-ink-subtle)]">
                    매뉴얼이 보이지 않으면{" "}
                    <a
                        href={MANUAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#2461d8] underline-offset-2 hover:underline"
                    >
                        새 탭에서 열기
                    </a>
                    를 눌러주세요
                </p>
            </main>
            <SiteFooter />
        </>
    );
}
