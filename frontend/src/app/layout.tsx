import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
    title: "PlateerLab — Open-source AI building blocks",
    description:
        "Eight open-source libraries powering the XGEN platform. Try every tool in your browser.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="ko"
            className={`${GeistSans.variable} ${GeistMono.variable}`}
        >
            <body className="min-h-dvh bg-[var(--color-surface)] font-sans text-[var(--color-ink)] antialiased">
                {children}
            </body>
        </html>
    );
}
