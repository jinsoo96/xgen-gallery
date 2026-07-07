---
title: "엔진은 플랫폼을 몰라야 합니다"
description: "플랫폼을 오염시키지 말라는 요구에 아키텍처로 답하다 — 엔진 독립, 표준 플러그인 규약(entry_points), 그리고 20일 만에 확정된 10단계 구조."
date: "2026-04-14"
author: Jinsoo Kim
category: Tech Note
tags:
  - 하네스
  - 아키텍처
  - 플러그인설계
series: 하네스 개발기
part: 2/9
draft: false
---

**한 줄 요약** — 플랫폼이 엔진에만 의존하도록 구조를 고정하고, 확장은 Python 표준 플러그인 규약(entry_points)으로 분리해 엔진이 하루 네 번 릴리즈돼도 플랫폼은 흔들리지 않도록 만들었습니다.

빠르게 진화하는 실험 코드와 안정적으로 운영되는 플랫폼은 요구사항이 다릅니다. 4월 중순, 하네스는 나흘간 작은 수정 릴리즈(패치)를 38번 쏟아내는 개선 속도를 내고 있었고, 같은 시기 플랫폼 쪽에서는 "제품의 메인 코드베이스(main 브랜치)에 하네스 코드가 섞여서는 안 된다"는 요구가 명확해졌습니다. 이 긴장을 푸는 방법은 격리된 브랜치가 아니라 **아키텍처**였습니다.

> 이 글에 나오는 버전 표기를 잠깐 풀면 — **v0.x**는 구조가 계속 바뀌는 실험 단계, **v1.0.0**은 구조를 확정한 첫 정식판입니다. 소수점 뒤 숫자가 올라가는 것은 기능 추가나 작은 수정의 릴리즈 횟수입니다.

<figure class="blog-illust">
<svg viewBox="0 0 1000 430" width="1000" height="430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="플랫폼→엔진 단방향 의존과 표준 플러그인 규약">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
    <marker id="a2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2563eb"/></marker>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="430" fill="url(#bg2)"/>
  <circle cx="930" cy="40" r="150" fill="#2563eb" opacity="0.05"/>
  <text x="48" y="60" font-size="24" font-weight="800" fill="#2563eb">하네스 개발기 · 2/9</text>
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">엔진은 플랫폼을 몰라야 한다</text>
  <!-- platform box -->
  <rect x="48" y="170" width="330" height="150" rx="18" fill="#ffffff" stroke="#d7e0f0"/>
  <text x="76" y="214" font-size="26" font-weight="800" fill="#0f172a">플랫폼</text>
  <text x="76" y="246" font-size="20" fill="#64748b">통합 레이어 · 정책 주입</text>
  <rect x="76" y="262" width="180" height="42" rx="10" fill="#eef4ff" stroke="#cddaf5"/><text x="166" y="290" text-anchor="middle" font-size="20" font-weight="700" fill="#2563eb">harness_bridge</text>
  <!-- single-direction dependency -->
  <line x1="392" y1="245" x2="600" y2="245" stroke="#2563eb" stroke-width="5" marker-end="url(#a2)"/>
  <text x="496" y="226" text-anchor="middle" font-size="23" font-weight="700" fill="#2563eb">단방향 의존</text>
  <text x="496" y="276" text-anchor="middle" font-size="19" fill="#64748b">pip · 버전 핀</text>
  <!-- engine box -->
  <rect x="624" y="170" width="330" height="150" rx="18" fill="#2563eb"/>
  <text x="652" y="214" font-size="26" font-weight="800" fill="#ffffff">엔진</text>
  <text x="652" y="246" font-size="20" fill="#cfe0ff">순수 PyPI 패키지</text>
  <rect x="652" y="262" width="274" height="42" rx="10" fill="#1e40af"/>
  <rect x="672" y="272" width="22" height="22" rx="5" fill="#93c5fd"/><rect x="702" y="272" width="22" height="22" rx="5" fill="#93c5fd"/><rect x="732" y="272" width="22" height="22" rx="5" fill="#93c5fd"/>
  <text x="906" y="289" text-anchor="end" font-size="19" font-weight="700" fill="#dbeafe">entry_points</text>
  <!-- stage chip -->
  <rect x="48" y="358" width="430" height="52" rx="14" fill="#ffffff" stroke="#d7e0f0"/>
  <text x="72" y="391" font-size="22" font-weight="700" fill="#334155">스테이지 정리</text>
  <rect x="230" y="371" width="56" height="28" rx="7" fill="#e2e8f0"/><text x="258" y="391" text-anchor="middle" font-size="20" font-weight="700" fill="#64748b">15</text>
  <line x1="296" y1="385" x2="330" y2="385" stroke="#2563eb" stroke-width="4" marker-end="url(#a2)"/>
  <rect x="342" y="371" width="56" height="28" rx="7" fill="#2563eb"/><text x="370" y="391" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">10</text>
  <text x="414" y="391" font-size="19" fill="#64748b">20일 만에</text>
</svg>
</figure>

> **시리즈 · 하네스 개발기** — 전 9부
>
> 1. [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. **엔진은 플랫폼을 몰라야 합니다** *(지금 읽는 글)*
> 3. [프로세스 경계를 넘는 자기완결성](/blog/harness-journey-3-compile-wheel-mcp)
> 4. [규칙은 프롬프트가 아니라 격리 judge로 강제합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> 6. [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. [설정을 스스로 개선하는 루프](/blog/harness-journey-7-self-forging)
> 8. [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 분리 전략: 의존 방향을 한쪽으로만

해법은 세 가지 결정으로 구성됩니다.

1. **엔진의 플랫폼 독립** — 엔진 저장소에서 플랫폼 어댑터를 삭제했습니다(v0.22.0 "엔진 독립성 완결"). 엔진은 이후 어떤 플랫폼 어휘도 갖지 않는 순수 PyPI 패키지입니다.
2. **플랫폼 특화 코드의 이관** — 플랫폼을 아는 코드 2,040줄은 플랫폼 측 통합 레이어(`harness_bridge/`)로 옮겼습니다. 같은 날 엔진에서 −2,251줄, 통합 레이어에서 +2,231줄이 움직인 대칭 커밋이 이 이관의 기록입니다.
3. **확장은 표준 플러그인 규약(entry_points)으로** — 플랫폼 측은 엔진을 pip으로 의존(`xgen-harness>=N`)하고, 배포 대상·옵션 소스·에러 패턴을 이 규약으로 등록합니다. 엔진은 메커니즘(Protocol과 등록 API)만 제공하고, 한국어 용어 확장 같은 정책은 플랫폼 측이 주입합니다.

> 플랫폼은 엔진에만 의존하도록 설계했습니다. 엔진을 먼저 릴리즈하고, 플랫폼은 필요한 시점에 사용할 엔진 버전(버전 핀)만 업데이트하는 방식으로 개발 사이클을 운영했습니다.

이 구조 덕에 별도 엔드포인트로 운영되던 하네스는, 검증이 쌓인 2주 뒤 공용 개발 코드베이스(develop 브랜치)에 정식 합류할 수 있었습니다. 플랫폼 입장에서 하네스는 이제 "플랫폼 코드와 뒤섞인 실험 코드"가 아니라 "버전이 명시된 외부 패키지 + 명시적 플러그인"이었기 때문입니다.

## 스테이지 구조의 정리: 15 → 10

같은 기간 파이프라인 구조도 정리됐습니다. Rust 시절 15개였던 스테이지는 삭제(계획 단계는 세 번 도입되고 세 번 제거됐습니다)와 통합을 거쳐, 첫 커밋 20일 만에 나온 첫 정식판(v1.0.0)에서 실행 단계(스테이지) 열 개로 확정됐습니다. 주요 업데이트 역시 같은 방향으로 진행됐습니다 — v0.17.0에서 안전장치를 선언형 점검 체인(Guard)으로 정리했고, v0.25.0에서 도구 공급을 단일 채널(ToolSource) 하나로 통일했습니다. 전부 "흩어져 있던 것을 하나의 표준 계약으로 통합하는" 릴리즈였습니다. 첫 공개 버전(v0.1.0)부터 정식판까지 14일간 약 60개 버전이 릴리즈됐는데, 이처럼 빠른 릴리즈를 가능하게 한 기반이 바로 이 분리 구조였습니다 — 플랫폼은 필요한 시점에 엔진 버전만 올리면 되므로, 잦은 엔진 릴리즈의 영향을 받지 않습니다.

운영에서 얻은 교정도 있습니다. PyPI의 버전 번호를 구버전 코드가 점유해 의존성 해석이 옛 코드를 설치하던 문제를 겪은 뒤, 버전 문자열을 코드에 두지 않고 패키지 정보에서 읽도록 바꿨습니다(세 번의 어긋남 수정 끝의 근본 해결).

## 정리하며

"플랫폼을 오염시키지 말라"는 요구에 브랜치 규칙으로 답했다면 마찰은 반복됐을 것입니다. 의존 방향을 한쪽으로 고정하고 확장을 플러그인 계약으로 명시한 것 — 이 구조는 이후 컴파일, SDK 통합, 자가개선 기능까지 이어지는 모든 확장의 기반이 됐습니다. 다음 편은 이 분리를 한 단계 더 확장한 이야기입니다: 플랫폼 없이, 프로세스 경계 너머에서도 동작하는 컴파일 산출물.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들입니다.
- 실험 코드와 플랫폼의 충돌을 브랜치 규칙 대신 의존 방향으로 풀어 보는 것도 방법일 것 같습니다. 우리는 단방향 의존 + 버전 핀으로 릴리즈 속도와 플랫폼 안정성이 공존했습니다.
- 플랫폼 특화 지식은 엔진보다 플러그인 계약(entry_points) 쪽에 두는 편이 이식성에 도움이 됐습니다.
- 버전 문자열은 코드보다 패키지 정보에서 읽는 쪽이 안전했습니다 — 코드와 버전이 어긋나는 일을 세 번 겪고 내린 결론입니다.

---

> **이전 편** → [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> **다음 편** → [프로세스 경계를 넘는 자기완결성](/blog/harness-journey-3-compile-wheel-mcp)
