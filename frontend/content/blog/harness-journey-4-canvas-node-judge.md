---
title: "규칙은 프롬프트가 아니라 구조가 지켜야 합니다"
description: "하네스 10-stage를 캔버스 노드 하나로. 절대 규칙을 생성 모델과 분리된 judge가 채점하고, 위반은 점수와 함께 반려해 루프를 다시 돌리는 구조."
date: "2026-05-08"
author: Jinsoo Kim
editor: Editorial SA
kicker: "설계 원칙"
category: Tech Note
tags:
  - 하네스
  - judge
  - 에이전트설계
series: 하네스 개발기
part: 4/9
draft: false
---

**한 줄 요약** — 절대 규칙을 프롬프트가 아닌 독립된 Judge가 검증하도록 설계했습니다. 규칙을 위반한 답변은 점수와 함께 반려되고, 실행기는 이를 바탕으로 다시 실행됩니다. 이유는 하나입니다 — 부탁은 잊히지만, 구조는 잊지 않기 때문입니다.

LLM에게 "이 규칙은 반드시 지켜주세요"라고 말하면 정말 지켜질까요? 처음에는 우리도 그렇게 생각했습니다. 중요한 규칙은 시스템 프롬프트에 넣고, 더 강조해야 하면 몇 번 더 반복해서 작성했습니다.

하지만 운영 환경에서는 다른 결과가 나타났습니다. 컨텍스트가 길어질수록 규칙은 조금씩 희미해졌고, 도구 호출과 긴 추론 과정이 이어질수록 처음의 지시사항은 뒤로 밀려났습니다. 프롬프트는 전달되었습니다. 하지만 규칙은 집행되지 않았습니다.

그 순간 질문을 바꿨습니다. 규칙은 모델이 기억해야 하는 걸까요? 아니면 시스템이 강제해야 하는 걸까요? 하네스는 두 번째를 선택했습니다.

<figure class="blog-illust">
<svg viewBox="0 0 1000 430" width="1000" height="430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="규칙을 격리된 judge 게이트로 강제한다">
  <defs>
    <linearGradient id="bg4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
    <marker id="a4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2563eb"/></marker>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="430" fill="url(#bg4)"/>
  <circle cx="930" cy="40" r="150" fill="#2563eb" opacity="0.05"/>
  <text x="48" y="60" font-size="24" font-weight="800" fill="#2563eb">하네스 개발기 · 4/9</text>
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">규칙은 구조가 지킨다</text>
  <rect x="48" y="240" width="150" height="70" rx="14" fill="#ffffff" stroke="#d7e0f0"/><text x="123" y="283" text-anchor="middle" font-size="24" font-weight="700" fill="#334155">노드 출력</text>
  <line x1="204" y1="275" x2="300" y2="275" stroke="#2563eb" stroke-width="5" marker-end="url(#a4)"/>
  <!-- isolated judge -->
  <rect x="316" y="176" width="300" height="200" rx="18" fill="#eef4ff" stroke="#2563eb" stroke-width="3" stroke-dasharray="10 8"/>
  <text x="466" y="212" text-anchor="middle" font-size="23" font-weight="800" fill="#2563eb">격리 JUDGE</text>
  <g transform="translate(426,226)">
    <path d="M40 0 L78 16 V44 C78 74 62 92 40 104 C18 92 2 74 2 44 V16 Z" fill="#2563eb"/>
    <path d="M24 52 l12 12 l22 -26" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="466" y="356" text-anchor="middle" font-size="19" fill="#64748b">프롬프트 아님 · 독립 실행</text>
  <line x1="622" y1="235" x2="716" y2="205" stroke="#1f9d57" stroke-width="5" marker-end="url(#a4)"/>
  <line x1="622" y1="315" x2="716" y2="345" stroke="#e11d48" stroke-width="5" marker-end="url(#a4)" stroke-dasharray="8 6"/>
  <rect x="732" y="176" width="220" height="64" rx="14" fill="#ecf8f1" stroke="#bfe6cf"/>
  <path d="M754 208 l11 11 18 -20" stroke="#1f9d57" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="796" y="216" font-size="22" font-weight="700" fill="#1f9d57">통과 → 진행</text>
  <rect x="732" y="312" width="220" height="64" rx="14" fill="#fdecef" stroke="#f6c6d0"/>
  <g stroke="#e11d48" stroke-width="5" stroke-linecap="round"><line x1="756" y1="336" x2="774" y2="354"/><line x1="774" y1="336" x2="756" y2="354"/></g><text x="796" y="351" font-size="22" font-weight="700" fill="#e11d48">위반 → 재시도</text>
</svg>
</figure>

> **시리즈 · 하네스 개발기** — 전 9부
>
> 1. 설계 원칙 — [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. 설계 원칙 — [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. 설계 원칙 — [프로세스의 경계를 넘으려면, 상태도 함께 넘어가야 합니다](/blog/harness-journey-3-compile-wheel-mcp)
> 4. 설계 원칙 — **규칙은 프롬프트가 아니라 구조가 지켜야 합니다** *(지금 읽는 글)*
> 5. 검증 — [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> 6. 실험 — [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. 설계 원칙 — [설정은 사람이 찾는 것이 아니라 시스템이 찾아야 합니다](/blog/harness-journey-7-self-forging)
> 8. 설계 원칙 — [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. 설계 원칙 · 전망 — [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 부탁과 강제는 다릅니다

프롬프트는 결국 모델에게 보내는 요청입니다. 모델은 가능한 한 요청을 따르려고 하지만, 컨텍스트가 달라지거나 우선순위가 바뀌면 언제든 다른 판단을 할 수 있습니다. 반면 절대 지켜야 하는 규칙은 그런 방식으로 관리할 수 없습니다.

그래서 생성과 판정을 분리했습니다. 생성 모델은 답을 만드는 역할만 맡고, 규칙을 지켰는지는 별도의 Judge가 판단하도록 설계했습니다. Judge는 답변을 기준별로 채점하고, 기준을 만족하지 못하면 점수와 사유를 함께 반환합니다. 실행기는 그 결과를 다시 받아 재시도 루프를 시작합니다.

여기서 중요한 것은 점수가 아닙니다. 생성과 검증이 서로 독립되었다는 사실입니다.

## 규칙은 기억되는 것이 아니라 반복해서 확인됩니다

이 구조를 적용한 이후 실행 흐름도 달라졌습니다. 규칙을 위반한 답변은 즉시 반려됐습니다. 실행기는 실패 이유를 다음 시도의 컨텍스트로 전달했고, Reflexion 경로는 이전 판단을 바탕으로 응답을 다시 생성했습니다.

결과적으로 규칙은 프롬프트 안에서 "기억"되는 것이 아니라, Judge를 통해 매번 "확인"되는 구조가 되었습니다. LLM은 답을 만들고, Judge는 답을 통과시킬지 결정합니다. 역할이 분리되자 실행 과정도 훨씬 예측 가능해졌습니다.

## Judge도 결국 하나의 프로그램입니다

흥미로운 점은 Judge 역시 완벽하지 않았다는 것입니다. 운영 과정에서는 예상하지 못했던 문제가 여러 번 발생했습니다.

판정 확장 코드가 로드되지 않았는데도 기본 Judge가 동작하면서 아무도 문제를 인지하지 못한 경우, 합격 기준이 설정과 다르게 코드 안에 하드코딩되어 있던 경우, 간단한 확인 응답을 정상 결과로 잘못 판단해 채점을 건너뛴 경우도 있었습니다.

겉으로 보기에는 시스템이 정상적으로 동작했습니다. 하지만 실제로는 Judge가 제대로 작동하지 않고 있었습니다. 이 문제를 겪으며 또 하나의 원칙을 세웠습니다. **Judge 역시 반드시 검증 대상이어야 한다.**

## 검증 시스템도 검증해야 합니다

Judge는 실패해도 시스템을 멈추지 않습니다. 대부분의 경우 기본 동작으로 돌아가거나, 더 느슨한 기준으로 계속 실행됩니다. 이른바 Fail Open 상태입니다.

그래서 더 위험합니다. 시스템은 계속 동작하지만, 품질 기준만 조용히 무너질 수 있기 때문입니다.

이후에는 Judge의 활성 상태를 지속적으로 계측하고, 실제 LLM을 포함한 End-to-End 테스트를 별도로 운영하기 시작했습니다. Judge가 살아 있는지까지 검증해야 비로소 규칙이 지켜진다고 말할 수 있었습니다.

## 실행 경로도 하나만 남겼습니다

Judge를 캔버스 노드로 통합하면서 또 하나의 원칙을 세웠습니다. 같은 기능이라면 실행 경로도 하나여야 합니다.

캔버스에서 실행할 때와 저장된 워크플로우를 실행할 때 서로 다른 코드를 사용하면, 같은 버그를 두 번 수정해야 합니다. 그래서 출력 형식, 메모리, 도구 연결을 모두 공통 모듈로 옮기고, 두 실행 경로가 동일한 코드 위에서 동작하도록 구조를 단순화했습니다. 구조가 단순해질수록 검증 역시 쉬워졌습니다.

## 성공은 코드가 아니라 결과가 말해줍니다

테스트 기준도 바뀌었습니다. 초기에는 HTTP 200과 응답 길이만 확인해도 성공으로 판단했습니다. 하지만 운영 과정에서는 이런 기준이 아무 의미가 없다는 사실을 자주 경험했습니다. 응답은 정상적으로 도착했지만, 내용은 틀린 경우가 많았기 때문입니다.

이후 성공의 기준을 바꿨습니다. 정해진 형식을 만족하는지, 메모리를 올바르게 회상하는지, 실제 데이터가 기대한 결과와 일치하는지. 결국 중요한 것은 응답이 왔는지가 아니라 무엇을 응답했는가였습니다.

## 마치며

이번 개발에서 얻은 가장 큰 교훈은 하나였습니다. 규칙은 모델이 기억하도록 만드는 것이 아니라, 시스템이 반드시 확인하도록 만들어야 합니다.

그래서 하네스는 생성과 검증을 분리했습니다. LLM은 답을 만들고, Judge는 통과 여부를 결정하며, 실행기는 그 결과를 바탕으로 다시 실행합니다.

부탁은 잊힐 수 있습니다. 하지만 구조는 잊지 않습니다.

**같은 고민을 하고 있다면** — 절대 지켜야 하는 규칙이라면 프롬프트 안에만 두지 않는 것을 권합니다.
- 생성 모델이 규칙을 기억하는 것에 의존하기보다, 생성과 검증을 분리하고 Judge가 통과 여부를 결정하도록 설계하면 규칙은 "권고"가 아니라 "실행 조건"이 됩니다.
- Judge 자체도 신뢰의 대상이 아니라 검증의 대상이어야 합니다. 활성 상태를 지속적으로 계측하고, 실제 LLM을 포함한 End-to-End 테스트를 운영해야만 품질 기준이 운영 환경에서도 일관되게 유지됩니다.

---

> **이전 편** → [프로세스의 경계를 넘으려면, 상태도 함께 넘어가야 합니다](/blog/harness-journey-3-compile-wheel-mcp)
> **다음 편** → [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
