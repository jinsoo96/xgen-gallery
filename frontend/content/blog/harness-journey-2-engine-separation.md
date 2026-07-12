---
title: "엔진은 플랫폼을 몰라야 합니다 (2부)"
description: "플랫폼을 오염시키지 말라는 요구에 아키텍처로 답하다 — 엔진 독립, 표준 플러그인 규약(entry_points), 그리고 20일 만에 확정된 10단계 구조."
date: "2026-04-14"
author: Jinsoo Kim
editor: Editorial Plateer Lab
kicker: "설계 원칙"
category: Tech Note
tags:
  - 하네스
  - 아키텍처
  - 플러그인설계
series: 하네스 개발기
part: 2/9
draft: false
---

**한 줄 요약** — 본류를 지키는 힘은 브랜치 규칙이 아니라 의존의 방향이었어요. 의존을 이식 레이어에서 엔진으로만 흐르도록 한 방향으로 고정하고 확장을 파이썬 표준 플러그인 규약(entry_points) 계약으로 명시했더니, 엔진이 하루 네 번 릴리즈되는 날에도 플랫폼 본류는 흔들리지 않았어요.

빠르게 진화하는 코드와 안정적으로 운영되는 플랫폼은 함께 성장할 수 있을까요? 처음에는 가능하다고 생각했습니다. 엔진과 플랫폼을 하나의 저장소에서 함께 개발하면 수정도 쉽고 배포도 단순해 보였습니다.

하지만 릴리즈 횟수가 늘어나기 시작하면서 예상하지 못했던 문제가 나타났습니다. 엔진은 하루에도 여러 번 바뀌는데 플랫폼은 그럴 수 없었습니다. 실험은 계속되어야 했고, 제품은 항상 안정적이어야 했습니다. 두 가지 요구를 같은 코드베이스 안에서 해결하려고 할수록 충돌은 반복됐습니다.

그때 깨달았습니다. 문제는 브랜치 전략이 아니었습니다. 아키텍처가 잘못되어 있었습니다.

<figure class="blog-illust">
<svg viewBox="0 0 1000 430" width="1000" height="430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="플랫폼→엔진 단방향 의존과 표준 플러그인 규약">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
    <marker id="a2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2563eb"/></marker>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="430" fill="url(#bg2)"/>
  <circle cx="930" cy="40" r="150" fill="#2563eb" opacity="0.05"/>
  <text x="48" y="60" font-size="24" font-weight="800" fill="#2563eb">하네스 개발기 · 2/9</text>
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">엔진은 플랫폼을 몰라야 한다</text>
  <!-- platform box -->
  <rect x="48" y="170" width="330" height="150" rx="18" fill="#ffffff" stroke="#d7e0f0"/>
  <text x="76" y="214" font-size="26" font-weight="800" fill="#0f172a">플랫폼</text>
  <text x="76" y="246" font-size="20" fill="#64748b">통합 레이어 · 정책 주입</text>
  <rect x="76" y="262" width="180" height="42" rx="10" fill="#eef4ff" stroke="#cddaf5"/><text x="166" y="290" text-anchor="middle" font-size="20" font-weight="700" fill="#2563eb">harness_bridge</text>
  <!-- single-direction dependency -->
  <line x1="392" y1="245" x2="600" y2="245" stroke="#2563eb" stroke-width="5" marker-end="url(#a2)"/>
  <text x="496" y="226" text-anchor="middle" font-size="23" font-weight="700" fill="#2563eb">단방향 의존</text>
  <text x="496" y="276" text-anchor="middle" font-size="19" fill="#64748b">pip · 버전 핀</text>
  <!-- engine box -->
  <rect x="624" y="170" width="330" height="150" rx="18" fill="#2563eb"/>
  <text x="652" y="214" font-size="26" font-weight="800" fill="#ffffff">엔진</text>
  <text x="652" y="246" font-size="20" fill="#cfe0ff">순수 PyPI 패키지</text>
  <rect x="652" y="262" width="274" height="42" rx="10" fill="#1e40af"/>
  <rect x="672" y="272" width="22" height="22" rx="5" fill="#93c5fd"/><rect x="702" y="272" width="22" height="22" rx="5" fill="#93c5fd"/><rect x="732" y="272" width="22" height="22" rx="5" fill="#93c5fd"/>
  <text x="906" y="289" text-anchor="end" font-size="19" font-weight="700" fill="#dbeafe">entry_points</text>
  <!-- stage chip -->
  <rect x="48" y="358" width="430" height="52" rx="14" fill="#ffffff" stroke="#d7e0f0"/>
  <text x="72" y="391" font-size="22" font-weight="700" fill="#334155">스테이지 정리</text>
  <rect x="230" y="371" width="56" height="28" rx="7" fill="#e2e8f0"/><text x="258" y="391" text-anchor="middle" font-size="20" font-weight="700" fill="#64748b">15</text>
  <line x1="296" y1="385" x2="330" y2="385" stroke="#2563eb" stroke-width="4" marker-end="url(#a2)"/>
  <rect x="342" y="371" width="56" height="28" rx="7" fill="#2563eb"/><text x="370" y="391" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">10</text>
  <text x="414" y="391" font-size="19" fill="#64748b">20일 만에</text>
</svg>
</figure>

> **시리즈 · 하네스 개발기** — 전 9부
>
> 1. 설계 원칙 — [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> 2. 설계 원칙 — **엔진은 플랫폼을 몰라야 합니다** *(지금 읽는 글)*
> 3. 설계 원칙 — [프로세스 경계를 넘는 자기완결성](/blog/harness-journey-3-compile-wheel-mcp)
> 4. 설계 원칙 — [규칙은 프롬프트가 아니라 격리 judge로 강제합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. 검증 — [배포의 신뢰성은 검증의 층수에서 나옵니다](/blog/harness-journey-5-release-reliability)
> 6. 실험 — [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. 설계 원칙 — [설정을 진화시키는 루프 — 자가단조](/blog/harness-journey-7-self-forging)
> 8. 설계 원칙 — [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. 설계 원칙 · 전망 — [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

지난 편에서 우리는 Rust로 시작한 실행기를 나흘 만에 Python으로 다시 쓰고, 엔진·이식·UI 세 저장소를 같은 날 출발시켰어요. 그리고 엔진을 파이썬 공식 패키지 저장소(PyPI)에 올리면서 엔진과 플랫폼 사이에 "패키지라는 경계"가 생겼다고 말씀드렸죠. 오늘은 그 경계가 진짜 시험대에 오른 이야기예요. 하네스가 플랫폼 본류에서 추방당하고, 브랜치 규칙이 아니라 아키텍처로 화해한 과정을 소개해 드릴게요.

## 어느 날, 하네스가 main에서 추방됐어요

4월 중순의 하네스는 무서운 속도로 자라고 있었어요. 나흘간 작은 수정 릴리즈(패치)만 38번을 쏟아냈고, 많게는 하루에 릴리즈 태그가 15개 붙은 날도 있었죠. 구조가 하루에도 몇 번씩 바뀌는, 전형적인 실험 단계였던 거예요.

그런데 바로 그 시기에 플랫폼 저장소에 커밋 하나가 올라왔어요. 제품의 정식 코드 줄기(main 브랜치)에서 **하네스 관련 파일 92개가 넘게 한꺼번에 삭제**된 거예요. 요구는 분명했어요. "main 브랜치에 하네스 코드가 섞여 있어서는 안 된다." 하네스는 같은 날 독립 엔드포인트 형태로, 기존 코드를 건드리지 않는 모양새로 간신히 자리를 지켰어요.

억울한 일이었을까요? 돌아보면 정당한 요구였다고 생각해요. 빠르게 자라는 실험 코드와 안정적으로 서비스되는 플랫폼 본류는 요구사항 자체가 달라요. 하루에도 몇 번씩 구조가 바뀌는 코드가 본류에 섞여 있으면, 본류의 모든 배포가 그 요동에 노출되니까요. 문제는 요구가 아니라, 그 요구에 답하는 방식이었어요.

## 브랜치 규칙으로는 왜 안 될까요

<figure class="blog-illust">
<svg viewBox="0 0 1000 360" width="1000" height="360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="브랜치 규칙 대신 아키텍처로 섞일 수 없는 단방향 의존 구조를 만든 이유">
  <defs><linearGradient id="bg2b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient></defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="360" fill="url(#bg2b)"/>
  <text x="44" y="50" font-size="27" font-weight="800" fill="#0f172a">규칙 대신, 섞일 수 없는 구조</text>
  <rect x="44" y="78" width="430" height="210" rx="16" fill="#ffffff" stroke="#f2c9d3"/>
  <text x="68" y="116" font-size="18" font-weight="800" fill="#b4315a">브랜치 규칙</text>
  <circle cx="440" cy="110" r="14" fill="#fdecef" stroke="#f6c6d0"/>
  <g stroke="#e11d48" stroke-width="3" stroke-linecap="round"><line x1="433" y1="103" x2="447" y2="117"/><line x1="447" y1="103" x2="433" y2="117"/></g>
  <text x="68" y="158" font-size="15" fill="#475569">머지마다 사람이 하네스 코드를 가려내야 함</text>
  <text x="68" y="186" font-size="15" fill="#475569">실수 한 번이면 같은 마찰이 반복</text>
  <text x="68" y="248" font-size="15" font-weight="700" fill="#b4315a">주의력에 의존해요</text>
  <text x="500" y="200" text-anchor="middle" font-size="30" font-weight="800" fill="#2563eb">&#8594;</text>
  <rect x="526" y="78" width="430" height="210" rx="16" fill="#ffffff" stroke="#cddaf5"/>
  <text x="550" y="116" font-size="18" font-weight="800" fill="#2563eb">아키텍처 · 단방향 의존</text>
  <circle cx="922" cy="110" r="14" fill="#ecf8f1" stroke="#bfe6cf"/>
  <path d="M915 110 l5 6 9 -12" fill="none" stroke="#1f9d57" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="550" y="158" font-size="15" fill="#475569">엔진은 플랫폼을 모른다 · pip 버전 핀</text>
  <text x="550" y="186" font-size="15" fill="#475569">애초에 섞일 수 없어 마찰이 사라짐</text>
  <text x="550" y="248" font-size="15" font-weight="700" fill="#2563eb">구조가 강제해요</text>
  <text x="500" y="326" text-anchor="middle" font-size="15" fill="#64748b">세 가지 결정 — ① 엔진 독립   ② 플랫폼 코드 이관   ③ entry_points 계약</text>
</svg>
</figure>

가장 쉬운 답은 "하네스는 격리 브랜치에서만 작업한다"는 규칙이었을 거예요. 그런데 규칙은 사람의 주의력에 의존해요. 머지할 때마다 어디까지가 하네스 코드인지 사람이 가려내야 하고, 실수가 한 번만 나도 같은 마찰이 반복되죠. 그래서 우리는 규칙 대신 **아예 섞일 수 없는 구조**를 만들기로 했어요.

> 잠깐, 이 글의 버전 표기를 풀어 둘게요. **v0.x**는 구조가 계속 바뀌는 실험 단계, **v1.0.0**은 구조를 확정한 첫 정식판이에요. 소수점 뒤 숫자가 올라가는 건 기능 추가나 작은 수정의 릴리즈 횟수고요.

해법은 세 가지 결정으로 구성됐어요.

첫째, **엔진이 플랫폼을 모르게** 했어요. v0.22.0("엔진 독립성 완결")에서 엔진 저장소에 남아 있던 플랫폼 어댑터를 삭제했어요. 이후의 엔진은 어떤 플랫폼 어휘도 갖지 않는 순수 PyPI 패키지예요.

둘째, 플랫폼을 아는 코드는 **플랫폼 쪽으로 옮겼어요**. 플랫폼 특화 코드 2,040줄이 이식 측의 `harness_bridge/` 레이어로 이동했는데, 같은 날 엔진에서 −2,251줄, 이식에서 +2,231줄이 움직인 대칭 커밋이 그 기록이에요.

셋째, 확장은 **파이썬 표준 플러그인 규약(entry_points)**이라는 계약으로만 열어 뒀어요. 이 규약을 고른 이유는 방향이에요. entry_points는 설치된 패키지가 확장을 스스로 등록하면 호스트는 그게 누구인지 몰라도 발견해서 쓰는 구조라, "엔진이 플랫폼을 모른다"는 첫 번째 결정과 어긋남 없이 맞물리거든요. 이식은 엔진을 pip 의존(`xgen-harness>=N`)으로 당겨 쓰고, 배포 대상·옵션 소스·에러 패턴 같은 확장을 이 규약으로 끼워 넣어요. 엔진은 끼울 자리(Protocol과 등록 API)만 제공하고, 한국어 용어 확장 같은 정책은 전부 이식이 주입하죠.

> 의존은 이식 → 엔진 한 방향뿐이에요. 엔진을 고쳐 배포한 뒤, 이식이 사용할 엔진 버전 지정(버전 핀)을 올리는 순서죠. 이게 그대로 우리의 개발 사이클이 됐어요.

이렇게 하니까 관계가 달라졌어요. 본류 입장에서 하네스는 더 이상 "섞여 들어온 실험 코드"가 아니라 **"버전이 명시된 외부 패키지 + 명시적 플러그인"**이었으니까요. 섞여 있던 시절에는 하네스의 요동이 본류의 모든 배포에 그대로 전달됐지만, 이제 본류가 받는 것은 자기가 골라 올린 버전 하나뿐이에요. 덕분에 추방 2주 뒤인 5월 1일, 하네스는 공용 개발 줄기(develop 브랜치)에 정식으로 합류할 수 있었어요.

## 같은 기간, 파이프라인도 수렴하고 있었어요

분리가 진행되는 동안 실행 파이프라인의 구조도 다듬어지고 있었어요. Rust 시절 15개였던 실행 단계(스테이지)는 삭제와 통합을 거쳐(계획 단계 하나만 해도 세 번 도입되고 세 번 제거됐어요) 첫 커밋 20일 만에 나온 첫 정식판 v1.0.0에서 열 개로 확정됐어요.

그 사이의 굵직한 릴리즈도 방향이 같았어요. v0.17.0에서는 흩어져 있던 안전장치를 선언형 점검 체인(Guard)으로 정리했고, v0.25.0에서는 도구 공급을 단일 채널(ToolSource) 하나로 통일했어요. 전부 "흩어진 것을 하나의 계약으로 모으는" 작업이었죠.

이 시기의 밀도가 어느 정도였냐면, 첫 공개 버전 v0.1.0부터 정식판 v1.0.0까지 14일 동안 약 60개 버전이 릴리즈됐어요. 이 속도를 본류가 감당할 수 있었던 이유가 바로 위의 분리 구조예요. 엔진이 하루 네 번 릴리즈돼도, 플랫폼 본류는 버전 지정을 올리기 전까지 아무 영향을 받지 않으니까요.

## 버전 번호도 배신할 수 있더라고요

<figure class="blog-illust">
<svg viewBox="0 0 1000 340" width="1000" height="340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="버전을 코드와 패키지 두 곳에 두면 어긋나므로 패키지 메타데이터 한 곳에서 읽도록 바꾼 이유">
  <defs><linearGradient id="bg2c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient></defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="340" fill="url(#bg2c)"/>
  <text x="44" y="50" font-size="26" font-weight="800" fill="#0f172a">버전이 두 곳에 있으면 어긋난다</text>
  <rect x="44" y="78" width="430" height="190" rx="16" fill="#ffffff" stroke="#f2c9d3"/>
  <text x="68" y="114" font-size="17" font-weight="800" fill="#b4315a">이전 — 두 곳에 버전</text>
  <rect x="68" y="128" width="382" height="36" rx="8" fill="#f8fafc" stroke="#e2e8f0"/><text x="84" y="152" font-size="15" fill="#334155">코드에 적힌 버전   v1.2.0</text>
  <rect x="68" y="172" width="382" height="36" rx="8" fill="#f8fafc" stroke="#e2e8f0"/><text x="84" y="196" font-size="15" fill="#334155">패키지 실제 버전   v1.1.0</text>
  <text x="68" y="244" font-size="15" font-weight="700" fill="#b4315a">✗ 의존성 해석이 옛 코드를 설치</text>
  <text x="500" y="176" text-anchor="middle" font-size="30" font-weight="800" fill="#2563eb">&#8594;</text>
  <rect x="526" y="78" width="430" height="190" rx="16" fill="#ffffff" stroke="#cddaf5"/>
  <text x="550" y="114" font-size="17" font-weight="800" fill="#2563eb">이후 — 단일 출처</text>
  <rect x="550" y="150" width="382" height="46" rx="10" fill="#eef4ff" stroke="#cddaf5"/><text x="741" y="179" text-anchor="middle" font-size="16" font-weight="700" fill="#2563eb">패키지 메타데이터에서 읽기</text>
  <text x="550" y="244" font-size="15" font-weight="700" fill="#1f9d57">✓ 코드와 패키지가 항상 일치</text>
  <text x="500" y="316" text-anchor="middle" font-size="15" fill="#64748b">버전조차 두 곳에 존재하면 어긋나요 — 출처를 하나로</text>
</svg>
</figure>

운영에서 얻은 교정도 하나 있어요. 어느 날 PyPI의 버전 번호 하나를 구버전 코드가 점유하고 있다는 걸 알게 됐어요. "이 버전 이상"이라는 의존성 선언이 새 모듈이 없는 옛 코드를 설치해 버리는 상황이었죠. 코드에 적힌 버전 문자열이 실제 패키지 버전과 어긋나는 사고도 세 번 반복됐고요. 결국 버전 문자열을 코드에 두지 않고 패키지 정보(메타데이터)에서 읽도록 바꾸는 것으로 근본 해결했어요. 버전조차 "두 곳에 존재하면 어긋난다"는, 이 편 전체를 관통하는 것과 같은 교훈이었어요.

## 정리하며

"본류를 침범하지 말라"는 요구에 브랜치 규칙으로 답했다면 마찰은 계속 반복됐을 거예요. 의존 방향을 한쪽으로 고정하고 확장을 플러그인 계약으로 명시한 이 구조가, 이후의 모든 확장, 그러니까 컴파일과 SDK 편입과 자가개선의 토대가 됐어요.

다음 편은 이 분리를 한 단계 더 밀고 나간 이야기예요. 플랫폼이 없어도, 프로세스 경계 너머에서도 동작하는 컴파일 산출물이요. 거기서 우리는 "클러스터에서는 되는데 산출물에서는 조용히 죽는" 버그의 계보를 만나게 돼요.

경계가 분명해야 속도가 안전해진다고 우리는 믿어요.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들이에요.
- 속도가 다른 두 세계(실험과 운영)를 한 몸으로 묶으면 둘 다 느려지는 것 같아요. 그 경계는 사람의 약속(브랜치 규칙)보다 구조(의존 방향)로 세우는 쪽이 오래가더라고요.
- 코어는 무지할수록 오래 사는 것 같아요. 특화 지식을 코어 밖의 확장점으로 밀어냈더니, 코어가 환경이 바뀌어도 다시 쓸 수 있는 자산이 되더라고요.
- 같은 정보를 두 곳에 적으면 언젠가는 어긋나더라고요. 진실의 원천을 한 곳으로 모으는 일은 사소해 보여도, 어긋남을 겪을 때마다 그 가치를 확인하게 되더라고요.

`#하네스` `#플러그인아키텍처` `#의존성설계`

---

> **이전 편** → [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
> **다음 편** → [프로세스 경계를 넘는 자기완결성](/blog/harness-journey-3-compile-wheel-mcp)
