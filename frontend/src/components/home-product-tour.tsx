"use client";

import { useState } from "react";
import { PlayCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * 메인 — Applied AI 하위 "Product Tour" 섹션.
 * 탭(XGEN / MCP Apps / PathFinder / FloUI)으로 제품 소개영상을 전환한다.
 *
 * 성능: 파사드(facade) 패턴 — 처음에는 썸네일(poster) + 재생 버튼만 렌더하고,
 * 사용자가 클릭할 때만 실제 임베드(iframe)를 로드한다. 활성 탭 1개만 렌더하므로
 * 초기 페이지 로드 시 영상 플레이어 JS가 전혀 로드되지 않아 LCP에 영향이 없다.
 * 영상 추가 시 각 제품의 `video`(임베드 URL)와 `poster`(썸네일)만 채우면 된다.
 */
type Product = {
    key: string;
    name: string;
    tagline: string;
    desc: string;
    /** 임베드 URL (YouTube/Vimeo 등). null이면 준비 중 플레이스홀더. */
    video: string | null;
    /** 썸네일 이미지 URL. 없으면 그라데이션 배경 + 재생 버튼만 표시. */
    poster?: string | null;
};

const PRODUCTS: Product[] = [
    {
        key: "xgen",
        name: "XGEN",
        tagline: "Agentic AI Platform",
        desc: "노드 캔버스와 헤드리스 엔진 기반의 엔터프라이즈 AI 에이전트 런타임 — 플랫폼 전반을 영상으로 소개합니다",
        video: "https://www.youtube-nocookie.com/embed/x0Uch1b0kNk",
        poster: "https://img.youtube.com/vi/x0Uch1b0kNk/maxresdefault.jpg",
    },
    {
        key: "mcp",
        name: "MCP Apps",
        tagline: "MCP App Runtime",
        desc: "MCP(Model Context Protocol)로 외부 도구·시스템을 안전하게 연결하는 앱 런타임을 소개합니다",
        video: null,
        poster: null,
    },
    {
        key: "pathfinder",
        name: "PathFinder",
        tagline: "XGEN",
        desc: "XGEN의 PathFinder 기능을 영상으로 소개합니다",
        video: null,
        poster: null,
    },
    {
        key: "floui",
        name: "FloUI",
        tagline: "XGEN",
        desc: "XGEN의 FloUI 기능을 영상으로 소개합니다",
        video: "https://www.youtube-nocookie.com/embed/StxOW5PbC8w",
        poster: "https://img.youtube.com/vi/StxOW5PbC8w/maxresdefault.jpg",
    },
];

/** 임베드 URL에 autoplay 파라미터를 붙인다(클릭 후 자동 재생). */
function withAutoplay(url: string) {
    return url + (url.includes("?") ? "&" : "?") + "autoplay=1";
}

export function HomeProductTour() {
    const [activeKey, setActiveKey] = useState(PRODUCTS[0].key);
    const [playing, setPlaying] = useState(false);
    const active = PRODUCTS.find((p) => p.key === activeKey) ?? PRODUCTS[0];

    function selectTab(key: string) {
        setActiveKey(key);
        setPlaying(false); // 탭 전환 시 이전 영상을 언마운트해 리소스를 해제한다.
    }

    return (
        <section className="border-t border-white/10 bg-[#070b1c] text-white">
            <div className="mx-auto max-w-6xl px-6 py-28">
                <p className="font-mono text-[13px] uppercase tracking-widest text-white/45">
                    / Product Tour
                </p>
                <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                    제품을{" "}
                    <span className="bg-gradient-to-r from-[#00acee] to-[#5eead4] bg-clip-text text-transparent">
                        영상
                    </span>
                    으로 만나보세요
                </h2>
                <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/65">
                    XGEN과 핵심 제품의 주요 기능을 짧은 소개영상으로 확인할 수 있습니다
                </p>

                {/* 탭 메뉴 */}
                <div className="mt-10 flex flex-wrap gap-2">
                    {PRODUCTS.map((p) => (
                        <button
                            key={p.key}
                            type="button"
                            onClick={() => selectTab(p.key)}
                            aria-pressed={p.key === activeKey}
                            className={cn(
                                "rounded-full px-4 py-2 text-[15px] font-semibold transition",
                                p.key === activeKey
                                    ? "bg-white text-[#070b1c]"
                                    : "border border-white/20 text-white/70 hover:border-white/50 hover:text-white",
                            )}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>

                {/* 영상 패널 */}
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-stretch">
                    <div className="overflow-hidden rounded-2xl border border-white/12 bg-black/40">
                        <div className="aspect-video w-full">
                            {active.video ? (
                                playing ? (
                                    // 클릭 후에만 실제 플레이어를 로드한다.
                                    <iframe
                                        key={active.key}
                                        src={withAutoplay(active.video)}
                                        title={`${active.name} 소개영상`}
                                        className="h-full w-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    // 파사드 — 썸네일 + 재생 버튼(영상 플레이어 미로드).
                                    <button
                                        type="button"
                                        onClick={() => setPlaying(true)}
                                        aria-label={`${active.name} 소개영상 재생`}
                                        className="group relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#0b1230] to-[#0a0f24]"
                                    >
                                        {active.poster && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={active.poster}
                                                alt={`${active.name} 소개영상 썸네일`}
                                                loading="lazy"
                                                className="absolute inset-0 h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
                                            />
                                        )}
                                        <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[#070b1c] shadow-lg transition group-hover:scale-105">
                                            <PlayCircle className="h-9 w-9" />
                                        </span>
                                    </button>
                                )
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                                    <PlayCircle className="h-14 w-14 text-white/35" />
                                    <p className="text-[15px] font-medium text-white/55">
                                        {active.name} 소개영상 준비 중
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 설명 */}
                    <div className="flex flex-col justify-center rounded-2xl border border-white/12 bg-white/[0.03] p-7">
                        <p className="font-mono text-[12.5px] uppercase tracking-wider text-[#5eead4]">
                            {active.tagline}
                        </p>
                        <h3 className="mt-2 text-2xl font-bold tracking-tight">
                            {active.name}
                        </h3>
                        <p className="mt-3 text-[15.5px] leading-relaxed text-white/70">
                            {active.desc}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
