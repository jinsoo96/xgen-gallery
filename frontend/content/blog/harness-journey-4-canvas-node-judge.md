---
title: "규칙은 프롬프트가 아니라 격리 judge로 강제합니다 (4부)"
description: "하네스 10-stage를 캔버스 노드 하나로. 절대 규칙을 생성 모델과 분리된 judge가 채점하고, 위반은 점수와 함께 반려해 루프를 다시 돌리는 구조."
date: "2026-05-08"
author: Jinsoo Kim
editor: Editorial Plateer Lab
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

**한 줄 요약** — 절대규칙을 프롬프트에서 꺼내 격리된 judge로 옮겼어요. 위반한 답변은 점수와 함께 반려되고, 실행 루프가 다시 돌아요. 이유는 하나예요. 부탁은 잊히지만, 게이트는 잊히지 않으니까요.

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
> 1. 설계 원칙 — [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. 설계 원칙 — [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. 설계 원칙 — [프로세스 경계를 넘는 자기완결성](/blog/harness-journey-3-compile-wheel-mcp)
> 4. 설계 원칙 — **규칙은 프롬프트가 아니라 격리 judge로 강제합니다** *(지금 읽는 글)*
> 5. 검증 — [배포의 신뢰성은 검증의 층수에서 나옵니다](/blog/harness-journey-5-release-reliability)
> 6. 실험 — [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. 설계 원칙 — [설정을 진화시키는 루프 — 자가단조](/blog/harness-journey-7-self-forging)
> 8. 설계 원칙 — [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. 설계 원칙 · 전망 — [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

시스템 프롬프트에 "이 규칙은 반드시 지켜"라고 적어 보신 적 있으신가요? 우리 경험으로 그건 부탁이었어요. 컨텍스트가 길어지면 모델은 잊어요. 그렇다면 절대 잊히면 안 되는 규칙은 어디에 두어야 할까요? 하네스가 캔버스 노드(`agents/harness`) 하나로 들어가면서 확정한 원칙은, 규칙의 집행 지점을 생성 모델 밖으로 옮기는 것이었어요. 오늘은 그 구조와, 그 판정기가 조용히 죽어 있던 이야기까지 소개해 드릴게요.

## 생성과 판정을 분리했어요

구조는 이래요. 절대규칙은 답변을 생성하는 본체가 아니라 **본체와 격리된 judge(판정기)**가 가져요. 모델의 답을 다른 모델(또는 격리된 판정 경로)이 채점하게 하는 "LLM-as-a-judge"라는 업계 기법 위에 선 구조죠. 이 옮김이 잊힘을 없애는 이유는 단순해요. 본체의 프롬프트에서 규칙은 길어지는 대화에 밀려나는 여러 문장 중 하나지만, judge에게 규칙은 채점 기준 그 자체라 희석될 다른 맥락이 없고, 판정은 켜 두면 매 답변마다 실행되는 단계라 생략될 일도 없거든요. 생성 모델이 답변을 내면 judge가 기준(criteria)별로 채점하고, 임계점에 못 미치면 점수와 사유를 붙여 반려해요. 실행기는 그 반려를 재시도 신호로 받아 루프를 다시 돌리고, 자기교정(Reflexion) 경로는 "무엇이 틀렸는지"에 대한 반성문을 다음 시도의 컨텍스트에 주입하고요. 참고로 Reflexion은 실패의 반성문을 다음 시도에 주입하는 공개 연구 기법이고, 우리는 그 경로를 이 루프 안에 배선한 거예요.

이게 실제로 동작하느냐고요? 실측 궤적이 증명이에요. 절대규칙을 위반한 발화는 0.00으로 즉시 반려됐고, 재시도에서 교정됐고, 준수한 답변은 0.93~1.0으로 통과했어요. Reflexion 경로도 0.00에서 반성문 주입을 거쳐 1.00으로 올라갔죠. 규칙이 프롬프트 안의 문장일 때는 얻을 수 없는, **관측 가능하고 강제되는** 궤적이에요.

## 그런데 판정기 자신이 조용히 죽어 있었어요

judge는 켜는 것부터 함정이었어요. 처음에 판정 단계의 전략 슬롯에 등록하는 방식으로 켰더니, 재시도 루프가 통째로 죽는 오류(LOOP_ERROR)가 났거든요. 그 방식으로 등록할 수 있는 부품이 아니었는데 등록을 받아 버렸던 거예요. 이 버그는 단위 테스트가 아니라, 끝까지 실제로 실행해 보는 종단 검증(E2E)에서만 잡혔어요.

더 무서운 건 judge가 **조용히 무력화되는 경로**가 여럿 있었다는 점이에요. 판정 확장 코드가 불러오기 오류(ImportError)로 통째로 비활성화된 채 내장 폴백(기본 동작)만 돌고 있던 문제가 대표예요. 자기교정이 동작하지 않던 진짜 이유가 이거였고, 엔진 v1.16.5(판정 확장 훅 복구)로 고쳤어요. 합격선이 코드 한 곳에 고정돼 설정과 어긋나던 문제, 짧은 확인 문구를 서두 발화로 오인해 채점을 건너뛰던 문제, 한글로 쓴 평가 기준 이름이 내부 변환 과정에서 빈 문자열이 돼 버리던 문제도 있었죠.

공통점이 보이시나요? 판정기가 죽어도 시스템은 멈추지 않았어요.

> 판정 경로는 "예외 시 통과(fail-open)"가 기본이 되기 쉬워요. 판정기가 죽으면 시스템은 더 관대해질 뿐 멈추지 않으니, 무력화가 겉으로 드러나지 않아요. 그래서 판정기에는 자기 상태를 드러내는 계측과, 실제 LLM을 태운 종단 검증이 별도로 필요해요.

이 계보는 7편에서 실측이 잡아낸 잠복 결함 이야기로 다시 만나게 돼요.

## 노드 하나로 접으며 얻은 규칙 두 가지

하네스 전체(노드 본체 869줄, 연결 재배선 모듈 760줄, 설정 항목 34개)를 캔버스 노드 하나로 접는 과정에서 굳힌 규칙이 두 가지 있어요.

**실행 경로는 하나로 수렴시켜요.** 캔버스에서 직접 실행하는 경로와 저장된 워크플로우로 실행하는 경로가 서로 다른 코드를 타면, 같은 버그를 두 번 고치게 돼요. 실제로 저장된 워크플로우 경로에서는 연결해 둔 노드들(출력 형식·메모리·도구)이 전부 무력화돼 있었는데, 실행 어댑터가 노드 사이의 연결선을 아예 걷지 않았기 때문이었어요. 연결 노드를 하네스 입력으로 옮겨 주는 공유 모듈을 만들어 두 경로를 일원화했어요.

**성공 판정은 데이터 내용으로 해요.** 이 규칙에는 계기가 있어요. 개발 중에 검증이 끝나기 전 "성공"이라고 네 번이나 잘못 기록했다가, 실제 응답 내용을 열어 보고 매번 정정한 일이 있었거든요. 요청 성공 코드(HTTP 200)와 응답 길이만 보면 오판이 반복된다는 걸 그때 확인했죠. 그래서 응답의 실제 내용, 그러니까 정해진 형식을 지킨 답변과 두 턴에 걸친 기억 회상 결과를 확인하는 검증 3종을 완주 조건으로 삼았어요. 이 원칙 덕에 메모리 회상 결함의 원인도 특정할 수 있었어요. 조회 함수가 항상 빈 결과를 반환하고 있었던 건데(쓰기는 정상, 읽기만 죽어 있던 상태), 결국 원시 SQL로 다시 썼어요. 쓰기 성공 로그만 봤다면 영영 몰랐을 결함이에요.

## 정리하며

에이전트 품질의 지렛대는 더 강한 부탁이 아니라 집행 구조였어요. 규칙은 격리된 판정기로, 판정기는 다시 계측과 실측으로. 이 기능은 세 저장소에 걸쳐 확정됐어요. 워크플로우 15커밋, 프론트엔드 5커밋, 그리고 엔진은 조용히 비활성화돼 있던 판정 확장 훅을 살린 v1.16.5를 릴리즈했고요.

다음 편은 이렇게 만든 것들을 세상에 내보내는 이야기예요. 배포 파이프라인이 어떻게 신뢰를 얻는지, 그리고 소스와 산출물이 어긋나는 경로가 생각보다 얼마나 많은지요.

에이전트의 규칙은 부탁이 아니라 구조로 지켜진다고 우리는 믿어요.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들이에요.
- 어겨서는 안 되는 규칙과 지키면 좋은 지침은 집행 장치를 다르게 두는 게 좋은 것 같아요. 전자를 후자의 자리(프롬프트)에 두면 희석되더라고요.
- 안전장치는 죽을 때 시끄러운 편이 좋은 것 같아요. 조용히 통과로 물러나는 안전장치는 없는 것보다 위험할 수도 있겠더라고요. 있다고 믿게 만드니까요.
- 성공의 증거는 형식(응답 코드·길이)보다 내용에서 찾는 편이 안전한 것 같아요. 형식은 실패도 성공처럼 포장할 수 있거든요.

`#하네스` `#judge` `#품질강제`

---

> **이전 편** → [프로세스 경계를 넘는 자기완결성](/blog/harness-journey-3-compile-wheel-mcp)
> **다음 편** → [배포의 신뢰성은 검증의 층수에서 나옵니다](/blog/harness-journey-5-release-reliability)
