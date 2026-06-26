/**
 * Renders a schema.org JSON-LD <script> block. Server component — the markup
 * lands in the initial HTML so AI crawlers that don't execute JS still read it.
 * See docs/GEO-OPTIMIZATION-GUIDE.md §2.1.
 */
export function JsonLd({ data }: { data: object | object[] }) {
    return (
        <script
            type="application/ld+json"
            // schema.org payloads are our own trusted, non-user data.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
