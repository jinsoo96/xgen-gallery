---
title: "실행기의 본질은 속도가 아니라 재조립입니다 (1부)"
description: "LLM 에이전트 실행기 '하네스'의 설계 배경. 왜 상태 머신인가, 왜 스테이지를 체크리스트로 만들었나, 그리고 왜 Rust가 아니라 Python이었나."
date: "2026-04-02"
author: Jinsoo Kim
kicker: "설계 원칙"
category: Tech Note
tags:
  - 하네스
  - 에이전트실행기
  - 아키텍처
series: 하네스 개발기
part: 1/9
draft: false
---

**한 줄 요약** — 에이전트의 품질은 모델이 아니라 모델을 감싼 실행 계층, 즉 하네스에서 갈려요. 그리고 그 하네스를 만들 때 정말 중요한 건 실행 속도가 아니라 파이프라인을 얼마나 빠르게 뜯어고칠 수 있느냐였어요. 그 기준으로 보면 Rust보다 Python이 정답이었고, 우리는 첫 커밋 나흘 만에 그 판단을 실행에 옮겼어요.

LLM 에이전트를 만들다 보면 의외의 지점에서 한계를 만납니다. 모델은 충분히 똑똑한데 결과가 들쭉날쭉합니다. 프롬프트를 조금만 바꿔도 응답이 달라지고, 실행 단계를 하나 추가하는 것만으로도 전체 파이프라인을 다시 손봐야 하는 일이 반복됩니다.

처음에는 모델의 문제라고 생각했습니다. 하지만 개발을 계속할수록 다른 결론에 도달했습니다. 문제는 모델이 아니라 실행기였습니다.

우리가 만들고자 했던 것은 더 빠른 실행기가 아니었습니다. 실행 과정을 언제든 다시 조립하고, 필요한 단계만 교체할 수 있는 실행기였습니다. 하네스(Harness)는 바로 그 질문에서 시작했습니다. 실행기의 병목은 어디에 있을까요? CPU일까요, 아니면 변경 속도일까요? 이 글에서는 그 질문에 답을 찾아가는 과정을 소개합니다.

<figure class="blog-illust">
<svg viewBox="0 0 1000 430" width="1000" height="430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="상태 머신과 재시도 루프 — Rust에서 Python으로">
  <defs>
    <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
    <marker id="a1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2563eb"/></marker>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="430" fill="url(#bg1)"/>
  <circle cx="930" cy="40" r="150" fill="#2563eb" opacity="0.05"/>
  <text x="48" y="60" font-size="24" font-weight="800" fill="#2563eb">하네스 개발기 · 1/9</text>
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">상태 머신으로 실행을 붙잡다</text>
  <!-- retry loop (arc above nodes) -->
  <path d="M720 250 C 720 165, 120 165, 120 250" fill="none" stroke="#7c5cff" stroke-width="4" marker-end="url(#a1)"/>
  <rect x="318" y="163" width="204" height="34" rx="17" fill="#ffffff"/>
  <text x="420" y="187" text-anchor="middle" font-size="22" font-weight="700" fill="#7c5cff">재시도 루프 (cycle)</text>
  <!-- forward arrows -->
  <line x1="172" y1="288" x2="268" y2="288" stroke="#2563eb" stroke-width="4" marker-end="url(#a1)"/>
  <line x1="372" y1="288" x2="468" y2="288" stroke="#2563eb" stroke-width="4" marker-end="url(#a1)"/>
  <line x1="572" y1="288" x2="668" y2="288" stroke="#2563eb" stroke-width="4" marker-end="url(#a1)"/>
  <!-- nodes -->
  <circle cx="120" cy="288" r="52" fill="#ffffff" stroke="#2563eb" stroke-width="3"/><text x="120" y="297" text-anchor="middle" font-size="26" font-weight="700" fill="#2563eb">탐색</text>
  <circle cx="320" cy="288" r="52" fill="#ffffff" stroke="#2563eb" stroke-width="3"/><text x="320" y="297" text-anchor="middle" font-size="26" font-weight="700" fill="#2563eb">압축</text>
  <circle cx="520" cy="288" r="52" fill="#ffffff" stroke="#2563eb" stroke-width="3"/><text x="520" y="297" text-anchor="middle" font-size="26" font-weight="700" fill="#2563eb">검증</text>
  <circle cx="720" cy="288" r="52" fill="#2563eb"/><text x="720" y="297" text-anchor="middle" font-size="26" font-weight="700" fill="#ffffff">판단</text>
  <!-- chip -->
  <rect x="812" y="250" width="150" height="76" rx="14" fill="#eef4ff" stroke="#cddaf5"/>
  <text x="887" y="284" text-anchor="middle" font-size="21" font-weight="700" fill="#334155">Rust →</text>
  <text x="887" y="312" text-anchor="middle" font-size="21" font-weight="700" fill="#2563eb">Python</text>
</svg>
</figure>

> **시리즈 · 하네스 개발기** — 전 9부
>
> 1. 설계 원칙 — **실행기의 본질은 속도가 아니라 재조립입니다** *(지금 읽는 글)*
> 2. 설계 원칙 — [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
> 3. 설계 원칙 — [프로세스 경계를 넘는 자기완결성](/blog/harness-journey-3-compile-wheel-mcp)
> 4. 설계 원칙 — [규칙은 프롬프트가 아니라 격리 judge로 강제합니다](/blog/harness-journey-4-canvas-node-judge)
> 5. 검증 — [배포의 신뢰성은 검증의 층수에서 나옵니다](/blog/harness-journey-5-release-reliability)
> 6. 실험 — [설정이 모델 격차를 지웁니다](/blog/harness-journey-6-qwen-vs-sonnet)
> 7. 설계 원칙 — [설정을 진화시키는 루프 — 자가단조](/blog/harness-journey-7-self-forging)
> 8. 설계 원칙 — [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. 설계 원칙 · 전망 — [에이전트는 자기 출력이 어디로 가는지 알아야 합니다](/blog/harness-journey-9-context-design)

AI 에이전트를 운영해 보신 분이라면 한 번쯤 겪어보셨을 거예요. 같은 모델, 같은 프롬프트인데 어제는 잘 되던 게 오늘은 엉뚱한 답을 내놓는 경험이요. 우리도 똑같은 고민을 하고 있었어요. 모델을 더 좋은 것으로 바꿔도 이 요동은 사라지지 않았어요. 같은 모델에 같은 프롬프트인데 결과가 다르다면, 변수는 그 둘이 아니라 그 사이 어딘가에 있다는 뜻이잖아요. 그래서 모델 바깥, 즉 모델을 둘러싼 실행 환경 전체를 통제해야 한다는 결론에 도달했어요.

이 시리즈는 그 실행 환경, **하네스(Harness)**를 석 달 동안 세 저장소에 1,270여 개의 커밋을 쌓으며 만든 과정의 기록이에요. 오늘 첫 편에서는 하네스가 대체 무엇인지부터 시작해서, 왜 멀쩡히 돌아가던 워크플로우 엔진을 두고 이걸 새로 만들었는지, 그리고 Rust로 시작했던 첫 커밋을 왜 나흘 만에 전부 지우고 Python으로 다시 썼는지를 이야기해 볼게요.

## 하네스가 뭐길래

하네스(harness)는 원래 마구(馬具)를 뜻하는 말이에요. 말에게 채우는 굴레와 고삐, 즉 말의 힘을 마차에 전달하면서 방향과 속도를 제어하는 장구죠. 소프트웨어에서는 이 비유가 테스트 하네스(test harness)로 먼저 자리를 잡았어요. 테스트 대상을 감싸서 실행하고, 입력을 넣고, 결과를 검증하는 자동화 틀이요.

에이전트 시대에 이 단어가 다시 소환됐어요. **에이전트 하네스는 모델의 추론을 제외한 전부를 관리하는 실행 계층**이에요. 어떤 도구를 보여줄지, 어떤 맥락을 실을지, 결과를 어떻게 검증할지, 부족하면 몇 번 다시 돌릴지까지요. 모델이 "생각"한다면, 하네스는 그 생각을 안전하게 "일"로 바꿔요. Claude Code 같은 코딩 에이전트가 강력한 것도 모델만의 힘이 아니라 그 주위를 감싼 하네스의 힘이라는 게 업계의 공통된 진단이고, 하네스 구성만 바꿔도 과제 해결률이 크게 달라진다는 연구 결과도 있어요.

그래서 요즘은 이런 계보로 이야기해요. 프롬프트 엔지니어링이 "모델에게 무엇을 시도하게 할지"를 다뤘고, 컨텍스트 엔지니어링이 "모델이 무엇을 알게 할지"를 다뤘다면, **하네스 엔지니어링은 "에이전트가 무엇을 할 수 있고, 무엇을 할 수 없게 할지"를 다뤄요.** 우리가 만들려던 것이 정확히 이 세 번째 층이었어요. 지시·맥락·행동·검증을 하나의 운영 체계로 묶는 것이요.

## 왜 멀쩡한 워크플로우 엔진을 두고 새로 만들었을까

<figure class="blog-illust">
<svg viewBox="0 0 1000 400" width="1000" height="400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="일방향 그래프(DAG)는 되돌아가는 흐름을 표현하지 못해 상태 머신으로 바꾼 이유">
  <defs>
    <linearGradient id="bg1c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
    <marker id="mfg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#94a3b8"/></marker>
    <marker id="mfb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2563eb"/></marker>
    <marker id="mbk" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#e11d48"/></marker>
    <marker id="mrt" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#7c5cff"/></marker>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="400" fill="url(#bg1c)"/>
  <text x="44" y="50" font-size="27" font-weight="800" fill="#0f172a">일방향 그래프로는 되돌아갈 수 없었어요</text>
  <rect x="44" y="78" width="430" height="250" rx="16" fill="#ffffff" stroke="#d7e0f0"/>
  <text x="68" y="112" font-size="17" font-weight="800" fill="#64748b">기존 · 일방향 그래프(DAG)</text>
  <path d="M370 178 C 370 132, 112 132, 112 178" fill="none" stroke="#e11d48" stroke-width="3" stroke-dasharray="7 6" marker-end="url(#mbk)"/>
  <g stroke="#e11d48" stroke-width="3" stroke-linecap="round"><line x1="234" y1="121" x2="248" y2="135"/><line x1="248" y1="121" x2="234" y2="135"/></g>
  <line x1="134" y1="200" x2="176" y2="200" stroke="#94a3b8" stroke-width="3" marker-end="url(#mfg)"/>
  <line x1="220" y1="200" x2="262" y2="200" stroke="#94a3b8" stroke-width="3" marker-end="url(#mfg)"/>
  <line x1="306" y1="200" x2="348" y2="200" stroke="#94a3b8" stroke-width="3" marker-end="url(#mfg)"/>
  <circle cx="112" cy="200" r="20" fill="#eef4ff" stroke="#94a3b8" stroke-width="2"/>
  <circle cx="198" cy="200" r="20" fill="#eef4ff" stroke="#94a3b8" stroke-width="2"/>
  <circle cx="284" cy="200" r="20" fill="#eef4ff" stroke="#94a3b8" stroke-width="2"/>
  <circle cx="370" cy="200" r="20" fill="#eef4ff" stroke="#94a3b8" stroke-width="2"/>
  <text x="68" y="300" font-size="14" fill="#64748b">앞으로만 흐르는 그래프 — 재시도 루프를 표현 못 함</text>
  <text x="500" y="212" text-anchor="middle" font-size="30" font-weight="800" fill="#2563eb">&#8594;</text>
  <rect x="526" y="78" width="430" height="250" rx="16" fill="#ffffff" stroke="#cddaf5"/>
  <text x="550" y="112" font-size="17" font-weight="800" fill="#2563eb">필요했던 것 · 상태 머신</text>
  <path d="M818 185 C 818 140, 590 140, 590 185" fill="none" stroke="#7c5cff" stroke-width="3" marker-end="url(#mrt)"/>
  <text x="704" y="132" text-anchor="middle" font-size="13" font-weight="700" fill="#7c5cff">재시도 루프</text>
  <line x1="634" y1="205" x2="660" y2="205" stroke="#2563eb" stroke-width="3" marker-end="url(#mfb)"/>
  <line x1="748" y1="205" x2="774" y2="205" stroke="#2563eb" stroke-width="3" marker-end="url(#mfb)"/>
  <rect x="548" y="185" width="84" height="40" rx="10" fill="#eef4ff" stroke="#cddaf5"/><text x="590" y="211" text-anchor="middle" font-size="17" font-weight="700" fill="#2563eb">탐색</text>
  <rect x="662" y="185" width="84" height="40" rx="10" fill="#eef4ff" stroke="#cddaf5"/><text x="704" y="211" text-anchor="middle" font-size="17" font-weight="700" fill="#2563eb">검증</text>
  <rect x="776" y="185" width="84" height="40" rx="10" fill="#2563eb"/><text x="818" y="211" text-anchor="middle" font-size="17" font-weight="700" fill="#ffffff">판단</text>
  <text x="550" y="300" font-size="14" fill="#64748b">이름 붙은 단계 · 되돌아가는 흐름까지 표현</text>
  <text x="500" y="372" text-anchor="middle" font-size="15" fill="#64748b">두 한계 — ① 되돌아가는 흐름 불가   ② 100+ 범용 노드 설정으론 실행 세부 통제 불가</text>
</svg>
</figure>

우리 플랫폼에는 이미 잘 돌아가는 워크플로우 실행기가 있었어요. 노드를 이어 붙이면 순서대로 실행해 주는 구조로, 정해진 일을 정해진 순서로 처리하는 데에는 아무 문제가 없었죠.

그런데 에이전트를 올리는 순간 두 가지 한계가 드러났어요.

첫째, **되돌아가는 흐름이 없었어요.** 당시 실행기는 노드가 한 방향으로만 흐르는 그래프 구조로 워크플로우를 실행했어요. 그런데 에이전트의 품질은 "답을 내고, 검증하고, 부족하면 앞으로 되돌아가 다시 하는" 루프에서 나와요. 그 루프를 워크플로우 위에 그릴 수가 없었던 거예요.

둘째, **실행 과정에 손댈 곳이 없었어요.** 실행기가 LangChain 계열 프레임워크 위에 서 있어서, 모델에게 실제로 전달되는 메시지가 어떻게 조립되는지를 프레임워크가 결정했어요. 100개가 넘는 범용 노드와 켜고 끄는 식의 설정으로는, 이번 호출에 어떤 맥락을 싣고 어떤 도구를 보여주고 답을 어떻게 검증할지 같은 **실행의 세부를 우리 손으로 통제할 수 없었죠.** 하네스 엔지니어링을 하려면 메시지 한 토막까지 우리가 쥐고 있어야 하는데요.

그래서 결론은 이거였어요. 에이전트에게 필요한 건 노드의 나열이 아니라, 실행의 매 단계가 이름 붙은 부품으로 존재하고 되돌아가는 흐름까지 표현할 수 있는 **상태 머신**이다.

## 실행 단계를 체크리스트로 만들자

방향은 처음부터 이렇게 잡았어요. "실행 단계를 전부 이름 붙은 부품으로 만들고, 사용자가 체크리스트처럼 골라 조립하게 하자."

실제로 첫 커밋의 코드 주석에는 이미 이렇게 적혀 있어요. "사용자가 체크리스트로 선택, 포함된 단계만 실행됨." 가장 가벼운 4단계 조합부터 전부 켠 12단계 조합까지 기본 프리셋도 첫날부터 들어 있었죠. 입력 정규화, 도구 카탈로그 구성, 맥락 압축, 도구 실행, 검증과 재시도 판단, 마무리까지, 하네스가 관리해야 할 일들이 각각 독립된 단계가 됐어요. 각 단계는 자기 담당만 모델에게 노출하고, 모델은 그 안에서 자율적으로 도구를 부르는 구조예요.

바닥부터 다 발명한 건 아니에요. 컨텍스트를 언제 얼마나 압축할지 같은 정교한 값들은, 공개된 코딩 에이전트 CLI들의 실행 파이프라인을 분석해서 대응표를 만들어 이식했어요. 다만 경계는 처음부터 분명히 그었어요. **실행 인프라는 배워 오되, 답을 검증하고 재시도를 판단하는 게이트는 우리가 직접 설계한다**는 것이었죠. 이 게이트가 나중에 시리즈 4편의 주인공인 격리 judge로 자라나요.

## 첫 커밋은 Rust 14,034줄이었어요

<figure class="blog-illust">
<svg viewBox="0 0 1000 360" width="1000" height="360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="병목은 실행 속도가 아니라 변경 속도 — 실행 시간의 대부분은 API 대기, Rust에서 Python으로 재작성">
  <defs>
    <linearGradient id="bg1b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="360" fill="url(#bg1b)"/>
  <text x="44" y="56" font-size="28" font-weight="800" fill="#0f172a">병목은 실행 속도가 아니라 변경 속도</text>
  <text x="44" y="94" font-size="15" font-weight="600" fill="#64748b">실행 1회 — 시간 구성</text>
  <clipPath id="bar1b"><rect x="44" y="106" width="912" height="52" rx="12"/></clipPath>
  <g clip-path="url(#bar1b)">
    <rect x="44" y="106" width="792" height="52" fill="#2563eb"/>
    <rect x="836" y="106" width="120" height="52" fill="#cbd5e1"/>
  </g>
  <text x="440" y="138" text-anchor="middle" font-size="19" font-weight="700" fill="#ffffff">API 응답 대기</text>
  <text x="896" y="137" text-anchor="middle" font-size="14" font-weight="700" fill="#475569">CPU</text>
  <text x="44" y="190" font-size="16" fill="#475569">실행 시간의 대부분이 API 대기 — Rust의 실행 속도 이점은 여기서 드러나지 않아요</text>
  <rect x="44" y="218" width="430" height="74" rx="14" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="68" y="252" font-size="20" font-weight="800" fill="#64748b">Rust</text>
  <text x="68" y="277" font-size="15" fill="#64748b">실행 성능 ↑ · 병목엔 실효 없음</text>
  <text x="500" y="263" text-anchor="middle" font-size="26" font-weight="800" fill="#2563eb">→</text>
  <rect x="526" y="218" width="430" height="74" rx="14" fill="#eef4ff" stroke="#2563eb"/>
  <text x="550" y="252" font-size="20" font-weight="800" fill="#2563eb">Python</text>
  <text x="550" y="277" font-size="15" fill="#334155">변경 속도 ↑ · 매 실험마다 이득</text>
  <text x="44" y="334" font-size="15" fill="#64748b">14,034줄 Rust → Python 재작성(나흘) · 상태 머신 계약은 그대로 승계</text>
</svg>
</figure>

첫 커밋은 56개 파일, 14,034줄의 Rust 상태 머신이었어요. "에이전트마다 실행기를 하나씩 붙일 텐데, 가볍고 빨라야 하지 않을까"라는 생각에서 나온 선택이었죠.

그런데 만들어 보니까 이상한 점이 보이기 시작했어요. 실행기가 하는 일의 대부분은 **LLM API 응답을 기다리는 것**이었어요. CPU가 바쁜 시간은 거의 없었죠. 반대로 속도를 위해 치른 비용은 실체가 있었어요. Rust와 Python을 잇는 연결 계층(PyO3)은 유지 보수가 번거로워 실제로 하루 만에 떼어냈고, 파이프라인 단계를 하나 고칠 때마다 컴파일 언어의 무게가 발목을 잡았어요.

여기서 질문을 다시 던졌어요. **"이 시스템의 병목은 어디인가?"** 답은 실행 속도가 아니라 **변경 속도**였어요. 하네스 엔지니어링은 본질적으로 실험의 연속이에요. 단계를 넣다 빼고, 검증 방식을 바꿔 보고, 압축 정책을 갈아 끼우면서 에이전트의 행동이 어떻게 달라지는지 봐야 하거든요.

이 반복 실험이라는 기준에서 두 언어의 성적표는 명확했어요. Python은 고치면 컴파일 없이 바로 실행해 볼 수 있고, LLM 공급사의 SDK와 주변 도구 대부분이 Python을 기준으로 나오기 때문에 연결 비용도 가장 낮아요. 반대로 Rust의 강점인 실행 성능은, 병목이 API 대기인 이 시스템에서는 체감할 수 없는 이점이었고요. 얻는 것은 실체가 없는데 치르는 비용(느린 실험 속도)은 실체가 있었던 거죠. 그래서 결론은 Python이었어요.

그래서 첫 커밋 나흘 만에 Rust 코어 14,220줄을 전부 걷어내고 Python으로 다시 썼어요. 언어를 바꿨다고 설계까지 버린 건 아니에요. 단계의 이름들과 상태 머신의 계약은 Python 구조에 그대로 승계됐어요. 되돌아보면 이 나흘은 손해가 아니라, "무엇을 최적화할 것인가"라는 기준을 가장 싸게 배운 시간이었다고 생각해요.

## 같은 날, 세 갈래가 출발했어요

Python으로 전환한 바로 그날, 세 개의 저장소가 동시에 출발했어요. 실행기 본체인 **엔진**, 엔진을 플랫폼에 연결하는 **이식** 레이어, 그리고 파이프라인을 눈으로 보여주는 **UI**(첫 커밋에만 3,694줄)까지요.

이틀 뒤에는 파이썬 공식 패키지 저장소(PyPI)에 첫 공개 버전(v0.1.0)이 올라갔고, 같은 날 플랫폼 저장소는 내장하고 있던 엔진 사본을 지우고 이 패키지를 설치해 쓰는 방식으로 갈아탔어요. 엔진과 플랫폼 사이에 **패키지라는 경계**가 생긴 거예요. 이 경계가 왜 중요한지는 겪어 보고 나서야 알게 됐는데, 그 이야기가 다음 편이에요.

## 정리하며

하네스는 모델의 생각을 일로 바꾸는 실행 계층이고, 하네스 엔지니어링은 그 계층으로 에이전트가 할 수 있는 일과 없는 일을 설계하는 규율이에요. 그 규율의 첫 번째 교훈이 이번 편의 제목이에요. 실행기의 본질은 속도가 아니라 재조립이라는 것이요. 에이전트 실행기의 병목은 변경 속도였고, 그 기준 하나가 상태 머신, 체크리스트 단계, 그리고 Python이라는 세 가지 선택을 일관되게 설명해 줘요.

다음 편은 이 실행기가 플랫폼 본류와 부딪히고 화해한 이야기예요. "main 브랜치에 하네스 코드가 있어서는 안 된다"는 요구를 받고, 우리는 브랜치 규칙이 아니라 아키텍처로 답했어요.

에이전트의 품질은 모델이 아니라 구조에서 나온다고 우리는 믿어요. 이 시리즈가 그 구조를 만들어 가는 기록이에요.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들이에요.
- 시스템이 흔들릴 때는 가장 눈에 띄는 부품(모델)부터 바꾸고 싶어져요. 그런데 변수는 대개 부품이 아니라 부품을 둘러싼 구조에 있더라고요. 그래서 교체보다 구조 점검을 먼저 해 보는 게 좋지 않을까 싶어요.
- 기술 선택은 "무엇이 우수한가"가 아니라 "이 시스템의 병목이 어디인가"에서 출발하는 게 맞는 것 같아요. 병목과 무관한 우수함은 비용만 남기더라고요.
- 자주 바뀔 것을 처음부터 명시적인 계약(이름 붙은 부품과 조합 규칙)으로 만들어 두면, 이후의 모든 확장이 그 계약 위에서 거의 공짜가 되는 것 같아요. 우리의 재조립·컴파일·자가개선이 전부 그랬어요.

`#하네스` `#에이전트` `#아키텍처`

---

> **다음 편** → [엔진은 플랫폼을 몰라야 합니다](/blog/harness-journey-2-engine-separation)
