---
title: "설정이 모델 격차를 지웁니다"
description: "동일 하네스, 모델만 교체, 고정 심판. 오픈소스 모델의 실행 시간을 설정 두 항목으로 1/25로 줄이고, 프론티어 모델과의 격차가 오차 범위까지 좁혀지는 것을 확인한 통제 실험."
date: "2026-06-01"
author: Jinsoo Kim
editor: Editorial SA
kicker: "실험"
category: Tech Note
tags:
  - 하네스
  - 벤치마크
  - LLM
series: 하네스 개발기
part: 6/9
draft: false
---

**한 줄 요약** — 동일한 하네스 환경에서 모델만 바꿔 비교한 결과, 재시도 정책 두 가지만 조정해도 실행 시간은 1/25로 줄었고, 오픈소스 모델과 프론티어 모델의 품질 차이도 오차 범위까지 좁혀졌습니다. 결국 성능은 모델뿐 아니라 설정에도 크게 좌우됩니다.

더 좋은 모델을 쓰면 성능도 좋아질까요? LLM을 도입할 때 가장 먼저 떠올리는 방법은 대부분 같습니다. 더 큰 모델, 더 최신 모델, 더 비싼 모델. 우리도 처음에는 그렇게 생각했습니다.

하지만 하네스를 개발하면서 조금 다른 질문을 하게 됐습니다. 정말 차이를 만드는 것은 모델일까요? 아니면 모델을 실행하는 방식일까요? 이번 글은 그 질문에 답하기 위한 실험입니다.

<figure class="blog-illust">
<svg viewBox="0 0 1000 430" width="1000" height="430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="설정이 모델 격차를 지운다 — Qwen과 Sonnet">
  <defs>
    <linearGradient id="bg6" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
    <marker id="a6" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2563eb"/></marker>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="430" fill="url(#bg6)"/>
  <circle cx="930" cy="40" r="150" fill="#2563eb" opacity="0.05"/>
  <text x="48" y="60" font-size="24" font-weight="800" fill="#2563eb">하네스 개발기 · 6/9</text>
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">설정이 모델 격차를 지운다</text>
  <!-- before -->
  <text x="200" y="176" text-anchor="middle" font-size="22" font-weight="700" fill="#64748b">설정 이전 — 격차</text>
  <rect x="110" y="300" width="80" height="70" rx="8" fill="#cbd5e1"/><text x="150" y="398" text-anchor="middle" font-size="22" font-weight="700" fill="#64748b">Qwen</text>
  <rect x="230" y="200" width="80" height="170" rx="8" fill="#93c5fd"/><text x="270" y="398" text-anchor="middle" font-size="22" font-weight="700" fill="#334155">Sonnet</text>
  <line x1="110" y1="296" x2="310" y2="196" stroke="#e11d48" stroke-width="3" stroke-dasharray="7 5"/>
  <!-- config -->
  <line x1="410" y1="285" x2="540" y2="285" stroke="#2563eb" stroke-width="5" marker-end="url(#a6)"/>
  <g transform="translate(438,190)">
    <rect x="-8" y="0" width="110" height="80" rx="14" fill="#2563eb"/>
    <line x1="20" y1="20" x2="20" y2="60" stroke="#bfdbfe" stroke-width="5"/><circle cx="20" cy="46" r="8" fill="#fff"/>
    <line x1="47" y1="20" x2="47" y2="60" stroke="#bfdbfe" stroke-width="5"/><circle cx="47" cy="30" r="8" fill="#fff"/>
    <line x1="74" y1="20" x2="74" y2="60" stroke="#bfdbfe" stroke-width="5"/><circle cx="74" cy="52" r="8" fill="#fff"/>
    <text x="47" y="-12" text-anchor="middle" font-size="21" font-weight="700" fill="#2563eb">설정</text>
  </g>
  <!-- after -->
  <text x="800" y="176" text-anchor="middle" font-size="22" font-weight="700" fill="#1f9d57">설정 이후 — 격차 지움</text>
  <rect x="700" y="210" width="80" height="160" rx="8" fill="#2563eb"/><text x="740" y="398" text-anchor="middle" font-size="22" font-weight="700" fill="#334155">Qwen</text>
  <rect x="820" y="200" width="80" height="170" rx="8" fill="#3b82f6"/><text x="860" y="398" text-anchor="middle" font-size="22" font-weight="700" fill="#334155">Sonnet</text>
  <line x1="700" y1="206" x2="900" y2="196" stroke="#1f9d57" stroke-width="3"/>
</svg>
</figure>

> **시리즈 · 하네스 개발기** — 전 9부
>
> 1. 설계 원칙 — [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. 설계 원칙 — [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. 설계 원칙 — [프로세스의 경계를 넘으려면, 상태도 함께 넘어가야 합니다](/blog/harness-journey-3-compile-wheel-mcp)
> 4. 설계 원칙 — [규칙은 프롬프트가 아니라 구조가 지켜야 합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. 검증 — [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> 6. 실험 — **설정이 모델 격차를 지웁니다** *(지금 읽는 글)*
> 7. 설계 원칙 — [설정은 사람이 찾는 것이 아니라 시스템이 찾아야 합니다](/blog/harness-journey-7-self-forging)
> 8. 설계 원칙 — [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. 설계 원칙 · 전망 — [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 모델만 바꾸고 나머지는 그대로 두었습니다

모델 성능을 비교하려면 변수부터 줄여야 했습니다. 그래서 실행 환경은 모두 동일하게 유지했습니다. 같은 하네스, 같은 워크플로우, 같은 Judge, 같은 평가 기준. 달라진 것은 모델 하나뿐이었습니다.

자체 호스팅한 Qwen과 프론티어 모델인 Sonnet을 동일한 조건에서 반복 실행했습니다. 우리가 알고 싶었던 것은 모델 자체가 만드는 차이였습니다.

## 가장 큰 차이는 모델이 아니었습니다

첫 번째 결과는 예상 밖이었습니다. Qwen은 하나의 과제를 완료하는 데 2,488초가 걸렸고, Sonnet은 84초였습니다.

처음에는 모델 성능 차이라고 생각했습니다. 하지만 실행 로그를 하나씩 분석해 보니 다른 원인이 보였습니다. 시간을 가장 많이 소비한 것은 추론이 아니라 재시도였습니다. Judge를 통과하지 못할 때마다 8,000토큰이 넘는 응답을 처음부터 다시 생성하고 있었던 것입니다.

모델은 생각보다 오래 고민하지 않았습니다. 실행기가 같은 질문을 계속 다시 시키고 있었습니다.

## 설정 두 개가 시간을 25배 줄였습니다

그래서 모델 대신 실행기를 수정했습니다. 재시도 횟수와 생성 토큰 상한. 딱 두 가지 설정만 바꿨습니다.

결과는 예상보다 훨씬 컸습니다. 실행 시간은 2,488초에서 약 100초까지 줄었습니다. 약 25배 빨라졌습니다. 모델은 그대로였습니다. 바뀐 것은 설정뿐이었습니다.

이 실험 이후 우리는 하나의 결론을 얻었습니다. 실행 성능은 모델만으로 결정되지 않는다.

## 중요한 것은 누가 이겼는지가 아니었습니다

속도만이 전부는 아니었습니다. 실무형 컨설팅 과제를 대상으로 품질도 함께 비교했습니다. 흥미롭게도 Qwen이 더 높은 점수를 받은 사례도 있었고, Sonnet이 앞선 경우도 있었습니다.

반복 실험까지 포함한 결과, 점수 차이는 대부분 ±0.01~0.05 수준이었습니다. 통계적으로 우열을 이야기하기 어려운 수준이었습니다. 그래서 결과를 "누가 더 뛰어나다"가 아니라 "거의 같은 수준까지 수렴했다"고 해석했습니다.

이것이 이번 실험에서 가장 의미 있는 결과였습니다. 좋은 실행 환경에서는 오픈소스 모델과 프론티어 모델의 품질 차이가 생각보다 크지 않았습니다.

## 구조를 단순하게 만들어도 성능은 유지됐습니다

같은 관점에서 실행 구조도 다시 살펴봤습니다. 초기 구조는 라우터와 플래너를 포함한 21개의 노드로 구성돼 있었습니다. 하지만 실제 실행 로그를 보면 중간 라우팅 과정에서 실패하는 경우가 적지 않았습니다.

그래서 질문을 다시 바꿨습니다. 라우터가 정말 필요한 걸까요? 도구 선택을 실행기가 직접 하면 안 될까요?

도구 탐색 기능을 하네스 내부로 통합한 결과, 11개의 과제를 모두 안정적으로 수행했고, 중간 폴백은 한 번도 발생하지 않았습니다. 구조는 단순해졌지만, 성능은 유지됐습니다. 오히려 실패 가능성은 줄어들었습니다.

## 행동은 프롬프트보다 실행 구조가 바꿨습니다

또 하나 흥미로운 사례도 있었습니다. 도구가 빈 결과를 반환해도 실행기는 이를 성공으로 판단했고, 같은 검색을 반복하는 문제가 있었습니다.

처음에는 프롬프트를 수정했습니다. 하지만 효과는 오래가지 않았습니다. 결국 해결한 것은 프롬프트가 아니었습니다. 상태 머신이 is_error 신호를 이해하도록 수정하자 반복은 즉시 사라졌습니다.

이 경험은 이전 글에서 얻은 원칙을 다시 확인해 주었습니다. 행동은 프롬프트보다 실행 구조가 더 크게 바꿉니다.

## 마치며

이번 실험은 어떤 모델이 더 뛰어난지를 증명하기 위한 것이 아니었습니다. 오히려 모델의 성능이 얼마나 실행 환경의 영향을 많이 받는지를 확인하기 위한 실험이었습니다.

동일한 모델도 설정에 따라 전혀 다른 결과를 만들었습니다. 실행 시간도, 품질도, 운영 비용도 모두 달라졌습니다. 그래서 이번 실험이 남긴 가장 중요한 결론은 하나였습니다. 모델의 성능은 고정되어 있지만, 실행기의 성능은 설계할 수 있습니다. 하네스가 개선하려 했던 것은 바로 그 영역이었습니다.

다음 글에서는 한 단계 더 나아갑니다. 설정을 사람이 직접 조정하는 대신, 실행기가 스스로 최적의 설정을 찾아가는 구조를 소개합니다.

**같은 고민을 하고 있다면** — 모델을 비교할 때는 모델만 바꾸고 나머지 변수는 모두 동일하게 유지하는 것이 중요합니다.
- 동일한 실행기와 동일한 Judge를 사용하고, 반복 실험까지 수행해야 모델 자체의 차이를 비교할 수 있습니다.
- 실행 시간이 예상보다 길다면 모델보다 먼저 실행 정책을 살펴보는 것을 권합니다. 하네스에서는 재시도 정책과 생성 예산만 조정해도 실행 시간이 25배 가까이 줄었습니다.
- 에이전트의 행동을 바꾸고 싶다면 프롬프트를 반복하기보다 상태 머신과 실행 정책을 먼저 검토하는 편이 더 일관된 결과를 얻을 수 있었습니다.

---

> **이전 편** → [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> **다음 편** → [설정은 사람이 찾는 것이 아니라 시스템이 찾아야 합니다](/blog/harness-journey-7-self-forging)
