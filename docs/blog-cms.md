# Insight Blog — 파일베이스 블로그 + Decap CMS 운영 가이드

연구소 블로그는 **DB 없이** 마크다운 파일로 운영합니다. 글 1개 = `frontend/content/blog/*.md` 파일 1개이며, 빌드 시점에 정적 페이지(SSG)로 구워져 SEO·GEO에 최적화됩니다.

> **개발자에게 글을 받는 법(기여자용)**: [BLOG-CONTRIBUTING.md](./BLOG-CONTRIBUTING.md) 참고.
> Decap 백엔드는 **Open Authoring**(`open_authoring: true`)이라, 기여자는 메인 리포 write 권한 없이
> 자기 GitHub 계정으로 로그인 → fork에서 PR을 열고, 편집자가 리뷰·머지하면 발행됩니다.

## 구조
- 콘텐츠: `frontend/content/blog/<slug>.md` (YAML 프론트매터 + 마크다운 본문)
- 목록: `/blog` (카테고리 탭: 전체 / 제품 소식 / Tech Note / Case Study, + 주제(태그) 필터)
- 상세: `/blog/<slug>` (BlogPosting JSON-LD, OG/Twitter 메타, 자동 사이트맵·RSS)
- RSS: `/feed.xml` · 사이트맵: `/sitemap.xml`
- 구 경로 `/insights` → `/blog` 301(308) 리다이렉트

## 프론트매터 필드
```yaml
title: "제목"
description: "검색·AI 답변용 한 줄 요약(≤155자)"
date: "2026-06-24"
updated: "2026-06-25"   # 선택
author: "Plateer Labs"
category: "Tech Note"   # Case Study | Tech Note | 제품 소식
tags: ["온톨로지", "GEO", "SEO"]   # 주제 엔티티 — 목록 주제 필터·SEO 키워드
cover: "/blog/xxx.png"  # 선택
draft: false            # true면 운영 빌드에서 숨김
```

## 글 추가 방법

### A. 파일로 직접 (개발자)
`frontend/content/blog/`에 `.md` 파일을 추가하고 커밋 → 재배포(`docker compose up -d --build frontend`).

### B. Decap CMS 어드민

> **환경별 로그인 방식 (중요)**
> GitHub OAuth App은 콜백 URL을 **하나만**(`https://labs.plateer.com/api/callback`) 가질 수 있어,
> **OAuth 로그인은 운영 도메인(labs.plateer.com)에서만** 동작합니다. 로컬(localhost)은 콜백이
> 맞지 않으므로 OAuth 대신 **local_backend**로 편집합니다.
>
> | 환경 | 로그인 방식 | 필요한 것 |
> |---|---|---|
> | **localhost:3000 / :3100 (개발)** | `local_backend`(decap-server) — GitHub 로그인 불필요 | 리포 루트에서 `npx decap-server` 실행 후 `/admin` 접속 → "Login" |
> | **labs.plateer.com (운영)** | GitHub OAuth — 멤버 각자 자기 계정으로 로그인 | 운영 서버 `.env`에 OAuth 자격증명 + 멤버 write 권한 |

- **로컬 편집(개발, OAuth 불필요)**:
  1. 리포 루트에서 `npx decap-server`
  2. `http://localhost:3000/admin`(또는 :3100) 접속 → "Login" → 글 작성/저장(로컬 파일에 기록)
  - ⚠️ localhost에서 "Login with GitHub"가 뜨면 decap-server가 안 떠 있는 것 — 먼저 실행할 것.

- **GitHub에 직접 커밋(운영)**: Next 앱이 OAuth 제공자 역할(`/api/auth`, `/api/callback`).

  1. **GitHub OAuth App** — ✅ 이미 생성됨: `PlateerLab` 조직 소유 "Plateer Labs Blog CMS"
       - **Client ID: `Ov23liv3gveHfTPsLH2Z`** · Callback: `https://labs.plateer.com/api/callback`
       - (재발급이 필요하면: GitHub → PlateerLab → Settings → Developer settings → OAuth Apps)
  2. **운영 서버 환경변수에 입력** 후 재배포:
       ```
       GITHUB_OAUTH_CLIENT_ID=<Client ID>
       GITHUB_OAUTH_CLIENT_SECRET=<Client secret>
       ```
       `docker compose up -d --build frontend` (운영 박스에서)
  3. **레포 쓰기 권한** — 로그인하는 GitHub 계정이 `PlateerLab/xgen-gallery` 의
     **콜라보레이터 또는 조직 멤버(write 이상)** 여야 합니다.
     (권한이 없으면 "Your GitHub user account does not have access to this repo" 에러)

  > `public/admin/config.yml` 의 `backend.base_url` 은 `/api/auth`·`/api/callback` 이
  > 있는 origin = **운영 도메인 `https://labs.plateer.com`** 으로 고정돼 있습니다.
  > 어드민을 어느 URL에서 열든 OAuth 팝업은 이 도메인으로 향합니다.
  > (로컬 편집은 `local_backend`가 처리하므로 base_url을 바꿀 필요 없음)

> repo는 `PlateerLab/xgen-gallery`, branch `main`으로 설정돼 있습니다.
> `/admin`은 robots에서 noindex 처리됩니다.

### OAuth 설정 — 필요한 것은 "시크릿 하나"뿐

GitHub OAuth **Client ID는 비밀이 아니다**(리다이렉트 URL·이 문서에 이미 공개: `Ov23liv3gveHfTPsLH2Z`).
그래서 코드에 **공개 기본값**을 박아 두었다(`/api/auth`, `/api/callback`). 서버 env가 비어 있어도
로그인 리다이렉트는 항상 동작한다. 실제로 서버에 필요한 값은 **`GITHUB_OAUTH_CLIENT_SECRET` 하나**뿐이다.

**시크릿을 넣는 방법(둘 중 하나, 1회):**
1. **(권장) GitHub Actions 시크릿** — Repo → Settings → Secrets and variables → Actions →
   `OAUTH_CLIENT_SECRET` 등록. 이후 매 배포마다 워크플로우가 go244의 `.env`에 자동 주입한다
   (`.github/workflows/deploy.yml`의 시드 단계). 서버 재접속·재설치와 무관하게 영구 유지.
   (⚠️ GitHub은 `GITHUB_`로 시작하는 시크릿 이름을 금지하므로 `GITHUB_OAUTH_CLIENT_SECRET`은 못 씀)
2. **직접 .env** — go244 `~/workspace/xgen-gallery/.env`에
   `GITHUB_OAUTH_CLIENT_SECRET=<시크릿>` 추가 후 `docker compose up -d --build frontend`.

**검증**: 배포 로그의 `OAUTH_SECRET=present ✓` 확인, 또는
```bash
docker compose exec frontend printenv GITHUB_OAUTH_CLIENT_SECRET
```

> 과거 함정(기록): `docker-compose.yml`의 `environment:`에 `GITHUB_OAUTH_CLIENT_ID: "${VAR:-}"`처럼
> 선언하면 `environment`가 `env_file`보다 우선해, 인터폴레이션이 빈 값일 때 `.env` 값을 덮어썼다(clobber).
> 현재는 `environment`에서 OAuth 변수를 제거해 이 문제를 원천 차단했다.

## 왜 이 방식인가 (SEO·GEO)
- 정적 HTML이라 AI 크롤러가 JS 실행 없이 본문을 그대로 읽고 인용 → GEO 유리
- DB·서버 운영 0, git 버전관리, 가장 빠른 응답
- 글 발행에 재빌드가 필요(수십 초~1분) — 빈번하면 ISR/웹훅으로 보완 가능
