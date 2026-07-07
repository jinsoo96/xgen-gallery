---
title: "규칙은 프롬프트가 아니라 격리 judge로 강제합니다"
description: "하네스 10-stage를 캔버스 노드 하나로. 절대 규칙을 생성 모델과 분리된 judge가 채점하고, 위반은 점수와 함께 반려해 루프를 다시 돌리는 구조."
date: "2026-05-08"
author: Jinsoo Kim
category: Tech Note
tags:
  - 하네스
  - judge
  - 에이전트설계
series: 하네스 개발기
part: 4/9
draft: false
---

**한 줄 요약** — 절대 규칙을 프롬프트가 아닌 독립된 judge가 검증하도록 설계했습니다. 규칙을 위반한 답변은 점수와 함께 반려되고, 실행기는 이를 바탕으로 다시 실행됩니다. 이유는 하나입니다 — 부탁은 잊히지만, 게이트는 잊히지 않기 때문입니다.

"이 규칙은 반드시 지켜라"라고 시스템 프롬프트에 적는 것은 결국 모델에게 부탁하는 것에 불과합니다. 컨텍스트가 길어질수록 모델은 그 규칙을 놓치기 쉽습니다. 하네스가 캔버스 노드(`agents/harness`)로 들어가면서 확정한 원칙은, 규칙을 생성 모델이 아니라 별도의 판정기에서 집행하는 것이었습니다.

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
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">규칙은 격리 judge로 강제한다</text>
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
> 1. [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. [프로세스 경계를 넘는 자기완결성](/blog/harness-journey-3-compile-wheel-mcp)
> 4. **규칙은 프롬프트가 아니라 격리 judge로 강제합니다** *(지금 읽는 글)*
> 5. [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> 6. [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. [설정을 스스로 개선하는 루프](/blog/harness-journey-7-self-forging)
> 8. [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 구조: 생성과 판정의 분리

절대 규칙은 생성 모델이 아니라 독립된 judge가 관리합니다. 생성 모델의 답변을 judge가 기준(criteria)별로 채점하고, 임계 미달이면 점수·사유와 함께 반려합니다. 실행기는 반려를 재시도 신호로 받아 루프를 다시 돌리고, 자기교정(Reflexion) 경로는 이전 실패 원인을 다음 시도의 컨텍스트에 주입합니다.

실제 실행 결과는 이 구조가 효과적이라는 것을 보여줍니다. 절대 규칙 위반 발화는 0.00으로 즉시 반려 → 재시도에서 교정 → 준수 답변이 0.93~1.0으로 통과. Reflexion 경로도 0.00 → 반성 주입 → 1.00. 규칙이 프롬프트 안의 문장일 때는 얻을 수 없는, **관측 가능하고 강제 가능한** 실행 흐름입니다.

## 판정기 자신도 검증 대상입니다

judge를 운영하면서 확인한 사실은, 판정기가 눈에 띄지 않게 무력화되는 경우가 여럿 있다는 점입니다. 판정 확장 코드가 불러오기 오류로 비활성화된 채 내장 폴백(기본 동작)만 실행되던 문제, 합격선이 코드 한 곳에 고정돼 설정과 어긋나던 문제, 짧은 확인 문구를 서두 발화로 오인해 채점을 건너뛰던 문제. 결국 공통 원인은 하나였습니다.

> 판정 경로는 "예외 시 통과(fail-open)"가 기본이 되기 쉽습니다. 판정기가 죽으면 시스템은 멈추지 않고 기준만 느슨해지니, 무력화가 겉으로 드러나지 않습니다. 판정기에는 자기 상태를 드러내는 계측과, 실제 LLM을 태운 종단 검증이 별도로 필요합니다.

이 계보는 7편(실측이 잡아낸 잠복 결함)으로 이어집니다.

## 노드로 만들면서 얻은 설계 원칙 두 가지

하네스 전체(노드 본체 869줄, 연결 재배선 모듈 760줄, 설정 항목 34개)를 노드 하나로 통합하면서 정립한 원칙입니다.

**실행 경로는 하나로 통합합니다.** 캔버스 직접 실행과 저장된 워크플로우 실행이 서로 다른 코드를 타면 같은 문제를 두 경로에서 각각 수정해야 합니다. 연결 노드(출력 형식·메모리·도구)를 하네스 입력으로 옮겨 주는 공유 모듈로 두 경로를 일원화했습니다.

**성공 판정은 데이터 내용으로 합니다.** 개발 중 "요청 성공 코드(HTTP 200)와 응답 길이"로 성공을 판정하면 오판이 반복된다는 것을 확인하고, 응답의 실제 내용(정해진 형식을 지킨 답변, 두 턴에 걸친 기억 회상 결과)을 확인하는 세 가지 검증을 모두 통과해야 성공으로 판단했습니다. 메모리 회상 결함의 원인이 항상 빈 결과를 반환하는 조회 함수였던 것도 이 원칙 덕에 원인을 정확히 찾아낼 수 있었습니다 — 쓰기 성공 로그만 봤다면 영영 몰랐을 결함입니다.

## 정리하며

에이전트 품질을 결정하는 핵심은 더 강한 부탁이 아니라 규칙을 실제로 강제하는 구조입니다. 규칙은 격리된 판정기로, 판정기는 다시 계측과 실측으로. 이 기능은 세 저장소에 걸쳐 확정됐습니다 — 워크플로우 15커밋, 프론트엔드 5커밋, 그리고 엔진은 위에서 말한 "눈에 띄지 않게 비활성화돼 있던 판정 확장 훅"을 살린 수정판(v1.16.5)을 릴리즈했습니다. 다음 편은 이 모든 구조를 운영 환경에 안전하게 배포하는 파이프라인이 어떻게 신뢰를 얻는가입니다.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들입니다.
- 반드시 지켜야 할 규칙이라면 생성 모델 밖의 판정기로 옮기는 구조를 한 번쯤 검토해 볼 만합니다. 우리는 반려→재시도 루프를 상태 머신에 두고서야 규칙이 지켜지는 것을 확인했습니다.
- 판정 경로의 예외 처리는 fail-open이 되기 쉬웠습니다. 판정기의 활성 상태 계측과 실제 LLM을 태운 종단 검증을 별도 층으로 두는 것이 도움이 됐습니다.
- 성공 판정은 응답 코드·응답 길이보다 데이터 내용으로 하는 편이 안전했습니다.

---

> **이전 편** → [프로세스 경계를 넘는 자기완결성](/blog/harness-journey-3-compile-wheel-mcp)
> **다음 편** → [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
