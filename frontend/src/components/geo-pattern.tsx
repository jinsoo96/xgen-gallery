/**
 * Clean light-gray geometric background patterns (same family, multiple variants)
 * used behind banners/CTAs. Soft, line-free gradients/curves — no busy dots or
 * hard stripes. Render inside a `relative` parent; content in a sibling.
 */
export const GEO_VARIANTS = 4;

/** Deterministic, collision-free variant per page (clean visual variety). */
const VARIANT_BY_PATH: Record<string, number> = {
    "/research": 0,
    "/technology": 1,
    "/solutions": 2,
    "/insights": 3,
    "/resources": 3,
    "/architecture": 1,
    "/poc-projects": 2,
    "/members": 0,
    "/releases": 1,
    "/library-gallery": 2,
    "/documentation": 0,
};

export function variantForPath(pathname: string) {
    if (pathname in VARIANT_BY_PATH) return VARIANT_BY_PATH[pathname];
    const sum = [...pathname].reduce((a, c) => a + c.charCodeAt(0), 0);
    return sum % GEO_VARIANTS;
}

export function GeoPattern({
    variant = 0,
    className,
}: {
    variant?: number;
    className?: string;
}) {
    const v = ((variant % GEO_VARIANTS) + GEO_VARIANTS) % GEO_VARIANTS;
    const id = `geo${v}`;

    return (
        <svg
            aria-hidden
            viewBox="0 0 1400 260"
            preserveAspectRatio="xMidYMid slice"
            className={className}
        >
            <defs>
                <linearGradient id={`${id}-base`} x1="0" y1="0" x2="0.4" y2="1">
                    <stop offset="0" stopColor="#f3f5f8" />
                    <stop offset="1" stopColor="#e3e6ec" />
                </linearGradient>
            </defs>
            <rect width="1400" height="260" fill={`url(#${id}-base)`} />

            {/* variant 0 — subtle diagonal lines (left) + soft layered curves (right) */}
            {v === 0 && (
                <>
                    <ellipse cx="960" cy="470" rx="560" ry="360" fill="#dfe3ea" opacity="0.55" />
                    <ellipse cx="1180" cy="430" rx="540" ry="350" fill="#ffffff" opacity="0.6" />
                    <ellipse cx="1380" cy="420" rx="520" ry="350" fill="#e7eaf0" opacity="0.6" />
                    <g stroke="#ffffff" strokeWidth="2" opacity="0.85">
                        {Array.from({ length: 9 }).map((_, i) => {
                            const x = -70 + i * 32;
                            return <line key={i} x1={x} y1={290} x2={x + 300} y2={-30} />;
                        })}
                    </g>
                </>
            )}

            {/* variant 1 — soft airy blobs (clean, no lines) */}
            {v === 1 && (
                <>
                    <ellipse cx="1140" cy="40" rx="400" ry="250" fill="#ffffff" opacity="0.55" />
                    <ellipse cx="1360" cy="240" rx="440" ry="290" fill="#e6e9ef" opacity="0.6" />
                    <ellipse cx="180" cy="300" rx="380" ry="230" fill="#ffffff" opacity="0.4" />
                </>
            )}

            {/* variant 2 — soft diagonal sweep (clean, no lines) */}
            {v === 2 && (
                <g transform="rotate(-11 700 130)">
                    <ellipse cx="900" cy="40" rx="980" ry="120" fill="#ffffff" opacity="0.5" />
                    <ellipse cx="640" cy="200" rx="980" ry="120" fill="#e4e8ee" opacity="0.55" />
                    <ellipse cx="1000" cy="340" rx="980" ry="120" fill="#ffffff" opacity="0.4" />
                </g>
            )}

            {/* variant 3 — soft layered curves on the right (clean, no lines) */}
            {v === 3 && (
                <>
                    <ellipse cx="980" cy="-120" rx="560" ry="320" fill="#ffffff" opacity="0.5" />
                    <ellipse cx="1220" cy="420" rx="560" ry="360" fill="#e6e9ef" opacity="0.6" />
                    <ellipse cx="1380" cy="120" rx="440" ry="300" fill="#ffffff" opacity="0.5" />
                </>
            )}
        </svg>
    );
}
