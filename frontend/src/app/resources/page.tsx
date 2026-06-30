import { GroupPage } from "@/components/onepage";
import { getGroup } from "@/lib/nav";

export const metadata = {
    title: "Resources",
    description:
        "Enterprise AI를 위한 기술 문서, 연구 성과, 릴리즈 노트 — 연구소가 축적한 지식 자산을 공유합니다.",
    alternates: { canonical: "/resources" },
};

function ResourcesHero() {
    return (
        <div className="max-w-3xl">
            <p className="text-[16px] font-semibold tracking-tight text-[#5eead4]">
                Resources
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Enterprise AI Resources
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">
                Enterprise AI를 위한 기술 문서, 연구 성과, 릴리즈 노트를 통해
                연구소가 축적한 지식 자산을 공유합니다
            </p>
        </div>
    );
}

export default function ResourcesPage() {
    // Documentation and Releases are standalone pages; this hub shows a short
    // intro + link for each via their `route`.
    return <GroupPage group={getGroup("resources")!} hero={<ResourcesHero />} />;
}
