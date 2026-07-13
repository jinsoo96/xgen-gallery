"use client";

import { useState } from "react";
import { PlayCircle, Clapperboard, CalendarDays } from "lucide-react";

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
type Chapter = {
    time: string; // 표시용 타임스탬프 "MM:SS"
    sec: number; // 시작 초 — 클릭 시 해당 지점부터 재생
    label: string; // "주제 – 부제" 형식(부제는 " – "로 구분)
};

type Demo = {
    id: string; // 유튜브 videoId
    title: string;
    desc: string;
    uploadDate?: string; // YYYY-MM-DD
    featured?: boolean; // 대표 영상 — 그리드에서 더 크게(2열 span) 노출
    chapters?: Chapter[]; // 챕터(타임스탬프) — 클릭하면 해당 지점부터 재생
};

const DEMOS: Demo[] = [
    {
        id: "3vkbqk7b5WY",
        // 제목·설명은 유튜브 원본과 동일하게 유지한다.
        title: "XGEN 플랫폼 실증 데모 — 문서 업로드부터 AI 에이전트·품질검증까지 (4분)",
        desc: "XGEN 온톨로지 엔진으로 정책문서 11종을 지식그래프로 만들고, 시맨틱 검색·전표 심사 에이전트·노코드 챗봇·LLM Judge 품질평가까지 한 번에 시연합니다. 코딩 없이 90초 만에 에이전트를 생성하고 조립합니다",
        uploadDate: "2026-07-13",
        featured: true,
        chapters: [
            {
                time: "00:00",
                sec: 0,
                label: "인트로 · AI 지식 저장소 – 문서 업로드부터 지식그래프까지",
            },
            {
                time: "01:01",
                sec: 61,
                label: "시맨틱 검색 – 의미 기반 지식 탐색",
            },
            {
                time: "01:17",
                sec: 77,
                label: "전표 심사 AI Agent – 증빙 등록부터 자동 검증까지",
            },
            {
                time: "02:46",
                sec: 166,
                label: "대화형 AI 챗봇 – 노코드 조립부터 응답까지",
            },
            {
                time: "03:34",
                sec: 214,
                label: "AI 품질 평가 – 배치 테스트와 LLM Judge 자동 채점",
            },
            {
                time: "04:07",
                sec: 247,
                label: "XGEN Pathfinder – 레거시 시스템에 AI 연결 (API 자동 수집·호출)",
            },
        ],
    },
    {
        id: "4T7tT2nTXfw",
        title: "XGEN PathFinder BUILD",
        desc: "PathFinder는 기존 웹 시스템을 AI가 이해하고 사용할 수 있는 Agent Tool로 연결하는 브라우저 자동화 기술입니다.",
        uploadDate: "2026-07-03",
    },
    {
        id: "StxOW5PbC8w",
        title: "XGEN FloUI experience",
        desc: "FLOUI(Flow UI)는 사용자의 질문과 업무 흐름에 따라 화면이 스스로 구성되는 AI 기반 Adaptive UI 기술입니다.",
        uploadDate: "2026-07-02",
    },
];

function YouTubeFacade({
    demo,
    loaded,
    start,
    onPlay,
    fill,
}: {
    demo: Demo;
    loaded: boolean;
    start: number;
    onPlay: (sec: number) => void;
    fill?: boolean; // true면 카드 높이를 채우도록 썸네일을 늘린다(우측 스택 정렬용)
}) {
    // fill 모드: aspect-video 대신 부모 높이를 채워 캡션 아래 여백을 없앤다.
    const mediaClass = fill
        ? "h-full min-h-[240px] w-full flex-1"
        : "aspect-video w-full";

    if (!demo.id) {
        return (
            <div
                className={`flex ${mediaClass} flex-col items-center justify-center gap-2 bg-[var(--color-surface-alt)] text-[var(--color-ink-subtle)]`}
            >
                <Clapperboard className="h-7 w-7" />
                <span className="text-[13px] font-semibold">영상 준비중</span>
            </div>
        );
    }

    if (loaded) {
        return (
            <iframe
                className={mediaClass}
                src={`https://www.youtube-nocookie.com/embed/${demo.id}?autoplay=1&rel=0${
                    start ? `&start=${start}` : ""
                }`}
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
            onClick={() => onPlay(0)}
            aria-label={`${demo.title} 영상 재생`}
            className={`group relative flex ${mediaClass} items-center justify-center overflow-hidden bg-black`}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={`https://i.ytimg.com/vi/${demo.id}/${
                    demo.featured ? "maxresdefault" : "hqdefault"
                }.jpg`}
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

function DemoCard({ demo }: { demo: Demo }) {
    // 재생 상태를 카드 단위로 올려, 챕터 클릭 시 해당 지점부터 재생되게 한다.
    const [player, setPlayer] = useState({ loaded: false, start: 0 });
    const play = (sec: number) => setPlayer({ loaded: true, start: sec });

    return (
        <figure
            className={`overflow-hidden rounded-2xl bg-white${
                demo.featured
                    ? " border-2 border-[var(--color-line-strong)] shadow-sm md:col-span-2 lg:col-span-2 lg:row-span-2"
                    : " flex h-full flex-col border border-[var(--color-line)]"
            }`}
        >
            <YouTubeFacade
                demo={demo}
                loaded={player.loaded}
                start={player.start}
                onPlay={play}
                fill={!demo.featured}
            />
            <figcaption className="p-5">
                <h2 className="text-[16px] font-bold tracking-tight text-[var(--color-ink)]">
                    {demo.title}
                </h2>
                {demo.uploadDate && (
                    <p className="mt-2 flex items-center gap-1.5 text-[12px] text-[var(--color-ink-subtle)]">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <time dateTime={demo.uploadDate}>
                            {demo.uploadDate.replaceAll("-", ".")} 업로드
                        </time>
                    </p>
                )}
                <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
                    {demo.desc}
                </p>
                {demo.chapters && demo.chapters.length > 0 && (
                    <ul className="mt-4 border-t border-[var(--color-line)] pt-3">
                        {demo.chapters.map((c) => {
                            const [head, ...rest] = c.label.split(" – ");
                            const sub = rest.join(" – ");
                            return (
                                <li key={c.time}>
                                    <button
                                        type="button"
                                        onClick={() => play(c.sec)}
                                        className="group flex w-full items-baseline gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-[var(--color-surface-alt)]"
                                    >
                                        <span className="shrink-0 font-mono text-[13px] font-semibold tabular-nums text-[var(--color-accent)] group-hover:underline">
                                            {c.time}
                                        </span>
                                        <span className="text-[14px] leading-snug">
                                            <span className="font-semibold text-[var(--color-ink)]">
                                                {head}
                                            </span>
                                            {sub && (
                                                <span className="text-[var(--color-ink-subtle)]">
                                                    {" "}
                                                    – {sub}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </figcaption>
        </figure>
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
                    <DemoCard key={d.title} demo={d} />
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
