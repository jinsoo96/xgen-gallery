import { NextResponse } from "next/server";
import { getMemberDetail, MEMBERS_REVALIDATE_SECONDS } from "@/lib/members/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOGIN_RE = /^[a-zA-Z0-9-]{1,39}$/;

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ login: string }> },
) {
    const { login } = await params;
    if (!LOGIN_RE.test(login)) {
        return NextResponse.json({ error: "Invalid login" }, { status: 400 });
    }
    try {
        const detail = await getMemberDetail(login);
        return NextResponse.json(detail, {
            headers: {
                "Cache-Control": `public, s-maxage=${MEMBERS_REVALIDATE_SECONDS}, stale-while-revalidate=${MEMBERS_REVALIDATE_SECONDS * 2}`,
            },
        });
    } catch (err) {
        console.error(`[/api/members/${login}] failed:`, err);
        return NextResponse.json(
            { error: "Failed to load member" },
            { status: 502 },
        );
    }
}
