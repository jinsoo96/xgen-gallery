---
title: "실행기의 본질은 속도가 아니라 재조립입니다"
description: "LLM 에이전트 실행기 '하네스'의 설계 배경. 왜 상태 머신인가, 왜 스테이지를 체크리스트로 만들었나, 그리고 왜 Rust가 아니라 Python이었나."
date: "2026-04-02"
author: Jinsoo Kim
category: Tech Note
tags:
  - 하네스
  - 에이전트실행기
  - 아키텍처
series: 하네스 개발기
part: 1/9
draft: false
---

**한 줄 요약** — 에이전트 실행기의 병목은 CPU가 아니라 변경 속도입니다. 상태 머신과 체크리스트 스테이지, 그리고 Rust 대신 Python을 택한 이유를 정리합니다.

LLM 에이전트는 뛰어난 추론 능력을 갖고 있지만, 실행 과정을 시스템이 제어하지 않으면 결과 품질이 쉽게 흔들립니다. 우리가 "하네스(Harness)"라고 부르는 에이전트 실행기는 그 흔들림을 아키텍처로 제어하려는 시도입니다. 이 시리즈는 석 달간 세 저장소에 쌓인 1,270여 커밋에서, 우리가 부딪힌 기술적 문제와 이를 해결한 설계를 골라 정리한 기록입니다.

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
> 1. **실행기의 본질은 속도가 아니라 재조립입니다** *(지금 읽는 글)*
> 2. [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. [프로세스 경계를 넘는 자기완결성](/blog/harness-journey-3-compile-wheel-mcp)
> 4. [규칙은 프롬프트가 아니라 격리 judge로 강제합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> 6. [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. [설정을 스스로 개선하는 루프](/blog/harness-journey-7-self-forging)
> 8. [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 문제 정의: 일방향 그래프(DAG) 실행기로는 에이전트를 안정적으로 제어하기 어려웠습니다

출발점의 문제의식은 첫 README에 정리돼 있습니다. 기존 워크플로우 실행기는 LangGraph 기반의 일방향 그래프 구조여서 **되돌아가는 흐름(재시도 루프)을 표현할 수 없고**, 100개가 넘는 범용 노드와 켜고 끄는 식의 설정으로 파이프라인을 조합하는 방식으로는 실행 과정을 충분히 제어하기 어려웠습니다. 에이전트에 필요한 것은 단순한 '노드의 나열'이 아니라 **상태 머신**이었습니다. 도구 탐색·컨텍스트 압축·검증·재시도 판단이 명시적 스테이지로 존재하고, 스테이지를 자유롭게 넣고 뺄 수 있는 구조 말입니다.

그래서 첫 구현부터 스테이지를 체크리스트 형태로 설계했습니다. 첫 커밋의 스테이지 목록 주석에 이미 "사용자가 체크리스트로 선택 — 포함된 단계만 실행됨"이 명시돼 있었고, minimal(4단계)부터 full(12단계)까지 프리셋이 함께 있었습니다. 컨텍스트 압축 예산 같은 상수는 공개된 코딩 에이전트 CLI 파이프라인을 분석해 대응표를 만들어 참고하되, 검증과 판정 로직은 그대로 가져오지 않고 처음부터 직접 설계했습니다.

## 설계 판단: Rust에서 Python으로

첫 커밋은 56파일 14,034줄의 Rust 상태 머신이었습니다. 나흘 뒤 이 코어를 전량 걷어내고 Pure Python으로 재작성했습니다. 지금 돌아보면 그 선택의 이유는 분명했습니다.

> 에이전트 실행기의 병목은 CPU가 아니라 API 호출 대기입니다. 반면 핵심 요구사항은 "파이프라인 단계를 수시로 재조립하는 것"이었습니다. 최적화해야 할 것은 실행 속도가 아니라 **변경 속도**였습니다.

Rust가 주는 이점(성능·타입 안전)은 이 용도에서 실익이 크지 않았던 반면, 비용(Python 생태계와의 연동 비용, Rust와 Python을 잇는 연결 계층(PyO3)의 유지 비용)은 실질적이었습니다. 실제로 이 연결 계층은 하루 만에 걷어냈고, Rust 코드는 사라졌지만 스테이지 이름과 상태 머신 계약은 Python 구조에 그대로 승계됐습니다. 언어를 바꾼 것이지 설계를 버린 것이 아닙니다.

## 같은 날 세 축이 함께 출발했습니다

Python 전환일에 엔진(실행기 본체), 통합 레이어(플랫폼 연결), UI(파이프라인 시각화 +3,694줄)가 각자의 저장소에서 동시에 개발을 시작했습니다. 이틀 뒤 파이썬 공식 패키지 저장소(PyPI)에 첫 공개 버전(v0.1.0)이 올라갔고, 같은 날 플랫폼 저장소는 내장 사본을 제거하고 이 패키지를 설치해 사용하는 방식으로 전환했습니다 — 엔진과 플랫폼을 패키지 경계로 떼어 놓는 구조가 첫 주에 잡힌 것입니다. 이 분리가 왜 중요한지는 다음 편의 주제입니다.

## 정리하며

기술 선택의 기준은 '좋은 기술'이 아니라 '병목이 어디에 있는가'였습니다. 에이전트 실행기의 병목은 재조립 속도였고, 그 기준이 상태 머신·체크리스트 스테이지·Python이라는 세 가지 선택을 자연스럽게 설명해 줍니다. 다음 편은 이 실행기가 플랫폼과 만나는 방식 — "엔진은 플랫폼을 몰라야 한다"는 분리 원칙이 어떻게 코드로 강제됐는지입니다.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들입니다.
- 실행기를 고를 때 처리량보다 파이프라인 변경 빈도를 먼저 재 보는 것도 좋을 것 같습니다. 우리 경우 병목이 API 대기라서 언어 수준의 성능 이점은 실효가 크지 않았습니다.
- 실행 단계를 체크리스트(선택 가능한 단계 목록 + 기본 조합)로 계약화해 두니, 이후의 재조립·컴파일·자가개선이 전부 그 계약 위에서 성립했습니다. 실제로 운영해 보니 충분히 검토할 가치가 있는 구조였습니다.

---

> **다음 편** → [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
