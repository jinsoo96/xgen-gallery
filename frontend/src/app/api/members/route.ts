import { NextResponse } from "next/server";
import { getMembersPayload, MEMBERS_REVALIDATE_SECONDS } from "@/lib/members/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const payload = await getMembersPayload();
        return NextResponse.json(payload, {
            headers: {
                "Cache-Control": `public, s-maxage=${MEMBERS_REVALIDATE_SECONDS}, stale-while-revalidate=${MEMBERS_REVALIDATE_SECONDS * 2}`,
            },
        });
    } catch (err) {
        console.error("[/api/members] failed:", err);
        return NextResponse.json(
            { error: "Failed to load members" },
            { status: 502 },
        );
    }
}
