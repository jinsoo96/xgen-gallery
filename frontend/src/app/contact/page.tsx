import { pageMetadata } from "@/lib/metadata";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { DemoForm } from "@/components/demo-form";

export const metadata = pageMetadata({
    title: "PoC · 기술 상담",
    description:
        "Plateer Labs에 PoC와 Enterprise AI 기술 상담을 요청하세요. 과제를 남겨주시면 담당자가 영업일 기준 1–2일 내에 연락드립니다.",
    path: "/contact",
});

const BENEFITS = [
    "과제 정의부터 PoC 설계·실행까지 전문가 1:1 상담",
    "기술 요건에 맞춘 솔루션·레퍼런스 아키텍처 제안",
    "PoC 결과 기반 도입 로드맵 가이드 제공",
];

export default function ContactPage() {
    return (
        <>
            {/* overlay nav so the background fills behind the GNB, like the main page */}
            <SiteNav overlay />
            <section className="relative flex min-h-[calc(100dvh+2px)] items-center overflow-hidden border-b border-white/10 text-white">
                {/* 배경 이미지 — 메인과 동일한 풀블리드 구성 */}
                <div aria-hidden className="pointer-events-none absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/hero-bg.png"
                        alt=""
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050813]/80 via-[#050813]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050813]/55 to-transparent" />
                </div>
                <div className="relative mx-auto w-full max-w-6xl px-6 pt-[140px] pb-20 md:pt-[160px] md:pb-24">
                    <div className="grid items-start gap-12 md:grid-cols-2 md:gap-16">
                        {/* intro */}
                        <div className="md:pt-6">
                            <p className="text-[16px] font-semibold tracking-tight text-[#7dd3fc]">
                                Plateer Labs · PoC · 기술 상담
                            </p>
                            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                                PoC · 기술 상담
                            </h1>
                            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/65">
                                PoC나 Enterprise AI 기술 적용을 검토 중이신가요?
                                과제와 문의 내용을 남겨주시면 담당자가 영업일 기준
                                1–2일 내에 연락드립니다.
                            </p>
                            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">
                                현장에 배치되는{" "}
                                <span className="font-semibold text-white">
                                    FDE(Forward Deployed Engineer)
                                </span>
                                가 요구사항 발굴부터 설계·구현·내재화까지 함께합니다
                            </p>

                            <ul className="mt-8 space-y-3">
                                {BENEFITS.map((b) => (
                                    <li
                                        key={b}
                                        className="flex items-start gap-3 text-[16px] text-white/80"
                                    >
                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f7bff]" />
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* form */}
                        <div>
                            <DemoForm />
                        </div>
                    </div>
                </div>
            </section>
            <SiteFooter />
        </>
    );
}
