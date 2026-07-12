---
title: "배포의 신뢰성은 검증의 층수에서 나옵니다 (5부)"
description: "소스와 산출물이 달라지는 원인은 생각보다 많습니다 — 추적 누락, 캐시 재사용, 동시 발행, 데이터 계약 부재. 각각을 구조적으로 막은 방법."
date: "2026-05-20"
author: Jinsoo Kim
editor: Editorial Plateer Lab
kicker: "검증"
category: Tech Note
tags:
  - 하네스
  - 배포파이프라인
  - 신뢰성
series: 하네스 개발기
part: 5/9
draft: false
---

**한 줄 요약** — 배포 사고의 범인은 대부분 코드 로직이 아니었어요. 소스와 산출물이 어긋나는 네 경로(추적 누락, 캐시와 경합, 데이터 계약 부재, 설정값 미검증)를 하나씩 실전에서 겪고, 각각의 검증층으로 막았어요.

코드는 수정했습니다. 테스트도 모두 통과했습니다. CI도 성공했습니다. 그런데 사용자 환경에서는 여전히 문제가 발생했습니다.

처음에는 원인을 이해하기 어려웠습니다. 같은 소스에서 빌드했는데, 왜 사용자가 설치한 패키지는 다른 동작을 하는 걸까요?

몇 번의 릴리즈를 반복하면서 한 가지 사실을 알게 됐습니다. 배포는 코드를 전달하는 과정이 아니라, 코드가 변하지 않았음을 증명하는 과정이라는 점입니다. 이번 글은 그 과정에서 발견한 문제와, 배포를 신뢰할 수 있도록 만들기 위해 추가한 검증 단계를 소개합니다.

<figure class="blog-illust">
<svg viewBox="0 0 1000 430" width="1000" height="430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="배포 신뢰성은 검증의 층수에서 만들어진다 — 다단계 검증">
  <defs>
    <linearGradient id="bg5" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="430" fill="url(#bg5)"/>
  <circle cx="930" cy="40" r="150" fill="#2563eb" opacity="0.05"/>
  <text x="48" y="60" font-size="24" font-weight="800" fill="#2563eb">하네스 개발기 · 5/9</text>
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">신뢰성은 검증의 층수에서</text>
  <rect x="120" y="168" width="600" height="50" rx="10" fill="#dbeafe" stroke="#bfdbfe"/><text x="150" y="201" font-size="23" font-weight="700" fill="#1e40af">1 · Fresh Clone 빌드</text>
  <rect x="180" y="228" width="480" height="50" rx="10" fill="#c7dbfe" stroke="#a9c7f8"/><text x="210" y="261" font-size="23" font-weight="700" fill="#1e40af">2 · 발행 전 원격 확인</text>
  <rect x="240" y="288" width="360" height="50" rx="10" fill="#9fc0fb" stroke="#7ea9f4"/><text x="270" y="321" font-size="23" font-weight="700" fill="#12327a">3 · 패키지 재검증</text>
  <rect x="300" y="348" width="240" height="50" rx="10" fill="#2563eb"/><text x="330" y="381" font-size="23" font-weight="800" fill="#ffffff">4 · 신뢰 배포</text>
  <g stroke="#e11d48" stroke-width="4" stroke-linecap="round">
    <line x1="742" y1="184" x2="764" y2="206"/><line x1="764" y1="184" x2="742" y2="206"/>
    <line x1="682" y1="244" x2="704" y2="266"/><line x1="704" y1="244" x2="682" y2="266"/>
    <line x1="622" y1="304" x2="644" y2="326"/><line x1="644" y1="304" x2="622" y2="326"/>
  </g>
  <text x="812" y="250" font-size="22" font-weight="700" fill="#e11d48">결함은 단계마다</text>
  <text x="812" y="280" font-size="22" font-weight="700" fill="#e11d48">걸러진다</text>
</svg>
</figure>

> **시리즈 · 하네스 개발기** — 전 9부
>
> 1. 설계 원칙 — [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. 설계 원칙 — [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. 설계 원칙 — [프로세스 경계를 넘는 자기완결성](/blog/harness-journey-3-compile-wheel-mcp)
> 4. 설계 원칙 — [규칙은 프롬프트가 아니라 격리 judge로 강제합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. 검증 — **배포의 신뢰성은 검증의 층수에서 나옵니다** *(지금 읽는 글)*
> 6. 실험 — [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. 설계 원칙 — [설정을 진화시키는 루프 — 자가단조](/blog/harness-journey-7-self-forging)
> 8. 설계 원칙 — [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. 설계 원칙 · 전망 — [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

개발 서버의 하네스가 전면 다운된 날이 있었어요. 실행도, 컴파일도, 패키지 발행도 전부 멈췄고, 산출물은 설치하면 import 한 줄부터 실패했어요. 범인이 뭐였을까요? 코드 로직의 버그가 아니라, 버전 관리 제외 목록(`.gitignore`)의 규칙 한 줄이었어요.

7주에 걸쳐 공개 패키지 저장소(PyPI/npm)에 30여 회 릴리즈하면서, 우리는 "내 소스"와 "사용자가 설치하는 산출물"이 달라질 수 있는 경로를 하나씩 실전에서 확인했어요. 오늘은 그 경로 네 가지와, 각각에 세운 방어층을 소개해 드릴게요.

## 경로 1: 저장소가 소스의 전부가 아니었어요

<figure class="blog-illust">
<svg viewBox="0 0 1000 340" width="1000" height="340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="로컬 빌드는 성공해도 새로 내려받은 저장소에서는 핵심 파일이 누락돼 패키지가 깨진 사례">
  <defs><linearGradient id="bg5b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient></defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="340" fill="url(#bg5b)"/>
  <text x="44" y="50" font-size="25" font-weight="800" fill="#0f172a">로컬 빌드 성공은 저장소를 증명하지 않아요</text>
  <rect x="44" y="82" width="430" height="176" rx="16" fill="#ffffff" stroke="#d7e0f0"/>
  <text x="68" y="118" font-size="17" font-weight="800" fill="#334155">로컬 디스크</text>
  <rect x="68" y="132" width="382" height="40" rx="10" fill="#f1f5f9" stroke="#e2e8f0"/><text x="84" y="157" font-size="14" fill="#334155">__init__.py 가 미추적으로 남아 있음</text>
  <text x="68" y="214" font-size="15" font-weight="700" fill="#64748b">빌드 성공 — 하지만 '내 컴퓨터'만 증명</text>
  <text x="500" y="176" text-anchor="middle" font-size="30" font-weight="800" fill="#2563eb">&#8594;</text>
  <rect x="526" y="82" width="430" height="176" rx="16" fill="#ffffff" stroke="#f2c9d3"/>
  <text x="550" y="118" font-size="17" font-weight="800" fill="#b4315a">Fresh Clone (저장소)</text>
  <rect x="550" y="132" width="382" height="40" rx="10" fill="#fdf1f4" stroke="#f6c6d0"/><text x="566" y="157" font-size="14" fill="#b4315a">.gitignore 규칙이 __init__.py까지 제외</text>
  <text x="550" y="214" font-size="15" font-weight="700" fill="#b4315a">핵심 파일 누락 → 패키지 깨짐 (4버전 연속)</text>
  <rect x="44" y="278" width="912" height="44" rx="12" fill="#eef4ff" stroke="#cddaf5"/><text x="500" y="306" text-anchor="middle" font-size="15" font-weight="700" fill="#2563eb">검증은 저장소를 새로 내려받은(fresh clone) 환경 기준으로</text>
</svg>
</figure>

가장 값비싼 사례부터요. 임시 파일을 거르려고 제외 목록에 넣은 규칙(`_*.py`)이, 파이썬 패키지의 필수 초기화 파일(`__init__.py`)까지 걸러 버렸어요. 새로 만든 패키지의 핵심 파일이 저장소에 한 번도 커밋되지 못하고 있었던 거예요.

그런데 왜 아무도 몰랐을까요? 로컬 빌드는 디스크에 남아 있던 미추적 파일 덕에 멀쩡했거든요. 저장소를 새로 내려받아(fresh-clone) 빌드하는 경로에서만 패키지 구조가 깨졌고, 그렇게 깨진 설치 파일(wheel)이 v1.18.1부터 v1.18.4까지 **네 개 버전 연속으로 배포**됐어요. 앞에서 말씀드린 전면 다운의 정체가 바로 이거예요.

같은 파일에 반전이 하나 더 있었어요. 같은 제외 패턴이 테스트 디렉토리도 막고 있었던 거예요. "테스트 0건"의 원인이 테스트를 안 쓴 게 아니라 커밋이 막혀 있던 거였죠. 추적을 풀자 테스트는 0개에서 151개로, 이후 237개까지 자랐어요.

방어층은 명확해요. **배포 검증은 반드시 fresh-clone 기준으로.** 로컬 빌드의 성공은 "디스크에 있는 파일"의 증명일 뿐, "저장소에 있는 파일"의 증명이 아니에요.

## 경로 2: 고쳐서 내보내도 끝이 아니었어요

핫픽스 v1.18.5(빠진 초기화 파일 복구)를 냈으니 끝일까요? 아니었어요. CI(자동 빌드 시스템)의 도커 레이어 캐시가 깨진 1.18.4 설치본을 그대로 재사용하고 있었거든요. 캐시 강제 갱신을 복구 절차에 포함하고 나서야 실제 복구가 완성됐어요.

경합도 두 번 겪었어요. 한 번은 두 작업 흐름이 같은 버전 번호(1.18.0)를 서로 다른 내용으로 발행했어요. 공개 패키지 저장소는 발행을 되돌릴 수 없어서, 다음 버전(1.18.1)으로 통합 재배포해야 했죠. 또 한 번은 다른 작업 흐름의 빌드가 1.18.3을 먼저 발행해서, 우리 수정이 빠진 wheel이 그대로 세상에 나갔어요. 발행된 wheel을 직접 내려받아 열어 보고 나서야 알았고, 1.18.4로 재발행했고요.

그래서 결론이 이래요. 검증의 마지막 층은 항상 **저장소에서 내려받은 실물**이어야 해요. 발행 전에는 원격 상태를 확인하고, 발행 후에는 실제로 내려받아 내용을 검사하는 것까지가 배포예요.

## 경로 3: 목록에는 뜨는데 호출만 실패했어요

<figure class="blog-illust">
<svg viewBox="0 0 1000 328" width="1000" height="328" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="동일 식별자로 두 행이 공존해 목록 조회와 호출 조회가 다른 데이터를 참조한 문제">
  <defs><linearGradient id="bg5c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient><marker id="m5c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#94a3b8"/></marker></defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="328" fill="url(#bg5c)"/>
  <text x="44" y="50" font-size="25" font-weight="800" fill="#0f172a">같은 ID가 둘이면, 목록과 호출이 어긋난다</text>
  <rect x="410" y="80" width="180" height="44" rx="12" fill="#ffffff" stroke="#d7e0f0"/><text x="500" y="108" text-anchor="middle" font-size="15" font-weight="700" fill="#334155">ID  wf-abc</text>
  <line x1="470" y1="124" x2="372" y2="162" stroke="#94a3b8" stroke-width="3" marker-end="url(#m5c)"/>
  <line x1="530" y1="124" x2="628" y2="162" stroke="#94a3b8" stroke-width="3" marker-end="url(#m5c)"/>
  <rect x="252" y="166" width="196" height="44" rx="10" fill="#eef4ff" stroke="#cddaf5"/><text x="350" y="194" text-anchor="middle" font-size="15" font-weight="700" fill="#2563eb">발행본</text>
  <rect x="552" y="166" width="196" height="44" rx="10" fill="#fdf1f4" stroke="#f6c6d0"/><text x="650" y="194" text-anchor="middle" font-size="15" font-weight="700" fill="#b4315a">오래된 초안</text>
  <text x="350" y="240" text-anchor="middle" font-size="14" fill="#2563eb">목록 조회 → 발행본 ✓</text>
  <text x="650" y="240" text-anchor="middle" font-size="14" fill="#b4315a">호출 조회 → 초안 → 404 ✗</text>
  <rect x="44" y="266" width="912" height="44" rx="12" fill="#ecf8f1" stroke="#bfe6cf"/><text x="500" y="294" text-anchor="middle" font-size="15" font-weight="700" fill="#1f9d57">해법 — 식별자에 UNIQUE 제약 · 조회/등록 지점 단일화</text>
</svg>
</figure>

산출물 쪽만의 문제도 아니었어요. 도구 목록에는 멀쩡히 뜨는데 호출만 간헐적으로 "찾을 수 없음(404)"이 나는 결함이 있었어요. 서버 안에서 데이터베이스를 직접 조회해 보고서야 원인이 확정됐는데, 워크플로우 ID 컬럼에 중복을 금지하는 제약(UNIQUE)이 없어서 같은 ID로 두 행(발행본과 오래된 초안)이 공존하고 있었어요. 목록 조회는 발행 조건으로 발행본을, 호출 조회는 "첫 행만"이라는 조건으로 오래된 초안을 집었던 거죠.

비슷한 부류가 하나 더 있었어요. 두 번이나 고쳐서 배포했는데 동작이 바뀌지 않던 버그요. 알고 보니 같은 요청 경로가 두 파일에 중복 등록돼 있었고, 우리가 고치던 쪽은 라우팅에서 가려진(shadowed) **죽은 코드**였어요. 활성 쪽 파일을 고치니 한 번에 해결됐죠.

> 유일성이 보장되지 않은 식별자와 단일화되지 않은 등록 지점은 반드시 비결정성으로 돌아와요. 수정은 조회 필터의 일원화와 등록 지점의 단일화였어요.

## 경로 4: 설정값 하나가 시스템 장애가 됐어요

마지막 경로는 설정값 검증이에요. 노드에 설정된 최대 출력 길이(`max_tokens=1,000,000`)가 모델의 한계(128,000)를 넘어서 매 호출이 실패하는 장애가 있었어요. 실행기는 90회의 빈 반복을 돌며 $1.21을 소모한 뒤에야 실패로 끝났고, 겉으로 드러난 증상은 엉뚱하게도 "결과 누락"이었죠. 재시도를 해도 실패의 원인인 설정값은 그대로니 같은 실패만 반복될 뿐인데, 루프에는 그 반복을 알아챌 장치가 없었던 거예요. 90회와 $1.21은 그 부재의 가격이었고요.

원인 분석에서 두 가지를 일반화했어요. 사용자 설정값은 실행 대상(모델)의 한계와 교차 검증해 한계값으로 자동 보정(clamp)한다. 그리고 반복 루프에는 "진전 없는 반복" 감지를 둔다. 둘 다 엔진에 들어갔어요.

## 정리하며

이 네 경로의 공통점, 눈치채셨을까요? 어느 것도 "코드 로직의 버그"가 아니에요. 추적, 캐시, 경합, 계약, 검증. 전부 코드 바깥의 구조예요. 그래서 방어도 코드 리뷰가 아니라 층으로 쌓았어요. 새로 내려받은 저장소 기준 빌드 → 발행 전 원격 상태 확인 → 발행 후 실물 검사 → 산출물 프로세스 종단 검증.

다음 편은 이렇게 신뢰할 수 있게 된 실행기 위에서의 실험이에요. 설정이 모델의 격차를 얼마나 지우는지, 통제된 벤치마크로 잰 기록이요.

배포의 신뢰는 좋은 코드가 아니라 검증의 층수에서 나온다고 우리는 믿어요.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들이에요.
- "내 자리에서 되는 것"과 "어디서든 되는 것"은 다른 명제인 것 같아요. 배포의 신뢰는 후자를 기준으로 검증할 때만 쌓이더라고요.
- 시스템이 지켜야 할 가정(유일성·단일성)은 사람의 기억보다 구조가 강제하는 쪽이 맞는 것 같아요. 기억은 흐려지지만 제약은 남더라고요.
- 사용자에게 열어 준 자유(설정값)에는 시스템이 감당할 한계를 함께 배선해 두는 게 좋은 것 같아요. 자유와 안전장치는 세트로 설계할 때만 둘 다 지켜지더라고요.

`#하네스` `#릴리즈엔지니어링` `#신뢰성`

---

> **이전 편** → [규칙은 프롬프트가 아니라 격리 judge로 강제합니다](/blog/harness-journey-4-canvas-node-judge)
> **다음 편** → [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
