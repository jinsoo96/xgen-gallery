# GEO·SEO 최적화 가이드 — Plateer Labs 연구소 홈페이지

> **이 문서는 강제 규칙입니다.** Plateer Labs(PLEX) 연구소 홈페이지의 모든 사이트/페이지는
> 반드시 **GEO(Generative Engine Optimization, 생성형 AI 검색 최적화)** 와
> **SEO(Search Engine Optimization, 전통 검색 엔진 최적화)** 를 **모두 고려해** 제작·운영해야 합니다.
> 두 최적화는 "사람에게 좋은 콘텐츠 + 기계가 명확히 파싱·인용·랭킹할 수 있는 구조"라는 공통 토대를
> 공유하므로 항상 함께 적용합니다. 새 페이지·컴포넌트·콘텐츠를 만들거나 수정할 때는 작업 전에 이
> 가이드를 먼저 읽고, 마지막 **Definition of Done 체크리스트(GEO+SEO 통합)** 를 통과시킨 뒤 완료합니다.

---

## 0. GEO란 무엇인가 (그리고 왜 연구소 사이트에 필수인가)

**GEO (Generative Engine Optimization)** = ChatGPT, Perplexity, Google AI Overviews/Gemini,
Claude, Copilot 같은 **생성형 AI 답변 엔진**이 우리 콘텐츠를 **이해·인용·추천**하도록 최적화하는 것.

- **SEO**는 "검색 결과 링크에 노출"이 목표 → 사람이 클릭.
- **GEO**는 "AI가 답변을 생성할 때 우리를 출처로 인용/추천"이 목표 → AI가 사용자에게 대신 전달.

연구소 사이트(오픈소스 AI 라이브러리/연구 성과 공개)는 개발자들이 점점 **AI에게 "이 작업에 쓸 만한
라이브러리 추천해줘"** 라고 물어보는 환경에 놓인다. 그 답변에 우리 도구가 인용되려면 GEO가 필수다.

> 핵심 원칙: **사람에게 좋은 콘텐츠 + 기계가 명확히 파싱·인용할 수 있는 구조.** 둘 다 만족해야 한다.

---

## 0-S. SEO 최적화 (전통 검색 엔진 — GEO와 함께 필수)

**SEO**는 Google·Bing·Naver 등 전통 검색 엔진이 우리 페이지를 **크롤링·인덱싱·랭킹**해 검색 결과 상위에
노출하도록 최적화하는 것이다. GEO(AI 인용)와 토대가 같아 **항상 동시에** 적용한다.

### SEO 필수 체크리스트
- **타이틀/메타**: 페이지별 고유 `title`(≤60자, 핵심 키워드 앞쪽) + `meta description`(≤155자). Next `metadata`/`generateMetadata`로 라우트마다 생성.
- **정규 URL(canonical)**: `alternates.canonical`로 중복 URL 정리. 쿼리·앵커 변형이 별도 색인되지 않게.
- **다국어(i18n) hreflang**: KO/EN 전환 사이트이므로 `alternates.languages`(hreflang `ko`,`en`,`x-default`)로 언어별 대체 URL 명시. 언어별 URL 전략(쿠키 전환은 색인 한계 → 필요 시 `/en` 경로 분리 검토).
- **사이트맵/robots**: `app/sitemap.ts`(우선순위·lastModified) + `app/robots.ts`(AI 봇 + 일반 크롤러 허용 + Sitemap 라인). ([§2.3](#) 참고)
- **구조화 데이터(JSON-LD)**: Organization/WebSite/BreadcrumbList/FAQPage/Article/SoftwareApplication → **리치 결과(rich snippet)** 확보. (GEO와 공유)
- **시맨틱 마크업 & 헤딩 위계**: 페이지당 `<h1>` 1개, 논리적 h2/h3, 시맨틱 태그. 키워드 자연 포함.
- **내부 링크 & 브레드크럼**: 관련 페이지 상호 링크 + `BreadcrumbList`로 크롤 경로·탐색성 강화.
- **OpenGraph/Twitter 카드**: 소셜 공유 미리보기 → CTR·간접 SEO 기여. (이미지 1200×630 권장)
- **Core Web Vitals**: LCP < 2.5s, CLS < 0.1, INP < 200ms. `next/image`(크기 지정·lazy), 폰트 `font-display: swap`+preload(이미 Pretendard 적용), JS 번들 최소화.
- **모바일 퍼스트 & 반응형**: 모바일 우선 인덱싱 대응. viewport·터치 타깃·가독성.
- **이미지 SEO**: 의미 있는 `alt`, 적정 포맷(webp/avif), `width/height` 지정.
- **크롤 가능성(SSR/SSG)**: 핵심 콘텐츠는 서버 렌더 HTML로 노출(클라이언트 JS 전용 ❌). (GEO와 공유)
- **클린 URL & 404/리다이렉트**: 의미 있는 경로, 끊긴 링크 방지, 301 적절히.

> GEO와 SEO의 차이: **SEO=검색 결과 링크 랭킹(사람이 클릭)**, **GEO=AI 답변에 인용·추천(AI가 전달)**.
> 둘은 90% 같은 작업(시맨틱 HTML·JSON-LD·메타·사이트맵·성능·SSR)을 공유하고, SEO는 *랭킹/리치결과/CWV*,
> GEO는 *answer-first·인용 가능 단위·llms.txt*에 추가 무게를 둔다. 본 가이드는 둘을 통합해 다룬다.

## 1. 7대 핵심 원칙

1. **Answer-first (결론 우선).** 각 페이지/섹션은 첫 문단에서 "무엇인지/무엇을 하는지"를 한두 문장으로
   완결되게 답한다. AI는 도입부에서 인용 가능한 자족적(self-contained) 문장을 뽑는다.
2. **Quotable chunks (인용 가능한 단위).** 한 문장만 떼어내도 의미가 통하도록 쓴다.
   대명사("이것", "그") 남발 금지 — 주어를 명시.
3. **Structured data (구조화 데이터, JSON-LD).** 기계가 엔티티(조직·소프트웨어·인물·FAQ)를
   모호함 없이 인식하도록 schema.org 마크업을 넣는다.
4. **Entity clarity & consistency (엔티티 일관성).** 브랜드명·도구명·용어를 사이트 전체에서
   **철자/표기까지 동일**하게 쓴다. (예: `Plateer AIX Labs`, `Synaptic Memory` — 표기 흔들림 금지)
5. **Evidence & specificity (근거·구체성).** 숫자·통계·날짜·벤치마크·출처를 명시한다.
   AI는 구체적 수치가 있는 콘텐츠를 더 자주 인용한다. ("빠름" ❌ → "80+ 포맷 지원" ✅)
6. **Crawlability for AI (AI 크롤러 접근 허용).** `robots.txt`, `llms.txt`, `sitemap.xml`,
   SSR/정적 HTML로 AI 봇이 콘텐츠를 실제로 읽을 수 있게 한다.
7. **Freshness & authority (최신성·전문성, E-E-A-T).** 게시/수정 날짜, 기여자(저자), 릴리스 이력을
   드러내 신뢰 신호를 준다.

---

## 2. 기술 구현 체크리스트 (이 Next.js 프로젝트 기준)

### 2.1 구조화 데이터 (JSON-LD) — **최우선**
`<script type="application/ld+json">` 으로 주입. Next.js App Router에서는 서버 컴포넌트에서
JSON 객체를 렌더하면 된다.

| 페이지 | 넣어야 할 schema.org 타입 |
|---|---|
| 전역(layout) | `Organization` 또는 `ResearchOrganization` (name, url, logo, sameAs[github 등], description) |
| 홈(`/`) | `WebSite` (+ `SearchAction`), `Organization` |
| 툴 상세(`/tool/[id]`) | `SoftwareApplication` 또는 `SoftwareSourceCode` (name, description, applicationCategory, programmingLanguage, codeRepository, offers/free, downloadUrl) |
| 멤버(`/members/[login]`) | `Person` (name, url, sameAs, affiliation→Organization) |
| 릴리스(`/releases`) | `ItemList` of `SoftwareApplication` 또는 각 항목 `TechArticle` |
| 자주 묻는 질문 섹션 | `FAQPage` (question/acceptedAnswer) — **GEO 인용률이 가장 높은 포맷 중 하나** |
| 모든 하위 페이지 | `BreadcrumbList` |

> 권장: `src/lib/structured-data.ts`에 타입별 JSON-LD 빌더 함수를 모으고,
> 각 페이지 서버 컴포넌트에서 `<JsonLd data={...} />` 형태로 주입.

### 2.2 메타데이터 (Next.js `metadata` API) — **`pageMetadata()` 헬퍼 필수**

> **강제 규칙:** 새 페이지의 메타데이터는 **반드시 `src/lib/metadata.ts`의 `pageMetadata()` 헬퍼로 생성**한다.
> 손으로 `export const metadata = { ... }`를 쓰면서 `openGraph`/`twitter`를 빠뜨리면, 링크 미리보기
> (Teams·Slack·카카오·iMessage 등)가 **페이지 내용이 아니라 루트 레이아웃의 사이트 공통 기본값**으로
> 떠버린다(모든 페이지가 홈과 똑같은 미리보기). 헬퍼는 canonical·OpenGraph·Twitter 카드를 페이지
> 제목/설명으로 한 번에 채워 이 누락을 구조적으로 방지한다.

정적 페이지:

```tsx
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
    title: "Technology",              // ≤60자, 브랜드명 일관 표기(접미사는 template이 자동)
    description: "…결론 우선·구체적…",  // ≤155자
    path: "/technology",              // canonical + og:url
    // image / imageDims — 생략 시 사이트 공통 OG 이미지. 페이지 고유 이미지가 있으면 지정
    //   (예: 영상 썸네일 https://i.ytimg.com/vi/<id>/maxresdefault.jpg, 1280×720)
    // robots — noindex 등 필요 시
});
```

동적 페이지는 `generateMetadata`에서 동일하게 `pageMetadata({...})`를 **반환**한다
(예: `/members/[login]`은 로그인별 제목·설명 + 아바타 이미지 `https://github.com/<login>.png`).

- 헬퍼가 자동 처리: `title`·`description`·`alternates.canonical`·`openGraph`(type·siteName·title·description·url·locale·images)·`twitter`(`summary_large_image`).
- `keywords`(보조용) 등 추가 필드가 필요하면 반환 객체에 스프레드로 병합.
- **직접 `openGraph`를 손으로 쓰지 말 것** — 페이지 고유 이미지는 `image`/`imageDims` 인자로 넘긴다.

### 2.3 AI 크롤러 접근 (`public/` 또는 라우트 핸들러)
- **`robots.txt`** — 주요 AI 크롤러를 **명시적으로 허용**:
  `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `anthropic-ai`, `Claude-SearchBot`,
  `PerplexityBot`, `Perplexity-User`, `Google-Extended`, `Applebot-Extended`, `Bingbot`, `CCBot`.
  + `Sitemap:` 라인 포함.
- **`sitemap.xml`** — Next.js `app/sitemap.ts`로 동적 생성 (모든 툴/멤버/릴리스 URL + `lastModified`).
- **`llms.txt`** (`/llms.txt`) — 사이트 요약 + 핵심 페이지 링크를 마크다운으로. AI가 사이트 전체를
  빠르게 파악하는 진입점. (선택: `/llms-full.txt`에 전체 콘텐츠 평문 제공)
- **SSR/SSG 우선** — 핵심 콘텐츠는 클라이언트 JS 렌더에만 의존하지 말 것. 많은 AI 크롤러는 JS를
  실행하지 않는다. (이 프로젝트는 `output: 'standalone'` + 정적/서버 렌더 사용 중 → 유지)

### 2.3-S 콘텐츠 보호 vs GEO·SEO (경쟁사 봇 차단 정책) — **필수**

> **핵심 결론(정직한 답):** "검색·AI에는 잘 노출되면서 경쟁사 봇은 전혀 못 보게" 하는 것은 **부분적으로만 가능**하다.
> 공개 인덱싱(SEO·GEO)과 완전 비공개는 본질적으로 상충한다 — **검색/AI 크롤러가 읽을 수 있는 콘텐츠는
> 마음먹은 경쟁사도 읽을 수 있다.** 그래서 "전부 막기"가 아니라 **선별 차단(allowlist + 적대적 봇 blocklist)
> + 인프라 방어 + 비공개 분리**의 3중 레이어로 접근한다. 특히 **GEO는 AI 크롤러 허용에 의존**하므로
> "AI 봇 전체 차단"은 GEO를 죽인다 → 우리를 **인용·추천해 주는 답변엔진(이득)** 과 **경쟁 분석·대량 스크래퍼(손해)**
> 를 반드시 구분한다.

**레이어 1 — robots.txt 선별 정책 (`app/robots.ts`)**
- **허용(allow `/`)**: 검색엔진(Googlebot·Bingbot·Naver Yeti·Daum) + GEO 답변엔진(GPTBot·ClaudeBot·PerplexityBot·Google-Extended 등). → SEO·GEO 둘 다 보존.
- **차단(disallow `/`)**: SEO 경쟁정보·백링크 분석·대량 콘텐츠 수집 봇 — `AhrefsBot`, `SemrushBot`, `MJ12bot`, `DotBot`, `rogerbot`, `DataForSeoBot`, `BLEXBot`, `Barkrowler`, `serpstatbot`, `ZoominfoBot`, `magpie-crawler`, `VelenPublicWebCrawler`, `Screaming Frog SEO Spider` 등.
- robots.txt는 **권고(advisory)** 다 → *예의 바른* 분석 도구(대부분의 SEO 툴이 여기 해당)는 실제로 멈추지만, 악성 스크래퍼는 무시한다. 그래서 레이어 2가 필요.

**레이어 2 — 엣지 UA 차단 (`middleware.ts`)**
- robots를 무시하되 식별 가능한 User-Agent를 보내는 봇은 **미들웨어에서 403**으로 실제 차단(enforcement). `BLOCKED_BOTS` 목록을 robots의 disallow 목록과 동기화.
- 더 강한 방어(레이트리밋, UA 위조 봇, 봇 핑거프린팅)는 **인프라/WAF**(Cloudflare Bot Management, 리버스 프록시 레이트리밋)에서 처리 — 앱 레이어로는 한계가 있음을 인지.

**레이어 3 — 비공개 분리**
- 진짜 민감한 정보(내부 벤치마크 원본, 고객 실명, 미공개 로드맵, 단가)는 **공개 페이지에 올리지 않거나 인증 뒤에 둔다.** 공개 = 만인이 읽을 수 있음. 공개 페이지에는 *인용되길 원하는* 콘텐츠만 둔다.

> 정리: robots/미들웨어 차단 목록은 **항상 동기화**하고, 새 경쟁/스크래퍼 봇 UA를 발견하면 두 곳 모두에 추가한다.
> GEO·SEO에 이로운 봇은 절대 차단 목록에 넣지 않는다.

### 2.4 시맨틱 HTML & 접근성
- 페이지당 `<h1>` 1개, 논리적 `h2/h3` 계층(건너뛰지 않기).
- `<main> <article> <section> <nav> <header> <footer>` 시맨틱 태그 사용.
- 모든 이미지 `alt`, 모든 링크 의미 있는 텍스트("여기" ❌).
- 데이터는 `<table>`/`<dl>`/`<ul>` 등 의미 있는 구조로 (AI가 관계를 파싱).

### 2.5 성능·Core Web Vitals
- 빠른 LCP, 작은 JS 번들, 이미지 최적화(`next/image`). 느린/깨진 페이지는 크롤·인용에서 불리.

---

## 3. 콘텐츠 작성 규칙 (GEO 카피라이팅)

작성/리뷰 시 다음을 지킨다:

- [ ] **첫 문장이 답이다.** 각 섹션 도입부에 자족적 정의/결론을 둔다.
- [ ] **고유명사·표기 일관.** `Plateer AIX Labs`, 도구명, 기술용어 철자 통일.
- [ ] **숫자·날짜·근거 명시.** "80+ 포맷", "4단계 기억 통합", "2026-06 릴리스"처럼 구체적으로.
- [ ] **Q&A / FAQ 섹션 적극 사용.** "X는 무엇인가?", "X를 언제 쓰나?" 형식 → `FAQPage` JSON-LD와 짝.
- [ ] **비교·목록 구조.** 표/불릿으로 "도구 vs 도구", "기능 목록"을 명시 (AI가 추천 비교에 활용).
- [ ] **정의 → 사용 사례 → 코드/설치 순서.** 개발자 의도(install, usage)에 바로 답.
- [ ] **과장·마케팅 수식어 최소화.** 검증 가능한 사실 위주(="혁신적" 대신 측정 가능한 기능).
- [ ] **한 줄 요약(TL;DR) 제공** — 긴 페이지 상단에 핵심 3줄 요약.
- [ ] **표시용 카피는 마침표 없이.** 히어로/섹션 헤드라인, 태그라인, 활용사례·Vision 등 짧은 표시 문구는 끝에 **마침표(.)를 쓰지 않는다.** (여러 문장으로 이어지는 설명형 본문 단락은 예외) — 사용자 지정 스타일 규칙.

---

## 4. 페이지 유형별 적용

- **홈 `/`**: Organization+WebSite JSON-LD, 연구소 한 줄 정의, 도구 카탈로그(비교 가능한 카드),
  "무엇을 하는 연구소인가" FAQ, 최신 릴리스 링크.
- **툴 상세 `/tool/[id]`**: SoftwareApplication JSON-LD, answer-first 정의, 설치 명령,
  사용 사례, 입출력 예시, "언제 이 도구를 쓰나" Q&A, GitHub repo 링크(codeRepository).
- **멤버 `/members/*`**: Person JSON-LD, affiliation, 기여 내역(권위/E-E-A-T 신호).
- **릴리스 `/releases`**: 날짜 명시 ItemList, 변경점 구체화(최신성 신호).
- **신규 "연구/논문/유스케이스" 페이지 추가 시**: `TechArticle`/`ScholarlyArticle` JSON-LD,
  저자·게시일·요약(abstract) 포함.

---

## 5. 이 프로젝트 파일 매핑

| 작업 | 위치 |
|---|---|
| 전역 메타·Organization JSON-LD | `frontend/src/app/layout.tsx` |
| JSON-LD 빌더(신규 권장) | `frontend/src/lib/structured-data.ts` |
| robots / sitemap / llms.txt | `frontend/src/app/robots.ts`, `frontend/src/app/sitemap.ts`, `frontend/public/llms.txt` |
| 툴 카탈로그(엔티티 데이터) | `frontend/src/lib/tools.ts` |
| 페이지 메타 헬퍼(**필수**) | `frontend/src/lib/metadata.ts`의 `pageMetadata()` |
| 페이지별 메타 | 각 `app/**/page.tsx`의 `metadata`/`generateMetadata` → **`pageMetadata()`로 생성** |
| 시맨틱 마크업 | `frontend/src/components/*` |

---

## 6. Definition of Done — 페이지/사이트 완료 전 필수 체크

새/수정 페이지는 아래를 **모두** 만족해야 "완료":

- [ ] `<h1>` 1개 + 논리적 heading 계층, 시맨틱 태그 사용
- [ ] answer-first 도입부(자족적 첫 문장)
- [ ] 적합한 schema.org **JSON-LD 주입** (페이지 유형에 맞게)
- [ ] `metadata`를 **`pageMetadata()` 헬퍼로 생성**(openGraph/twitter/canonical 자동 완비) — 손으로 쓴 bare metadata 객체 금지. 페이지 고유 이미지는 `image`/`imageDims` 인자로 전달
- [ ] FAQ/Q&A 또는 구조화된 비교·목록 1개 이상 (해당 시 `FAQPage` JSON-LD)
- [ ] 구체적 숫자·날짜·근거 포함, 과장 수식어 제거
- [ ] 표시용 카피/헤드라인/태그라인에 **마침표(.) 없음** (설명형 본문 단락 제외)
- [ ] `sitemap.xml`에 URL 포함, `robots.txt`가 AI 크롤러 허용
- [ ] **(보안)** 경쟁사·스크래퍼 봇 차단 목록이 `robots.ts`(disallow)와 `middleware.ts`(403)에 **동기화**돼 있고, GEO·SEO 유익 봇은 차단되지 않음 ([§2.3-S](#) 참고)
- [ ] 핵심 콘텐츠가 SSR/SSG로 노출(클라이언트 JS 의존 ❌)
- [ ] 이미지 alt·의미 있는 링크 텍스트, 접근성 통과
- [ ] **(SEO)** canonical + KO/EN `hreflang`(alternates.languages) 설정
- [ ] **(SEO)** 내부 링크/브레드크럼 연결, 클린 URL, 404/301 점검
- [ ] **(SEO)** Core Web Vitals(LCP<2.5s·CLS<0.1·INP<200ms) + 모바일 반응형 확인
- [ ] **(SEO)** OpenGraph/Twitter 카드 이미지(1200×630) 노출
- [ ] 빌드 후 실제 HTML(`view-source`)에 콘텐츠·JSON-LD가 보이는지 확인

---

### 부록: 참고 — "GEO" 용어
이 가이드의 GEO는 **Generative Engine Optimization**(생성형 AI 검색/답변 최적화)을 뜻한다.
지리적 타게팅(geo-targeting/local SEO)을 의도한 것이라면 별도 가이드가 필요하니 알려줄 것.
