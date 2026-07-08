"use client";

import { useEffect } from "react";

/**
 * 콘텐츠 보호(디터런트) — 마우스 드래그 복사·우클릭·이미지 드래그 저장을 차단한다.
 * 검색·문의 폼 등 입력 필드는 예외로 두어 사용성을 유지한다.
 *
 * ⚠️ 클라이언트 측 보호는 완전한 방어가 아니라 억제 수단이다. 개발자도구·소스보기·
 *    자바스크립트 비활성화·화면 캡처로 우회 가능하다.
 *
 * 운영(리모트)에서만 동작한다 — 개발 서버(next dev, NODE_ENV=development)에서는
 * 마우스 드래그 선택·복사·우클릭이 정상적으로 가능하도록 리스너를 붙이지 않는다.
 */
export function ContentGuard() {
    useEffect(() => {
        if (process.env.NODE_ENV !== "production") return;
        const isField = (el: EventTarget | null) => {
            const n = el as HTMLElement | null;
            return (
                !!n &&
                (n.tagName === "INPUT" ||
                    n.tagName === "TEXTAREA" ||
                    n.isContentEditable)
            );
        };
        const onCopyCut = (e: ClipboardEvent) => {
            if (!isField(document.activeElement)) e.preventDefault();
        };
        const onContext = (e: MouseEvent) => {
            if (!isField(e.target)) e.preventDefault();
        };
        const onDrag = (e: DragEvent) => {
            const t = e.target as HTMLElement | null;
            if (t?.tagName === "IMG") e.preventDefault();
        };
        document.addEventListener("copy", onCopyCut);
        document.addEventListener("cut", onCopyCut);
        document.addEventListener("contextmenu", onContext);
        document.addEventListener("dragstart", onDrag);
        return () => {
            document.removeEventListener("copy", onCopyCut);
            document.removeEventListener("cut", onCopyCut);
            document.removeEventListener("contextmenu", onContext);
            document.removeEventListener("dragstart", onDrag);
        };
    }, []);

    return null;
}
