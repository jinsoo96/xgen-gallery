---
title: "개발자가 자신의 GitHub 계정으로 블로그를 기고하도록 만든 이유"
description: "메인 저장소 권한을 열지 않고도 개발자가 자신의 GitHub 계정으로 기고하도록 — Open Authoring으로 참여 비용만 낮춘 운영 구조 이야기입니다."
date: "2026-07-14"
author: "sooanc"
authorGithub: "sooanc"
category: "Tech Note"
tags: ["블로그", "기고", "Open Authoring"]
draft: false
---

## 블로그를 운영하는 일과 블로그가 운영되는 구조를 만드는 일은 다릅니다

기업 기술 블로그를 운영하다 보면 결국 같은 문제를 만나게 됩니다.

개발자는 글을 쓰고 싶어 하지만, 운영자는 저장소 권한을 쉽게 열어줄 수 없습니다. 그렇다고 운영 담당자가 원고를 받아 대신 커밋하는 방식은 오래가지 못합니다. 글이 늘어날수록 운영자는 병목이 되고, 개발자는 점점 글을 올리기 어려워집니다.

결국 문제는 '누가 글을 쓰느냐'가 아니라 '얼마나 쉽게 기고할 수 있느냐'였습니다.

## 권한은 유지하고, 참여 비용만 낮추기

이번에 선택한 방법은 Decap CMS의 Open Authoring 기능입니다.

Open Authoring은 메인 저장소의 권한을 추가로 부여하지 않습니다. 작성자는 자신의 GitHub 계정으로 로그인하면 개인 저장소(Fork)에서 글을 작성하고, 시스템이 자동으로 원본 저장소에 Pull Request를 생성합니다.

운영자는 기존과 동일하게 PR만 검토하고 병합하면 됩니다.

<figure style="margin:2.5rem 0">
<svg viewBox="0 0 380 560" width="100%" role="img" aria-label="Open Authoring 기고 흐름: 작성자 → GitHub 로그인 → Fork Repository → 글 작성 → Pull Request 생성 → 운영자 Review & Merge" xmlns="http://www.w3.org/2000/svg" style="max-width:360px;display:block;margin:0 auto;font-family:'Pretendard','Geist',system-ui,-apple-system,sans-serif">
<defs>
<linearGradient id="oaG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f7bff"/><stop offset="1" stop-color="#7c5cff"/></linearGradient>
</defs>
<g fill="none" stroke="#c2cad8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M184 97 L190 103 L196 97"/><path d="M184 189 L190 195 L196 189"/><path d="M184 281 L190 287 L196 281"/><path d="M184 373 L190 379 L196 373"/><path d="M184 465 L190 471 L196 465"/>
</g>
<circle cx="190" cy="34" r="18" fill="url(#oaG)"/>
<circle cx="190" cy="31" r="3.2" fill="#fff"/><path d="M183.8 41 a6.2 6.2 0 0 0 12.4 0" fill="#fff"/>
<text x="190" y="70" text-anchor="middle" font-size="15.5" font-weight="700" fill="#16203a">작성자</text>
<text x="190" y="86" text-anchor="middle" font-size="12" fill="#6b7688">기고자</text>
<circle cx="190" cy="126" r="18" fill="#fff" stroke="#2f7bff" stroke-width="2"/>
<g fill="none" stroke="#2461d8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M192 120 h5 v12 h-5"/><path d="M183 126 h7"/><path d="M188 123 l3 3 l-3 3"/></g>
<text x="190" y="162" text-anchor="middle" font-size="15.5" font-weight="700" fill="#16203a">GitHub 로그인</text>
<circle cx="190" cy="218" r="18" fill="#fff" stroke="#2f7bff" stroke-width="2"/>
<g fill="#2461d8" stroke="#2461d8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="190" cy="212" r="1.9" stroke="none"/><circle cx="184" cy="224" r="1.9" stroke="none"/><circle cx="196" cy="224" r="1.9" stroke="none"/><path d="M190 212 L184 224" fill="none"/><path d="M190 212 L196 224" fill="none"/></g>
<text x="190" y="254" text-anchor="middle" font-size="15.5" font-weight="700" fill="#16203a">Fork Repository</text>
<text x="190" y="270" text-anchor="middle" font-size="12" fill="#6b7688">개인 저장소(Fork)</text>
<circle cx="190" cy="310" r="18" fill="#fff" stroke="#2f7bff" stroke-width="2"/>
<g stroke="#2461d8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M186 316 l8 -8" fill="none"/><path d="M191 305 l4 4" fill="none"/><path d="M184 318 l1.6 -4 l2.6 2.6 z" fill="#2461d8" stroke="none"/></g>
<text x="190" y="346" text-anchor="middle" font-size="15.5" font-weight="700" fill="#16203a">글 작성</text>
<circle cx="190" cy="402" r="18" fill="#fff" stroke="#2f7bff" stroke-width="2"/>
<g fill="none" stroke="#2461d8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M184 396 h12"/><path d="M190 411 V401"/><path d="M186 405 L190 401 L194 405"/></g>
<text x="190" y="438" text-anchor="middle" font-size="15.5" font-weight="700" fill="#16203a">Pull Request 생성</text>
<text x="190" y="454" text-anchor="middle" font-size="12" fill="#6b7688">원본 저장소로 자동 생성</text>
<circle cx="190" cy="494" r="18" fill="url(#oaG)"/>
<path d="M184 494 L188.5 499 L196 488" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
<text x="190" y="530" text-anchor="middle" font-size="15.5" font-weight="700" fill="#16203a">운영자</text>
<text x="190" y="546" text-anchor="middle" font-size="12" fill="#6b7688">Review &amp; Merge</text>
</svg>
</figure>

운영 방식은 그대로 유지하면서도 참여자는 별도의 권한 요청 없이 기고할 수 있게 된 것입니다.

기술적으로는 단순한 기능이지만, 운영 관점에서는 권한 관리와 콘텐츠 생산성을 동시에 확보하는 구조라고 볼 수 있습니다.

---

## 작성자를 시스템이 아니라 사람으로 남기기

기술 블로그는 정보보다 신뢰가 중요합니다.

같은 내용이라도 누가 작성했는지가 드러나야 글의 맥락과 전문성이 함께 전달됩니다.

그래서 모든 글에는 `authorGithub` 정보를 함께 관리하도록 구성했습니다.

해당 정보가 존재하면 화면에서는 GitHub 프로필과 아바타를 자동으로 연결하고, 검색엔진과 AI 서비스에는 Person 메타데이터로 함께 제공됩니다.

덕분에 글은 단순한 Markdown 문서가 아니라 작성자와 함께 관리되는 지식 자산이 됩니다.

---

## 기술보다 중요한 것은 운영 구조

이번 작업의 목적은 CMS를 도입하는 것이 아니었습니다.

진짜 목적은 운영자가 개입하지 않아도 콘텐츠가 자연스럽게 축적되는 구조를 만드는 것이었습니다.

글 작성은 개인이 하지만, 리뷰는 팀이 수행하고, 배포는 자동화되며, 작성자의 이력은 시스템이 관리합니다.

결국 운영자는 콘텐츠를 대신 등록하는 사람이 아니라, 품질을 함께 다듬는 역할에 집중할 수 있습니다.

---

## 결국 남는 것은 문화다

기술은 참여의 장벽을 낮출 뿐입니다.

지속적으로 글이 쌓이는 블로그는 시스템만으로 만들어지지 않습니다.

좋은 아이디어가 사라지지 않도록 글감을 수집하고, 리뷰를 승인 절차가 아닌 함께 완성도를 높이는 과정으로 만들고, 작성자가 자신의 이름으로 기록을 남길 수 있도록 하는 문화가 함께 자리 잡아야 합니다.

이번 Open Authoring 적용은 새로운 기능을 붙인 사례라기보다, 기업 기술 블로그가 개인의 기록을 조직의 지식으로 축적하는 운영 구조를 설계한 첫 번째 단계였습니다.
