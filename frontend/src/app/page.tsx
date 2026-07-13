import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { HomeResearch } from "@/components/home-research";
import { HomeTechnology } from "@/components/home-technology";
import { UseCases } from "@/components/usecases";
import { HomeIndustries } from "@/components/home-industries";
import { HomeProductTour } from "@/components/home-product-tour";
import { QualitySecurity } from "@/components/quality-security";
import { HomeInsights } from "@/components/home-insights";
import { HomeResources } from "@/components/home-resources";
import { Faq } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { faqPageLd } from "@/lib/structured-data";
import { dict } from "@/lib/i18n";
import { getAllPosts } from "@/lib/blog";
import { getIssues } from "@/lib/newsletter";

export default function Home() {
    // 히어로 하단 오버레이용 최신 1건씩(서버에서 읽어 클라이언트 Hero로 전달).
    const p = getAllPosts()[0];
    const latestPost = p
        ? { slug: p.slug, title: p.title, category: p.category, date: p.date }
        : null;
    const iss = getIssues()[0];
    const latestIssue = iss
        ? { slug: iss.slug, title: iss.title, vol: iss.vol, date: iss.date }
        : null;

    return (
        <>
            <JsonLd data={faqPageLd(dict.ko.faq.entries)} />
            <SiteNav overlay />
            <main>
                <Hero latestPost={latestPost} latestIssue={latestIssue} />
                <HomeResearch />
                <HomeTechnology />
                <UseCases />
                <HomeIndustries />
                <HomeProductTour />
                <QualitySecurity />
                <HomeInsights />
                <HomeResources />
                <Faq />
            </main>
            <SiteFooter />
        </>
    );
}
