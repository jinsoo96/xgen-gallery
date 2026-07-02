import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";
import { JsonLd } from "@/components/json-ld";
import { BlogList } from "@/components/blog-list";
import { getAllPosts } from "@/lib/blog";
import { breadcrumbLd, itemListLd } from "@/lib/structured-data";
import { absoluteUrl } from "@/lib/site";

export const metadata = {
    title: "Insight Blog",
    description:
        "Plateer Labs Insight Blog — Case Study, Tech News, 제품 소식 등 Enterprise AI 연구·실무 인사이트를 공유합니다.",
    alternates: { canonical: "/blog" },
    openGraph: {
        title: "Insight Blog · Plateer Labs",
        description:
            "Case Study · Tech News · 제품 소식 — Enterprise AI 인사이트.",
        type: "website",
        url: absoluteUrl("/blog"),
    },
};

export default function BlogPage() {
    const posts = getAllPosts();

    return (
        <>
            <SiteNav overlay />
            <JsonLd
                data={[
                    {
                        "@context": "https://schema.org",
                        "@type": "Blog",
                        "@id": absoluteUrl("/blog#blog"),
                        name: "Plateer Labs Blog",
                        url: absoluteUrl("/blog"),
                        inLanguage: "ko",
                    },
                    itemListLd(
                        "Plateer Labs Blog",
                        posts.map((p) => ({
                            name: p.title,
                            url: `/blog/${p.slug}`,
                            description: p.description,
                        })),
                    ),
                    breadcrumbLd([
                        { name: "Home", path: "/" },
                        { name: "Blog", path: "/blog" },
                    ]),
                ]}
            />

            <section className="relative flex min-h-[480px] items-center overflow-hidden border-b border-white/10 py-28 text-white">
                <SceneBackground concept="insights" />
                <div className="relative mx-auto w-full max-w-6xl px-6 pt-16">
                    <p className="text-[16px] font-semibold tracking-tight text-[#fcd34d]">
                        Plateer Labs · Insight Blog
                    </p>
                    <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-5xl md:leading-[1.1]">
                        Proven by research,
                        <br />
                        delivered as value in the field
                    </h1>
                    <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
                        Case Study, Tech News, 제품 소식 —
                        <br className="hidden sm:block" />
                        연구와 현장에서 얻은 인사이트를 공유합니다
                    </p>
                </div>
            </section>

            <main id="articles" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
                <BlogList posts={posts} />
            </main>
            <SiteFooter />
        </>
    );
}
