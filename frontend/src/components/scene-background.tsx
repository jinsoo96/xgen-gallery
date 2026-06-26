import { getConcept, type ConceptId } from "@/lib/backgrounds";
import { cn } from "@/lib/cn";

/**
 * Full-bleed decorative background for a section/page, themed per menu concept
 * (deep base + two accent glows + subtle dotted grid). Place inside a
 * `relative overflow-hidden` parent; content goes in a sibling with `relative`.
 */
export function SceneBackground({
    concept = "home",
    className,
}: {
    concept?: ConceptId;
    className?: string;
}) {
    const c = getConcept(concept);
    return (
        <div
            aria-hidden
            className={cn(
                "pointer-events-none absolute inset-0 overflow-hidden",
                className,
            )}
            style={{ backgroundColor: c.base }}
        >
            <div
                className="absolute left-1/2 top-[-30%] h-[700px] w-[1100px] -translate-x-1/2 rounded-full blur-2xl"
                style={{
                    background: `radial-gradient(ellipse at center, ${c.glow1}, transparent 60%)`,
                }}
            />
            <div
                className="absolute bottom-[-25%] right-[-10%] h-[520px] w-[520px] rounded-full blur-3xl"
                style={{
                    background: `radial-gradient(circle, ${c.glow2}, transparent 65%)`,
                }}
            />
            <div
                className="absolute inset-0 opacity-[0.18]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                    maskImage:
                        "linear-gradient(to bottom, black 55%, transparent 100%)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, black 55%, transparent 100%)",
                }}
            />
        </div>
    );
}
