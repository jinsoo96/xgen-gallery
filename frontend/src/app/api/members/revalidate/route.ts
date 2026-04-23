import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { inspectMembersCache } from "@/lib/members/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Read-only cache state for debugging. Safe to expose (no PII). */
export async function GET() {
    const info = await inspectMembersCache();
    return NextResponse.json({
        ok: true,
        tokenConfigured: Boolean(process.env.MEMBERS_REVALIDATE_TOKEN),
        ...info,
    });
}

export async function POST(req: Request) {
    const expected = process.env.MEMBERS_REVALIDATE_TOKEN;
    if (!expected) {
        return NextResponse.json(
            { error: "Revalidation disabled (no token configured)" },
            { status: 503 },
        );
    }
    const got = req.headers.get("x-revalidate-token");
    if (got !== expected) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    revalidateTag("members");
    return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
