/**
 * XGEN 뉴스레터 — 격주 발행 아카이브. DB 없이 이 파일의 데이터로 정적 렌더한다.
 * 새 호를 낼 때는 ISSUES 맨 앞에 새 Issue 객체를 추가하면 목록·상세·사이트맵에
 * 자동 반영된다. 원본은 사내 메일(.msg)이며, 사이트 공개용으로 큐레이션한다.
 */

export type Badge =
    | "신규"
    | "개선"
    | "수정"
    | "개발중"
    | "연구중"
    | "준비중";

export interface ReleaseItem {
    title: string;
    badge: Badge;
    body: string;
}

export interface ProgressItem {
    title: string;
    badge: Extract<Badge, "개발중" | "연구중">;
    percent: number;
    body: string;
}

/** 기술 뉴스·읽을거리 공통 항목(외부 링크). */
export interface LinkItem {
    n: string; // "01" 표기
    title: string;
    body: string;
    source: string;
    readTime: string;
    url: string;
}

export interface PaperItem {
    arxiv: string;
    title: string;
    authors?: string;
    body: string;
    url: string;
}

export interface UpcomingItem {
    title: string;
    badge: Extract<Badge, "준비중">;
    body: string;
}

export interface Issue {
    slug: string; // "vol-1"
    vol: number;
    date: string; // YYYY-MM-DD
    title: string;
    summary: string;
    intro: string[];
    releases: ReleaseItem[];
    inProgress: ProgressItem[];
    news: LinkItem[];
    reading: LinkItem[];
    papers: PaperItem[];
    upcoming: UpcomingItem[];
}

const vol1: Issue = {
    slug: "vol-1",
    vol: 1,
    date: "2026-07-13",
    title: "XGEN 뉴스레터 vol.1",
    summary:
        "Claude Code 백엔드 연동, 구글 검색 AI 전면 전환, Context rot — 최근 소식을 정리했습니다",
    intro: [
        "안녕하세요, Plateer Labs AI솔루션연구소입니다. 오늘부터 연구소가 XGEN과 AI 관련 소식을 격주로 정리해 전해드립니다. 연구소의 활동과 최신 기술 동향을 한 걸음 더 가까이 공유하는 자리가 되었으면 합니다.",
        "창간호에서는 Claude Code 백엔드 연동을 포함한 최근 배포 내용과 현재 개발 중인 과제, 그리고 눈여겨볼 만한 기술 뉴스·읽을거리·논문을 함께 담았습니다.",
    ],
    releases: [
        {
            title: "Claude Code (CLI) 백엔드",
            badge: "신규",
            body: "지금까지 XGEN의 LLM 백엔드는 API 호출 방식뿐이라, 터미널에서 검증된 Claude Code의 에이전틱 코딩 능력을 플랫폼 안에서 쓸 수 없었습니다. 브라우저 로그인(OAuth·setup-token)과 Redis 잡 릴레이로 CLI의 로컬 1인 로그인·k8s 멀티파드 제약까지 풀어, 이제 워크플로우·에이전트에서 다른 모델을 고르듯 Claude Code를 선택할 수 있습니다. CLI 버전은 관리 화면에서 핀 고정·설치·업데이트·롤백으로 통제됩니다.",
        },
        {
            title: "배포 승인 · 리스크 평가 개편",
            badge: "개선",
            body: "XGEN 에이전트는 배포 요청 → 위험 등급 평가 → 시스템 관리자 1차 승인 → 거버넌스 2차 승인을 거쳐야 사용자에게 열립니다. 승인 상태가 한 컬럼에 뭉쳐 어느 단계에서 멈췄는지 보이지 않았고, 완화조치는 매번 수동 입력, 중단된 에이전트는 재승인 뒤에도 손으로 복구해야 했습니다. 이번 개편으로 1·2차 승인 상태 컬럼이 분리되고, 이전 평가의 완화조치가 자동완성되며, 위험 등급 점수 구간이 필수화됐습니다. 승인 시 중단 에이전트는 자동 복구되고 재승인 이력·감사 로그까지 남아 — 심사는 빨라지고 추적은 가능해졌습니다.",
        },
        {
            title: "Vision vLLM 설정 개선",
            badge: "개선",
            body: "vLLM으로 비전(VL) 모델을 붙일 때 base_url에 /v1을 빠뜨리거나 모델명을 틀려 등록이 실패하는 일이 잦았습니다. 이제 카탈로그에서 원클릭 등록, 주소 자동 정규화, 저장 전 라이브 연결 프로브로 실제 연결을 확인합니다. 온톨로지 추출 배치도 작은 로컬 모델이 큰 배치를 못 버텨 ‘하다 만’ 결과를 내던 문제를 컨텍스트 윈도우 기반 자동 사이징과 타임아웃·절단 재시도로 해소했습니다.",
        },
        {
            title: "안정성 수정",
            badge: "수정",
            body: "온톨로지 검색에서 답변 합성이 시간 상한에 걸리면 빈 답이 나가거나 내부 근거 블록이 사용자에게 그대로 노출되던 버그를 바로잡아, 답변이 항상 온전한 형태로 나갑니다. 이 밖에 Redis Sentinel 읽기/쓰기 단일 클라이언트 통일(페일오버 정합성, core·documents·mcp-station 공통), 피드백 통계가 0으로 나오던 집계 SQL 오타, 배포 rollout 타임아웃(120→300s)을 수정했습니다.",
        },
    ],
    inProgress: [
        {
            title: "AI 아바타 기능",
            badge: "개발중",
            percent: 70,
            body: "텍스트뿐인 대화 화면에 ‘눈에 보이는 상대’를 만들어 사용 경험을 개인화하는 기능입니다. 마이페이지 [아바타 설정]에서 Live2D·Spine 모델(.zip)이나 사진으로 나만의 아바타를 등록·미리보기·기본 지정하고, [스토어]에서 동료가 공개한 아바타를 별점·설명과 함께 둘러보다 클릭 한 번으로 가져옵니다. 설정·스토어·백엔드 저장소까지 완성됐고, 마지막 대화 화면 렌더링 연결이 남았습니다.",
        },
        {
            title: "DB → 온톨로지 증분 색인",
            badge: "개발중",
            percent: 85,
            body: "온톨로지는 문서에서 LLM으로 추출하다 보니 시간·비용이 들고, 정작 가장 정형화된 지식인 사내 DB는 넣을 방법이 없었습니다. 등록된 DB의 SELECT 결과를 LLM 없이 rows-native로 바로 색인하는 경로를 새로 만들었습니다. 워크스페이스 ‘DB에서 가져오기’에서 미리보기 → 매핑 → 색인으로 이어지고, watermark 기반이라 바뀐 행만 따라갑니다. develop 반영 완료, 다음 배포 대기.",
        },
        {
            title: "토큰 쿼터 · 데이터 접근 감사",
            badge: "개발중",
            percent: 85,
            body: "조직 도입에서 반드시 나오는 질문 — ‘누가 얼마나 쓰는지 통제되나, 에이전트가 어떤 데이터를 봤는지 증빙되나’에 대한 답입니다. 토큰 정책 대상을 사용자/역할개별/역할전체 3종으로 확장하고 우선순위·동시평가 집행 로직을 붙였으며, 에이전트의 DB·지식 접근을 사용자·부서·대상 테이블 단위 감사 로그로 남깁니다. 프롬프트 실행 통계까지 더해지면 사용량과 접근 이력을 관리자 화면에서 증빙할 수 있습니다. develop 반영 완료, 다음 배포 예정.",
        },
        {
            title: "에이전트 하니스 v2",
            badge: "개발중",
            percent: 60,
            body: "에이전트가 긴 작업에서 직전 실행의 교훈을 잊고 같은 실수를 반복하거나, 판정이 통과/실패 둘뿐이라 부분 진척을 인정하지 못하던 한계가 있었습니다. 판정을 점진 채점으로 바꾸고 교훈을 런 간에 최신순으로 이월하며, RAG 문서답변이 제목·요약·본문 형식을 기계적으로 흉내 내는 스캐폴딩도 차단합니다. 같은 모델로 더 안정적인 실행 품질을 내는 것이 목표입니다.",
        },
        {
            title: "온톨로지 v3",
            badge: "연구중",
            percent: 35,
            body: "문서에서 온톨로지를 뽑는 추출 파이프라인의 정확도와 처리량을 함께 끌어올리기 위한 v3 구조를 연구하고 있습니다. 선행 개선인 배치 자동 사이징·절단 재시도는 이번 릴리즈에 먼저 실렸고, v3 본체는 실험 단계입니다.",
        },
    ],
    news: [
        {
            n: "01",
            title: "구글 검색, Gemini 3.5 Flash로 전면 전환 — ‘10개 블루링크’ 폐지",
            body: "검색의 기본 단위가 ‘링크 목록’에서 ‘생성된 답변’으로 바뀌었다는 뜻입니다. 이제 웹에서 발견되려면 랭킹에 오르는 게 아니라 AI 답변 안에 인용되어야 하고, 콘텐츠도 클릭을 부르는 글이 아니라 발췌·인용되기 좋은 구조여야 합니다. 우리 제품 문서와 기술 블로그도 ‘AI에게 인용되기 좋은 형태’로 재정비할 때라는 신호입니다.",
            source: "Build Fast with AI",
            readTime: "7min",
            url: "https://www.buildfastwithai.com/blogs/ai-news-today-july-12-2026",
        },
        {
            n: "02",
            title: "허깅페이스 CEO “기업들, 프론티어 API에서 오픈모델로 회귀 중”",
            body: "‘AI는 API로 빌려 쓰는 것’이라는 지난 3년의 전제가 흔들린다는 뜻입니다. 프론티어 API 요금이 오를수록 비용을 예측하고 데이터를 내부에 두고 싶은 기업은 오픈모델 + 자체 인프라 조합으로 이동하는데, 이는 곧 폐쇄망·온프렘 LLM 플랫폼의 시장이 커진다는 이야기입니다. 우리가 XGEN으로 만드는 방향이 업계 흐름과 일치한다는 근거 — 제안서에 인용하기 좋은 발언입니다.",
            source: "The Neuron",
            readTime: "5min",
            url: "https://www.theneuron.ai/explainer-articles/everything-that-happened-in-ai-today-saturday-july-11-2026/",
        },
        {
            n: "03",
            title: "캐나다 앨버타주 정부, Claude로 4억 6,600만 줄 코드 점검",
            body: "‘AI 코드 감사’가 PoC 단계를 지나 정부 단위 실전 사례로 증명됐다는 의미입니다. 수년치 백로그가 20시간으로 줄어든 효율은 사람을 대체했다기보다, 인력 문제로 엄두를 못 내던 전수 점검을 처음으로 가능하게 만든 쪽에 가깝습니다. 이번에 XGEN에 들어간 Claude Code 백엔드가 정확히 이 유형의 작업을 위한 것 — 고객 폐쇄망의 레거시 코드 감사라는 새 제안 시나리오가 생겼습니다.",
            source: "인공지능신문",
            readTime: "4min",
            url: "https://www.aitimes.kr/news/articleView.html?idxno=40870",
        },
    ],
    reading: [
        {
            n: "01",
            title: "‘Context rot’ — 컨텍스트가 길어질수록 retrieval은 무너진다",
            body: "‘컨텍스트 윈도우가 크니까 다 넣으면 된다’는 요즘 설계가 틀렸을 수 있다는 실측 근거입니다. 256K에서 80%였던 회수율이 1M 토큰에서 36%까지 떨어진다는 것은, 컨텍스트가 길어질수록 모델이 그 안에서 필요한 것을 ‘못 찾게’ 된다는 뜻입니다. 청킹·리랭킹으로 컨텍스트를 아껴 쓰는 우리 RAG 원칙이 여전히 유효한 이유 — 장문맥 시대의 반론 자료로 챙겨둘 만합니다.",
            source: "The Neuron",
            readTime: "6min",
            url: "https://www.theneuron.ai/explainer-articles/everything-that-happened-in-ai-today-saturday-july-11-2026/",
        },
        {
            n: "02",
            title: "“여러 모델 섞어 써도 한계 명확” — 오케스트레이션 통념 깨는 연구",
            body: "‘모델을 여러 개 섞으면 서로 약점을 보완한다’는 가정이 데이터로 반박됐다는 의미입니다. 최신 모델일수록 비슷한 데이터로 학습돼 같은 문제에서 같이 틀리기 때문에, 라우팅에서 중요한 건 ‘두 번째로 좋은 모델’이 아니라 ‘다르게 틀리는 모델’입니다. LLM-as-judge에서 판정 모델과 생성 모델을 같은 계열로 쓰면 안 되는 이유이기도 합니다.",
            source: "AI타임스",
            readTime: "5min",
            url: "https://www.aitimes.com/news/articleView.html?idxno=212625",
        },
        {
            n: "03",
            title: "루프 시작하기 — 에이전트에게 지시 대신 ‘정지 조건’을 주는 법",
            body: "에이전트를 부리는 단위가 ‘프롬프트 한 번’에서 ‘정지 조건이 있는 루프’로 넘어가고 있다는 글입니다. 사람이 매 단계 지시하는 대신 완료 기준을 먼저 정의해두면, 에이전트가 기준을 통과할 때까지 스스로 반복합니다. 핵심 난제가 ‘좋은 정지 조건을 어떻게 정의하나’로 옮겨간다는 점에서, 하니스 v2의 판정 게이트로 우리가 풀고 있는 문제와 정확히 같은 방향입니다.",
            source: "GeekNews",
            readTime: "4min",
            url: "https://news.hada.io/topic?id=31225",
        },
    ],
    papers: [
        {
            arxiv: "2506.07962",
            title: "Correlated Errors in Large Language Models",
            body: "모델들이 서로 독립적으로 틀리지 않는다는 걸 대규모로 측정한 논문입니다. 두 모델이 모두 틀릴 때 답까지 같은 경우가 60%에 달하고, 같은 개발사·같은 아키텍처일수록 오류 상관이 커집니다. 읽을거리 02의 근거가 되는 연구로, 라우팅·앙상블·LLM-as-judge 설계 전에 읽어볼 만합니다.",
            url: "https://arxiv.org/abs/2506.07962",
        },
        {
            arxiv: "2606.18089",
            title: "From Reasoning Traces to Reusable Modules: Compositional Generalization in LM Reasoning",
            authors: "Kong et al. · CMU",
            body: "SFT는 추론의 ‘부품’을 공급하고 RL이 그 부품을 새로운 조합으로 재구성한다는 가설을 검증했습니다. SFT만 하면 익숙한 골든 트레이스 모방에 그쳐 OOD 조합에서 무너진다는 결과 — 도메인 파인튜닝 전략(SFT→RL 순서) 설계에 참고할 만합니다.",
            url: "https://arxiv.org/abs/2606.18089",
        },
    ],
    upcoming: [
        {
            title: "팀 유튜브 채널",
            badge: "준비중",
            body: "XGEN 데모와 기술 세션을 다루는 팀 유튜브 채널을 준비하고 있습니다. 첫 영상과 함께 오픈 소식을 다음 호에서 전해드릴게요.",
        },
        {
            title: "사내 해커톤",
            badge: "준비중",
            body: "평소 업무에서는 시도하기 어려운 아이디어를 꺼내고, 팀이 함께 실험해보는 자리를 준비하고 있습니다. 형식과 일정은 확정되는 대로 공지드릴게요.",
        },
    ],
};

/** 최신호가 앞. 새 호는 이 배열 맨 앞에 추가한다. */
export const ISSUES: Issue[] = [vol1];

export function getIssues(): Issue[] {
    return [...ISSUES].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getIssue(slug: string): Issue | undefined {
    return ISSUES.find((i) => i.slug === slug);
}

export function getLatestIssue(): Issue | undefined {
    return getIssues()[0];
}
