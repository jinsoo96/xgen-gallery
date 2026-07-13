import { pageMetadata } from "@/lib/metadata";
import { GroupPage } from "@/components/onepage";
import { getGroup } from "@/lib/nav";

export const metadata = pageMetadata({
    title: "Products",
    description: "XGEN 플랫폼과 PathFinder, FloUI, Canvas, MCP Compiler.",
    path: "/products",
});

export default function ProductsPage() {
    return <GroupPage group={getGroup("products")!} />;
}
