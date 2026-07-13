import type { Metadata } from "next";
import { SITE } from "./site";

/**
 * 페이지 전용 메타데이터 빌더 — 모든 라우트는 이 헬퍼로 `metadata`(또는
 * generateMetadata 반환값)를 만들어야 한다.
 *
 * 왜: openGraph/twitter를 생략하면 링크 미리보기(Teams·Slack·카카오 등)가
 * 페이지 내용이 아니라 루트 레이아웃의 사이트 공통 기본값으로 뜬다. 이 헬퍼는
 * canonical·OG·Twitter 카드를 페이지 제목/설명으로 한 번에 채워 그 누락을 막는다.
 *
 * 신규 페이지 생성 체크리스트는 docs/GEO-OPTIMIZATION-GUIDE.md 참고.
 */
export interface PageMetaInput {
    /** 페이지 제목(브랜드 접미사 제외 — <title>은 루트 template이 `· Plateer Labs`를 붙임). */
    title: string;
    /** 페이지 설명 — meta description·og:description·twitter description에 공통 사용. */
    description: string;
    /** canonical 경로(예: "/about"). og:url에도 사용. */
    path: string;
    /** 공유 이미지 절대/상대 URL. 기본값은 사이트 공통 OG 이미지. */
    image?: string;
    /** 공유 이미지 크기(있으면 og:image:width/height 출력 — 언퍼를 안정화). */
    imageDims?: { width: number; height: number };
    /** 색인 제어가 필요한 페이지용(예: noindex). */
    robots?: Metadata["robots"];
}

export function pageMetadata({
    title,
    description,
    path,
    image = SITE.ogImage,
    imageDims,
    robots,
}: PageMetaInput): Metadata {
    // og:title은 template이 자동 적용되지 않으므로 브랜드 접미사를 명시적으로 붙인다.
    const ogTitle = `${title} · ${SITE.name}`;
    return {
        title,
        description,
        alternates: { canonical: path },
        openGraph: {
            type: "website",
            siteName: SITE.name,
            title: ogTitle,
            description,
            url: path,
            locale: SITE.locale,
            images: [{ url: image, ...(imageDims ?? {}) }],
        },
        twitter: {
            card: "summary_large_image",
            title: ogTitle,
            description,
            images: [image],
        },
        ...(robots ? { robots } : {}),
    };
}
