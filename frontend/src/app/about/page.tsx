import { pageMetadata } from "@/lib/metadata";
import { GroupPage } from "@/components/onepage";
import { ABOUT_GROUP } from "@/lib/nav";

export const metadata = pageMetadata({
    title: "About Plateer Labs",
    description: "Plateer Labs를 만드는 사람들과 회사 소개.",
    path: "/about",
});

export default function AboutPage() {
    return <GroupPage group={ABOUT_GROUP} />;
}
