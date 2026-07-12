import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SceneBackground } from "@/components/scene-background";
import { JsonLd } from "@/components/json-ld";
import { ViewCount } from "@/components/view-count";
import { getAllSlugs, getPost } from "@/lib/blog";
import { blogPostingLd, breadcrumbLd } from "@/lib/structured-data";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
    return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = getPost(slug);
    if (!post) return {};
    const url = absoluteUrl(`/blog/${post.slug}`);
    return {
        title: post.title,
        description: post.description,
        alternates: { canonical: `/blog/${post.slug}` },
        keywords: post.tags,
        openGraph: {
            title: post.title,
            description: post.description,
            type: "article",
            url,
            publishedTime: post.date,
            modifiedTime: post.updated || post.date,
            authors: [post.author],
            ...(post.cover ? { images: [absoluteUrl(post.cover)] } : {}),
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.description,
        },
    };
}

function fmtDate(d: string) {
    return d.replaceAll("-", ".");
}

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = getPost(slug);
    if (!post) notFound();

    return (
        <>
            <SiteNav overlay />
            <JsonLd
                data={[
                    blogPostingLd(post),
                    breadcrumbLd([
                        { name: "Home", path: "/" },
                        { name: "Blog", path: "/blog" },
                        { name: post.title, path: `/blog/${post.slug}` },
                    ]),
                ]}
            />

            <section className="relative flex min-h-[380px] items-center overflow-hidden border-b border-white/10 py-28 text-white">
                <SceneBackground concept="insights" />
                <div className="relative mx-auto w-full max-w-3xl px-6 pt-16">
                    <div className="flex flex-wrap items-center gap-2 text-[14px] text-white/60">
                        <time dateTime={post.date}>{fmtDate(post.date)}</time>
                        <span>·</span>
                        <span>Reading Time | {post.readingMinutes} min</span>
                        <ViewCount slug={post.slug} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-white/60">
                        <span>
                            작성 <span className="text-white/40">|</span>{" "}
                            <span className="text-white/80">{post.author}</span>
                        </span>
                        {post.editor && (
                            <span>
                                편집 <span className="text-white/40">|</span>{" "}
                                <span className="text-white/80">{post.editor}</span>
                            </span>
                        )}
                    </div>
                    {post.kicker && (
                        <div className="mt-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[13px] font-semibold uppercase tracking-wide text-white/85">
                            {post.kicker}
                        </div>
                    )}
                    <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-5xl">
                        {post.title}
                    </h1>
                    <p className="mt-5 text-lg leading-relaxed text-white/75">
                        {post.description}
                    </p>
                </div>
            </section>

            <main className="mx-auto max-w-3xl px-6 py-20">
                {post.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={post.cover}
                        alt=""
                        className="mb-12 aspect-[16/9] w-full rounded-2xl border border-[var(--color-line)] object-cover"
                    />
                )}
                <article
                    className="blog-prose"
                    dangerouslySetInnerHTML={{ __html: post.html }}
                />

                {post.tags.length > 0 && (
                    <div className="mt-10 flex flex-wrap gap-2 border-t border-[var(--color-line)] pt-6">
                        {post.tags.map((t) => (
                            <span
                                key={t}
                                className="rounded-full border border-[var(--color-line)] bg-[var(--color-surface-alt)] px-3 py-1 text-[13.5px] font-semibold text-[var(--color-ink-muted)]"
                            >
                                #{t}
                            </span>
                        ))}
                    </div>
                )}

                <Link
                    href="/blog"
                    className="mt-10 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#2461d8] transition hover:text-[#1b4fb0]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    블로그 목록으로
                </Link>
            </main>
            <SiteFooter />
        </>
    );
}
