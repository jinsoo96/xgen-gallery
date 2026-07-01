/**
 * Plateer Labs brand logo — renders the supplied image asset as-is
 * (public/brand-mark.png). Not modified.
 */
export function BrandMark({ className }: { className?: string }) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src="/plateer-logo.png"
            alt="Plateer Labs"
            className={className}
            style={{ objectFit: "contain" }}
        />
    );
}
