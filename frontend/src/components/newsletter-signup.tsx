"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * 뉴스레터 구독/해지 폼. 이메일을 /api/newsletter 로 전송하면, 서버가 별도 구글
 * 시트에 저장(구독=Y / 해지=N)하고 메일링을 처리한다(NEWSLETTER_WEBHOOK_URL).
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "submitting" | "done" | "error";

export function NewsletterSignup() {
    const [email, setEmail] = useState("");
    const [mode, setMode] = useState<"subscribe" | "unsubscribe">("subscribe");
    const [status, setStatus] = useState<Status>("idle");

    const subscribing = mode === "subscribe";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const value = email.trim();
        if (!EMAIL_RE.test(value)) {
            setStatus("error");
            return;
        }
        setStatus("submitting");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email: value, subscribe: subscribing }),
            });
            if (!res.ok) throw new Error("request failed");
            setStatus("done");
        } catch {
            setStatus("error");
        }
    }

    if (status === "done") {
        return (
            <div className="flex items-center gap-3 rounded-2xl border border-[#cce6d7] bg-[#ecf8f1] px-5 py-4">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1f9d57] text-white">
                    <Check className="h-5 w-5" />
                </span>
                <p className="text-[15.5px] font-medium text-[var(--color-ink)]">
                    {subscribing
                        ? "구독 신청이 접수되었습니다. 확인 메일을 보내드리겠습니다"
                        : "구독이 해지되었습니다. 그동안 함께해 주셔서 감사합니다"}
                </p>
            </div>
        );
    }

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                    }}
                    placeholder="이메일 주소를 입력하세요"
                    aria-label="이메일 주소"
                    disabled={status === "submitting"}
                    className="w-full flex-1 rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-[15.5px] text-[var(--color-ink)] outline-none transition focus:border-[#2f7bff] focus:ring-2 focus:ring-[#2f7bff]/20 disabled:opacity-60"
                />
                <button
                    type="submit"
                    disabled={status === "submitting"}
                    className={cn(
                        "group inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition disabled:opacity-60",
                        subscribing
                            ? "bg-[linear-gradient(45deg,#00acee_20%,#185aea_80%)] text-white shadow-[0_8px_24px_-6px_rgba(47,123,255,0.5)] hover:brightness-110"
                            : "border border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:border-[var(--color-ink)]",
                    )}
                >
                    {status === "submitting"
                        ? "처리 중…"
                        : subscribing
                          ? "구독하기"
                          : "구독 해지"}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </button>
            </form>

            {status === "error" && (
                <p className="mt-2 text-[13.5px] text-[#d33]">
                    이메일 주소를 확인하거나 잠시 후 다시 시도해 주세요
                </p>
            )}

            <button
                type="button"
                onClick={() => {
                    setMode(subscribing ? "unsubscribe" : "subscribe");
                    setStatus("idle");
                }}
                className="mt-3 text-[13.5px] text-[var(--color-ink-subtle)] underline underline-offset-2 transition hover:text-[var(--color-ink-muted)]"
            >
                {subscribing ? "구독을 해지하시겠어요?" : "다시 구독하기"}
            </button>
        </div>
    );
}
