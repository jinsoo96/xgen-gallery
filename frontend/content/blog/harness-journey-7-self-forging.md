---
title: "설정은 사람이 찾는 것이 아니라 시스템이 찾아야 합니다"
description: "선언형 설정은 시스템이 고쳐 쓸 수 있습니다. 점수 → 설정 변경 → 검증 문제셋 → 롤백으로 구성한 자가개선 루프와, 그것을 신뢰하게 만드는 검증 구조."
date: "2026-06-13"
author: Jinsoo Kim
editor: Editorial SA
kicker: "설계 원칙"
category: Tech Note
tags:
  - 하네스
  - 자가개선
  - 설정자동개선
series: 하네스 개발기
part: 7/9
draft: true
---

**한 줄 요약** — 판정 점수를 바탕으로 설정을 자동 조정하고, 별도의 검증 문제셋(held-out)과 롤백으로 안정성을 확보하는 자가개선 루프를 만들었습니다. PoC에서는 판정 점수가 0.318에서 0.996까지 향상됐고, 운영 환경에서는 검색 범위를 4→8→12로 자동 조정하는 방식으로 검증했습니다.

에이전트를 운영하다 보면 같은 질문을 반복하게 됩니다. Temperature를 조금 낮춰볼까? 검색 개수를 늘려볼까? 재시도 횟수를 바꿔볼까?

대부분의 AI 운영은 이런 방식으로 이루어집니다. 사람이 로그를 보고, 설정을 수정하고, 다시 테스트하는 과정을 반복합니다. 처음에는 우리도 그랬습니다.

하지만 시간이 지날수록 다른 질문을 하게 됐습니다. 설정을 사람이 계속 찾아야 하는 걸까요? 아니면 시스템이 스스로 더 좋은 설정을 찾게 만들 수는 없을까요? 하네스의 자가개선(Self-Improvement) 루프는 이 질문에서 시작했습니다.

<figure class="blog-illust">
<svg viewBox="0 0 1000 430" width="1000" height="430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="설정은 사람이 찾는 것이 아니라 시스템이 찾아야 합니다">
  <defs>
    <linearGradient id="bg7" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
    <marker id="a7" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2563eb"/></marker>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="430" fill="url(#bg7)"/>
  <circle cx="930" cy="40" r="150" fill="#2563eb" opacity="0.05"/>
  <text x="48" y="60" font-size="24" font-weight="800" fill="#2563eb">하네스 개발기 · 7/9</text>
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">설정은 시스템이 찾는다</text>
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
> 1. 설계 원칙 — [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. 설계 원칙 — [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. 설계 원칙 — [프로세스의 경계를 넘으려면, 상태도 함께 넘어가야 합니다](/blog/harness-journey-3-compile-wheel-mcp)
> 4. 설계 원칙 — [규칙은 프롬프트가 아니라 구조가 지켜야 합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. 검증 — [배포의 신뢰성은 검증 단계에서 만들어집니다](/blog/harness-journey-5-release-reliability)
> 6. 실험 — [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. 설계 원칙 — **설정은 사람이 찾는 것이 아니라 시스템이 찾아야 합니다** *(지금 읽는 글)*
> 8. 설계 원칙 — [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. 설계 원칙 · 전망 — [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

## 설정은 코드보다 다루기 쉬운 대상이었습니다

앞선 글에서 이야기했듯이 실행 품질은 모델보다 설정의 영향을 크게 받았습니다. 그렇다면 다음 단계는 자연스럽습니다. 좋은 설정을 사람이 계속 찾아주는 대신, 실행 결과를 바탕으로 시스템이 직접 조정하면 됩니다.

이 접근이 가능했던 이유는 하네스의 설정이 코드가 아니라 선언형 값으로 정의되어 있었기 때문입니다. 설정이 값이라면 읽을 수 있고, 읽을 수 있다면 비교할 수 있으며, 비교할 수 있다면 더 좋은 값으로 바꿀 수도 있습니다.

## 루프는 생각보다 단순합니다

자가개선 알고리즘 자체는 복잡하지 않습니다. 현재 설정으로 실행합니다. Judge가 점수를 계산합니다. 다른 설정을 시도합니다. 더 좋은 결과가 나오면 새로운 설정을 채택합니다. 중요한 것은 AI가 스스로 학습하는 것이 아니라, 피드백을 기반으로 설정을 선택하는 구조입니다.

실제 PoC에서는 Judge 점수가 0.318에서 0.996까지 향상됐습니다. 하지만 더 흥미로웠던 것은 점수 자체가 아니었습니다. 좋은 설정을 찾는 과정이 점점 짧아졌다는 점입니다. 후보를 동시에 유지하고, 최근에 실패한 조합은 다시 시도하지 않으며, 비용까지 함께 고려하도록 개선하자 동일한 품질에 더 적은 탐색으로 도달할 수 있었습니다.

## 점수만 따라가면 오히려 성능이 나빠질 수도 있습니다

하지만 여기에는 함정도 있었습니다. 점수만 높이면 되는 문제였다면 이야기는 훨씬 쉬웠을 것입니다. 실제로는 그렇지 않았습니다. 개발용 데이터에서는 성능이 좋아졌지만, 새로운 문제에서는 오히려 품질이 떨어지는 경우가 발생했습니다. 전형적인 과적합이었습니다.

그래서 자가개선 루프에 처음부터 하나의 원칙을 넣었습니다. 개선과 검증은 같은 문제를 사용하지 않는다. 설정은 개발셋에서 탐색하지만, 실제 채택 여부는 별도의 Held-out 데이터셋에서만 판단했습니다. 그리고 성능이 떨어지면 자동으로 이전 설정으로 되돌렸습니다.

자가개선에서 가장 중요한 기능은 개선이 아니라 롤백이었습니다.

## 시스템은 자기 자신까지 바꾸게 해서는 안 됩니다

자가개선을 설계하면서 한 가지는 의도적으로 하지 않았습니다. 개선 알고리즘이 자기 코드를 수정하는 기능입니다.

처음에는 가능성도 검토했습니다. 하지만 곧 제외했습니다. 코드까지 바뀌기 시작하면 어떤 변화가 왜 발생했는지 더 이상 검증할 수 없기 때문입니다.

그래서 하네스는 진화의 대상을 명확하게 제한했습니다. 코드는 그대로 두고, 설정만 바꿉니다. 진화할 수 있는 범위를 제한하는 것이 오히려 시스템을 더 신뢰할 수 있게 만들었습니다.

## 실제 모델은 테스트가 보지 못한 문제를 찾아냈습니다

이 루프를 실제 LLM으로 실행하면서 예상하지 못했던 결과도 얻었습니다. 225개의 단위 테스트가 모두 통과했던 코드에서 실제 운영 환경에서는 새로운 문제가 발견됐습니다.

비어 있는 설정값 하나가 숫자 변환 과정에서 오류를 만들었고, 그 오류는 Fail Open 경로를 통해 조용히 무시되고 있었습니다. 결과적으로 Judge는 항상 같은 점수만 반환하고 있었습니다. 테스트는 모두 성공했습니다. 하지만 시스템은 제대로 평가하지 못하고 있었습니다.

이 경험은 하나의 사실을 다시 확인해 주었습니다. 모킹(Mock) 테스트만으로는 운영 환경을 재현할 수 없습니다.

## 개선 루프는 운영에서도 계속됩니다

자가개선은 릴리즈 사이에서만 동작하지 않습니다. 실행 중에도 같은 원칙을 적용했습니다. 검색 결과가 부족하면 검색 범위를 넓히고, 반복 실패가 이어지면 Temperature를 낮추고, Judge의 점수도 0과 1이 아니라 연속적인 점수로 바꿔 다음 조정의 근거로 사용했습니다.

한 번의 실행이 끝나면 교훈은 메모리에 남고, 다음 실행은 그 교훈을 이어받아 시작합니다. 설정은 더 이상 고정값이 아니라, 실행을 통해 계속 다듬어지는 대상이 되었습니다.

## 마치며

이번 글에서 만들고자 했던 것은 스스로 학습하는 AI가 아니었습니다. 오히려 스스로 더 나은 설정을 찾는 실행기였습니다. 좋은 설정은 우연히 발견되는 것이 아니라, 실행 결과를 수집하고, 평가하고, 검증하고, 필요하면 되돌리는 피드백 루프 안에서 만들어집니다.

그래서 자가개선은 새로운 알고리즘이 아니라 좋은 피드백 구조에 더 가까웠습니다.

다음 글에서는 이 실행기가 아직 해결하지 못한 마지막 질문을 다룹니다. 에이전트는 자신의 답변이 이후 어떤 시스템에서 어떻게 사용되는지까지 이해해야 할까요?

**같은 고민을 하고 있다면** — 자가개선 기능을 도입한다면 개선과 검증을 반드시 분리하는 것을 권합니다.
- 설정은 개발셋에서 탐색하되, 실제 채택 여부는 별도의 Held-out 데이터셋으로 판단해야 합니다. 롤백 역시 선택이 아니라 필수 기능입니다.
- 진화의 대상을 명확하게 제한하는 것이 중요합니다. 하네스는 코드는 고정한 채 설정만 변경하도록 설계했습니다. 이렇게 해야 변화의 원인을 추적할 수 있고, 시스템 전체의 신뢰성을 유지할 수 있었습니다.
- 실제 LLM을 포함한 End-to-End 실행을 검증의 최상위 단계에 두는 것을 권합니다. 모킹 테스트는 구현의 정확성을 확인하는 데는 충분하지만, 운영 환경에서만 드러나는 Fail Open이나 설정 오류까지 발견하기는 어렵습니다.

---

> **이전 편** → [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> **다음 편** → [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
