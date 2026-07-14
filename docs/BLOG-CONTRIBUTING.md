# 블로그 기여 가이드 — 개발자가 글을 올리는 법

Plateer Labs Insight 블로그는 **DB 없이 git 리포의 마크다운 파일**로 운영됩니다.
글 1개 = `frontend/content/blog/<slug>.md` 파일 1개이고, 머지되면 자동 배포됩니다.

개발자 각자 **자기 GitHub 계정으로 로그인**해 글을 올리고, 편집자가 **PR을 리뷰·머지**하면 발행됩니다.
메인 리포에 write 권한이 없어도 됩니다 — Decap이 여러분 계정으로 리포를 fork하고 그 fork에서 PR을 열어줍니다(Open Authoring).

> 글을 쓰기 전에 [블로그 글쓰기 가이드](./BLOG-WRITING-GUIDE.md)와 [GEO·SEO 가이드](./GEO-OPTIMIZATION-GUIDE.md)를 먼저 읽어주세요. 둘 다 필수입니다.

---

## 두 가지 경로 (편한 쪽으로)

### 경로 A — 웹 에디터 `/admin` (글 위주 · 세팅 불필요, 추천)

1. **https://labs.plateer.com/admin** 접속 → **"Login with GitHub"** → 본인 GitHub 계정으로 로그인
2. **New Blog** → 제목·설명·카테고리·태그·본문 작성 (위지윅 + 마크다운)
3. 저장하면 **"검토 대기(In Review)"** 상태로 PR이 자동 생성됩니다(초안은 fork에 안전하게 보관)
4. 편집자가 리뷰 후 머지 → 발행

- 처음 로그인 시 GitHub이 fork 생성·PR 권한을 요청합니다(공개 리포 기준). 승인하면 됩니다.
- 이미지: 본문에서 바로 업로드하면 `frontend/public/blog/`에 함께 커밋됩니다.

### 경로 B — 리포에 `.md` + PR (에디터에 사는 개발자용)

1. 리포를 **fork**하고 브랜치 생성
2. `frontend/content/blog/<slug>.md` 추가 (아래 스캐폴드)
3. **PR 생성** — 블로그 PR 템플릿을 붙이려면:
   `.../compare/main...<브랜치>?template=blog-post.md`

> **사이트 개발환경(`npm run dev`)은 필요 없습니다.** 미리보기는 아래를 참고하세요.

---

## 미리보기 (사이트 개발환경 없이)

- **작성 중 실시간 미리보기** → 경로 A의 `/admin` 편집기 **오른쪽 미리보기 패널**. 로컬 세팅 0.
- **실제 사이트에서 확인** → 글이 **머지·배포되면** `https://labs.plateer.com/blog/<slug>` 에 나옵니다.
  운영은 `main`에 머지된 것만 빌드하므로, 아직 PR/초안 상태는 운영 URL로 보이지 않습니다.
  - **정식 오픈 전**이라면 가장 간단한 길: `draft: false`로 발행해 머지 → 운영 URL에서 확인 → 필요 시 수정. (아직 외부에 공개된 사이트가 아니라 부담이 적습니다)

> 로컬 CMS(`npx decap-server`) 등 운영/개발 환경 설정은 유지보수자용 문서 [blog-cms.md](./blog-cms.md) 참고.

---

## 프론트매터 스캐폴드

`.md` 파일 맨 위에 그대로 복사해 채우세요.

```markdown
---
title: "핵심 키워드를 앞에 — 마침표 없이(≤60자 권장)"
description: "검색·AI 답변에 그대로 노출되는 한 줄 요약. 결론 먼저, 40~155자(GEO)"
date: "2026-07-13"
# updated: "2026-07-20"   # 내용을 고쳤을 때만
author: "홍길동"           # 화면에 보일 작성자 이름(바이라인)
# authorGithub: "your-github-id"  # 입력하면 바이라인이 /members/<아이디> 프로필로 연결 + Person 저작(GEO)
category: "Tech Note"       # Case Study | Tech Note | 제품 소식
tags: ["온톨로지", "하네스", "GEO"]   # 주제 엔티티 — 목록 필터·SEO 키워드
# cover: "/blog/<slug>.png"  # 선택 — SNS/검색 썸네일(1200×630 권장)
draft: false                # true면 운영에서 숨김(검토 중일 때)
---

첫 문단에 결론부터. "무엇을, 왜, 그래서 독자에게 어떤 이득인지"를 자족적으로.

## 왜 이걸 하게 됐나
...

## 이렇게 접근했다 (구체적 장면·숫자)
...

## 넘어진 자리와 배운 점
...
```

필드 정의와 목록/상세 동작은 [blog-cms.md](./blog-cms.md) 참고.

---

## 리뷰 · 발행 흐름

```
글감(이슈) → 초안(PR: In Review) → 리뷰(톤·GEO 체크) → 머지 → 자동 배포
```

- **글감만 있는 단계**면 이슈 템플릿 **"✍️ 블로그 글감·초안 제안"**으로 남겨주세요 — 아이디어가 사라지지 않게 보드에서 관리합니다.
- 리뷰는 게이트가 아니라 품질 보조입니다. 리뷰어는 [BLOG-WRITING-GUIDE](./BLOG-WRITING-GUIDE.md)의 B2B 톤과 GEO 체크리스트를 기준으로 봅니다.
- 발행에는 재빌드가 필요합니다(수십 초~1분).

## 자주 묻는 것

- **write 권한이 없는데요?** 필요 없습니다. Open Authoring이 여러분 fork에서 PR을 엽니다.
- **로컬에서 `/admin`이 "Login with GitHub"만 떠요.** `npx decap-server`가 안 떠 있는 것입니다. 먼저 실행하세요.
- **내 이름/프로필로 표시되나요?** `author`에 이름을, 가능하면 GitHub 아이디를 함께 남기면 바이라인·작성자 프로필로 연결됩니다. (멤버 개인 글은 코퍼릿 톤으로 정규화하지 않고 작성자 목소리를 유지합니다.)
