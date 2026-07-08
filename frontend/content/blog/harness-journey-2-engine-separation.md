---
title: "엔진은 플랫폼을 몰라야 합니다"
description: "플랫폼을 오염시키지 말라는 요구에 아키텍처로 답하다 — 엔진 독립, 표준 플러그인 규약(entry_points), 그리고 20일 만에 확정된 10단계 구조."
date: "2026-04-14"
author: Jinsoo Kim
editor: Editorial SA
kicker: "설계 원칙"
category: Tech Note
tags:
  - 하네스
  - 아키텍처
  - 플러그인설계
series: 하네스 개발기
part: 2/9
draft: false
---

**한 줄 요약** — 플랫폼이 엔진에만 의존하도록 구조를 고정하고, 확장은 Python 표준 플러그인 규약(entry_points)으로 분리해 엔진이 하루 여러 번 릴리즈돼도 플랫폼은 흔들리지 않도록 만들었습니다.

빠르게 진화하는 코드와 안정적으로 운영되는 플랫폼은 함께 성장할 수 있을까요? 처음에는 가능하다고 생각했습니다. 엔진과 플랫폼을 하나의 저장소에서 함께 개발하면 수정도 쉽고 배포도 단순해 보였습니다.

하지만 릴리즈 횟수가 늘어나기 시작하면서 예상하지 못했던 문제가 나타났습니다. 엔진은 하루에도 여러 번 바뀌는데 플랫폼은 그럴 수 없었습니다. 실험은 계속되어야 했고, 제품은 항상 안정적이어야 했습니다. 두 가지 요구를 같은 코드베이스 안에서 해결하려고 할수록 충돌은 반복됐습니다.

그때 깨달았습니다. 문제는 브랜치 전략이 아니었습니다. 아키텍처가 잘못되어 있었습니다.

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
> 1. 설계 원칙 — [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. 설계 원칙 — **엔진은 플랫폼을 몰라야 합니다** *(지금 읽는 글)*
> 3. 설계 원칙 — [프로세스의 경계를 넘으려면, 상태도 함께 넘어가야 합니다](/blog/harness-journey-3-compile-wheel-mcp)
> 4. 설계 원칙 — [규칙은 프롬프트가 아니라 구조가 지켜야 합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. 검증 — [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> 6. 실험 — [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. 설계 원칙 — [설정은 사람이 찾는 것이 아니라 시스템이 찾아야 합니다](/blog/harness-journey-7-self-forging)
> 8. 설계 원칙 — [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. 설계 원칙 · 전망 — [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 브랜치를 나누는 것으로는 해결되지 않았습니다

2026년 4월 중순. 하네스는 거의 매시간 새로운 개선이 반영될 정도로 빠르게 변화하고 있었습니다. 나흘 동안만 38번의 패치 릴리즈가 이어졌습니다.

반면 플랫폼은 달랐습니다. 제품은 언제든 배포할 수 있는 안정적인 상태를 유지해야 했고, 실험 코드가 메인 코드베이스에 섞이는 것은 허용하기 어려웠습니다.

처음에는 브랜치 전략으로 해결하려고 했습니다. 하지만 브랜치는 코드를 분리할 뿐, 의존성을 분리하지는 못했습니다. 결국 문제는 다시 반복됐습니다.

그래서 질문을 바꿨습니다. 플랫폼이 엔진을 알아야 하는 걸까요? 아니면 엔진이 플랫폼을 몰라야 하는 걸까요? 하네스는 두 번째를 선택했습니다.

## 의존성은 한 방향으로만 흐르도록 만들었습니다

이후 설계 원칙은 매우 단순해졌습니다. **플랫폼은 엔진을 사용할 수 있지만, 엔진은 플랫폼을 알지 못한다.** 이 원칙을 지키기 위해 세 가지 구조를 만들었습니다.

첫째, 엔진에서 플랫폼 코드를 모두 제거했습니다. 실행기는 플랫폼과 완전히 독립된 PyPI 패키지가 되었고, 어떤 플랫폼에서도 동일하게 사용할 수 있는 구조가 됐습니다.

둘째, 플랫폼을 이해해야 하는 모든 코드는 통합 레이어로 옮겼습니다. 엔진은 실행만 담당하고, 플랫폼과 연결되는 책임은 플랫폼이 갖도록 역할을 분리했습니다.

셋째, 확장은 Python의 표준 플러그인 규약인 entry_points를 통해 이루어지도록 했습니다. 엔진은 확장 메커니즘만 제공하고, 실제 정책과 비즈니스 규칙은 플랫폼이 주입하도록 설계했습니다.

결국 엔진은 메커니즘만 알고, 플랫폼은 정책만 알게 되었습니다.

## 그 결과 릴리즈 방식도 달라졌습니다

구조를 바꾸자 개발 방식도 함께 바뀌었습니다. 엔진은 필요한 만큼 빠르게 릴리즈할 수 있었고, 플랫폼은 필요한 시점에 원하는 버전만 선택해서 적용하면 됐습니다.

엔진이 하루에 여러 번 릴리즈되더라도 플랫폼은 영향을 받지 않았습니다. 버전 번호 하나만 변경하면 새로운 실행기를 사용할 수 있었기 때문입니다. 빠른 변화와 안정적인 운영이 처음으로 공존하기 시작했습니다.

## 구조를 단순하게 만들수록 실행도 단순해졌습니다

파이프라인 역시 같은 방향으로 정리했습니다. 초기에는 15개의 실행 스테이지가 존재했습니다. 새로운 단계를 추가하기도 했고, 다시 제거하기도 했으며, 역할이 겹치는 단계는 통합했습니다. 20일 동안의 반복 끝에 실행기는 10개의 스테이지로 정리됐습니다.

여기서 중요한 것은 숫자가 아닙니다. 실행기가 점점 단순한 구조로 수렴했다는 점입니다. Guard는 하나의 선언형 검증 체인으로 통합했고, ToolSource는 모든 도구 공급을 담당하는 단일 계약으로 정리했습니다. 흩어져 있던 기능을 하나의 표준 계약으로 모으는 작업이 계속 이어졌습니다.

결국 빠른 릴리즈를 가능하게 만든 것은 개발 속도가 아니라 구조의 단순함이었습니다.

## 운영은 항상 설계를 다시 검증합니다

구조를 바꾼다고 모든 문제가 끝나는 것은 아니었습니다. 운영 과정에서는 예상하지 못했던 문제도 만났습니다.

한 번은 PyPI 버전 번호와 실제 코드가 어긋나면서 오래된 코드가 설치되는 문제가 발생했습니다. 세 번의 수정 끝에 내린 결론은 단순했습니다. 버전은 코드 안에 두는 것이 아니라 패키지 메타데이터를 기준으로 관리해야 한다는 것이었습니다.

운영은 설계를 검증하는 마지막 단계였고, 설계 역시 운영을 통해 조금씩 다듬어졌습니다.

## 마치며

이번 글의 핵심은 PyPI도, entry_points도 아닙니다. 더 중요한 것은 변화의 속도가 다른 시스템은 서로 독립적으로 진화해야 한다는 원칙입니다.

실험이 빠르게 이루어지는 영역과 안정성이 중요한 영역을 하나의 코드베이스에서 함께 관리하면, 결국 둘 다 느려집니다. 하네스는 의존성을 한 방향으로 고정하고, 확장을 명시적인 플러그인 계약으로 분리하는 방식을 선택했습니다. 이 구조는 이후 컴파일, SDK, 자가 개선 기능까지 이어지는 모든 확장의 기반이 되었습니다.

다음 글에서는 이 원칙을 한 단계 더 확장합니다. 플랫폼조차 필요 없는 실행기. 프로세스의 경계를 넘어 독립적으로 동작하는 컴파일 구조를 소개합니다.

---

> **이전 편** → [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> **다음 편** → [프로세스의 경계를 넘으려면, 상태도 함께 넘어가야 합니다](/blog/harness-journey-3-compile-wheel-mcp)
