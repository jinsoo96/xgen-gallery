import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { HomeResearch } from "@/components/home-research";
import { HomeTechnology } from "@/components/home-technology";
import { UseCases } from "@/components/usecases";
import { HomeIndustries } from "@/components/home-industries";
import { QualitySecurity } from "@/components/quality-security";
import { HomeInsights } from "@/components/home-insights";
import { HomeResources } from "@/components/home-resources";
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
                <HomeResearch />
                <HomeTechnology />
                <UseCases />
                <HomeIndustries />
                <QualitySecurity />
                <HomeInsights />
                <HomeResources />
                <Faq />
            </main>
            <SiteFooter />
        </>
    );
}
