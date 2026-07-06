# Insight Blog — 파일베이스 블로그 + Decap CMS 운영 가이드

연구소 블로그는 **DB 없이** 마크다운 파일로 운영합니다. 글 1개 = `frontend/content/blog/*.md` 파일 1개이며, 빌드 시점에 정적 페이지(SSG)로 구워져 SEO·GEO에 최적화됩니다.

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
- **로컬 편집(즉시 사용, OAuth 불필요)**:
  1. 리포 루트에서 `npx decap-server`
  2. 브라우저에서 `http://localhost:3100/admin` 접속 → 글 작성/저장(로컬 파일에 기록)
- **GitHub에 직접 커밋(권장)**: 별도 서비스 없이 **Next 앱이 OAuth 제공자** 역할을 합니다
  (`/api/auth`, `/api/callback` 라우트 구현됨). 다음 3가지만 하면 됩니다.

  1. **GitHub OAuth App 생성** — GitHub → Settings → Developer settings →
     **OAuth Apps** → New OAuth App
       - Homepage URL: `https://labs.plateer.com`
       - Authorization callback URL: `https://labs.plateer.com/api/callback`
       - 생성 후 **Client ID** 와 **Client secret** 발급
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

## 왜 이 방식인가 (SEO·GEO)
- 정적 HTML이라 AI 크롤러가 JS 실행 없이 본문을 그대로 읽고 인용 → GEO 유리
- DB·서버 운영 0, git 버전관리, 가장 빠른 응답
- 글 발행에 재빌드가 필요(수십 초~1분) — 빈번하면 ISR/웹훅으로 보완 가능
