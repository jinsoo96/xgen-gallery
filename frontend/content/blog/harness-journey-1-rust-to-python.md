---
title: "검증 루프를 실행 상태로 나눈 이유"
description: "생성, 검증, 도구 실행, 재시도를 하나의 반복문에 숨기지 않고 명시적인 상태와 전이로 설계한 과정을 다룹니다."
date: "2026-07-15"
author: "김진수"
authorGithub: "jinsoo96"
category: "Tech Note"
tags: ["하네스", "에이전트 실행", "상태 머신"]
draft: true
---

하네스 개발의 출발점은 에이전트에 기능을 더 넣는 일이 아니었습니다. 워크플로우 자동 생성 모델이 존재하지 않는 노드나 연결할 수 없는 포트를 만들어도, 프롬프트만으로는 같은 오류를 막기 어려웠습니다. 4월 5일에는 생성 결과를 노드 레지스트리와 대조하는 일곱 가지 규칙을 만들고, 실패 사유를 다음 생성에 돌려보내 최대 세 번 교정했습니다. 생성은 모델이 맡더라도 통과 여부는 코드가 정하도록 한 것입니다.

비슷한 문제가 L사 QA에서도 나타났습니다. 네 단계의 QA 실행 기록을 65개 판정 규칙으로 재생하면 결과가 잘못됐다는 사실은 찾을 수 있었지만, 운영 실행 중에 같은 규칙을 일관되게 적용하기는 어려웠습니다. 기존 실행기에 판정 미들웨어를 끼우는 방식도 검토했지만, 제품의 노드 실행 코드와 도메인 규칙이 한 계층에 결합돼 변경 범위가 너무 커졌습니다. 생성 모델 바깥에서 검증과 재시도를 소유하는 별도 실행 계층이 필요했습니다.

정상 경로만 보면 별도 실행기가 과해 보일 수 있습니다. 생성 결과가 검증을 통과하면 그대로 끝내면 되기 때문입니다. 하지만 검증이 실패하거나, 모델이 답 대신 도구를 요청하거나, 실행 한도에 도달하면 같은 ‘한 번 더 실행’도 의미가 달라집니다. 다음 회차에 넘길 값과 종료 조건을 워크플로우의 간선과 조건문에 계속 추가하면 어느 사건이 현재 실행을 움직였는지 설명하기 어려워집니다.

그래서 4월 10일 독립 실행기를 만들며 가장 먼저 정한 것은 모델 호출 방식이 아니라 **상태와 전이**였습니다. 첫 구현은 Rust였고 4월 14일 Python으로 다시 작성했습니다. 월말에는 입력부터 결과 정리까지 열 단계의 실행 흐름으로 정착했습니다. 언어는 바뀌었지만, 모델이 아니라 실행기가 검증과 종료를 결정한다는 출발점은 유지했습니다.

## 같은 반복이어도 다음 회차의 목적은 달랐습니다

도구를 호출한 뒤 이어 가는 것과 검증에 실패해 답을 다시 만드는 것은 같은 반복이 아닙니다. 도구 회차에서는 기존 대화에 관측 결과를 추가하고 작업을 계속해야 합니다. 품질 재시도에서는 완성된 후보를 반려한 이유를 넘기고 새 후보를 만들어야 합니다. 종료는 더 다릅니다. 답이 완성돼 끝날 수도 있고, 정책이나 실행 한도 때문에 중단될 수도 있습니다.

이를 단순한 `true`와 `false`로 표현하면 한 카운터가 서로 다른 책임을 떠안게 됩니다. 도구를 세 번 쓴 실행과 품질 검증을 세 번 실패한 실행이 모두 ‘재시도 3회’로 남는 식입니다. 호출 수는 같아도 비용을 쓴 이유와 다음 입력은 전혀 다릅니다.

하네스는 다음 행동을 세 가지 의미로 나눴습니다.

```text
continue → 새 관측을 더해 현재 작업을 이어 간다
retry    → 검증 피드백을 반영해 새 답 후보를 만든다
complete → 완료 또는 중단 사유를 확정하고 결과를 정리한다
```

이 구분을 두면 각 전이가 무엇을 소비하고 무엇을 남겨야 하는지도 정할 수 있습니다. `continue`에는 도구 호출과 관측 결과가 필요하고, `retry`에는 반려된 후보와 검증 피드백이 필요합니다. `complete`에는 최종 출력뿐 아니라 종료 이유가 함께 있어야 합니다. ‘몇 번 돌았는가’보다 ‘왜 어느 상태로 이동했는가’가 실행 기록의 기준이 됐습니다.

<figure style="margin:2rem 0;">
<svg viewBox="0 0 640 240" style="width:100%;height:auto;display:block" role="img" aria-label="다음 행동을 continue·retry·complete 세 전이로 나눈 구조">
<defs><marker id="hj1a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="#9fb2d6"/></marker></defs>
<rect x="26" y="90" width="150" height="60" rx="14" fill="#16224a"/>
<text x="101" y="116" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="700">다음 행동</text>
<text x="101" y="134" text-anchor="middle" fill="#c7d3ee" font-family="sans-serif" font-size="12">결정</text>
<path d="M176 120 C 270 120 270 48 356 48" fill="none" stroke="#9fb2d6" stroke-width="2" marker-end="url(#hj1a)"/>
<path d="M176 120 L 356 120" fill="none" stroke="#9fb2d6" stroke-width="2" marker-end="url(#hj1a)"/>
<path d="M176 120 C 270 120 270 192 356 192" fill="none" stroke="#9fb2d6" stroke-width="2" marker-end="url(#hj1a)"/>
<text x="266" y="64" text-anchor="middle" fill="#2461d8" font-family="monospace" font-size="12" font-weight="700">continue</text>
<text x="266" y="112" text-anchor="middle" fill="#c2711c" font-family="monospace" font-size="12" font-weight="700">retry</text>
<text x="266" y="210" text-anchor="middle" fill="#1f8f52" font-family="monospace" font-size="12" font-weight="700">complete</text>
<rect x="360" y="24" width="256" height="48" rx="10" fill="#eef3ff" stroke="#2f7bff" stroke-width="1.5"/>
<text x="376" y="53" fill="#16224a" font-family="sans-serif" font-size="13">관측을 더해 현재 작업을 이어 간다</text>
<rect x="360" y="96" width="256" height="48" rx="10" fill="#fff4ec" stroke="#ff9a52" stroke-width="1.5"/>
<text x="376" y="125" fill="#16224a" font-family="sans-serif" font-size="13">피드백을 반영해 새 답 후보를 만든다</text>
<rect x="360" y="168" width="256" height="48" rx="10" fill="#ecf8f1" stroke="#1f9d57" stroke-width="1.5"/>
<text x="376" y="197" fill="#16224a" font-family="sans-serif" font-size="13">종료 사유를 확정하고 결과를 정리한다</text>
</svg>
<figcaption style="margin-top:.6rem;font-size:13px;color:#7a89a8;text-align:center;">하나의 반복을 continue·retry·complete 세 전이로 나눠, 각 경로가 소비·기록하는 값을 분리했다</figcaption>
</figure>

## 상태를 한곳에 모으자 단계의 책임이 보였습니다

전이를 나눠도 메시지, 도구 결과, 검증 점수, 비용이 여러 함수의 지역 변수에 흩어져 있으면 실행을 복원하기 어렵습니다. 그래서 실행 중 필요한 값을 `PipelineState`에 모았습니다. 대화 이력, 사용할 수 있는 도구, 대기 중인 호출, 답 후보, 검증 결과, 반복 횟수, 토큰과 비용이 하나의 실행 ID를 따라 움직입니다.

공유 상태는 편리하지만 아무 단계나 모든 필드를 바꿀 수 있게 두면 곧 전역 변수와 다를 바가 없어집니다. 각 단계가 소유한 입력과 출력을 좁혔습니다. 모델 호출은 응답을 기록하지만 종료를 결정하지 않습니다. 도구 단계는 관측 결과를 추가하지만 품질 판단을 바꾸지 않습니다. 결정 단계는 현재 후보와 도구 상태, 정책 결과, 실행 한도를 함께 보고 다음 전이를 선택합니다.

이 구분을 기준으로 실행은 준비, 반복, 정리의 세 구간으로 나뉩니다.

```text
입력 준비
  → [컨텍스트 구성 → 모델 호출 → 정책 검사 → 도구 실행 → 다음 행동 결정]
  → 결과 정리
```

사용자 입력을 정규화하고 도구 목록을 준비하는 일은 처음 한 번이면 됩니다. 모델 호출과 정책 검사, 도구 실행, 다음 행동 결정만 필요한 만큼 반복합니다. 실행이 끝나면 출력과 사용량, 종료 이유를 한 번 정리합니다. 루프 안에 모든 일을 넣던 구조보다 반복되는 것과 한 번만 일어나는 것이 분명해졌습니다.

<figure style="margin:2rem 0;">
<svg viewBox="0 0 680 250" style="width:100%;height:auto;display:block" role="img" aria-label="준비·반복·정리 세 구간과 이를 관통하는 PipelineState">
<defs><marker id="hj1b" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="#9fb2d6"/></marker></defs>
<rect x="30" y="26" width="184" height="118" rx="14" fill="#f5f8ff" stroke="#dbe4f5" stroke-width="1.5"/>
<rect x="248" y="26" width="184" height="118" rx="14" fill="#eef3ff" stroke="#2f7bff" stroke-width="1.5"/>
<rect x="466" y="26" width="184" height="118" rx="14" fill="#f5f8ff" stroke="#dbe4f5" stroke-width="1.5"/>
<path d="M214 85 L 248 85" fill="none" stroke="#9fb2d6" stroke-width="2" marker-end="url(#hj1b)"/>
<path d="M432 85 L 466 85" fill="none" stroke="#9fb2d6" stroke-width="2" marker-end="url(#hj1b)"/>
<text x="122" y="58" text-anchor="middle" fill="#16224a" font-family="sans-serif" font-size="15" font-weight="700">준비</text>
<text x="122" y="86" text-anchor="middle" fill="#4a5878" font-family="sans-serif" font-size="12">입력 정규화</text>
<text x="122" y="106" text-anchor="middle" fill="#4a5878" font-family="sans-serif" font-size="12">도구 목록 구성</text>
<text x="122" y="127" text-anchor="middle" fill="#7a89a8" font-family="sans-serif" font-size="11">처음 한 번</text>
<text x="340" y="58" text-anchor="middle" fill="#2461d8" font-family="sans-serif" font-size="15" font-weight="700">반복 ↻</text>
<text x="340" y="86" text-anchor="middle" fill="#284574" font-family="sans-serif" font-size="12">모델 호출 · 정책 검사</text>
<text x="340" y="106" text-anchor="middle" fill="#284574" font-family="sans-serif" font-size="12">도구 실행 · 다음 결정</text>
<text x="340" y="127" text-anchor="middle" fill="#2461d8" font-family="sans-serif" font-size="11">필요한 만큼</text>
<text x="558" y="58" text-anchor="middle" fill="#16224a" font-family="sans-serif" font-size="15" font-weight="700">정리</text>
<text x="558" y="86" text-anchor="middle" fill="#4a5878" font-family="sans-serif" font-size="12">출력 · 사용량</text>
<text x="558" y="106" text-anchor="middle" fill="#4a5878" font-family="sans-serif" font-size="12">종료 이유</text>
<text x="558" y="127" text-anchor="middle" fill="#7a89a8" font-family="sans-serif" font-size="11">마지막 한 번</text>
<path d="M122 144 L 122 174" fill="none" stroke="#cdd9ef" stroke-width="1.5" stroke-dasharray="3 3"/>
<path d="M340 144 L 340 174" fill="none" stroke="#9fb2d6" stroke-width="1.5" stroke-dasharray="3 3"/>
<path d="M558 144 L 558 174" fill="none" stroke="#cdd9ef" stroke-width="1.5" stroke-dasharray="3 3"/>
<rect x="30" y="174" width="620" height="52" rx="12" fill="#16224a"/>
<text x="50" y="199" fill="#ffffff" font-family="monospace" font-size="13" font-weight="700">PipelineState</text>
<text x="50" y="216" fill="#9fb2d6" font-family="sans-serif" font-size="11">하나의 실행 ID로 공유</text>
<g font-family="sans-serif" font-size="11">
<rect x="196" y="188" width="66" height="24" rx="12" fill="#2b3c66"/><text x="229" y="204" text-anchor="middle" fill="#cdd9ef">대화 이력</text>
<rect x="270" y="188" width="44" height="24" rx="12" fill="#2b3c66"/><text x="292" y="204" text-anchor="middle" fill="#cdd9ef">도구</text>
<rect x="322" y="188" width="60" height="24" rx="12" fill="#2b3c66"/><text x="352" y="204" text-anchor="middle" fill="#cdd9ef">답 후보</text>
<rect x="390" y="188" width="66" height="24" rx="12" fill="#2b3c66"/><text x="423" y="204" text-anchor="middle" fill="#cdd9ef">검증 결과</text>
<rect x="464" y="188" width="74" height="24" rx="12" fill="#2b3c66"/><text x="501" y="204" text-anchor="middle" fill="#cdd9ef">토큰·비용</text>
</g>
</svg>
<figcaption style="margin-top:.6rem;font-size:13px;color:#7a89a8;text-align:center;">준비와 정리는 한 번, 반복 구간만 필요한 만큼 — 실행에 필요한 값은 PipelineState 하나로 공유했다</figcaption>
</figure>

## 열 단계는 기능 목록이 아니라 변경 경계였습니다

초기 실행기를 만들 때는 단계 수 자체가 중요하지 않았습니다. 필요한 책임을 나누다 보니 전체 실행 조율, 입력, 이력, 프롬프트, 도구, 정책, 컨텍스트, 실행, 결정, 마무리로 경계가 구체화됐고, 4월 말 열 단계의 파이프라인으로 정리됐습니다.

단계의 순서는 실행 계약으로 두고, 단계 안의 처리 방식은 전략으로 바꿀 수 있게 했습니다. 예를 들어 컨텍스트 단계는 단순 절단이나 요약 전략으로 교체할 수 있지만, 그 구현이 결정 단계의 상태를 직접 바꾸지는 않습니다. 품질 판정 방식이 달라져도 도구 실행 단계의 호출 규격은 유지됩니다.

이 구조는 단계가 많아 보여도 변경 범위를 줄입니다. 새 공급자를 연결할 때 전체 루프를 다시 쓰지 않고 모델 호출 전략만 교체할 수 있습니다. 컨텍스트 예산을 다르게 쓰고 싶다면 상태 전이 자체를 건드리지 않아도 됩니다. 단계 진입과 종료, 도구 호출, 검증, 재시도는 이벤트로 남겨 실행 순서를 다시 그릴 수 있게 했습니다.

<figure style="margin:2rem 0;">
<svg viewBox="0 0 720 210" style="width:100%;height:auto;display:block" role="img" aria-label="열 단계 파이프라인 — 순서는 고정된 계약, 단계 내부는 교체 가능한 전략">
<defs><marker id="hj1c" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#c2cfe6"/></marker></defs>
<text x="40" y="30" fill="#2461d8" font-family="sans-serif" font-size="13" font-weight="700">순서 = 실행 계약 (고정)</text>
<g font-family="sans-serif" font-size="11">
<rect x="40" y="44" width="52" height="46" rx="9" fill="#ffffff" stroke="#c7d3ee" stroke-width="1.5"/><text x="66" y="71" text-anchor="middle" fill="#16224a">조율</text>
<rect x="105" y="44" width="52" height="46" rx="9" fill="#ffffff" stroke="#c7d3ee" stroke-width="1.5"/><text x="131" y="71" text-anchor="middle" fill="#16224a">입력</text>
<rect x="170" y="44" width="52" height="46" rx="9" fill="#ffffff" stroke="#c7d3ee" stroke-width="1.5"/><text x="196" y="71" text-anchor="middle" fill="#16224a">이력</text>
<rect x="235" y="44" width="52" height="46" rx="9" fill="#ffffff" stroke="#c7d3ee" stroke-width="1.5"/><text x="261" y="71" text-anchor="middle" fill="#16224a">프롬프트</text>
<rect x="300" y="44" width="52" height="46" rx="9" fill="#ffffff" stroke="#c7d3ee" stroke-width="1.5"/><text x="326" y="71" text-anchor="middle" fill="#16224a">도구</text>
<rect x="365" y="44" width="52" height="46" rx="9" fill="#ffffff" stroke="#c7d3ee" stroke-width="1.5"/><text x="391" y="71" text-anchor="middle" fill="#16224a">정책</text>
<rect x="430" y="44" width="52" height="46" rx="9" fill="#eef3ff" stroke="#2f7bff" stroke-width="1.8"/><text x="456" y="71" text-anchor="middle" fill="#2461d8" font-weight="700">컨텍스트</text>
<rect x="495" y="44" width="52" height="46" rx="9" fill="#ffffff" stroke="#c7d3ee" stroke-width="1.5"/><text x="521" y="71" text-anchor="middle" fill="#16224a">실행</text>
<rect x="560" y="44" width="52" height="46" rx="9" fill="#ffffff" stroke="#c7d3ee" stroke-width="1.5"/><text x="586" y="71" text-anchor="middle" fill="#16224a">결정</text>
<rect x="625" y="44" width="52" height="46" rx="9" fill="#ffffff" stroke="#c7d3ee" stroke-width="1.5"/><text x="651" y="71" text-anchor="middle" fill="#16224a">마무리</text>
</g>
<g stroke="#c2cfe6" stroke-width="1.8" fill="none">
<path d="M92 67 L103 67" marker-end="url(#hj1c)"/>
<path d="M157 67 L168 67" marker-end="url(#hj1c)"/>
<path d="M222 67 L233 67" marker-end="url(#hj1c)"/>
<path d="M287 67 L298 67" marker-end="url(#hj1c)"/>
<path d="M352 67 L363 67" marker-end="url(#hj1c)"/>
<path d="M417 67 L428 67" marker-end="url(#hj1c)"/>
<path d="M482 67 L493 67" marker-end="url(#hj1c)"/>
<path d="M547 67 L558 67" marker-end="url(#hj1c)"/>
<path d="M612 67 L623 67" marker-end="url(#hj1c)"/>
</g>
<path d="M456 90 L 456 132" fill="none" stroke="#2f7bff" stroke-width="1.5" stroke-dasharray="3 3"/>
<rect x="352" y="132" width="264" height="56" rx="10" fill="#eef3ff" stroke="#2f7bff" stroke-width="1.5"/>
<text x="368" y="158" fill="#2461d8" font-family="sans-serif" font-size="13" font-weight="700">단계 내부 = 전략 (교체 가능)</text>
<text x="368" y="177" fill="#4a5878" font-family="sans-serif" font-size="11.5">예) 컨텍스트 단계: 절단 ↔ 요약 전략 교체</text>
</svg>
<figcaption style="margin-top:.6rem;font-size:13px;color:#7a89a8;text-align:center;">순서는 계약으로 고정하고 단계 내부는 전략으로 교체 — 새 공급자·예산도 한 단계 교체로 끝난다</figcaption>
</figure>

## Rust에서 Python으로 옮겨도 계약은 남았습니다

첫 구현에서 Rust를 선택한 이유는 실행 코어의 상태와 자료형을 단단하게 잡기 좋았기 때문입니다. 그러나 실제 에이전트 실행 시간의 대부분은 모델과 외부 도구를 기다리는 데 쓰였습니다. 반면 공급자와 전략, 평가 방식을 바꾸는 코드는 빠르게 늘었습니다. 병목은 상태 전이의 계산 속도보다 변경을 연결하고 검증하는 시간이었습니다.

그래서 4월 14일 같은 상태 머신을 Python으로 다시 만들었습니다. 이때 처음부터 새로 설계하지 않고 단계 ID, 상태 필드, 이벤트 형식, 도구 인터페이스를 유지했습니다. 언어를 바꾼 뒤에도 같은 상황에서 같은 전이를 선택하는지를 비교할 수 있었습니다. Python 전환은 빠른 구현을 위한 선택이었지만, 그 선택이 가능했던 이유는 실행 의미가 언어 바깥의 계약으로 먼저 잡혀 있었기 때문입니다.

## 최종 답보다 실행 경로를 검증했습니다

LLM의 마지막 문장은 실행할 때마다 달라질 수 있습니다. 문자열을 그대로 맞추는 테스트만으로는 상태 머신을 확인할 수 없습니다. 대신 도구 요청이 있으면 관측 결과를 더한 뒤 계속하는지, 검증에 실패하면 피드백을 포함한 새 생성 경로로 가는지, 정책이 차단하면 추가 호출 없이 종료하는지를 확인했습니다.

결과에는 답만 남기지 않았습니다. 어떤 단계를 거쳤는지, 무엇을 관측했는지, 어떤 이유로 계속하거나 멈췄는지, 토큰과 비용이 어느 실행에 속하는지를 함께 연결했습니다. 답의 표현이 달라도 실행의 의미가 같다면 같은 계약을 지킨 것으로 볼 수 있습니다.

상태 머신은 단순한 검증 루프를 복잡하게 만드는 장치가 아니었습니다. 생성과 도구 사용, 판정, 종료가 이미 가진 차이를 코드에 드러내는 장치였습니다. 다음 편에서는 이 실행기가 특정 제품의 데이터베이스와 캔버스 객체를 알지 않아도 동작하도록 의존 방향을 나눈 과정을 살펴봅니다.


---
**다음 편 →** [엔진 코어와 제품 통합 계층을 분리한 이유](/blog/harness-journey-2-engine-separation)