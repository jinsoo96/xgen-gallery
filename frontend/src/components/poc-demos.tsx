"use client";

import { useState } from "react";
import { PlayCircle, Clapperboard } from "lucide-react";

/**
 * 실증 데모(Proof in Action) — XGEN 기능이 실제로 동작하는 모습을 영상으로 보여준다.
 * 성능을 주장하는 대신 증명한다는 연구소 톤의 연장. 독립 페이지(/proof-in-action)의
 * 본문으로 사용된다(페이지 히어로가 제목·소개를 담당하므로 여기선 그리드만 렌더).
 *
 * ▶ 영상 추가/교체는 아래 DEMOS의 `id`(유튜브 11자리 videoId)만 채우면 된다.
 *   `uploadDate`(YYYY-MM-DD)는 있으면 VideoObject JSON-LD에 포함(GEO·SEO), 없으면 생략.
 * ▶ 임베드는 youtube-nocookie + 썸네일 파사드(클릭 시 로드)로, 페이지 진입만으로
 *   유튜브 스크립트가 로드되지 않게 한다.
 */
type Demo = {
    id: string; // 유튜브 videoId
    title: string;
    desc: string;
    uploadDate?: string; // YYYY-MM-DD
};

const DEMOS: Demo[] = [
    {
        id: "x0Uch1b0kNk",
        title: "XGEN 소개영상",
        desc: "XGEN Agentic AI 플랫폼의 전체 그림을 짧게 살펴봅니다",
    },
    {
        id: "4T7tT2nTXfw",
        title: "XGEN PathFinder BUILD",
        desc: "자연어 요구사항에서 실행 가능한 워크플로우를 만들어내는 과정",
    },
    {
        id: "StxOW5PbC8w",
        title: "XGEN FloUI experience",
        desc: "에이전트 실행 흐름을 시각적으로 조립하고 검증하는 경험",
    },
];

function YouTubeFacade({ demo }: { demo: Demo }) {
    const [loaded, setLoaded] = useState(false);

    if (!demo.id) {
        return (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-[var(--color-surface-alt)] text-[var(--color-ink-subtle)]">
                <Clapperboard className="h-7 w-7" />
                <span className="text-[13px] font-semibold">영상 준비중</span>
            </div>
        );
    }

    if (loaded) {
        return (
            <iframe
                className="aspect-video w-full"
                src={`https://www.youtube-nocookie.com/embed/${demo.id}?autoplay=1&rel=0`}
                title={demo.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        );
    }

    return (
        <button
            type="button"
            onClick={() => setLoaded(true)}
            aria-label={`${demo.title} 영상 재생`}
            className="group relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={`https://i.ytimg.com/vi/${demo.id}/hqdefault.jpg`}
                alt={`${demo.title} 썸네일`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-85 transition group-hover:opacity-100"
            />
            <span className="relative z-10 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#070b1c] shadow-lg transition group-hover:scale-105">
                <PlayCircle className="h-9 w-9" />
            </span>
        </button>
    );
}

export function PocDemos() {
    const jsonLd = DEMOS.filter((d) => d.id).map((d) => ({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: d.title,
        description: d.desc,
        // uploadDate는 있을 때만 포함(정확한 값이 없으면 생략 — 부정확한 날짜보다 안전)
        ...(d.uploadDate ? { uploadDate: d.uploadDate } : {}),
        thumbnailUrl: [`https://i.ytimg.com/vi/${d.id}/hqdefault.jpg`],
        embedUrl: `https://www.youtube-nocookie.com/embed/${d.id}`,
        contentUrl: `https://www.youtube.com/watch?v=${d.id}`,
        publisher: { "@type": "Organization", name: "Plateer Labs" },
    }));

    return (
        <div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {DEMOS.map((d) => (
                    <figure
                        key={d.title}
                        className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white"
                    >
                        <YouTubeFacade demo={d} />
                        <figcaption className="p-5">
                            <h2 className="text-[16px] font-bold tracking-tight text-[var(--color-ink)]">
                                {d.title}
                            </h2>
                            <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
                                {d.desc}
                            </p>
                        </figcaption>
                    </figure>
                ))}
            </div>

            {jsonLd.length > 0 && (
                <script
                    type="application/ld+json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
        </div>
    );
}
