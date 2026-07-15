# 블로그 운영 방식 — 기고부터 발행까지

Plateer Labs Insight 블로그는 **DB 없이 git 저장소의 마크다운 파일**로 운영됩니다.
글 1개는 `frontend/content/blog/<slug>.md` 파일 1개이고, `main`에 머지되면 자동 배포됩니다.
개발자는 각자 **자기 GitHub 계정**으로 글을 올리고, 편집자가 **리뷰·머지**하면 발행됩니다.

## 한눈에 보는 흐름

```
/admin 로그인(GitHub) → 작성
  → 저장: 본인 fork 브랜치에 PR(In Review)로 보관 — main 직접 수정 안 함
  → 편집자(sooanc) 리뷰 → 머지 → 발행
```

- **초안(`draft: true`)은 운영에 노출되지 않습니다** — 검토 중인 글이 사이트에 새지 않도록 숨깁니다.
- 발행에는 재빌드가 필요합니다(수십 초~1분).

## 왜 브랜치(PR) 방식인가

메인 저장소에 write 권한이 없어도 누구나 안전하게 기고할 수 있도록, **Open Authoring** 방식을 씁니다.
Decap CMS가 기고자의 계정으로 저장소를 fork하고, 그 fork의 브랜치에서 **Pull Request**를 열어줍니다.
따라서 기고자는 `main`을 직접 건드리지 않고, 편집자는 PR 단위로 안전하게 검토·머지합니다.

## 기고자(개발자) 관점

1. **https://labs.plateer.com/admin** 접속 → **Login with GitHub** → 본인 계정으로 로그인
2. **글쓰기** → 제목·설명·카테고리·태그·본문 작성
3. **저장** → 본인 fork 브랜치에 **PR(In Review)** 로 보관됩니다(초안은 fork에 안전하게 남습니다)
4. 편집자 리뷰 후 머지 → 발행

> 글을 쓰기 전에 [블로그 글쓰기 가이드](blog-writing.html)와 [GEO·SEO 가이드](geo-seo.html)를 먼저 읽어주세요. 자세한 기고 방법은 [기여 가이드](contributing.html)에 있습니다.

## 편집자(운영자) 관점

기고글은 **GitHub Pull Requests**에 도착합니다 — **Decap의 Workflow 보드에는 뜨지 않습니다**.
Open Authoring은 기고자의 **fork 브랜치**에서 PR을 열기 때문에, 베이스 저장소의 `cms/*` 브랜치만 추적하는
Decap 편집자 보드에는 나타나지 않습니다. 이는 정상 동작이며, 편집자는 GitHub PR로 검토합니다.

1. **Pull requests** 탭에서 대기 중인 기고글 확인
   → https://github.com/PlateerLab/xgen-gallery/pulls
2. **Files changed**에서 `frontend/content/blog/<slug>.md` 본문·톤·GEO 체크
3. **Merge** → `main` 반영 → CI 재빌드 → 발행

> **중요**: 기고글은 대개 `draft: true`(검토 중) 상태로 들어옵니다.
> 머지만 해서는 운영에 노출되지 않으므로, 실제로 공개하려면 **`draft: false`로 변경**해야 합니다.

## 상태값 요약

| 항목 | 의미 |
|------|------|
| `draft: true` | 검토 중 — 운영 사이트에서 숨김 |
| `draft: false` | 발행 — 머지 후 운영에 노출 |
| In Review(PR) | 기고자 fork에서 열린 검토 대기 PR |
| Merged | `main` 반영 완료 — 재빌드 후 배포 |

## 리뷰 기준

리뷰는 게이트가 아니라 품질 보조입니다. 리뷰어는 [글쓰기 가이드](blog-writing.html)의 B2B 톤과
[GEO·SEO 가이드](geo-seo.html)의 체크리스트를 기준으로 봅니다.
멤버 개인 글은 코퍼릿 톤으로 정규화하지 않고 작성자 목소리를 유지합니다.
