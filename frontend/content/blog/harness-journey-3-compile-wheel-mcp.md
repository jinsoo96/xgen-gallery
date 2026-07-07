---
title: "프로세스 경계를 넘는 자기완결성"
description: "워크플로우를 설치형 패키지(wheel)로 컴파일해 '환경변수만 주입하면 동작하는' 산출물로. 프로세스 안에만 있던 상태를 파일에 담는 것이 컴파일의 본질이었습니다."
date: "2026-04-26"
author: Jinsoo Kim
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

하네스의 승부수는 컴파일입니다. 캔버스에서 만든 워크플로우를 `compile_workflow()`로 파이썬 설치 파일(wheel)이나 npm 패키지로 변환하면, 플랫폼 없이 **환경변수만 주입하면 동작하는** 독립 산출물이 되고, AI 도구 연결 표준(MCP) 서버로 실행해 Claude 같은 외부 에이전트의 도구가 됩니다. 이 기능을 완성하며 배운 것은, 컴파일에서 가장 어려운 점은 코드 변환이 아니라 **상태의 완전한 동결(freeze)**에 있다는 사실이었습니다.

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
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">경계를 넘는 자기완결 산출물</text>
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
> 1. [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. **프로세스 경계를 넘는 자기완결성** *(지금 읽는 글)*
> 4. [규칙은 프롬프트가 아니라 격리 judge로 강제합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> 6. [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. [설정을 스스로 개선하는 루프](/blog/harness-journey-7-self-forging)
> 8. [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 원칙: 실행에 필요한 정보는 모두 산출물 안에 있어야 합니다

초기 검증 과정에서 산출물의 도구 목록이 빈 채(`FROZEN_TOOL_DEFINITIONS = []`)로 생성되는 결함이 나왔습니다. 동결 빌더에 "워크플로우를 도구로 변환하는" 처리가 없었기 때문입니다. 해법은 유형별 동결 규칙을 정의하는 것이었습니다 — 서브워크플로우는 설정 전체를 산출물에 포함하고 호출 시 그 안에서 중첩 실행(무한 반복 방지 제한 포함), 캔버스는 하네스 설정으로 변환하거나 그래프 해석기로 실행. Python과 Node 환경 모두 동일한 동결 형식을 읽고 같은 결과를 내도록 구현했습니다.

## 반복된 결함의 공통 원인: 프로세스 전역 상태

이후 몇 주간의 결함들은 패턴이 같았습니다. **클러스터 안에서는 정상인데 산출물에서는 오류 없이 기능이 누락되는** 부류입니다.

- judge 평가 기준의 정의가 플랫폼 프로세스의 메모리(전역 레지스트리)에만 있었습니다 — 별도 프로세스로 뜨는 산출물에는 그 메모리가 없으니, 평가는 기본 설정으로 대체되어 실행됐습니다. 수정은 평가 기준을 **설정 파일에 담아** 산출물이 스스로 복원하게 하는 것.
- 문서 검색(RAG)은 서비스 연결·검색 개수 기본값·결과 미리보기 길이 세 곳이 모두 산출물에서는 동작하지 않았습니다. 각각 동결 시점에 값을 확정해 포함하도록 바꿨습니다.

일반화하면 다음과 같습니다.

> 플랫폼 프로세스 안에서만 존재하는 암묵적 상태(메모리 속 등록 정보, 서비스 연결, 실행 중 기본값)는 컴파일 구조에서는 유지될 수 없습니다. 산출물이 읽을 수 있는 것은 파일로 담긴 설정뿐이므로, "동결 시점에 모든 암묵적 상태를 명시적 설정으로 바꾼다"가 컴파일러의 첫 번째 계약이어야 합니다.

이 부류는 명시적인 오류 없이 실패한다는 점이 특히 까다로워서, 검증도 산출물 기준으로 바꿨습니다 — 실제 Claude 클라이언트에 MCP로 등록해 도구 호출·데이터 인용까지 전 구간을 완주시키는 것을 완성 조건으로 삼았고, 표준 인증(OAuth)과 자동 탐색 경로까지 포함해 검증 항목 여섯 개를 통과시킨 뒤에야 기능 개발을 마무리했습니다.

## 정리하며

컴파일 기능의 설계 원칙은 한 줄로 요약됩니다 — **산출물의 실행 경로에서 암묵 상태를 없앨 것.** 그리고 그 검증은 반드시 실제 산출물 환경에서 이뤄져야 한다는 것이 우리의 결론입니다. in-process 테스트로는 이 부류의 결함이 구조적으로 잡히지 않았습니다. 다음 편은 같은 원칙을 실행 품질에도 적용한 이야기입니다 — 에이전트가 지켜야 할 규칙을, 프롬프트가 아니라 어디에 두어야 하는가.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들입니다.
- 컴파일·산출물 기능이라면 "동결 시점에 암묵적 상태를 명시적 설정으로"라는 규칙을 먼저 세워 두는 것도 좋을 것 같습니다. 우리 경우 메모리 속 등록 정보, 서비스 연결, 실행 중 기본값 — 이 세 가지가 대부분의 문제를 일으켰습니다.
- 산출물 검증은 별도 프로세스에서 실제 클라이언트(MCP 등록→도구 호출→데이터 인용)로 하는 것이 가장 신뢰할 수 있는 방법이었습니다. in-process 테스트로는 이 부류의 결함이 잡히지 않았습니다.

---

> **이전 편** → [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> **다음 편** → [규칙은 프롬프트가 아니라 격리 judge로 강제합니다](/blog/harness-journey-4-canvas-node-judge)
