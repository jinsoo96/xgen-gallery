import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ToolDemoClient } from "@/components/tool-demo-client";
import { JsonLd } from "@/components/json-ld";
import { TOOLS } from "@/lib/tools";
import { SITE } from "@/lib/site";
import { softwareApplicationLd, breadcrumbLd } from "@/lib/structured-data";

export function generateStaticParams() {
    return TOOLS.filter((t) => t.id !== "synaptic-memory").map((t) => ({ id: t.id }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const tool = TOOLS.find((t) => t.id === id);
    if (!tool) return { title: "Tool not found" };

    const title = `${tool.name} — ${tool.tagline}`;
    const description = `${tool.description} 설치: ${tool.install} · 언어: ${tool.language} · 오픈소스(MIT). ${SITE.name}.`;
    const path = `/tool/${tool.id}`;

    return {
        title,
        description,
        alternates: { canonical: path },
        openGraph: {
            type: "article",
            siteName: SITE.name,
            title,
            description,
            url: `${SITE.url}${path}`,
            images: [{ url: SITE.ogImage }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [SITE.ogImage],
        },
    };
}

export default async function ToolDemoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const tool = TOOLS.find((t) => t.id === id);
    if (!tool) notFound();

    return (
        <>
            <JsonLd
                data={[
                    softwareApplicationLd(tool),
                    breadcrumbLd([
                        { name: "Home", path: "/" },
                        { name: "Tools", path: "/#tools" },
                        { name: tool.name, path: `/tool/${tool.id}` },
                    ]),
                ]}
            />
            <SiteNav />
            <ToolDemoClient tool={tool} />
            <SiteFooter />
        </>
    );
}
