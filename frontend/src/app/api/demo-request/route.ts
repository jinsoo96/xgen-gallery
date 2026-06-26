import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DemoRequest {
    email?: string;
    name?: string;
    company?: string;
    department?: string;
    jobTitle?: string;
    phone?: string;
    referralPath?: string;
    inquiry?: string;
    agreePrivacyPolicy?: boolean;
    agreePrivacyCollect?: boolean;
    agreeThirdParty?: boolean;
    agreeMarketing?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Receives an XGEN demo-trial request from the site modal. Validates required
 * fields, then forwards to DEMO_WEBHOOK_URL if configured (Slack/email/CRM),
 * otherwise logs server-side. Wire real delivery by setting the env var — no
 * code change needed.
 */
export async function POST(req: Request) {
    let body: DemoRequest;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const required: (keyof DemoRequest)[] = [
        "email",
        "name",
        "company",
        "department",
        "jobTitle",
        "phone",
        "referralPath",
        "inquiry",
    ];
    const missing = required.filter((k) => !String(body[k] ?? "").trim());
    if (missing.length > 0) {
        return NextResponse.json(
            { error: "Missing required fields", fields: missing },
            { status: 422 },
        );
    }
    if (!EMAIL_RE.test(String(body.email))) {
        return NextResponse.json(
            { error: "Invalid email", fields: ["email"] },
            { status: 422 },
        );
    }
    const requiredConsents: (keyof DemoRequest)[] = [
        "agreePrivacyPolicy",
        "agreePrivacyCollect",
        "agreeThirdParty",
    ];
    const missingConsent = requiredConsents.filter((k) => !body[k]);
    if (missingConsent.length > 0) {
        return NextResponse.json(
            { error: "Required consent missing", fields: missingConsent },
            { status: 422 },
        );
    }

    const record = {
        ...body,
        receivedAt: new Date().toISOString(),
        source: "gallery-site/demo-page",
    };

    const webhook = process.env.DEMO_WEBHOOK_URL;
    if (webhook) {
        try {
            await fetch(webhook, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(record),
            });
        } catch (e) {
            console.error("[demo-request] webhook forward failed:", e);
            return NextResponse.json(
                { error: "Delivery failed" },
                { status: 502 },
            );
        }
    } else {
        // No delivery target configured yet — log so it's not lost.
        console.log("[demo-request] received:", JSON.stringify(record));
    }

    return NextResponse.json({ ok: true });
}
