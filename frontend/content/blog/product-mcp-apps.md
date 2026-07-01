---
title: "MCP Apps — 한 번 만들고 어디서나 실행"
description: "엔진을 감싸는 Wrapper 방식을 넘어, SDK로 워크플로우·정책을 코드에 담아 독립 MCP 서버로 내보내는 MCP Apps를 소개합니다."
date: "2026-06-21"
author: "Plateer Labs"
category: "제품 소식"
tags: ["MCP Apps", "독립", "제품"]
draft: false
---

**한 줄 요약 —** 대부분의 플랫폼은 엔진을 '감싸는' 데 그치지만, XGEN은 엔진 자체를 코드 안에 '담아'냅니다.

## 무엇이 다른가

- **Wrapper 방식** — 엔진을 내부에 상시 구동하고 MCP로 겉면만 래핑 → 플랫폼 종속 MCP 서버
- **Compiler 방식 (XGEN)** — SDK로 워크플로우·정책을 표준 프로세스 코드로 내재화 → 독립 MCP 서버 패키지(Node · Python)

## 왜 중요한가

특정 플랫폼에 종속되지 않고 표준 생태계(PyPI·npm) 위에서 어디서나 수정·실행·연결됩니다. 한 번 만든 Agent를 환경이 바뀌어도 그대로 재사용합니다. 자세히는 [Technology](/technology#mcp-apps)에서 확인하세요.
