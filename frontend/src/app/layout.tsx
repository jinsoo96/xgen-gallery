import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'PLATEER Gallery',
    description: 'PlateerLab Open Source Gallery & Playground',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body style={{ margin: 0, padding: 0 }}>
                {children}
            </body>
        </html>
    );
}
