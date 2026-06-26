import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SynapticDemoClient } from "@/components/synaptic-demo-client";
import { JsonLd } from "@/components/json-ld";
import { TOOLS } from "@/lib/tools";
import { SITE } from "@/lib/site";
import { softwareApplicationLd, breadcrumbLd } from "@/lib/structured-data";

const TOOL = TOOLS.find((t) => t.id === "synaptic-memory")!;

export const metadata: Metadata = {
    title: `${TOOL.name} — ${TOOL.tagline}`,
    description: `${TOOL.description} 설치: ${TOOL.install} · 언어: ${TOOL.language} · 오픈소스(MIT). ${SITE.name}.`,
    alternates: { canonical: "/tool/synaptic-memory" },
    openGraph: {
        type: "article",
        siteName: SITE.name,
        title: `${TOOL.name} — ${TOOL.tagline}`,
        description: TOOL.description,
        url: `${SITE.url}/tool/synaptic-memory`,
        images: [{ url: SITE.ogImage }],
    },
};

export default function SynapticMemoryPage() {
    return (
        <>
            <JsonLd
                data={[
                    softwareApplicationLd(TOOL),
                    breadcrumbLd([
                        { name: "Home", path: "/" },
                        { name: "Tools", path: "/#tools" },
                        { name: TOOL.name, path: "/tool/synaptic-memory" },
                    ]),
                ]}
            />
            <SiteNav />
            <SynapticDemoClient tool={TOOL} />
            <SiteFooter />
        </>
    );
}
