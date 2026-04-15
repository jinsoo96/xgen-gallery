import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { LivePreview } from "@/components/live-preview";
import { ToolGrid } from "@/components/tool-grid";
import { UseCases } from "@/components/usecases";

export default function Home() {
    return (
        <>
            <SiteNav />
            <main>
                <Hero />
                <LivePreview />
                <ToolGrid />
                <UseCases />
            </main>
            <SiteFooter />
        </>
    );
}
