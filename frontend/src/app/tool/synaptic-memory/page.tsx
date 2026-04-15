import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SynapticDemoClient } from "@/components/synaptic-demo-client";
import { TOOLS } from "@/lib/tools";

export default function SynapticMemoryPage() {
    const tool = TOOLS.find((t) => t.id === "synaptic-memory")!;
    return (
        <>
            <SiteNav />
            <SynapticDemoClient tool={tool} />
            <SiteFooter />
        </>
    );
}
