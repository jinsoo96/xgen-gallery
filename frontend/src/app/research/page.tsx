import { GroupPage } from "@/components/onepage";
import { ResearchContent } from "@/components/research-content";
import { getGroup } from "@/lib/nav";

export const metadata = {
    title: "Research",
    description:
        "Plateer Labs의 연구 — Enterprise AI를 현실로 만드는 연구 영역과 아키텍처.",
    alternates: { canonical: "/research" },
};

function ResearchHero() {
    return (
        <div className="max-w-3xl">
            <p className="text-[16px] font-semibold tracking-tight text-[#7dd3fc]">
                Research
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Research that makes Enterprise AI real
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
                기업 환경의 AI 도입은 더 이상 모델 성능만으로 결정되지 않습니다
            </p>
        </div>
    );
}

export default function ResearchPage() {
    return (
        <GroupPage
            group={getGroup("research")!}
            hero={<ResearchHero />}
            content={{ "research-areas": <ResearchContent /> }}
        />
    );
}
