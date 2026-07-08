---
title: "프로세스의 경계를 넘으려면, 상태도 함께 넘어가야 합니다"
description: "워크플로우를 설치형 패키지(wheel)로 컴파일해 '환경변수만 주입하면 동작하는' 산출물로. 프로세스 안에만 있던 상태를 파일에 담는 것이 컴파일의 본질이었습니다."
date: "2026-04-26"
author: Jinsoo Kim
editor: Editorial SA
kicker: "설계 원칙"
category: Tech Note
tags:
  - 하네스
  - MCP
  - 컴파일
series: 하네스 개발기
part: 3/9
draft: false
---

**한 줄 요약** — 컴파일의 본질은 코드 변환이 아니라 상태의 동결입니다. 플랫폼 내부에만 존재하던 실행 정보를 설정 파일로 고정해, 환경변수만으로 동작하는 독립 실행 산출물을 만들었습니다.

워크플로우를 컴파일한다는 것은 무엇일까요? 처음에는 단순히 실행 코드를 하나의 패키지로 만드는 일이라고 생각했습니다. 캔버스에서 만든 워크플로우를 wheel이나 npm 패키지로 만들고, 필요한 환경변수만 전달하면 어디서든 실행할 수 있는 형태로 배포하는 것. 하네스의 컴파일 기능도 그렇게 시작했습니다.

그런데 실제로 구현해 보니 예상과 다른 문제가 나타났습니다. 컴파일은 성공했습니다. 패키지도 정상적으로 생성됐습니다. 오류도 발생하지 않았습니다. 그런데 실행 결과만 달랐습니다.

그 순간 깨달았습니다. 컴파일은 코드를 옮기는 작업이 아니라, 상태를 옮기는 작업이었습니다.

<figure class="blog-illust">
<svg viewBox="0 0 1000 430" width="1000" height="430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="프로세스 경계를 넘는 자기완결 산출물 — 컴파일, wheel, MCP">
  <defs>
    <linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
    <marker id="a3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2563eb"/></marker>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="430" fill="url(#bg3)"/>
  <circle cx="930" cy="40" r="150" fill="#2563eb" opacity="0.05"/>
  <text x="48" y="60" font-size="24" font-weight="800" fill="#2563eb">하네스 개발기 · 3/9</text>
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">상태도 함께 경계를 넘는다</text>
  <!-- canvas -->
  <rect x="48" y="185" width="200" height="150" rx="16" fill="#ffffff" stroke="#d7e0f0"/>
  <text x="72" y="222" font-size="23" font-weight="800" fill="#0f172a">캔버스</text>
  <circle cx="90" cy="258" r="10" fill="#93c5fd"/><circle cx="134" cy="258" r="10" fill="#93c5fd"/><circle cx="178" cy="258" r="10" fill="#93c5fd"/>
  <line x1="90" y1="258" x2="134" y2="258" stroke="#cbd5e1" stroke-width="3"/><line x1="134" y1="258" x2="178" y2="258" stroke="#cbd5e1" stroke-width="3"/>
  <rect x="72" y="290" width="150" height="14" rx="7" fill="#e2e8f0"/>
  <line x1="262" y1="260" x2="316" y2="260" stroke="#2563eb" stroke-width="5" marker-end="url(#a3)"/>
  <text x="290" y="238" text-anchor="middle" font-size="21" font-weight="700" fill="#2563eb">compile</text>
  <!-- wheel -->
  <rect x="340" y="190" width="190" height="140" rx="16" fill="#2563eb"/>
  <text x="435" y="228" text-anchor="middle" font-size="23" font-weight="800" fill="#ffffff">.whl 산출물</text>
  <circle cx="435" cy="278" r="30" fill="none" stroke="#bfdbfe" stroke-width="4"/><circle cx="435" cy="278" r="9" fill="#bfdbfe"/>
  <line x1="435" y1="248" x2="435" y2="308" stroke="#bfdbfe" stroke-width="3"/><line x1="405" y1="278" x2="465" y2="278" stroke="#bfdbfe" stroke-width="3"/>
  <!-- boundary -->
  <line x1="590" y1="165" x2="590" y2="360" stroke="#94a3b8" stroke-width="3" stroke-dasharray="9 9"/>
  <text x="590" y="152" text-anchor="middle" font-size="20" font-weight="700" fill="#64748b">프로세스 경계</text>
  <line x1="540" y1="260" x2="644" y2="260" stroke="#2563eb" stroke-width="5" marker-end="url(#a3)"/>
  <rect x="666" y="196" width="180" height="60" rx="12" fill="#ffffff" stroke="#d7e0f0"/><text x="756" y="234" text-anchor="middle" font-size="24" font-weight="700" fill="#334155">CLI 실행</text>
  <rect x="666" y="272" width="180" height="60" rx="12" fill="#ffffff" stroke="#d7e0f0"/><text x="756" y="310" text-anchor="middle" font-size="24" font-weight="700" fill="#334155">MCP 서버</text>
  <text x="864" y="268" font-size="19" fill="#64748b">플랫폼 없이</text>
  <text x="864" y="292" font-size="19" fill="#64748b">동작</text>
</svg>
</figure>

> **시리즈 · 하네스 개발기** — 전 9부
>
> 1. 설계 원칙 — [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. 설계 원칙 — [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. 설계 원칙 — **프로세스의 경계를 넘으려면, 상태도 함께 넘어가야 합니다** *(지금 읽는 글)*
> 4. 설계 원칙 — [규칙은 프롬프트가 아니라 구조가 지켜야 합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. 검증 — [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> 6. 실험 — [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. 설계 원칙 — [설정은 사람이 찾는 것이 아니라 시스템이 찾아야 합니다](/blog/harness-journey-7-self-forging)
> 8. 설계 원칙 — [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. 설계 원칙 · 전망 — [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 코드보다 먼저 사라지는 것이 있습니다

플랫폼 안에서는 모든 것이 정상적으로 동작했습니다. 워크플로우도 실행됐고, 도구도 호출됐으며, Judge도 제대로 평가를 수행했습니다.

하지만 동일한 워크플로우를 컴파일해 별도 프로세스에서 실행하면 일부 기능이 조용히 사라졌습니다. 오류는 발생하지 않았습니다. 단지 일부 기능이 동작하지 않았을 뿐입니다.

처음에는 각각의 버그처럼 보였습니다. 하지만 하나씩 원인을 추적하면서 공통점을 발견했습니다. 문제를 일으킨 것은 모두 프로세스 안에만 존재하던 상태였습니다.

## 메모리는 컴파일되지 않습니다

가장 먼저 발견한 문제는 도구 목록이었습니다. 생성된 산출물에는 FROZEN_TOOL_DEFINITIONS가 비어 있었습니다. 컴파일은 완료됐지만 실행에 필요한 도구 정보가 함께 생성되지 않았던 것입니다.

이후에도 비슷한 문제가 반복됐습니다. Judge는 플랫폼의 전역 레지스트리에 저장된 평가 기준을 참조하고 있었고, RAG는 서비스 연결 정보와 기본 검색 설정을 실행 중 메모리에서 가져오고 있었습니다.

플랫폼에서는 모두 정상적으로 동작했습니다. 하지만 컴파일된 산출물에는 그런 메모리가 존재하지 않았습니다. 컴파일이 끝나는 순간, 프로세스 안의 상태도 함께 사라졌기 때문입니다.

## 컴파일러의 역할은 상태를 파일로 바꾸는 것입니다

그 이후 컴파일러의 역할을 다시 정의했습니다. 실행에 필요한 정보가 메모리에만 존재한다면, 컴파일 과정에서 반드시 파일로 변환해야 합니다.

워크플로우는 설정으로, Judge는 평가 기준으로, RAG는 서비스 연결 정보와 검색 설정으로. 실행 중에만 존재하던 모든 상태를 명시적인 설정으로 바꾸기 시작했습니다.

결국 컴파일은 코드를 만드는 과정이 아니라 실행 상태를 동결(Freeze)하는 과정이 되었습니다.

## 플랫폼이 없어도 같은 결과가 나와야 합니다

동결 규칙도 같은 원칙으로 설계했습니다. 서브워크플로우는 실행에 필요한 설정 전체를 산출물 안에 포함하도록 했고, 캔버스는 하네스 설정으로 변환하거나 그래프를 직접 해석하는 방식으로 실행하도록 구성했습니다. Python과 Node.js 환경 모두 동일한 동결 형식을 읽고 같은 실행 결과를 만들도록 구현했습니다.

중요한 것은 언어가 아니었습니다. 어떤 환경에서 실행하더라도 동일한 상태를 복원할 수 있는지가 더 중요했습니다.

## 그래서 테스트 방식도 바뀌었습니다

이 과정에서 테스트 기준도 달라졌습니다. 플랫폼 내부에서 성공했다고 해서 컴파일이 성공한 것은 아니었습니다. 실제로 중요한 것은 산출물이 독립적으로 동작하는지였습니다.

그래서 검증 환경도 바꿨습니다. 생성된 산출물을 실제 MCP 서버로 실행하고, Claude에 등록한 뒤, 도구 호출부터 데이터 인용까지 전 과정을 검증하도록 테스트를 재구성했습니다. OAuth 인증과 자동 탐색까지 포함한 모든 시나리오를 통과해야 비로소 컴파일이 완료된 것으로 판단했습니다.

컴파일 기능은 플랫폼 안에서 검증하는 것이 아니라, 플랫폼 밖에서 검증해야 했습니다.

## 마치며

이번 구현에서 얻은 가장 큰 교훈은 의외로 단순했습니다. 프로세스의 경계를 넘는 순간, 메모리는 더 이상 존재하지 않습니다. 따라서 컴파일러가 해야 할 일은 코드를 생성하는 것이 아니라, 실행에 필요한 모든 상태를 명시적인 설정으로 바꾸는 것입니다. 우리는 이것을 Freeze라고 정의했습니다.

컴파일은 결국 상태를 동결하는 과정이며, 독립 실행이 가능하다는 것은 필요한 상태를 하나도 빠짐없이 함께 옮겼다는 의미이기도 합니다.

다음 글에서는 같은 원칙을 실행 품질에 적용한 이야기를 다룹니다. 에이전트가 반드시 지켜야 하는 규칙을 프롬프트가 아니라 실행 구조 안으로 옮긴 이유를 소개합니다.

**같은 문제를 겪고 있다면** — 컴파일 기능을 구현한다면 가장 먼저 확인해야 할 것은 코드가 아니라 상태입니다.
- 메모리 속 등록 정보, 서비스 연결, 실행 중 생성되는 기본값처럼 프로세스 안에서만 유지되는 정보가 있다면 컴파일 시점에 모두 명시적인 설정으로 변환해야 합니다.
- 검증 역시 플랫폼 내부가 아니라 실제 실행 환경에서 이루어져야 합니다. 우리가 가장 신뢰했던 방법은 생성된 산출물을 MCP 서버로 실행하고, 실제 클라이언트에서 도구 호출과 데이터 인용까지 확인하는 end-to-end 검증이었습니다.

---

> **이전 편** → [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> **다음 편** → [규칙은 프롬프트가 아니라 구조가 지켜야 합니다](/blog/harness-journey-4-canvas-node-judge)
