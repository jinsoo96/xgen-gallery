export type ReleaseCategory = "new" | "improved" | "fixed";

export type ReleaseProduct = "xgen" | "library";

export interface ReleaseItem {
    category: ReleaseCategory;
    title: string;
    detail?: string;
    modules?: string[];
}

export interface Release {
    version: string;
    date: string;
    product: ReleaseProduct;
    tagline: string;
    summary: string;
    highlights?: string[];
    items: ReleaseItem[];
}

export const RELEASES: Release[] = [
    {
        version: "v2.2.0",
        date: "2026-04-21",
        product: "xgen",
        tagline: "Governance, Harness & Ontology v3",
        summary:
            "AI 거버넌스 대시보드, 하네스 오케스트레이터, 온톨로지 v3 — 엔터프라이즈 운영에 필요한 관찰성·컴플라이언스·지식 그래프 기반을 한층 고도화했습니다.",
        highlights: [
            "AI Governance dashboard",
            "Harness orchestrator (workflow → wheel)",
            "Ontology v3 hybrid search",
            "ABAC 권한 체계",
        ],
        items: [
            {
                category: "new",
                title: "AI Governance 대시보드",
                detail: "위험 평가 재수행, 응답 품질 커버리지, 점검 기한 초과 현황, 재평가 미완료율까지 — 거버넌스 운영에 필요한 주요 지표를 한 화면에서 모니터링합니다.",
                modules: ["xgen-core"],
            },
            {
                category: "new",
                title: "Harness 오케스트레이터",
                detail: "워크플로우를 독립 실행 가능한 wheel 패키지로 컴파일합니다. 실행 이력, DAG 엔드포인트, drift-free 연동, 노드 파라미터 자동 상속까지 UX 6트랙으로 정비했습니다.",
                modules: ["xgen-workflow"],
            },
            {
                category: "new",
                title: "Ontology v3 하이브리드 검색",
                detail: "벡터 검색 + Kiwi 형태소 분석 결합. 멀티홉 탐색, CSV 스키마 빌더, FK 자동 감지(카디널리티 필터 포함)를 추가했습니다.",
                modules: ["xgen-documents"],
            },
            {
                category: "new",
                title: "Support Center API",
                detail: "공지/QnA/FAQ/서비스 요청을 팝업·첨부파일·팔로업·통계와 함께 제공합니다.",
                modules: ["xgen-core"],
            },
            {
                category: "new",
                title: "ABAC 권한 체계",
                detail: "역할·권한 기반 접근 제어(`require_perm`)로 전환. 전체 컨트롤러의 권한 처리를 일관된 구조로 정비했습니다.",
                modules: ["xgen-core", "xgen-documents"],
            },
            {
                category: "new",
                title: "배치 LLM 평가",
                detail: "xlsx 업로드 → LLM 평가 → 원본 컬럼 유지한 결과 병합 다운로드. 평가 사유와 멀티 프로바이더 UI까지 지원합니다.",
                modules: ["xgen-frontend", "xgen-workflow"],
            },
            {
                category: "new",
                title: "문서 거버넌스 기능",
                detail: "컬렉션 TTL 관리, PII 자동 마스킹, 업로드 히스토리 추적 API.",
                modules: ["xgen-documents", "xgen-core"],
            },
            {
                category: "improved",
                title: "검색 성능 2~4배 개선",
                detail: "병렬 검색 파이프라인 도입, `limit` → `score_threshold` 전환, 코퍼스 크기 기반 동적 한계값으로 고도화했습니다.",
                modules: ["xgen-documents"],
            },
            {
                category: "improved",
                title: "share_permissions JSONB 전환",
                detail: "VARCHAR → JSONB 마이그레이션. 공유 역할, 기록 가능 스토리지, 폴더 단위 권한 체크까지 유연해졌습니다.",
                modules: ["xgen-core", "xgen-documents"],
            },
            {
                category: "improved",
                title: "SQL 도구 PostgreSQL 완전 전환",
                detail: "SQLite 기반 SQL 실행 도구를 PostgreSQL로 전면 이전했습니다.",
                modules: ["xgen-documents"],
            },
            {
                category: "improved",
                title: "xgen-sdk 1.4.4 통합 로깅",
                detail: "`create_logger`로 서비스 전반 로깅 체계를 통일했습니다.",
                modules: ["xgen-core", "xgen-documents"],
            },
            {
                category: "fixed",
                title: "FK 감지 오탐 방지",
                detail: "수량/가격 같은 숫자 데이터 컬럼에서 발생하던 FK 오탐을 카디널리티 필터로 차단했습니다.",
                modules: ["xgen-documents"],
            },
            {
                category: "fixed",
                title: "인스턴스 동의어 1:1 통합",
                detail: "공백·대소문자·한국어 조사를 정규화해 중복 노드를 제거합니다.",
                modules: ["xgen-documents"],
            },
            {
                category: "fixed",
                title: "문서 폴더 트리 동기화",
                detail: "폴더 삭제 버그, tree view 동기화, 문서 페이지네이션의 루트 포함 필터링 이슈를 일괄 수정했습니다.",
                modules: ["xgen-frontend"],
            },
        ],
    },
    {
        version: "v2.1.0",
        date: "2026-03-22",
        product: "xgen",
        tagline: "Multi-Cloud, HA & Air-gapped Scale",
        summary:
            "고가용성 2노드 프로필, 폐쇄망 K3s HA 이전, vLLM 0.17(Qwen3.5 지원) 등 멀티 클라우드·폐쇄망 운영 역량을 집중적으로 강화했습니다.",
        highlights: [
            "vLLM 0.17 + Qwen3.5",
            "HA 2-node profile",
            "Air-gapped K3s migration",
            "GPU 배포 파이프라인",
        ],
        items: [
            {
                category: "new",
                title: "vLLM 0.17.0 업그레이드",
                detail: "Qwen3.5 모델 지원, extra_args CLI 플래그 전달. `--served-model-name`으로 모델명 기반 추론 호출이 가능해졌습니다.",
                modules: ["xgen-model"],
            },
            {
                category: "new",
                title: "폐쇄망 K3s HA 이전",
                detail: "CNPG · Valkey · Qdrant · MinIO 기반 HA 스택으로 폐쇄망 환경에서 2노드 고가용성을 제공합니다.",
                modules: ["xgen-infra"],
            },
            {
                category: "new",
                title: "2노드 HA 프로필",
                detail: "`--mode ha-2` 단일 플래그로 HA 배포를 즉시 구성합니다.",
                modules: ["xgen-infra"],
            },
            {
                category: "new",
                title: "GPU 배포 지원",
                detail: "Jenkins buildx 마운트와 커스텀/GPU/기본 3단계 배포 전략 분기를 추가했습니다.",
                modules: ["xgen-infra", "xgen-model"],
            },
            {
                category: "new",
                title: "MS 365 멀티유저 인증",
                detail: "MS365 MCP에 Device Code Flow 대응 토큰 캐시 PVC, user_id 기반 멀티유저 지원이 추가되었습니다.",
                modules: ["xgen-mcp-station"],
            },
            {
                category: "new",
                title: "추론 Reverse Proxy",
                detail: "`/api/inference/*` → vLLM / llama-server 경로로 프록시해 모델 서버 교체 시 프런트엔드 변경 없이 스위칭할 수 있습니다.",
                modules: ["xgen-model"],
            },
            {
                category: "improved",
                title: "llama-server 폐쇄망 지원",
                detail: "vLLM 프로세스에 `HF_HUB_OFFLINE=1`, `TRANSFORMERS_OFFLINE=1` 환경변수를 적용했습니다.",
                modules: ["xgen-model"],
            },
            {
                category: "improved",
                title: "대형 모델 지원",
                detail: "xgen-model 메모리·프로브 타임아웃을 조정하여 대형 모델 로딩을 안정화했습니다.",
                modules: ["xgen-model"],
            },
            {
                category: "improved",
                title: "프로덕션 리소스 튜닝",
                detail: "실제 사용량 기반으로 CPU/Memory request를 상향하고 OOMKilled·CPU throttling을 해결했습니다.",
                modules: ["xgen-infra"],
            },
            {
                category: "fixed",
                title: "Ingress YAML 파싱",
                detail: "`hosts` 값의 별칭(`*`) 파싱 오류를 quote 처리로 해결했습니다.",
                modules: ["xgen-infra"],
            },
            {
                category: "fixed",
                title: "ArgoCD 프로젝트 오류",
                detail: "프로젝트명 오류와 `DEPLOY_ENV` 기본값을 개선하고, Root App 파일명을 `ARGOCD_PROJECT` 기반으로 동적 결정하도록 수정했습니다.",
                modules: ["xgen-infra"],
            },
        ],
    },
    {
        version: "v2.0.0",
        date: "2026-02-27",
        product: "xgen",
        tagline: "XGEN 2.0 General Availability",
        summary:
            "XGEN 2.0 정식 출시. 워크플로우·모델·문서·MCP를 통합한 차세대 AI 플랫폼으로 9개 핵심 모듈이 동시 릴리스되었습니다.",
        highlights: [
            "9-module unified release",
            "xgen-model v2 architecture",
            "MinIO model hub",
            "Agent mode + scenario recorder",
        ],
        items: [
            {
                category: "new",
                title: "XGEN 2.0 플랫폼",
                detail: "xgen-workflow · xgen-core · xgen-backend-gateway · xgen-frontend · xgen-model · xgen-mcp-station · xgen-session-station · xgen-documents · xgen-infra 9개 모듈을 v2.0.0 태그로 동시 공개했습니다.",
                modules: ["xgen-core", "xgen-workflow", "xgen-frontend", "xgen-model", "xgen-documents", "xgen-mcp-station", "xgen-session-station", "xgen-backend-gateway", "xgen-infra"],
            },
            {
                category: "new",
                title: "xgen-model v2 아키텍처",
                detail: "MinIO 중앙 모델 허브 + PV 캐시 구조로 모델 배포를 표준화했습니다. `/api/model/loading_status` 호환 엔드포인트까지 제공합니다.",
                modules: ["xgen-model"],
            },
            {
                category: "new",
                title: "Agent 모드",
                detail: "Playwright 기반 Agent가 실사이트에서 12대 개선사항, 6대 정확도 개선, 3-5배 MCP 호출 축소로 Claude Code 수준의 속도·정확도를 달성합니다.",
                modules: ["xgen-frontend", "xgen-app"],
            },
            {
                category: "new",
                title: "시나리오 녹화 + 재생",
                detail: "브라우저 상호작용 녹화, selector 보정, Excel 루프 자동 매핑, 재생 엔진까지 end-to-end 자동화를 지원합니다.",
                modules: ["xgen-frontend", "xgen-app"],
            },
            {
                category: "new",
                title: "Human-in-the-loop UX",
                detail: "일시정지 버튼, 상황별 맥락 표시 배너, MAX_ROUNDS 50 라운드 자동 개입, 엑셀 루프 중단 없는 수동 액션 캡처를 구현했습니다.",
                modules: ["xgen-frontend", "xgen-app"],
            },
            {
                category: "new",
                title: "Local CLI Bridge",
                detail: "Tauri 데스크탑 앱에서 로컬 CLI 명령을 백엔드-프런트엔드 WebSocket 브리지로 실행합니다. SSE pause/resume, CLI exec 블록 UI까지 포함합니다.",
                modules: ["xgen-app"],
            },
            {
                category: "new",
                title: "MCP Station 세션 관리",
                detail: "Redis 기반 세션, 멀티 팟 라우팅, 활동 기반 타임아웃, 프로세스 헬스체크로 대규모 MCP 운영 환경을 지원합니다.",
                modules: ["xgen-mcp-station"],
            },
            {
                category: "new",
                title: "시스템 트레이 + Remote WebView",
                detail: "데스크탑 앱이 트레이로 최소화되며, Remote WebView 아키텍처로 프로토콜 기반 API 경로 자동 감지가 동작합니다.",
                modules: ["xgen-app"],
            },
        ],
    },
];

export const RELEASE_PRODUCT_LABEL: Record<ReleaseProduct, string> = {
    xgen: "XGEN Platform",
    library: "Open Source",
};

export const RELEASE_CATEGORY_LABEL: Record<ReleaseCategory, string> = {
    new: "New",
    improved: "Improved",
    fixed: "Fixed",
};

export const RELEASE_CATEGORY_STYLE: Record<ReleaseCategory, string> = {
    new: "bg-[#111] text-white",
    improved: "bg-[#eef2ff] text-[#3730a3] border border-[#c7d2fe]",
    fixed: "bg-[#f5f5f5] text-[#525252] border border-[#e5e5e5]",
};
