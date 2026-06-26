import { GroupPage } from "@/components/onepage";
import { getGroup } from "@/lib/nav";

export const metadata = {
    title: "Products",
    description: "XGEN 플랫폼과 PathFinder, FloUI, Canvas, MCP Compiler.",
    alternates: { canonical: "/products" },
};

export default function ProductsPage() {
    return <GroupPage group={getGroup("products")!} />;
}
