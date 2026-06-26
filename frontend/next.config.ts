import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
    output: 'standalone',
    outputFileTracingRoot: path.join(__dirname),
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
        ],
    },
    async redirects() {
        return [
            // 블로그를 /insights → /blog 로 이전 (SEO 손실 방지, 영구 리다이렉트).
            { source: '/insights', destination: '/blog', permanent: true },
        ];
    },
    async rewrites() {
        return [
            // Decap CMS 어드민 — public/admin/index.html 을 /admin 클린 URL로 서빙.
            { source: '/admin', destination: '/admin/index.html' },
        ];
    },
};

export default nextConfig;
