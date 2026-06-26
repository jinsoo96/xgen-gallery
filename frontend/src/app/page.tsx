import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { LivePreview } from "@/components/live-preview";
import { ToolGrid } from "@/components/tool-grid";
import { UseCases } from "@/components/usecases";
import { QualitySecurity } from "@/components/quality-security";
import { Faq } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { faqPageLd } from "@/lib/structured-data";
import { dict } from "@/lib/i18n";

export default function Home() {
    return (
        <>
            <JsonLd data={faqPageLd(dict.ko.faq.entries)} />
            <SiteNav overlay />
            <main>
                <Hero />
                <LivePreview />
                <ToolGrid />
                <UseCases />
                <QualitySecurity />
                <Faq />
            </main>
            <SiteFooter />
        </>
    );
}
