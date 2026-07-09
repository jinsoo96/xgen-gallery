import { Sparkles, Rocket, FileText, Mail, type LucideIcon } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd } from "@/lib/structured-data";
import { absoluteUrl } from "@/lib/site";
import { NewsletterSignup } from "@/components/newsletter-signup";

export const metadata = {
    title: "뉴스레터",
    description:
        "Plateer Labs 뉴스레터 — Enterprise AI·Agentic AI 연구와 실무 인사이트, 제품 소식과 검증된 적용 사례를 정기적으로 받아보세요.",
    alternates: { canonical: "/newsletter" },
    openGraph: {
        title: "뉴스레터 · Plateer Labs",
        description:
            "Enterprise AI 인사이트와 제품 소식을 정기적으로 받아보세요.",
        type: "website",
        url: absoluteUrl("/newsletter"),
    },
};

const BENEFITS: { icon: LucideIcon; title: string; desc: string }[] = [
    {
        icon: Sparkles,
        title: "연구·기술 인사이트",
        desc: "Agentic AI·RAG·거버넌스 등 현장에서 검증한 기술 인사이트를 정리해 전달합니다",
    },
    {
        icon: Rocket,
        title: "제품 소식·릴리스",
        desc: "XGEN을 비롯한 Plateer Labs 제품의 새 기능과 릴리스 소식을 가장 먼저 알려드립니다",
    },
    {
        icon: FileText,
        title: "검증된 적용 사례",
        desc: "금융·공공·커머스 등 산업별 Enterprise AI 도입·실증 사례를 공유합니다",
    },
];

export default function NewsletterPage() {
    return (
        <>
            <SiteNav overlay />
            <JsonLd
                data={[
                    breadcrumbLd([
                        { name: "Home", path: "/" },
                        { name: "Insight", path: "/blog" },
                        { name: "뉴스레터", path: "/newsletter" },
                    ]),
                ]}
            />

            {/* Hero */}
            <section className="relative flex min-h-[440px] items-center overflow-hidden border-b border-white/10 py-28 text-white">
                <SceneBackground concept="insights" />
                <div className="relative mx-auto w-full max-w-3xl px-6 pt-16 text-center">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur">
                        <Mail className="h-6 w-6" />
                    </span>
                    <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
                        Plateer Labs 뉴스레터
                    </h1>
                    <p className="mt-5 text-lg leading-relaxed text-white/75">
                        Enterprise AI·Agentic AI 연구와 실무 인사이트, 제품 소식과
                        검증된 적용 사례를 정기적으로 받아보세요
                    </p>
                </div>
            </section>

            <main className="mx-auto max-w-3xl px-6 py-20">
                {/* 혜택 */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {BENEFITS.map((b) => (
                        <div
                            key={b.title}
                            className="flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6"
                        >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#2f7bff]/10 text-[#2f7bff]">
                                <b.icon className="h-5 w-5" />
                            </span>
                            <h2 className="mt-4 text-[16px] font-bold tracking-tight text-[var(--color-ink)]">
                                {b.title}
                            </h2>
                            <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
                                {b.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* 구독 폼 */}
                <div className="mt-10 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-7">
                    <h2 className="text-xl font-bold tracking-tight text-[var(--color-ink)]">
                        지금 구독하기
                    </h2>
                    <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                        원치 않으시면 언제든 한 번의 클릭으로 구독을 해지할 수 있습니다
                    </p>
                    <div className="mt-5">
                        <NewsletterSignup />
                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
