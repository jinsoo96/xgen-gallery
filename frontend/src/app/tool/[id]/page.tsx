import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ToolDemoClient } from "@/components/tool-demo-client";
import { TOOLS } from "@/lib/tools";

export function generateStaticParams() {
    return TOOLS.map((t) => ({ id: t.id }));
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
            <SiteNav />
            <ToolDemoClient tool={tool} />
            <SiteFooter />
        </>
    );
}
