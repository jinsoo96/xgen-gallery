---
title: "실행기의 본질은 속도가 아니라 재조립입니다"
description: "LLM 에이전트 실행기 '하네스'의 설계 배경. 왜 상태 머신인가, 왜 스테이지를 체크리스트로 만들었나, 그리고 왜 Rust가 아니라 Python이었나."
date: "2026-04-02"
author: Jinsoo Kim
editor: Editorial SA
kicker: "설계 원칙"
category: Tech Note
tags:
  - 하네스
  - 에이전트실행기
  - 아키텍처
series: 하네스 개발기
part: 1/9
draft: true
---

**한 줄 요약** — 에이전트 실행기의 병목은 CPU가 아니라 변경 속도입니다. 상태 머신과 체크리스트 스테이지, 그리고 Rust 대신 Python을 택한 이유를 정리합니다.

LLM 에이전트를 만들다 보면 의외의 지점에서 한계를 만납니다. 모델은 충분히 똑똑한데 결과가 들쭉날쭉합니다. 프롬프트를 조금만 바꿔도 응답이 달라지고, 실행 단계를 하나 추가하는 것만으로도 전체 파이프라인을 다시 손봐야 하는 일이 반복됩니다.

처음에는 모델의 문제라고 생각했습니다. 하지만 개발을 계속할수록 다른 결론에 도달했습니다. 문제는 모델이 아니라 실행기였습니다.

우리가 만들고자 했던 것은 더 빠른 실행기가 아니었습니다. 실행 과정을 언제든 다시 조립하고, 필요한 단계만 교체할 수 있는 실행기였습니다. 하네스(Harness)는 바로 그 질문에서 시작했습니다. 실행기의 병목은 어디에 있을까요? CPU일까요, 아니면 변경 속도일까요? 이 글에서는 그 질문에 답을 찾아가는 과정을 소개합니다.

<figure class="blog-illust">
<svg viewBox="0 0 1000 430" width="1000" height="430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="상태 머신과 재시도 루프 — Rust에서 Python으로">
  <defs>
    <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
    <marker id="a1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2563eb"/></marker>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="430" fill="url(#bg1)"/>
  <circle cx="930" cy="40" r="150" fill="#2563eb" opacity="0.05"/>
  <text x="48" y="60" font-size="24" font-weight="800" fill="#2563eb">하네스 개발기 · 1/9</text>
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">상태 머신으로 실행을 붙잡다</text>
  <!-- retry loop (arc above nodes) -->
  <path d="M720 250 C 720 165, 120 165, 120 250" fill="none" stroke="#7c5cff" stroke-width="4" marker-end="url(#a1)"/>
  <rect x="318" y="163" width="204" height="34" rx="17" fill="#ffffff"/>
  <text x="420" y="187" text-anchor="middle" font-size="22" font-weight="700" fill="#7c5cff">재시도 루프 (cycle)</text>
  <!-- forward arrows -->
  <line x1="172" y1="288" x2="268" y2="288" stroke="#2563eb" stroke-width="4" marker-end="url(#a1)"/>
  <line x1="372" y1="288" x2="468" y2="288" stroke="#2563eb" stroke-width="4" marker-end="url(#a1)"/>
  <line x1="572" y1="288" x2="668" y2="288" stroke="#2563eb" stroke-width="4" marker-end="url(#a1)"/>
  <!-- nodes -->
  <circle cx="120" cy="288" r="52" fill="#ffffff" stroke="#2563eb" stroke-width="3"/><text x="120" y="297" text-anchor="middle" font-size="26" font-weight="700" fill="#2563eb">탐색</text>
  <circle cx="320" cy="288" r="52" fill="#ffffff" stroke="#2563eb" stroke-width="3"/><text x="320" y="297" text-anchor="middle" font-size="26" font-weight="700" fill="#2563eb">압축</text>
  <circle cx="520" cy="288" r="52" fill="#ffffff" stroke="#2563eb" stroke-width="3"/><text x="520" y="297" text-anchor="middle" font-size="26" font-weight="700" fill="#2563eb">검증</text>
  <circle cx="720" cy="288" r="52" fill="#2563eb"/><text x="720" y="297" text-anchor="middle" font-size="26" font-weight="700" fill="#ffffff">판단</text>
  <!-- chip -->
  <rect x="812" y="250" width="150" height="76" rx="14" fill="#eef4ff" stroke="#cddaf5"/>
  <text x="887" y="284" text-anchor="middle" font-size="21" font-weight="700" fill="#334155">Rust →</text>
  <text x="887" y="312" text-anchor="middle" font-size="21" font-weight="700" fill="#2563eb">Python</text>
</svg>
</figure>

> **시리즈 · 하네스 개발기** — 전 9부
>
> 1. 설계 원칙 — **실행기의 본질은 속도가 아니라 재조립입니다** *(지금 읽는 글)*
> 2. 설계 원칙 — [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. 설계 원칙 — [프로세스의 경계를 넘으려면, 상태도 함께 넘어가야 합니다](/blog/harness-journey-3-compile-wheel-mcp)
> 4. 설계 원칙 — [규칙은 프롬프트가 아니라 구조가 지켜야 합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. 검증 — [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> 6. 실험 — [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. 설계 원칙 — [설정은 사람이 찾는 것이 아니라 시스템이 찾아야 합니다](/blog/harness-journey-7-self-forging)
> 8. 설계 원칙 — [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. 설계 원칙 · 전망 — [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 에이전트에게 정말 필요한 것은 무엇일까

기존 워크플로우 엔진은 대부분 DAG(Directed Acyclic Graph)를 기반으로 동작합니다. 작업은 앞에서 뒤로 흘러갑니다. 노드를 연결하고 실행하면 끝입니다. 처음에는 이것으로 충분해 보였습니다.

하지만 에이전트는 일반적인 워크플로우와 달랐습니다. 도구를 다시 찾아야 할 수도 있고, 컨텍스트를 다시 압축해야 할 수도 있으며, 응답을 검증한 뒤 처음 단계부터 다시 실행해야 하는 경우도 자주 발생했습니다. 즉, 에이전트의 실행은 직선이 아니라 순환에 가까웠습니다.

DAG가 잘못된 것이 아닙니다. 우리가 해결하려는 문제는 DAG가 잘 풀어내는 문제가 아니었던 것입니다.

## 노드를 늘리는 대신 상태를 정의했습니다

처음에는 노드를 계속 추가했습니다. 도구 호출 노드, 검증 노드, 재시도 노드, 압축 노드. 어느 순간 노드는 100개를 넘어갔습니다.

하지만 실행 과정은 더 명확해지지 않았습니다. 오히려 "지금 에이전트가 어떤 상태에 있는가"를 이해하기가 더 어려워졌습니다.

그때 설계 방향을 바꾸기로 했습니다. 노드를 늘리는 대신, 상태를 정의하기 시작했습니다. 도구 탐색, 컨텍스트 압축, 검증, 판단, 재시도. 이들은 노드가 아니라 실행기의 상태(State)가 되었습니다.

## Rust를 포기한 이유는 성능 때문이 아니었습니다

첫 구현은 Rust였습니다. 56개의 파일, 1만 4천 줄이 넘는 코드. 겉으로 보기에는 충분히 완성된 프로젝트였습니다.

그런데 개발을 이어갈수록 이상한 점이 하나 보였습니다. CPU는 거의 바쁘지 않았습니다. 대부분의 시간은 외부 API를 기다리고 있었습니다. 반대로 개발자는 계속 바빴습니다. 파이프라인을 수정하고, 실행 단계를 추가하고, 순서를 바꾸고, 다시 테스트하는 일을 반복했습니다.

> 병목은 CPU가 아니었습니다. 사람이 실행기를 변경하는 속도였습니다.

그 순간 Rust를 계속 가져갈 이유가 사라졌습니다. 우리는 Rust 코드를 버린 것이 아니라, 병목에 맞지 않는 선택을 버린 것이었습니다.

## 설계는 언어보다 오래 남습니다

Rust를 걷어내고 Python으로 다시 구현했습니다. 하지만 상태 머신은 그대로였습니다. 스테이지도 그대로였습니다. 실행 계약도 그대로였습니다. 바뀐 것은 구현 언어뿐이었습니다.

오히려 Python으로 옮긴 이후 실행기를 수정하는 속도는 훨씬 빨라졌고, 새로운 스테이지를 추가하거나 제거하는 작업도 자연스러워졌습니다. 결국 오래 살아남은 것은 Rust가 아니라 설계였습니다.

## 그래서 하네스는 실행기보다 설계에 가깝습니다

이번 프로젝트를 통해 얻은 가장 큰 교훈은 의외로 단순했습니다. 기술을 선택할 때 먼저 물어야 하는 질문은 "어떤 언어가 더 빠른가?"가 아니었습니다. 대신 "우리 시스템의 병목은 어디에 있는가?"였습니다.

하네스에서는 그 답이 CPU가 아니라 재조립 속도였습니다. 그래서 상태 머신을 선택했고, 체크리스트 기반 스테이지를 만들었으며, Rust 대신 Python을 선택했습니다. 결국 이 세 가지 결정은 서로 다른 선택이 아니라, 하나의 질문에서 나온 같은 답이었습니다.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들입니다.
- 실행기를 고를 때 처리량보다 파이프라인 변경 빈도를 먼저 재 보는 것도 좋을 것 같습니다. 우리 경우 병목이 API 대기라서 언어 수준의 성능 이점은 실효가 크지 않았습니다.
- 실행 단계를 체크리스트(선택 가능한 단계 목록 + 기본 조합)로 계약화해 두니, 이후의 재조립·컴파일·자가개선이 전부 그 계약 위에서 성립했습니다. 실제로 운영해 보니 충분히 검토할 가치가 있는 구조였습니다.

---

> **다음 편** → [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
