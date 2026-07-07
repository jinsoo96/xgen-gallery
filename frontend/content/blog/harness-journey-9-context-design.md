---
title: "에이전트는 자기 출력이 어디로 가는지 알아야 합니다"
description: "출력 채널을 컨텍스트의 1급 자원으로, 도구 노출은 '지도의 복원'으로. 컨텍스트 설계의 두 원칙과, 하네스가 운영 플랫폼으로 발전하는 다음 단계."
date: "2026-07-05"
author: Jinsoo Kim
category: Tech Note
tags:
  - 하네스
  - 컨텍스트설계
  - 로드맵
series: 하네스 개발기
part: 9/9
draft: false
---

**한 줄 요약** — 출력이 어디로 나가는지를 도구·데이터와 같은 격의 정보로 에이전트에게 보여주고, 도구 노출은 '지도의 복원'을 원칙으로. 에이전트는 자기 말의 목적지와 자기 도구의 존재를 알아야 통제할 수 있기 때문입니다.

마지막 편은 완결이 아니라 설계 과제의 목록입니다. 최근의 두 사례가 에이전트 컨텍스트 설계의 다음 원칙을 정확히 가리키고 있었기 때문입니다.

<figure class="blog-illust">
<svg viewBox="0 0 1000 430" width="1000" height="430" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="출력이 어디로 가는지 알아야 한다 — 출력 채널 1급 자원, 도구 지도 복원">
  <defs>
    <linearGradient id="bg9" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f9ff"/><stop offset="1" stop-color="#e9f1ff"/></linearGradient>
    <marker id="a9" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#2563eb"/></marker>
  </defs>
  <style>text{font-family:'Pretendard Variable',Pretendard,'Malgun Gothic','Apple SD Gothic Neo',system-ui,sans-serif}</style>
  <rect width="1000" height="430" fill="url(#bg9)"/>
  <circle cx="930" cy="40" r="150" fill="#2563eb" opacity="0.05"/>
  <text x="48" y="60" font-size="24" font-weight="800" fill="#2563eb">하네스 개발기 · 9/9</text>
  <text x="48" y="112" font-size="42" font-weight="800" fill="#0f172a">출력이 어디로 가는지 알아야</text>
  <!-- agent -->
  <circle cx="150" cy="290" r="60" fill="#2563eb"/><text x="150" y="284" text-anchor="middle" font-size="24" font-weight="800" fill="#ffffff">에이전트</text><text x="150" y="310" text-anchor="middle" font-size="18" fill="#cfe0ff">context</text>
  <!-- output channels -->
  <text x="240" y="176" font-size="22" font-weight="700" fill="#2563eb">출력 채널 = 1급 자원</text>
  <line x1="214" y1="262" x2="300" y2="214" stroke="#2563eb" stroke-width="4" marker-end="url(#a9)"/>
  <line x1="216" y1="290" x2="300" y2="290" stroke="#2563eb" stroke-width="4" marker-end="url(#a9)"/>
  <line x1="214" y1="318" x2="300" y2="366" stroke="#2563eb" stroke-width="4" marker-end="url(#a9)"/>
  <rect x="314" y="192" width="180" height="46" rx="10" fill="#ffffff" stroke="#d7e0f0"/><text x="334" y="222" font-size="21" font-weight="700" fill="#334155">이메일 종단</text>
  <rect x="314" y="267" width="180" height="46" rx="10" fill="#ffffff" stroke="#d7e0f0"/><text x="334" y="297" font-size="21" font-weight="700" fill="#334155">문서 · 도구</text>
  <rect x="314" y="342" width="180" height="46" rx="10" fill="#ffffff" stroke="#d7e0f0"/><text x="334" y="372" font-size="21" font-weight="700" fill="#334155">다음 노드</text>
  <!-- tool map -->
  <rect x="548" y="176" width="406" height="214" rx="18" fill="#ffffff" stroke="#d7e0f0"/>
  <text x="572" y="212" font-size="22" font-weight="800" fill="#0f172a">도구 지도 · 복원</text>
  <rect x="572" y="226" width="358" height="46" rx="10" fill="#dbeafe" stroke="#bfdbfe"/><text x="592" y="255" font-size="20" font-weight="700" fill="#1e40af">명시 연결 · 이름 항상 보임</text>
  <rect x="572" y="288" width="358" height="86" rx="10" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="592" y="316" font-size="18" fill="#64748b">익명 대량 도구 — 검색 뒤로 숨김</text>
  <g fill="#cbd5e1"><rect x="592" y="330" width="66" height="22" rx="6"/><rect x="668" y="330" width="66" height="22" rx="6"/><rect x="744" y="330" width="66" height="22" rx="6"/></g>
  <circle cx="884" cy="341" r="15" fill="none" stroke="#64748b" stroke-width="3"/><line x1="895" y1="352" x2="906" y2="363" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>
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
> 8. [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> 9. **에이전트는 자기 출력이 어디로 가는지 알아야 합니다** *(지금 읽는 글)*

## 원칙 1: 에이전트는 출력이 어디로 전달되는지 알아야 합니다

실제 운영에서 이런 문제가 발생했습니다. 워크플로우 마지막에 이메일 발송 단계가 연결되어 있었는데, 에이전트는 "이메일 전송 기능은 제 도구에 없습니다."라고 답했습니다. 그런데 그 답변이 그대로 이메일 발송 단계로 전달되면서 실제 이메일이 발송됐습니다.

처음에는 프롬프트에 "이 답변은 이메일로 발송됩니다."라는 문장을 추가하는 방법도 검토했습니다. 하지만 채널이 늘어날 때마다 프롬프트를 계속 수정해야 하는 구조여서 적절한 해결책이 아니었습니다.

대신 출력 채널(output_channel)을 문서나 도구처럼 에이전트가 이해하는 실행 정보로 제공하기로 했습니다. 그러면 에이전트는 사용할 수 있는 도구뿐 아니라 자신의 답변이 어디로 전달되는지도 함께 인식하게 됩니다. 그 결과 출력 대상에 맞게 답변의 형식과 표현을 스스로 조정할 수 있습니다.

또한 이메일 발송은 하나의 전용 실행 도구에서만 처리하도록 구조를 변경해 중복 발송이 발생하지 않도록 했습니다. 개인정보 보호를 위한 허용 주소도 코드에 직접 작성하지 않고 노드 설정에서 자동으로 수집하도록 개선했습니다.

## 원칙 2: 필요한 도구는 항상 보여야 합니다

도구가 수십 개를 넘어가면 모든 정보를 컨텍스트에 넣는 것은 비효율적입니다. 그래서 하네스는 필요한 도구만 단계적으로 보여주는 Progressive Disclosure 방식을 사용합니다. 검색은 BM25 기반으로 수행하며, 실제 테스트에서는 약한 모델도 검색 → 발견 → 호출 과정을 안정적으로 수행했습니다. (66개의 도구를 숨긴 상태에서도 필요한 도구를 정확히 찾아냄)

그런데 이 감추기 정책이 과하게 적용되면 반대 결함이 생깁니다 — 나중에 불러올 항목의 분류를 일괄 처리한 리팩터링이 **사용자가 캔버스에서 명시적으로 연결한 도구까지** 숨겨, 모델이 도구의 존재 자체를 볼 수 없게 된 회귀가 확인됐습니다. 존재를 모르는 것은 프롬프트로도 강제할 수 없습니다. 여기서 확정한 설계 원칙은 다음과 같습니다.

> 명시적으로 연결된 자원은 이름이 항상 지도에 보여야 하고(상세 내용은 필요할 때 불러오기), 익명의 대량 목록만 검색 뒤로 숨깁니다. 고칠 것은 지도의 복원이지, 사용의 강제(자동 선호출이나 도구 지정 강제)가 아닙니다.

이 회귀는 원칙과 함께 미해결 과제로 기록되어 있습니다.

## 다음 단계: 실행기에서 운영 플랫폼으로

지금까지 하네스는 캔버스 안에서 워크플로우를 실행하는 역할에 집중했습니다.

다음 단계에서는 역할이 조금 달라집니다. 실행 결과와 판정 점수를 지속적으로 수집하고, 그 데이터를 바탕으로 노드 설정을 자동으로 조정하는 운영 플랫폼으로 발전하는 것입니다.

예를 들어 실행 과정에서 얻은 점수와 실패 원인은 하나의 상태 저장소(State Spine)에 축적되고, 하네스는 이를 바탕으로 노드 설정을 개선합니다. 검증을 통과한 설정은 새로운 실행에 다시 반영되고, 실행 결과는 재사용 가능한 도구로 축적됩니다.

궁극적으로는 결과 → 설정 → 의도까지 하나의 흐름으로 연결해, 에이전트가 어떻게 동작했고 왜 그런 판단을 했는지를 코드 수정 없이 추적할 수 있는 구조를 만드는 것이 목표입니다.

이를 위한 핵심 구조는 대부분 구현되어 있으며, 남은 과제는 각각의 기능을 하나의 흐름으로 연결하는 일입니다.

## 정리하며 — 시리즈를 마치며

석 달 동안 세 개의 저장소에서 1,270여 개의 커밋을 쌓으며, 결국 하나의 결론에 도달했습니다.

에이전트의 품질은 프롬프트가 아니라 구조에서 만들어집니다.

상태 머신은 실행을 제어하고, 독립된 judge는 규칙을 검증하며, 설정 동결은 일관된 실행 환경을 보장합니다. 여기에 다층 검증은 안정적인 배포를 만들고, 컨텍스트 설계는 에이전트가 현재 상황을 올바르게 이해하도록 돕습니다.

이번 시리즈는 지금까지 구현한 내용을 정리한 기록이면서, 앞으로 발전시켜 나갈 방향을 정리한 설계 노트이기도 합니다. 아직 해결해야 할 과제도 남아 있지만, 그것 역시 다음 단계에서 풀어야 할 문제로 이어질 것입니다.

**같은 문제를 겪는 팀에게** — 우리가 겪으며 얻은 생각들입니다.
- 에이전트에게 입력(도구·데이터)뿐 아니라 출력의 목적지도 알려 주는 설계를 고려해 보시면 좋을 것 같습니다. 채널명을 프롬프트에 직접 써 넣는 방식은 채널 수만큼 늘어나는 하드코딩이었습니다.
- 도구 은닉(Progressive Disclosure)을 조일 때 "사용자가 명시 연결한 자원의 이름은 항상 보인다"를 불변식으로 지키는 편이 안전한 것 같습니다. 존재를 모르는 것은 프롬프트로도 강제되지 않았습니다.

---

> **이전 편** → [실행이 끝나도 배운 것은 남아야 합니다 — 에이전트 메모리](/blog/harness-journey-8-memory-loop)
> **시리즈 처음으로** → [실행기의 본질은 속도가 아니라 재조립입니다](/blog/harness-journey-1-rust-to-python)
