import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/search";

// 인덱스는 콘텐츠 변경 시에만 바뀌므로 1시간 캐시 후 재생성.
export const revalidate = 3600;

export function GET() {
    return NextResponse.json(
        { docs: buildSearchIndex() },
        { headers: { "cache-control": "public, max-age=0, s-maxage=3600" } },
    );
}
