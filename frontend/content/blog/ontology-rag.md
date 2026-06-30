---
title: "Ontology RAG: 벡터를 넘어 관계로"
description: "유사도 기반 벡터 검색의 한계와, 데이터 간 관계를 따라 '맞는 사실'을 찾는 XGEN Ontology RAG의 차이를 정리합니다."
date: "2026-06-18"
author: "Plateer AI Labs"
category: "AILab Tech"
tags: ["Ontology", "RAG", "Knowledge Graph"]
draft: false
---

**한 줄 요약 —** 벡터는 '닮은 문장'을 찾고, 온톨로지는 '맞는 사실'을 따라갑니다. 문서가 많아질수록 벌어지는 답변 품질 격차의 해법입니다.

## 벡터 검색의 한계

벡터 RAG는 질문과 유사도가 높은 단편을 고정된 Top-K로 가져옵니다. 빠르지만 데이터가 따로 존재하면 원인·관계를 설명하지 못하고, 출처 추적도 약합니다.

## XGEN Ontology RAG

| 구분 | Vector RAG | XGEN Ontology RAG |
|---|---|---|
| 검색 | Pinned Top-K (고정) | Dynamic Top-k (적응형) |
| 탐색 | 유사도 단편 검색 | 관계 기반 사실 탐색 |
| 출처 | 약함 | 근거 경로 추적 |
| 저장 | Vector DB | Graph DB |

질문에서 출발해 의미·관계를 탐색하고 원인·맥락을 발견하므로, '무엇이 있는가'가 아니라 '왜 그런가'까지 답합니다. 자세한 기술은 [Technology](/technology#ontology)를 참고하세요.
