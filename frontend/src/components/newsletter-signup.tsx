"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

/**
 * 뉴스레터 구독 폼. 현재는 프론트 검증 + 접수 확인 상태까지 처리한다.
 * TODO: 실제 메일링 서비스(Stibee/Mailchimp/Substack 등) 또는 /api/newsletter 연동.
 */
export function NewsletterSignup() {
    const [email, setEmail] = useState("");
    const [done, setDone] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const value = email.trim();
        if (!value || !value.includes("@")) return;
        setDone(true);
    }

    if (done) {
        return (
            <div className="flex items-center gap-3 rounded-2xl border border-[#cce6d7] bg-[#ecf8f1] px-5 py-4">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1f9d57] text-white">
                    <Check className="h-5 w-5" />
                </span>
                <p className="text-[15.5px] font-medium text-[var(--color-ink)]">
                    구독 신청이 접수되었습니다. 확인 메일을 보내드리겠습니다
                </p>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
            <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소를 입력하세요"
                aria-label="이메일 주소"
                className="w-full flex-1 rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-[15.5px] text-[var(--color-ink)] outline-none transition focus:border-[#2f7bff] focus:ring-2 focus:ring-[#2f7bff]/20"
            />
            <button
                type="submit"
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[linear-gradient(45deg,#00acee_20%,#185aea_80%)] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_8px_24px_-6px_rgba(47,123,255,0.5)] transition hover:brightness-110"
            >
                구독하기
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
        </form>
    );
}
