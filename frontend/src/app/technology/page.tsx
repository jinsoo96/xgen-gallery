import { GroupPage } from "@/components/onepage";
import {
    EnginesContent,
    FrameworksContent,
    RuntimeContent,
} from "@/components/technology-sections";
import { getGroup } from "@/lib/nav";

export const metadata = {
    title: "Technology",
    description:
        "Ontology · Harness 엔진부터 AgenticOps · GraphRAG 프레임워크, 독립 MCP 런타임까지 — 운영·독립·연결·확장을 떠받치는 XGEN 기술.",
    alternates: { canonical: "/technology" },
};

function TechnologyHero() {
    return (
        <div className="max-w-3xl">
            <p className="text-[16px] font-semibold tracking-tight text-[#67e8f9]">
                Technology
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Enterprise AI, Engineered for Reality
            </h1>
            <p className="mt-5 text-lg font-medium leading-relaxed text-white/85">
                실험을 넘어 실제 운영까지
            </p>
            <p className="mt-2 max-w-xl text-[16px] leading-relaxed text-white/65">
                Enterprise AI를 위한 핵심 엔진과 프레임워크를 연구하고 설계합니다
            </p>
        </div>
    );
}

export default function TechnologyPage() {
    // Library Gallery is a standalone page (/library-gallery); the section here
    // renders a short intro + link via the item's `route`.
    return (
        <GroupPage
            group={getGroup("technology")!}
            hero={<TechnologyHero />}
            content={{
                engines: <EnginesContent />,
                frameworks: <FrameworksContent />,
                runtime: <RuntimeContent />,
            }}
        />
    );
}
