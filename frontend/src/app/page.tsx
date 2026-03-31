'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const XgenGallery = dynamic(
    () => import('@plateerlab/xgen-gallery').then(mod => mod.XgenGallery),
    { ssr: false }
);

const API_URL = process.env.NEXT_PUBLIC_GALLERY_API_URL || '';

function GalleryContent() {
    const searchParams = useSearchParams();
    const theme = searchParams.get('theme') === 'light' ? 'light' : 'dark';

    const containerStyle: React.CSSProperties = {
        minHeight: '100vh',
        background: theme === 'dark' ? '#0f172a' : '#f8fafc',
        color: theme === 'dark' ? '#fff' : '#1e293b',
    };

    const headerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.5rem 2rem',
        borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
    };

    const mainStyle: React.CSSProperties = {
        maxWidth: 1400,
        margin: '0 auto',
        padding: '2rem',
    };

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>
                    PLATEER Gallery
                </h1>
            </header>
            <main style={mainStyle}>
                <XgenGallery org="PlateerLab" theme={theme} apiBaseUrl={API_URL} />
            </main>
        </div>
    );
}

export default function Home() {
    return (
        <Suspense>
            <GalleryContent />
        </Suspense>
    );
}
