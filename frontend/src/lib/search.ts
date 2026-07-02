import { TOOLS } from "@/lib/tools";
import { getAllPosts } from "@/lib/blog";
import { dict } from "@/lib/i18n";

/**
 * 사이트 전역 검색 인덱스 — 빌드/요청 시점에 생성해 /api/search-index로 서빙한다.
 * 백엔드 검색 엔진 없이 클라이언트에서 이 정적 인덱스를 퍼지 검색한다.
 */
export type SearchType = "페이지" | "아키텍처" | "도구" | "블로그" | "FAQ";

export interface SearchDoc {
    title: string;
    subtitle?: string;
    url: string;
    type: SearchType;
    /** 추가 검색어(태그·카테고리 등) */
    keywords?: string;
}

const PAGES: SearchDoc[] = [
    { title: "Research", subtitle: "Enterprise AI 연구 영역·백서·아키텍처", url: "/research", type: "페이지", keywords: "연구 리서치" },
    { title: "Research & Technology", subtitle: "엔진·프레임워크·아키텍처·연구", url: "/technology", type: "페이지", keywords: "기술 엔진 프레임워크 연구 리서치" },
    { title: "Applied AI", subtitle: "산업별 솔루션·Agentic AI·PoC", url: "/solutions", type: "페이지", keywords: "솔루션 산업 금융 공공 커머스" },
    { title: "Insight", subtitle: "연구·현장 인사이트", url: "/blog", type: "페이지", keywords: "블로그 인사이트 insight" },
    { title: "Architecture", subtitle: "Enterprise AI 참조 아키텍처·XGEN 플랫폼·CI/CD", url: "/architecture", type: "페이지", keywords: "아키텍처 architecture" },
    { title: "Documentation", subtitle: "XGEN 사용자 매뉴얼·가이드", url: "/documentation", type: "페이지", keywords: "문서 매뉴얼 manual" },
    { title: "Library Gallery", subtitle: "오픈소스 라이브러리 갤러리", url: "/library-gallery", type: "페이지", keywords: "라이브러리 오픈소스" },
    { title: "Release Notes", subtitle: "변경 이력·업데이트", url: "/releases", type: "페이지", keywords: "릴리즈 변경 이력 changelog" },
    { title: "Lab Members", subtitle: "연구 멤버 프로필·기여 활동", url: "/members", type: "페이지", keywords: "멤버 팀 team lab members 랩" },
    { title: "PoC Projects", subtitle: "산업별 PoC 실증 사례", url: "/poc-projects", type: "페이지", keywords: "poc 실증 사례" },
    { title: "Technical Consulting", subtitle: "AI 도입 전략·PoC·아키텍처 컨설팅", url: "/technical-consulting", type: "페이지", keywords: "컨설팅 consulting" },
    { title: "PoC · 기술 상담", subtitle: "문의·상담 신청", url: "/contact", type: "페이지", keywords: "문의 상담 contact 데모" },
];

const ARCHITECTURE: SearchDoc[] = [
    { title: "기반 아키텍처", subtitle: "데이터 주권·AI Runtime 핵심 기반", url: "/architecture#foundation", type: "아키텍처" },
    { title: "아키텍처 설계 원칙", subtitle: "근거 기반·데이터 주권·조합성·거버넌스", url: "/architecture#principles", type: "아키텍처" },
    { title: "Enterprise AI 아키텍처", subtitle: "접근 채널부터 모델·인프라까지 참조 구조", url: "/architecture#reference", type: "아키텍처" },
    { title: "XGEN 2.0 플랫폼 아키텍처", subtitle: "클라이언트·게이트웨이·마이크로서비스·데이터 계층", url: "/architecture#platform", type: "아키텍처" },
    { title: "코드 어시스턴트 아키텍처", subtitle: "인덱싱·하이브리드 검색·AI 재정렬", url: "/architecture#code-assistant", type: "아키텍처" },
    { title: "CI/CD 배포 파이프라인", subtitle: "GitOps 기반 통제된 배포", url: "/architecture#cicd", type: "아키텍처" },
];

/** 인덱스 생성 (서버 전용 — 블로그 fs 접근 포함). */
export function buildSearchIndex(): SearchDoc[] {
    const tools: SearchDoc[] = TOOLS.map((t) => ({
        title: t.name,
        subtitle: t.tagline,
        url: `/tool/${t.id}`,
        type: "도구",
        keywords: t.category,
    }));

    const posts: SearchDoc[] = getAllPosts().map((p) => ({
        title: p.title,
        subtitle: p.description,
        url: `/blog/${p.slug}`,
        type: "블로그",
        keywords: [p.category, ...(p.tags ?? [])].join(" "),
    }));

    const faqs: SearchDoc[] = dict.ko.faq.entries.map((f) => ({
        title: f.question,
        subtitle: f.answer.slice(0, 90),
        url: "/#faq",
        type: "FAQ",
    }));

    return [...PAGES, ...ARCHITECTURE, ...tools, ...posts, ...faqs];
}
