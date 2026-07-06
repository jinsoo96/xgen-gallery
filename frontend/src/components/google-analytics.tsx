import Script from "next/script";

/**
 * Google Analytics (gtag.js) — GA4 태그를 한 곳에서 관리한다.
 * 루트 레이아웃(app/layout.tsx)의 <head>에 한 번만 렌더되어 모든 페이지에
 * 자동 적용된다(페이지당 1개). 측정 ID를 바꾸려면 아래 GA_ID만 수정하면 된다.
 *
 * next/script 의 afterInteractive 전략으로 하이드레이션 이후 비동기 로드한다.
 */
const GA_ID = "G-TSE0FC0VCQ";

export function GoogleAnalytics() {
    return (
        <>
            {/* Google tag (gtag.js) */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
                {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
        </>
    );
}
