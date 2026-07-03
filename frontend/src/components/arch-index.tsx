"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * 아키텍처 페이지 스티키 인덱스(목차).
 * 스크롤 위치(IntersectionObserver)로 현재 보고 있는 섹션을 추적해 활성 링크의
 * 컬러를 바꾼다. 링크 클릭 시 해당 섹션으로 이동 → 그 섹션이 활성화되어 강조된다.
 */
export function ArchIndex({
    sections,
}: {
    sections: { id: string; label: string }[];
}) {
    const [active, setActive] = useState(sections[0]?.id ?? "");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top,
                    );
                if (visible[0]) setActive(visible[0].target.id);
            },
            // 상단 스티키(nav+index ≈ 140px) 아래로 들어온 섹션을 활성으로 판정.
            { rootMargin: "-150px 0px -55% 0px", threshold: 0 },
        );
        sections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [sections]);

    return (
        <nav className="sticky top-[84px] z-30 border-b border-[var(--color-line)] bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 py-3">
                {sections.map((s) => (
                    <a
                        key={s.id}
                        href={`#${s.id}`}
                        onClick={() => setActive(s.id)}
                        aria-current={active === s.id ? "true" : undefined}
                        className={cn(
                            "whitespace-nowrap rounded-full px-3.5 py-1.5 text-[14px] font-semibold transition",
                            active === s.id
                                ? "bg-[#2f7bff]/12 text-[#2461d8]"
                                : "font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-ink)]",
                        )}
                    >
                        {s.label}
                    </a>
                ))}
            </div>
        </nav>
    );
}
