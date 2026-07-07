---
title: "설정이 모델 격차를 지웁니다"
description: "동일 하네스, 모델만 교체, 고정 심판. 오픈소스 모델의 실행 시간을 설정 두 항목으로 1/25로 줄이고, 프론티어 모델과의 격차가 오차 범위까지 좁혀지는 것을 확인한 통제 실험."
date: "2026-06-01"
author: Jinsoo Kim
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

하네스가 실제로 성능 향상에 기여하는지 확인하려면 비교 조건을 최대한 동일하게 맞춰야 합니다. 실험 설계는 다음과 같습니다 — 동일한 하네스 노드, 변수는 모델뿐(자체 호스팅 오픈소스 Qwen vs 프론티어 Sonnet), 심판은 Sonnet으로 고정, 심판 조작 없음.

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
> 1. [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. [프로세스 경계를 넘는 자기완결성](/blog/harness-journey-3-compile-wheel-mcp)
> 4. [규칙은 프롬프트가 아니라 격리 judge로 강제합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> 6. **설정이 모델 격차를 지웁니다** *(지금 읽는 글)*
> 7. [설정을 스스로 개선하는 루프](/blog/harness-journey-7-self-forging)
> 8. [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 실행 시간을 결정한 것은 모델이 아니라 설정이었습니다

첫 코드 과제에서 Qwen은 2,488초, Sonnet은 84초였습니다. 30배 차이의 원인을 분석해 보니 모델 추론 속도가 아니라 **재시도 정책**이었습니다 — 판정 실패 시 답변 전체(8,192토큰)를 처음부터 다시 생성하기를 반복하는 구조가 실행 시간을 대부분 차지하고 있었습니다. 반복 상한과 토큰 상한 두 항목을 조정하자 실행 시간은 약 100초, 1/25로 줄었습니다.

> 에이전트의 체감 성능은 모델 성능만으로 결정되지 않습니다. 실행기 설정이 함께 맞물려야 비로소 제대로 된 성능이 나옵니다. 설정이 나쁘면 좋은 모델도 느리고, 설정이 맞으면 작은 모델도 실용 범위에 들어옵니다. 이 분리가 하네스가 존재하는 이유입니다.

## 결과 해석: 중요한 것은 우열보다 격차였습니다

실무형 컨설팅 과제 4개를 대상으로 한 평가에서 Qwen이 3승 1패(0.94~0.98 vs 0.90~1.0)를 기록했습니다. 차이를 만든 요인은 심판의 근거 기준이었습니다 — 출처 없는 수치 생성을 감점하는 기준에 프론티어 모델의 답변이 걸렸습니다. 다만 한 번의 결과만으로는 우열을 판단하기 어렵기 때문에 재현 세션을 별도로 돌렸고, 6개 과제 4승 2패에 점수 차 ±0.01~0.05라는 결과를 얻었습니다. 유의미한 차이라고 보기 어려웠기 때문에 결론은 "사실상 동률"로 기록했습니다.

동률이라는 결론이 이 실험의 성과입니다. **하네스 위에서 무료 오픈소스 모델과 프론티어 모델의 품질 격차가 오차 범위까지 좁혀진다** — 운영 비용을 크게 줄일 가능성을 보여 준 결과였습니다.

## 구조를 단순화해도 성능은 유지됐습니다 — 라우터 없는 단일 에이전트

같은 방법론으로 아키텍처도 비교했습니다. 질문을 분기하는 라우터와 계획 수립기(플래너)로 구성한 기존 21노드 구조가 21개 과제 중 15개를 완주할 때, 도구 8개를 하네스 하나에 통합한 단일 에이전트는 11개 과제 전부를 완주했습니다(폴백 0회, 과제당 약 $0.005/45초). 라우팅 로직이 하던 일 — 의도 분류와 도구 선택 — 을 하네스의 도구 탐색 스테이지가 흡수하므로, 중간 라우팅 계층은 불필요한 실패 가능성만 늘리고 있었습니다.

추가로 확인한 사실도 있었습니다. 도구가 빈 결과를 반환해도 성공으로 집계돼 검색이 무한 반복되던 결함은, 프롬프트에 주의 문구를 넣는 방식이 아니라 실행 단계가 도구의 오류 신호(is_error)를 존중하도록 고치는 것이 정답이었습니다 — 행동을 교정하는 가장 효과적인 방법은 프롬프트가 아니라 상태 머신을 수정하는 것이었습니다.

## 정리하며

이번 벤치마크의 핵심은 변수 격리와 재현이었습니다. 그리고 가장 중요한 결과는 "설정이 격차를 지운다"였습니다. 여기서 자연스럽게 다음 질문이 이어집니다 — 그 설정을 사람이 아니라 시스템이 찾게 할 수는 없는가. 다음 편이 그 답, 설정을 스스로 개선하는 루프입니다.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들입니다.
- 모델 비교는 변수 격리(동일 실행기·고정 심판)에 재현 세션까지를 한 세트로 보기를 권장합니다. 한 번의 결과만으로는 우열을 판단하기 어려웠습니다.
- 실행 시간이 이상할 때 모델보다 재시도 정책을 먼저 살펴보는 것도 방법입니다. 우리 경우 판정 실패 시의 재생성 예산이 실행 시간을 대부분 차지하고 있었습니다.
- 행동 교정은 프롬프트보다 상태 머신 쪽이 확실했습니다 — 도구의 오류 신호(is_error)를 실행 스테이지가 존중하게 한 것이 우리가 찾은 정공법이었습니다.

---

> **이전 편** → [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> **다음 편** → [설정을 스스로 개선하는 루프](/blog/harness-journey-7-self-forging)
