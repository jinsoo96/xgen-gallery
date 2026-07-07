---
title: "실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리"
description: "실행 안의 루프는 있는데 실행 사이의 루프가 끊겨 있었습니다. 네 가지 저장 범위의 메모리와 교훈 전달을 연결해, 에이전트가 지난 실행에서 배우게 만든 기록."
date: "2026-06-24"
author: Jinsoo Kim
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

앞 편에서 다룬 '설정을 스스로 개선하는 루프'는 실행과 실행 사이에서 설정을 진화시킵니다. 그렇다면 설정이 아니라 경험은 어떻게 이어질까요? 에이전트 메모리에 대한 관련 기술과 사례를 조사한 결과(출처 24건, 클레임 119건을 3인 교차검증해 만장일치만 수록), 우리 시스템에 대해 내린 진단은 한 문장이었습니다.

> "실행 내 루프(재시도·자기교정)는 있는데, 실행 간 루프가 끊겨 있다."

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
> 1. [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. [프로세스 경계를 넘는 자기완결성](/blog/harness-journey-3-compile-wheel-mcp)
> 4. [규칙은 프롬프트가 아니라 격리 judge로 강제합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> 6. [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. [설정을 스스로 개선하는 루프](/blog/harness-journey-7-self-forging)
> 8. **실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리** *(지금 읽는 글)*
> 9. [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 어디서 뽑고, 어디에 넣는가

핵심은 두 지점을 연결하는 것이었습니다. **기억은 실행이 끝나는 시점에 추출합니다.** 대화에서 기억할 것을 뽑아 저장합니다. **다음 실행이 시작될 때는 프롬프트를 구성하며 기억을 다시 불러옵니다.** 라이브 검증에서 이 두 지점의 결함이 각각 하나씩 나왔는데, 추출 로직이 특정 저장 방식에서만 동작하던 것과 회상된 기억이 조립 단계에서 유실되던 것이었습니다. 둘 다 처리 지점이 명확하게 정의된 구조였기에 원인을 빠르게 찾아 수정할 수 있었습니다.

첫 번째 통합 테스트에서는: 한 대화에서 "제 이름은 김진수입니다"라고 말하면 마무리 단계가 기억 2건을 추출해 저장하고, **새로운 실행에서도** 이름을 묻자 회상이 동작했습니다. 대화와 워크플로우의 경계를 넘는 첫 회상입니다.

## 스코프 4개와 우선순위 2축

모든 기억을 하나의 저장소에 모으면 원하는 기억을 정확하게 찾기 어려워집니다. 그래서 저장소를 **대화(session) / 워크플로우(workflow) / 사용자(user) / 플랫폼(platform)** 4개 범위로 나누고, 추출 시점에 LLM이 어느 범위의 기억인지 분류합니다(라이브 검증: 한 발화에서 사용자 1건, 워크플로우 1건으로 나뉘어 저장). 충돌은 두 가지 기준으로 해결합니다 —

- **타입 축**: 제약(constraint)은 상위 스코프가 우선합니다. 플랫폼 정책이 개인 취향을 이깁니다.
- **스코프 축**: 선호(preference)는 하위 스코프가 우선합니다. 이 워크플로우에서의 선호가 일반 선호를 이깁니다.

조회 설계에는 도구 쪽에서 검증된 패턴을 그대로 옮겼습니다 — **"도구의 점진 공개(PD)와 메모리의 점진 공개는 같은 원리"**라는 관찰입니다. 기억 전문을 다 싣지 않고 목차를 먼저 검색한 뒤 필요한 본문만 펼칩니다. 컨텍스트 예산 관점에서 도구 목록과 기억 저장소는 같은 방식으로 해결할 수 있는 문제이기 때문입니다.

## 교훈을 다음 실행으로 이어가기: 저장에서 소비까지

실패에서 얻은 교훈(lesson)도 같은 원칙을 따릅니다. 초기 구현은 교훈을 기록만 하고 다음 실행이 읽지 않았습니다 — 이 연결을 완성한 뒤, Run A의 교훈이 Run B 시작 시 `[state] resume — 정제기억 61건·교훈 69건 이월`로 실제로 다음 실행에 반영되는 것을 확인했습니다. 판정을 0/1 양극단에서 0.70~0.98의 점진 채점으로 바꾼 것도 같은 맥락입니다 — 다음 실행으로 전달할 정보의 정밀도가 높아야 다음 실행의 조정이 정밀해집니다.

## 정리하며

메모리 기능의 핵심은 저장소의 구조가 아니라 **파이프라인의 어느 지점에서 뽑고 어느 지점에서 읽는가**에 있었습니다. 추출은 마무리 단계에서, 주입은 프롬프트 조립 단계에서, 분류는 4개 스코프로, 충돌은 2개 축으로 — 전부 처리 지점이 명확한 구조라 문제가 생겨도 어느 단계에서 발생했는지 쉽게 확인할 수 있었습니다. 남은 과제는 기억을 지속적으로 정리하는 기능(중복 병합·감쇠)입니다. 다음 편은 마지막 — 에이전트의 상황 인지 설계에서 아직 풀리지 않은 과제들입니다.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들입니다.
- 메모리는 저장보다 소비부터 설계하는 편이 좋았습니다. "다음 실행의 어느 지점이 이것을 읽는가"에 답이 없으면 활용되지 않는 데이터로 남았습니다.
- 스코프 분리와 충돌 규칙(제약은 상위 우선, 선호는 하위 우선)의 명문화도 한 번쯤 검토해 볼 만합니다. 하나의 저장소에 모으면 조회 정확도가 떨어졌습니다.
- 기억 조회에는 도구 PD 패턴(목차 검색 → 본문 펼침)을 그대로 재사용할 수 있었습니다. 두 문제 모두 컨텍스트를 효율적으로 사용하는 방식이라는 점에서 같은 접근법을 적용할 수 있었습니다.

---

> **이전 편** → [설정을 스스로 개선하는 루프](/blog/harness-journey-7-self-forging)
> **다음 편** → [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)
