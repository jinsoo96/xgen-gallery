/**
 * 고객사 로고 마퀴 — 메인 히어로 동영상 위에 오버레이되는 하단 스트립.
 * 컬러 로고를 크게, 좌→우 자동 스크롤(algorithmlabs식). 끊김 없는 루프를 위해 목록 2회 렌더.
 * (로고는 x2bee 자사 제품 메인의 고객사 로고)
 */
const LOGOS = [
    { src: "/customers/lotte-card.png", alt: "롯데카드" },
    { src: "/customers/the-handsome.png", alt: "한섬 THE HANDSOME" },
    { src: "/customers/iscream-media.png", alt: "아이스크림미디어" },
    { src: "/customers/dongwon.png", alt: "동원홈푸드" },
    { src: "/customers/hyundai.png", alt: "현대" },
    { src: "/customers/olive-young.png", alt: "올리브영" },
    { src: "/customers/hankook.png", alt: "한국타이어" },
];

export function CustomerMarquee() {
    return (
        <div className="absolute inset-x-0 bottom-20 z-10 md:bottom-28">
            {/* 다크 동영상 위 오버레이 — 반투명 스크림 + 화이트 모노톤 로고 */}
            <div className="border-y border-white/10 bg-[#070b1c]/35 py-8 backdrop-blur-sm">
                <div className="[mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
                    <div className="marquee-track flex w-max items-center gap-24 pr-24 md:gap-40 md:pr-40">
                        {[...LOGOS, ...LOGOS].map((l, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={i}
                                src={l.src}
                                alt={l.alt}
                                loading="lazy"
                                className="h-12 w-auto shrink-0 object-contain opacity-70 brightness-0 invert transition duration-300 hover:opacity-100 md:h-14"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
