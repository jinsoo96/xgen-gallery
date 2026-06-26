import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { MemberDetailView } from "@/components/member-detail";
import { JsonLd } from "@/components/json-ld";
import { getMemberDetail } from "@/lib/members/cache";
import { personLd, breadcrumbLd } from "@/lib/structured-data";

// Render at request time — see /members/page.tsx for rationale.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const LOGIN_RE = /^[a-zA-Z0-9-]{1,39}$/;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ login: string }>;
}): Promise<Metadata> {
    const { login } = await params;
    if (!LOGIN_RE.test(login)) return { title: "Member" };
    return {
        title: `@${login} — Member`,
        description: `GitHub profile, repositories, and stats for @${login} at Plateer AI Labs.`,
        alternates: { canonical: `/members/${login}` },
    };
}

export default async function MemberPage({
    params,
}: {
    params: Promise<{ login: string }>;
}) {
    const { login } = await params;
    if (!LOGIN_RE.test(login)) notFound();

    let detail;
    try {
        detail = await getMemberDetail(login);
    } catch (e) {
        console.error(`[/members/${login}] failed:`, e);
        notFound();
    }

    return (
        <>
            <JsonLd
                data={[
                    personLd(detail),
                    breadcrumbLd([
                        { name: "Home", path: "/" },
                        { name: "Members", path: "/members" },
                        {
                            name: detail.name || detail.login,
                            path: `/members/${detail.login}`,
                        },
                    ]),
                ]}
            />
            <SiteNav />
            <main className="mx-auto max-w-5xl px-6 pb-24 pt-14 md:pt-20">
                <MemberDetailView member={detail} />
            </main>
            <SiteFooter />
        </>
    );
}
