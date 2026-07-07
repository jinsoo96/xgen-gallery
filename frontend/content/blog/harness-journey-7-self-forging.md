---
title: "설정을 스스로 개선하는 루프"
description: "선언형 설정은 시스템이 고쳐 쓸 수 있습니다. 점수 → 설정 변경 → 검증 문제셋 → 롤백으로 구성한 자가개선 루프와, 그것을 신뢰하게 만드는 검증 구조."
date: "2026-06-13"
author: Jinsoo Kim
category: Tech Note
tags:
  - 하네스
  - 자가개선
  - 설정자동개선
series: 하네스 개발기
part: 7/9
draft: false
---

**한 줄 요약** — 판정 점수를 바탕으로 설정을 자동 조정하고, 별도의 검증 문제셋(held-out)과 롤백으로 안정성을 확보하는 자가개선 루프를 만들었습니다. PoC에서는 판정 점수가 0.318에서 0.996까지 향상됐고, 운영 환경에서는 검색 범위를 4→8→12로 자동 조정하는 방식으로 검증했습니다.

앞 편의 결론은 "설정이 격차를 지운다"였습니다. 이제는 그 설정을 시스템이 스스로 찾아가도록 만들 차례입니다. 이번 편의 주제인 **설정을 스스로 개선하는 루프**가 그것입니다. 하네스의 설정(HarnessConfig)이 코드가 아니라 값의 목록으로 선언돼 있다는 사실이 출발점입니다 — 설정이 값으로 선언돼 있으면 시스템은 이를 읽고, 평가하고, 필요하면 스스로 수정할 수 있습니다.

<figure class="blog-illust">
<svg viewBox="0 0 1000 430" width="1000" height="430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="설정을 스스로 개선하는 루프">
  <defs>
    <linearGradient id="bg7" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
    <marker id="a7" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2563eb"/></marker>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="430" fill="url(#bg7)"/>
  <circle cx="930" cy="40" r="150" fill="#2563eb" opacity="0.05"/>
  <text x="48" y="60" font-size="24" font-weight="800" fill="#2563eb">하네스 개발기 · 7/9</text>
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">설정을 스스로 개선하는 루프</text>
  <!-- top: 실행 / 판정 / 개정 in a triangle-ish loop -->
  <rect x="380" y="160" width="240" height="60" rx="14" fill="#ffffff" stroke="#d7e0f0"/><text x="500" y="198" text-anchor="middle" font-size="23" font-weight="700" fill="#334155">① 실행</text>
  <rect x="700" y="270" width="250" height="60" rx="14" fill="#ffffff" stroke="#d7e0f0"/><text x="825" y="308" text-anchor="middle" font-size="23" font-weight="700" fill="#334155">② 판정 점수</text>
  <rect x="380" y="360" width="240" height="60" rx="14" fill="#ffffff" stroke="#d7e0f0"/><text x="500" y="398" text-anchor="middle" font-size="23" font-weight="700" fill="#334155">③ 설정 개정</text>
  <rect x="50" y="270" width="250" height="60" rx="14" fill="#2563eb"/><text x="175" y="308" text-anchor="middle" font-size="22" font-weight="800" fill="#ffffff">state spine</text>
  <path d="M620 198 C 720 214, 760 236, 800 266" fill="none" stroke="#2563eb" stroke-width="4" marker-end="url(#a7)"/>
  <path d="M790 330 C 720 366, 660 382, 624 388" fill="none" stroke="#2563eb" stroke-width="4" marker-end="url(#a7)"/>
  <path d="M380 388 C 300 382, 250 366, 216 334" fill="none" stroke="#2563eb" stroke-width="4" marker-end="url(#a7)"/>
  <path d="M240 270 C 280 232, 320 214, 376 200" fill="none" stroke="#2563eb" stroke-width="4" marker-end="url(#a7)"/>
  <g transform="translate(500,258)">
    <circle r="30" fill="none" stroke="#7c5cff" stroke-width="7"/><circle r="9" fill="#7c5cff"/>
    <g stroke="#7c5cff" stroke-width="7" stroke-linecap="round"><line x1="0" y1="-40" x2="0" y2="-28"/><line x1="0" y1="28" x2="0" y2="40"/><line x1="-40" y1="0" x2="-28" y2="0"/><line x1="28" y1="0" x2="40" y2="0"/></g>
  </g>
  <text x="500" y="316" text-anchor="middle" font-size="20" font-weight="700" fill="#7c5cff">설정 자동 개선</text>
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
> 7. **설정을 스스로 개선하는 루프** *(지금 읽는 글)*
> 8. [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 루프의 구성: 점수, 설정 변경, 게이트, 롤백

알고리즘은 단순합니다. 현재 설정으로 과제를 실행해 판정 점수(J)를 얻고, 다른 설정 조합을 시도하고, 점수가 오르면 채택합니다. 오프라인 PoC에서 J는 0.318에서 0.996까지 상승했습니다. 이후 매번 눈앞의 최선만 고르던 탐색을 더 긴 관점에서 탐색하는 방식(후보 여럿 유지, 최근 시도 회피, 비용 함께 고려)으로 올려, 같은 품질 최적점(0.9956)을 더 적은 단계(5→4)와 불필요한 롤백 0으로 도달하게 했습니다.

지표만 쫓다 본질이 망가지는 것(굿하트의 법칙)에 대한 방어는 처음부터 루프의 핵심 구성 요소였습니다.

> 개선은 연습 문제(개발셋)에서 하되, 실제 적용 여부는 별도로 분리한 검증 문제셋(held-out)으로 판단합니다. 과최적화가 감지되면 자동 롤백합니다. 검증 문제셋 기준 실제 점수는 0.5 → 0.96.

개선 알고리즘이 자신의 코드까지 수정하는 방식은 검토 후 금지로 결정했습니다 — 진화의 대상은 설정이지 개선 알고리즘이 아닙니다.

## 검증 과정에서 얻은 교훈: 단위테스트가 못 보는 곳

이 루프를 실제 LLM(자체 호스팅 Qwen)으로 돌리자, 단위테스트 225개가 잡지 못한 잠복 결함이 곧바로 발견됐습니다. 비어 있는 보조 설정값이 숫자 변환 경로로 들어가 오류(`int(None)`)를 일으켰고, 그 오류가 눈에 띄지 않게 폴백(기본 동작)으로 대체돼 **LLM 심판이 매 호출 고정 점수로 바뀌어** 있었습니다. 4편에서 말한 "예외 시 통과" 문제의 실증이자, 운영 QA의 판정 불안정에 대해 원인을 설명해 주는 사례이기도 했습니다.

정리하면 — 모킹(가짜 응답) 기반 테스트는 "오류가 눈에 띄지 않게 폴백으로 대체되는" 부류를 구조적으로 못 잡습니다. 실제 모델을 연결한 전체 파이프라인 실행이 검증의 최상층에 반드시 있어야 하고, 설정을 스스로 개선하는 이 루프는 그 실행을 지속적으로 실행하게 되는 효과가 있습니다.

## 릴리즈 단위 개선에서 실행 중 자동 조정으로

설정을 스스로 개선하는 이 루프가 릴리즈와 릴리즈 사이의 진화라면, self-govern은 한 번의 실행 안에서 이뤄지는 조정입니다. 실제 운영에서는: 재시도 1회차에 검색 폭 4→8, 2회차에 8→12, 답변의 무작위성(temperature) 0.7→0.5→0.3 — **실패 신호를 설정 조정 신호로 재해석**하도록 설계했습니다(이 기능을 끈 대조군은 4 고정이라 비교 실험이 성립합니다). 판정도 0/1의 양극단에서 0.70~0.98의 점진 채점으로 바꿔 조정에 활용할 수 있는 정보의 정밀도를 높였고, 실행에서 얻은 교훈을 다음 실행으로 이월하는 경로(정제기억 61건·교훈 69건 이월 기록)와 대화·워크플로우 경계를 넘는 사용자 기억 회상까지, "실행 간 학습 루프"의 기본 구조가 이 시기에 완성됐습니다.

## 정리하며

자가개선은 마법이 아니라 구조입니다. 점수를 수집하고, 설정을 바꾸고, 검증 문제셋으로 확인한 뒤, 문제가 있으면 롤백하는 피드백 루프가 핵심입니다. 그리고 그 구조의 신뢰는 실제 모델을 연결한 검증이 만듭니다. 마지막 편은 이 실행기가 아직 풀지 못한 설계 과제입니다 — 에이전트는 자기 출력이 어디로 흘러가는지 알아야 합니다.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들입니다.
- 자가개선 루프에 별도 검증 문제셋(held-out)과 롤백을 처음부터 넣기를 권장합니다. 개선용 지표와 채택용 지표의 분리가 우리가 찾은 "지표 맹신 방지"의 최소 단위였습니다.
- 우리는 진화의 대상을 설정으로 한정했습니다. 개선 알고리즘이 자기 코드를 고치는 구조는 검증 불가능성을 함께 가져온다고 판단했기 때문입니다.
- 모킹 테스트만으로는 "오류가 눈에 띄지 않게 폴백으로 대체되는" 결함이 보이지 않았습니다. 실제 모델을 연결한 실행을 검증 최상층에 두고서야 잡혔습니다.

---

> **이전 편** → [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> **다음 편** → [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
