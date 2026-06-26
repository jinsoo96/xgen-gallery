import { GroupPage } from "@/components/onepage";
import { ABOUT_GROUP } from "@/lib/nav";

export const metadata = {
    title: "About PLEX",
    description: "Plateer AI Labs를 만드는 사람들과 회사 소개.",
    alternates: { canonical: "/about" },
};

export default function AboutPage() {
    return <GroupPage group={ABOUT_GROUP} />;
}
