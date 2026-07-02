import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Newsletter subscribe. Mirrors the demo-request flow: validate the email,
 * then forward to NEWSLETTER_WEBHOOK_URL (a Google Apps Script / Zapier
 * endpoint that appends to a *separate* Google Sheet and sends the mailing).
 * Set that env var to wire real delivery — no code change needed. Without it,
 * submissions are logged server-side so they're not lost.
 */
export async function POST(req: Request) {
    let body: { email?: string; subscribe?: boolean };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const email = String(body.email ?? "").trim();
    if (!EMAIL_RE.test(email)) {
        return NextResponse.json(
            { error: "Invalid email", fields: ["email"] },
            { status: 422 },
        );
    }

    // 구독=Y / 해지=N. 시트에서 이메일 행을 찾아 이 값으로 갱신하도록 웹훅에 전달.
    const subscribe = body.subscribe !== false; // default: subscribe
    const record = {
        email,
        subscribed: subscribe ? "Y" : "N",
        receivedAt: new Date().toISOString(),
        source: "gallery-site/newsletter",
    };

    const webhook = process.env.NEWSLETTER_WEBHOOK_URL;
    if (webhook) {
        try {
            await fetch(webhook, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(record),
            });
        } catch (e) {
            console.error("[newsletter] webhook forward failed:", e);
            return NextResponse.json(
                { error: "Delivery failed" },
                { status: 502 },
            );
        }
    } else {
        // No delivery target configured yet — log so it's not lost.
        console.log("[newsletter] received:", JSON.stringify(record));
    }

    return NextResponse.json({ ok: true });
}
