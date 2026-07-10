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
draft: true
---

**한 줄 요약** — 컴파일의 어려움은 코드 변환이 아니라 상태의 동결에 있었어요. 플랫폼 프로세스 안에만 있던 암묵적인 상태를 산출물이 스스로 읽을 수 있는 설정 파일로 바꾸고 나서야, 플랫폼 없이 환경변수만으로 동작하는 산출물이 완성됐어요.

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
> 5. 검증 — [배포의 신뢰성은 검증의 층수에서 나옵니다](/blog/harness-journey-5-release-reliability)
> 6. 실험 — [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. 설계 원칙 — [설정은 사람이 찾는 것이 아니라 시스템이 찾아야 합니다](/blog/harness-journey-7-self-forging)
> 8. 설계 원칙 — [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. 설계 원칙 · 전망 — [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

지난 편에서 우리는 엔진과 플랫폼 사이에 한 방향 의존이라는 경계를 세웠어요. 오늘은 그 경계를 한 단계 더 밀고 나간 이야기예요. 플랫폼이라는 프로세스 자체가 없는 곳에서도 동작해야 하는 컴파일 기능을 완성하며 겪은 일들을 소개해 드릴게요.

하네스의 승부수는 컴파일이에요. 캔버스에서 만든 워크플로우를 `compile_workflow()`로 파이썬 설치 파일(wheel)이나 npm 패키지로 변환하면, 플랫폼 없이 **환경변수만 주입하면 동작하는** 독립 산출물이 돼요. 이 산출물은 AI 도구 연결 공개 표준(MCP) 서버로 기동해서 Claude 같은 외부 에이전트의 도구가 되고요. 그런데 이 기능, 처음부터 순탄하게 완성된 건 아니었어요.

## 연결은 되는데 실행이 안 되는 산출물

첫 검증에서 이상한 상태를 만났어요. 컴파일한 wheel을 외부 도구에 연결하면 연결까지는 잘 되는데, 정작 실행하면 모델이 도구를 하나도 부르지 못하고 텍스트만 뱉는 거예요. 왜 그랬을까요?

산출물을 열어 보니 답이 있었어요. 도구 목록 파일이 `FROZEN_TOOL_DEFINITIONS = []`, 그러니까 **빈 배열**이었어요. 동결(freeze) 빌더에 "워크플로우를 도구로 변환하는" 처리 자체가 없어서, 도구가 하나도 담기지 않은 채 산출물이 만들어지고 있었던 거죠. 덤으로 잠재 결함도 하나 발견했어요. 직렬화 코드가 도구 정의를 처리하지 못해 죽는 버그가 숨어 있었는데, 여태 도구 목록이 늘 비어 있던 덕에 한 번도 터지지 않았던 거예요.

그래서 유형별 동결 규칙을 채워 나갔어요. 서브워크플로우는 설정 전체를 산출물에 포함하고 호출 시 그 안에서 중첩 실행하되, 무한 반복을 막는 깊이 제한(최대 4단)을 뒀어요. 캔버스 워크플로우는 하네스 설정으로 변환하거나 그래프 해석기로 실행하게 했고요. Python과 Node 두 실행 방식이 같은 동결 형식을 읽고 같은 결과를 내도록 맞추는 작업까지, 이 확장은 하루 만에 이뤄졌어요. 그날 하루에만 v1.16.0(워크플로우를 도구로 동결)부터 v1.16.3(캔버스 그래프 해석기)까지 네 개 버전이 연달아 릴리즈됐죠.

## 고치고 나니, 같은 패턴이 계속 나왔어요

이걸로 끝난 줄 알았어요. 그런데 이후 몇 주간의 결함들이 전부 같은 얼굴을 하고 나타났어요. **클러스터 안에서는 정상인데, 산출물에서는 조용히 기능이 빠지는** 부류요.

대표 사례가 judge(답변을 채점하는 판정기)의 평가 기준이에요. 평가 기준의 정의가 플랫폼 프로세스의 메모리(전역 레지스트리)에만 있었거든요. 별도 프로세스로 뜨는 산출물에는 그 메모리가 없으니, Python 산출물은 범용 기본 기준으로, Node 산출물은 "유효한 기준 없음"으로 평가가 조용히 대체됐어요. 에러 한 줄 없이요. 수정은 평가 기준을 **설정 파일에 직렬화해서** 산출물이 스스로 복원하게 하는 것이었고, v1.17.1(평가 기준의 산출물 직렬화)로 나갔어요.

문서 검색(RAG)은 더 심했어요. 검색 서비스 연결, 검색 개수 기본값, 결과 미리보기 길이, 이 세 곳이 동시에 산출물 경로에서 비활성 상태였어요. 검색 개수는 0으로 굳어 조회가 항상 빈 결과를 반환했고, 미리보기는 0자로 잘려 도구 결과가 전부 빈 문자열이었죠. 조사 끝에 내린 결론은 뼈아팠어요. **RAG는 컴파일 산출물에서 단 한 번도 동작한 적이 없었던 거예요.** 세 곳 모두 동결 시점에 값을 확정해 포함하도록 바꾸고, v1.18.6(산출물 RAG 복원)으로 릴리즈했어요.

일반화하면 이래요.

> 플랫폼 프로세스 안에서만 성립하는 암묵적 상태(메모리 속 등록 정보, 서비스 연결, 실행 중 기본값)는 컴파일과 양립할 수 없어요. 산출물이 읽을 수 있는 건 파일로 담긴 설정뿐이니까요. "동결 시점에 모든 암묵적 상태를 명시적 설정으로 바꾼다"가 컴파일러의 첫 번째 계약이어야 해요.

## 검증도 산출물 기준으로 바꿨어요

이 부류의 결함이 특히 까다로운 이유는 조용히 실패한다는 점이에요. 그런데 플랫폼 안에서 도는 테스트(in-process 테스트)로는 왜 안 잡혔을까요? 테스트가 도는 프로세스에는 그 암묵적 상태가 전부 살아 있기 때문이에요. 결함이 성립하는 조건 자체가 테스트 환경에는 없는 거죠.

그래서 검증의 기준을 산출물 쪽으로 옮겼어요. 실제 Claude 클라이언트에 산출물을 MCP 서버로 등록하고, 도구가 실제로 호출되고, 실데이터를 인용한 답변이 나오는 것까지 전 구간을 완주시키는 걸 완성 조건으로 삼았어요. 실제로 마지막 검증에서는 Claude Code에 등록한 산출물의 검색 도구가 실데이터 3건을 인용해 답하는 것까지 확인했고요. 표준 인증(OAuth)과 자동 탐색 경로까지 포함해 검증 항목 여섯 개를 통과시킨 뒤에야 기능을 닫았어요.

## 정리하며

컴파일 기능의 설계 원칙은 한 줄로 요약돼요. **산출물의 실행 경로에서 암묵 상태를 없앨 것.** 그리고 그 검증은 산출물 프로세스에서 해야 한다는 것. 클러스터 안 테스트로는 이 부류의 결함이 구조적으로 잡히지 않는다는 걸, 우리는 몇 주에 걸쳐 배웠어요.

다음 편은 실행 품질 쪽에서 같은 질문을 던져요. 에이전트가 반드시 지켜야 할 규칙을 프롬프트에 적으면 왜 지켜지지 않는지, 그렇다면 그 규칙은 어디에 두어야 하는지요.

산출물이 스스로 설명하지 못하는 상태는 남기지 않는다. 이게 우리가 컴파일에서 얻은 믿음이에요.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들이에요.
- 산출물이 만든 환경 밖에서도 살아남으려면, 환경에 암묵적으로 기대던 것들을 명시적인 것으로 바꿔 줘야 하는 것 같아요. 이건 컴파일만이 아니라 모든 "내보내기"(배포, 이관, 오픈소스화)에 통하는 본질 같아요.
- 테스트는 결함이 성립하는 조건에서 돌아야 의미가 있는 것 같아요. 만든 환경 안에서만 하는 검증은, 그 환경 밖에서 벌어질 실패를 구조적으로 보지 못하더라고요.

`#하네스` `#MCP` `#설정동결`

---

> **이전 편** → [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> **다음 편** → [규칙은 프롬프트가 아니라 구조가 지켜야 합니다](/blog/harness-journey-4-canvas-node-judge)
