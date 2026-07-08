---
title: "실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리"
description: "실행 안의 루프는 있는데 실행 사이의 루프가 끊겨 있었습니다. 네 가지 저장 범위의 메모리와 교훈 전달을 연결해, 에이전트가 지난 실행에서 배우게 만든 기록."
date: "2026-06-24"
author: Jinsoo Kim
editor: Editorial SA
kicker: "설계 원칙"
category: Tech Note
tags:
  - 하네스
  - 에이전트메모리
  - 실행간학습
series: 하네스 개발기
part: 8/9
draft: false
---

**한 줄 요약** — 실행이 끝나면 기억을 추출해 네 가지 저장 범위(스코프)로 저장하고, 다음 실행에서는 이를 다시 불러와 프롬프트를 구성합니다. 이렇게 실행을 넘어 학습이 이어지는 구조를 만들었습니다. 이유는 단순합니다 — 저장만 하고 활용하지 않는 기억은 의미가 없기 때문입니다.

에이전트는 같은 실수를 두 번 하지 않을까요? 사람이라면 한 번 실패한 경험을 다음 선택에 반영합니다. 검색이 부족했다면 다음에는 더 많이 검색하고, 설명이 부족했다면 같은 실수를 반복하지 않습니다.

하지만 대부분의 에이전트는 그렇지 않습니다. 한 번의 실행이 끝나는 순간, 그 실행에서 얻은 경험도 함께 사라집니다. 다음 실행은 언제나 처음부터 다시 시작합니다.

하네스를 개발하면서 우리는 이 지점을 가장 큰 한계라고 생각했습니다. 실행은 반복되는데, 학습은 반복되지 않는다. 이번 글은 이 문제를 해결하기 위해 에이전트 메모리를 어떻게 설계했는지에 대한 이야기입니다.

<figure class="blog-illust">
<svg viewBox="0 0 1000 430" width="1000" height="430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="실행이 끝나도 배운 것은 남는다 — 에이전트 메모리">
  <defs>
    <linearGradient id="bg8" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
    <marker id="a8" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2563eb"/></marker>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="430" fill="url(#bg8)"/>
  <circle cx="930" cy="40" r="150" fill="#2563eb" opacity="0.05"/>
  <text x="48" y="60" font-size="24" font-weight="800" fill="#2563eb">하네스 개발기 · 8/9</text>
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">실행이 끝나도 배운 것은 남는다</text>
  <rect x="56" y="235" width="200" height="96" rx="16" fill="#ffffff" stroke="#d7e0f0"/><text x="156" y="278" text-anchor="middle" font-size="24" font-weight="700" fill="#334155">실행 N</text><text x="156" y="308" text-anchor="middle" font-size="19" fill="#64748b">배운 것 추출</text>
  <line x1="264" y1="283" x2="356" y2="283" stroke="#2563eb" stroke-width="5" marker-end="url(#a8)"/><text x="310" y="262" text-anchor="middle" font-size="20" font-weight="700" fill="#2563eb">저장</text>
  <g transform="translate(380,210)">
    <rect x="0" y="0" width="240" height="146" rx="18" fill="#2563eb"/>
    <text x="120" y="42" text-anchor="middle" font-size="24" font-weight="800" fill="#ffffff">에이전트 메모리</text>
    <ellipse cx="120" cy="82" rx="58" ry="15" fill="none" stroke="#bfdbfe" stroke-width="3"/>
    <path d="M62 82 v34 a58 15 0 0 0 116 0 v-34" fill="none" stroke="#bfdbfe" stroke-width="3"/>
    <path d="M62 100 a58 15 0 0 0 116 0" fill="none" stroke="#bfdbfe" stroke-width="3"/>
  </g>
  <line x1="628" y1="283" x2="720" y2="283" stroke="#2563eb" stroke-width="5" marker-end="url(#a8)"/><text x="674" y="262" text-anchor="middle" font-size="20" font-weight="700" fill="#2563eb">조회</text>
  <rect x="744" y="235" width="200" height="96" rx="16" fill="#ffffff" stroke="#d7e0f0"/><text x="844" y="278" text-anchor="middle" font-size="24" font-weight="700" fill="#334155">실행 N+1</text><text x="844" y="308" text-anchor="middle" font-size="19" fill="#64748b">맥락 이어받기</text>
  <path d="M844 231 C 844 168, 156 168, 156 231" fill="none" stroke="#7c5cff" stroke-width="4" marker-end="url(#a8)"/>
  <text x="500" y="162" text-anchor="middle" font-size="22" font-weight="700" fill="#7c5cff">실행 간 학습 루프</text>
</svg>
</figure>

> **시리즈 · 하네스 개발기** — 전 9부
>
> 1. 설계 원칙 — [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. 설계 원칙 — [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. 설계 원칙 — [프로세스의 경계를 넘으려면, 상태도 함께 넘어가야 합니다](/blog/harness-journey-3-compile-wheel-mcp)
> 4. 설계 원칙 — [규칙은 프롬프트가 아니라 구조가 지켜야 합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. 검증 — [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> 6. 실험 — [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. 설계 원칙 — [설정은 사람이 찾는 것이 아니라 시스템이 찾아야 합니다](/blog/harness-journey-7-self-forging)
> 8. 설계 원칙 — **실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리** *(지금 읽는 글)*
> 9. 설계 원칙 · 전망 — [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 실행 안에서는 똑똑했지만, 실행 밖에서는 아무것도 기억하지 못했습니다

앞선 글에서 소개한 하네스는 실행 중에는 스스로 수정할 수 있었습니다. Judge가 실패를 감지하면 다시 실행하고, Reflexion이 실패 원인을 다음 시도에 반영했습니다.

하지만 실행이 끝나는 순간 모든 것이 초기화됐습니다. 다음 실행에서는 같은 실패를 다시 반복했습니다.

이 문제를 분석하면서 하나의 결론에 도달했습니다. 실행 안의 루프는 있었지만, 실행 사이의 루프는 존재하지 않았습니다.

## 메모리는 저장보다 연결이 더 중요했습니다

처음에는 기억을 저장하는 기능부터 만들었습니다. 하지만 곧 문제가 드러났습니다. 기억은 계속 쌓이는데, 정작 다음 실행에서는 아무도 그 기억을 사용하지 않았습니다. 저장소는 있었지만, 소비자가 없었습니다.

그 이후 설계 방향을 완전히 바꿨습니다. 메모리는 저장 기능이 아니라 실행 파이프라인의 일부가 되어야 했습니다.

그래서 두 지점을 명확하게 정의했습니다. 실행이 끝나는 순간에는 기억을 추출하고, 새로운 실행이 시작될 때는 그 기억을 다시 읽어 프롬프트를 구성합니다. 기억은 저장되는 것이 아니라 다음 실행으로 전달됩니다.

## 기억은 모두 같은 종류가 아니었습니다

모든 기억을 하나의 저장소에 넣는 것도 금세 한계를 드러냈습니다. 사용자의 선호, 현재 워크플로우에서만 필요한 정보, 대화 중에만 유효한 내용, 플랫폼 전체 정책이 서로 섞이기 시작했습니다. 검색 정확도도 함께 떨어졌습니다.

그래서 기억을 네 가지 범위로 나눴습니다. Session, Workflow, User, Platform. LLM은 기억을 저장하는 순간부터 어떤 범위에 속하는 정보인지를 함께 판단합니다. 덕분에 다음 실행에서는 필요한 기억만 가져올 수 있게 됐습니다.

## 기억에도 우선순위가 필요했습니다

기억이 늘어나자 또 다른 문제가 생겼습니다. 같은 질문에 서로 다른 기억이 존재하는 경우였습니다. 예를 들어 사용자는 특정 표현을 선호하지만, 플랫폼 정책은 그 표현을 허용하지 않을 수도 있습니다. 어떤 기억을 우선해야 할까요?

이 문제를 해결하기 위해 기억에도 규칙을 만들었습니다. 제약(Constraint)은 상위 범위가 우선합니다. 플랫폼 정책은 개인 선호보다 먼저 적용됩니다. 반대로 선호(Preference)는 하위 범위가 우선합니다. 이번 워크플로우에서의 선호가 일반적인 사용자 취향보다 더 중요합니다.

메모리도 결국 하나의 실행 정책이었습니다.

## 기억은 모두 읽을 필요가 없습니다

기억이 많아질수록 새로운 문제가 생겼습니다. 프롬프트에 모든 기억을 넣을 수는 없었습니다.

그래서 이전에 도구 탐색에서 사용했던 방식을 그대로 가져왔습니다. 먼저 필요한 기억의 목차만 찾고, 실제로 필요한 경우에만 내용을 펼칩니다. 도구를 점진적으로 공개했던 방식이 메모리에서도 그대로 적용됐습니다.

결국 도구와 기억은 같은 문제였습니다. 둘 다 컨텍스트를 어떻게 효율적으로 사용할 것인가에 대한 문제였습니다.

## 교훈도 다음 실행으로 이어져야 했습니다

메모리뿐 아니라 교훈(Lesson)도 같은 방식으로 연결했습니다. 초기에는 실패 원인을 저장만 했습니다. 하지만 다음 실행에서는 아무도 그 교훈을 읽지 않았습니다.

그래서 실행이 시작되는 순간, 이전 실행의 Lesson도 함께 가져오도록 변경했습니다. Run A에서 얻은 실패 경험은 Run B의 시작부터 실행 전략에 반영됩니다. 실행은 끝났지만, 학습은 계속 이어지게 됐습니다.

## 마치며

이번 글에서 만들고자 했던 것은 더 큰 메모리 저장소가 아니었습니다. 오히려 경험이 다음 실행으로 자연스럽게 이어지는 구조였습니다.

기억은 저장되는 순간보다 다시 사용되는 순간에 비로소 가치가 생깁니다. 그래서 메모리는 데이터베이스가 아니라 실행 파이프라인의 일부가 되어야 했습니다. 하네스는 실행이 끝날 때 기억을 남기고, 다음 실행은 그 기억에서 다시 시작합니다. 사람이 경험을 통해 배우듯, 에이전트도 실행을 통해 조금씩 더 나아질 수 있도록 말입니다.

다음 글에서는 시리즈의 마지막 주제인 상황 인지(Context Awareness)를 다룹니다. 에이전트는 자신의 답변이 이후 어떤 시스템에서 어떻게 사용될지까지 이해해야 할까요?

**같은 고민을 하고 있다면** — 메모리를 설계할 때는 무엇을 저장할 것인가보다, 언제 다시 사용할 것인가를 먼저 정의하는 것이 중요합니다.
- 저장과 소비가 하나의 파이프라인으로 연결되지 않으면 메모리는 단순한 로그에 머물 가능성이 큽니다.
- 기억은 하나의 저장소에 모두 모으기보다 범위(Session, Workflow, User, Platform)를 나누고, 충돌 규칙을 명확하게 정의하는 편이 조회 정확도와 운영 일관성을 높이는 데 도움이 됩니다.
- 모든 기억을 프롬프트에 넣기보다 필요한 기억만 점진적으로 불러오는 구조를 권장합니다. 하네스에서는 도구 탐색에 사용했던 점진적 공개(PD) 방식을 메모리에도 동일하게 적용해 컨텍스트 효율을 높일 수 있었습니다.

---

> **이전 편** → [설정은 사람이 찾는 것이 아니라 시스템이 찾아야 합니다](/blog/harness-journey-7-self-forging)
> **다음 편** → [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)
