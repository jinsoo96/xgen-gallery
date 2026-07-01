/**
 * Single source of truth for the global navigation (GNB) and footer.
 *
 * Concept: every top-level group is a "one-page" (a single scrollable route)
 * whose sub-menu items are anchor links to sections inside that page. Clicking
 * a sub-menu therefore scrolls to `/{group}#{section}`. Content is filled in
 * gradually — sections that have no content yet render a placeholder.
 *
 * To add/rename a menu, edit this file only; SiteNav, the group pages, and the
 * footer are all driven from here.
 */
import type { ConceptId } from "@/lib/backgrounds";

export interface NavLeaf {
    /** display label */
    label: string;
    /** anchor id within the group page (becomes /{group}#{id}) */
    id: string;
    /** nested children (one level), e.g. XGEN → PathFinder/FloUI/... */
    children?: NavLeaf[];
    /**
     * Absolute external URL. When set, this item is an outbound link (opens in a
     * new tab with an external-link indicator) instead of an in-page section —
     * it is skipped when rendering the group one-page's sections.
     */
    external?: string;
    /**
     * Internal route to a standalone page (e.g. "/library-gallery"). When set,
     * the menu links straight to that page, and the group one-page renders only
     * a short intro + a "바로가기" link to it instead of full inline content.
     */
    route?: string;
    /** Short intro copy for a `route` item on the group one-page. */
    blurb?: string;
    /**
     * Hide from the menus (GNB dropdown, mobile drawer, hero quick-jump) while
     * keeping the section rendered on the group one-page. Use to retire a menu
     * entry without deleting its content.
     */
    hidden?: boolean;
    /**
     * In a `wide` dropdown, force this item to start a new column (line break).
     * Use to control column grouping instead of even auto-distribution.
     */
    colBreak?: boolean;
}

export interface NavGroup {
    /** url segment + key, e.g. "research" → /research */
    key: string;
    /** top-level GNB label */
    label: string;
    /** background atmosphere for the group's one-page hero */
    concept: ConceptId;
    /** short hero subtitle — fill in over time */
    blurb: string;
    /** sub-menu items, each an anchored section on the group page */
    items: NavLeaf[];
    /**
     * Hide this whole group from the menus (GNB dropdown, mobile drawer, footer
     * Explore list) while keeping its one-page route (/{key}) reachable.
     */
    hidden?: boolean;
    /**
     * External URL. When set, the top-level menu opens this in a new tab with an
     * outbound-link arrow instead of linking to an in-site /{key} one-page.
     */
    external?: string;
    /**
     * Render the GNB entry as a flat 1-depth link (no dropdown) even though the
     * group has `items`. The items still drive the group's one-page sections —
     * only the top-level menu is collapsed to a single link to /{key}.
     */
    flat?: boolean;
    /** Lay the GNB dropdown out in multiple columns (for long item lists). */
    wide?: boolean;
    /** Number of columns for a `wide` dropdown (default 3). */
    cols?: number;
}

/** Build the full href for a group/section: /research#research-areas */
export function sectionHref(groupKey: string, id: string): string {
    return `/${groupKey}#${id}`;
}

export const NAV_GROUPS: NavGroup[] = [
    {
        key: "research",
        label: "Research",
        concept: "research",
        blurb: "엔터프라이즈 AI를 떠받치는 연구 — 영역, 백서, 아키텍처, 로드맵.",
        items: [
            { label: "Research Areas", id: "research-areas" },
            { label: "Papers", id: "papers" },
            { label: "Publications", id: "publications" },
        ],
    },
    {
        key: "technology",
        label: "Technology",
        concept: "technology",
        blurb: "엔진부터 런타임, 오픈소스 라이브러리 갤러리까지.",
        wide: true,
        items: [
            {
                label: "Engines",
                id: "engines",
                children: [
                    { label: "Ontology", id: "ontology" },
                    { label: "Harness", id: "harness" },
                ],
            },
            {
                label: "Frameworks",
                id: "frameworks",
                children: [
                    { label: "AgenticOps", id: "agenticops" },
                    { label: "GraphRAG", id: "graphrag" },
                    { label: "Hybrid RAG", id: "hybrid-rag" },
                    { label: "Context Engineering", id: "context-engineering" },
                ],
            },
            {
                label: "Architecture",
                id: "architecture",
                colBreak: true,
                route: "/architecture",
                blurb: "신뢰할 수 있는 Enterprise AI를 위한 참조 아키텍처를 별도 페이지에서 확인하세요.",
                children: [
                    { label: "기반 아키텍처", id: "foundation", route: "/architecture#foundation" },
                    { label: "설계 원칙", id: "principles", route: "/architecture#principles" },
                    { label: "Enterprise AI 아키텍처", id: "reference", route: "/architecture#reference" },
                    { label: "XGEN 플랫폼", id: "platform", route: "/architecture#platform" },
                    { label: "코드 어시스턴트", id: "code-assistant", route: "/architecture#code-assistant" },
                    { label: "CI/CD 배포", id: "cicd", route: "/architecture#cicd" },
                ],
            },
            {
                label: "Runtime",
                id: "runtime",
                colBreak: true,
                children: [
                    { label: "MCP Apps", id: "mcp-apps" },
                    { label: "Runtime SDK", id: "runtime-sdk" },
                    { label: "Runtime API", id: "runtime-api" },
                ],
            },
        ],
    },
    {
        key: "products",
        label: "Products",
        concept: "products",
        blurb: "XGEN 플랫폼과 그 위의 제품들.",
        hidden: true,
        items: [
            { label: "Polar", id: "polar" },
            {
                label: "XGEN",
                id: "xgen",
                children: [
                    { label: "PathFinder", id: "pathfinder" },
                    { label: "FloUI", id: "floui" },
                    { label: "Canvas", id: "canvas" },
                    { label: "MCP App", id: "mcp-compiler" },
                ],
            },
            { label: "AI Code Assistant", id: "ai-code-assistant" },
        ],
    },
    {
        key: "solutions",
        label: "Applied AI",
        concept: "solutions",
        blurb: "산업별 솔루션, 레퍼런스 아키텍처, 라이브러리 레시피.",
        wide: true,
        cols: 2,
        items: [
            {
                label: "Agentic AI",
                id: "ai-agents",
                children: [{ label: "Industries", id: "industries" }],
            },
            {
                label: "PoC Projects",
                id: "poc-projects",
                route: "/poc-projects",
                blurb: "산업별 PoC 실증 프로젝트를 한 페이지에서 모아 확인하세요.",
            },
            {
                label: "Technical Consulting",
                id: "technical-consulting",
                route: "/technical-consulting",
                blurb: "AI 도입 전략부터 PoC, 아키텍처 설계, 운영 체계까지 — 연구 기반 기술 컨설팅을 별도 페이지에서 확인하세요.",
            },
            {
                // Library Gallery(별도 페이지) 아래에 Library Recipes를 서브로 노출.
                // Recipes 링크는 /solutions#library-recipes 섹션으로 스크롤된다.
                label: "Library Gallery",
                id: "library-gallery",
                route: "/library-gallery",
                blurb: "XGEN을 떠받치는 오픈소스 라이브러리 모음 — 인제스션, 지식 그래프, 에이전트 도구를 한곳에서.",
                children: [{ label: "Library Recipes", id: "library-recipes" }],
            },
            {
                // Product — XGEN 제품. 라벨은 xgen.im 으로 나가고, 하위에
                // 인증·문서·체험을 노출한다(Applied AI 2열 드롭다운의 한 항목).
                label: "Product",
                id: "xgen-site",
                external: "https://www.xgen.im/",
                children: [
                    { label: "Certifications & Quality", id: "certification" },
                    {
                        label: "Documentation",
                        id: "documentation",
                        route: "/documentation",
                    },
                    {
                        label: "무료 체험 (Trial)",
                        id: "xgen-trial",
                        external: "https://www.xgen.im/trial",
                    },
                ],
            },
            {
                // 섹션은 /solutions#library-recipes 로 렌더하되, GNB 드롭다운에는
                // 노출하지 않는다(위 Library Gallery 하위 항목에서만 진입).
                label: "Library Recipes",
                id: "library-recipes",
                hidden: true,
            },
            {
                // 섹션은 /solutions#certification 으로 렌더하되, GNB 드롭다운에는
                // 노출하지 않는다(최상위 Product 메뉴의 "Certifications & Quality"에서만 진입).
                label: "Certifications & Quality",
                id: "certification",
                hidden: true,
            },
        ],
    },
    {
        // Resources 메뉴 — Documentation · Release Notes · Research Team 드롭다운.
        key: "resources",
        label: "Resources",
        concept: "resources",
        blurb: "문서와 릴리스 노트, 그리고 연구 멤버",
        items: [
            {
                label: "Release Notes",
                id: "releases",
                route: "/releases",
                blurb: "XGEN 플랫폼의 새 기능, 개선사항, 버그 수정 이력.",
            },
            {
                label: "Research Team",
                id: "research-team",
                route: "/members",
                blurb: "Plateer Labs를 만드는 멤버들을 소개합니다.",
            },
        ],
    },
    {
        // 1-depth 메뉴 — 파일베이스 블로그(/blog)로 바로 이동.
        key: "blog",
        label: "Insight Blog",
        concept: "insights",
        blurb: "Enterprise AI · Agentic AI · GEO·SEO 인사이트",
        items: [],
    },
];

/** Lookup a group by its url key. */
export function getGroup(key: string): NavGroup | undefined {
    return NAV_GROUPS.find((g) => g.key === key);
}

/** Primary call-to-action — opens the XGEN demo-request one-page (/demo). */
export const DEMO_CTA = {
    ko: "PoC · 기술 상담",
    en: "PoC · Tech consulting",
    href: "/contact",
};

/** Footer "About" column — its own one-page at /about. */
export const ABOUT_GROUP: NavGroup = {
    key: "about",
    label: "About",
    concept: "about",
    blurb: "Plateer Labs를 만드는 미션과 사람들.",
    items: [
        { label: "Company", id: "company", external: "https://www.plateer.com/" },
    ],
};
