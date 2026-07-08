import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { cookies } from "next/headers";
import { SITE } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { organizationLd, websiteLd } from "@/lib/structured-data";
import { I18nProvider } from "@/components/i18n-provider";
import { StickyCta } from "@/components/sticky-cta";
import { ContentGuard } from "@/components/content-guard";
import { GoogleAnalytics } from "@/components/google-analytics";
import { LOCALE_COOKIE, DEFAULT_LOCALE, isLocale } from "@/lib/i18n";

export const metadata: Metadata = {
    metadataBase: new URL(SITE.url),
    title: {
        default: `${SITE.name} — Open-source AI building blocks`,
        template: `%s · ${SITE.name}`,
    },
    description: SITE.description,
    applicationName: SITE.name,
    keywords: [
        "Plateer Labs",
        "XGEN",
        "open-source AI",
        "RAG",
        "AI agent",
        "knowledge graph",
        "document ingestion",
        "Contextifier",
        "Synaptic Memory",
        "Googer",
    ],
    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    publisher: SITE.name,
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        siteName: SITE.name,
        title: `${SITE.name} — Open-source AI building blocks`,
        description: SITE.description,
        url: SITE.url,
        locale: SITE.locale,
        images: [{ url: SITE.ogImage }],
    },
    twitter: {
        card: "summary_large_image",
        title: `${SITE.name} — Open-source AI building blocks`,
        description: SITE.description,
        images: [SITE.ogImage],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
};

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const raw = cookieStore.get(LOCALE_COOKIE)?.value;
    const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

    return (
        <html
            lang={locale}
            className={`${GeistSans.variable} ${GeistMono.variable}`}
        >
            <head>
                {/* Google Analytics — 모든 페이지 공통(한 곳에서 관리) */}
                <GoogleAnalytics />
                {/* Pretendard (same font as konantech) — self-hosted variable
                    woff2, preloaded so it renders as early as possible. */}
                <link
                    rel="preload"
                    href="/fonts/PretendardVariable.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                />
            </head>
            <body
                data-guard={
                    process.env.NODE_ENV === "production" ? "on" : undefined
                }
                className="min-h-dvh bg-[var(--color-surface)] font-sans text-[var(--color-ink)] antialiased"
            >
                <JsonLd data={[organizationLd(), websiteLd()]} />
                <I18nProvider initialLocale={locale}>
                    {children}
                    <StickyCta />
                </I18nProvider>
                <ContentGuard />
            </body>
        </html>
    );
}
