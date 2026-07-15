"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, Check, ChevronDown, Flame } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * 플로팅 구독 위젯 — 경로에 따라 종류(kind)가 달라진다.
 *  - /newsletter : 뉴스레터 구독(격주 발행 아카이브 구독)
 *  - /blog       : 블로그 구독(새 글 알림)
 * 둘은 성격이 다르므로 카피가 바뀌고, /api/newsletter 로 kind 구분값을 함께 보낸다.
 * (전역 기술상담 배너 StickyCta는 이 경로들에서 숨김 — sticky-cta.tsx 참고)
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CLOSED_PREFIX = "ailabs-subscribe-cta-closed:";

type Kind = "newsletter" | "blog";
type Status = "idle" | "submitting" | "done" | "error";

const CONFIG: Record<
    Kind,
    {
        pill: string;
        title: React.ReactNode;
        desc: string;
        doneDesc: string;
    }
> = {
    newsletter: {
        pill: "뉴스레터 구독하기",
        title: (
            <>
                격주로 도착하는{" "}
                <span className="text-[#2461d8]">XGEN·AI 소식</span>을 받아보세요
            </>
        ),
        desc: "제품 릴리스·기술 뉴스·논문까지, 연구소가 큐레이션해 한 번에 정리해 드립니다",
        doneDesc: "다음 호가 나오면 메일로 가장 먼저 보내드릴게요",
    },
    blog: {
        pill: "블로그 구독하기",
        title: (
            <>
                새 글이 올라오면 <span className="text-[#2461d8]">가장 먼저</span>{" "}
                받아보세요
            </>
        ),
        desc: "Tech Note·제품 소식·Case Study, 플래티어랩의 새 인사이트를 메일로 알려드립니다",
        doneDesc: "새 글이 올라오면 메일로 알려드릴게요",
    },
};

export function SubscribeCta() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [agree, setAgree] = useState(false);
    const [status, setStatus] = useState<Status>("idle");

    const kind: Kind | null = pathname.startsWith("/newsletter")
        ? "newsletter"
        : pathname === "/blog" || pathname.startsWith("/blog/")
          ? "blog"
          : null;

    useEffect(() => {
        setMounted(true);
        if (!kind) return;
        // 사용자가 한 번 접었으면 접힌 채 시작, 아니면 잠시 뒤 자동으로 펼쳐 안내한다.
        if (localStorage.getItem(`${CLOSED_PREFIX}${kind}`) === "1") return;
        const t = setTimeout(() => setOpen(true), 900);
        return () => clearTimeout(t);
    }, [kind]);

    if (!mounted || !kind) return null;

    const cfg = CONFIG[kind];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const value = email.trim();
        if (!EMAIL_RE.test(value) || !agree) {
            setStatus("error");
            return;
        }
        setStatus("submitting");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email: value, subscribe: true, kind }),
            });
            if (!res.ok) throw new Error("request failed");
            setStatus("done");
        } catch {
            setStatus("error");
        }
    }

    function collapse() {
        setOpen(false);
        localStorage.setItem(`${CLOSED_PREFIX}${kind}`, "1");
    }

    return (
        <div className="fixed bottom-5 right-5 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col items-end gap-3">
            {open && (
                <div className="cta-enter w-full overflow-hidden rounded-3xl border border-[var(--color-line)] bg-white shadow-[0_24px_60px_-14px_rgba(20,40,80,0.32)]">
                    {status === "done" ? (
                        <div className="flex flex-col items-center gap-3 px-7 py-9 text-center">
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1f9d57] text-white">
                                <Check className="h-6 w-6" />
                            </span>
                            <p className="text-[16.5px] font-bold text-[var(--color-ink)]">
                                구독 신청이 접수되었습니다
                            </p>
                            <p className="text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
                                {cfg.doneDesc}
                            </p>
                            <button
                                type="button"
                                onClick={collapse}
                                className="mt-1 text-[13.5px] font-semibold text-[#2461d8] transition hover:text-[#1b4fb0]"
                            >
                                닫기
                            </button>
                        </div>
                    ) : (
                        <div className="px-6 pb-6 pt-5">
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-[17.5px] font-bold leading-snug tracking-tight text-[var(--color-ink)]">
                                    {cfg.title}
                                </p>
                                <button
                                    type="button"
                                    onClick={collapse}
                                    aria-label="접기"
                                    className="-mr-1.5 -mt-1 rounded-full p-1.5 text-[var(--color-ink-subtle)] transition hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-ink)]"
                                >
                                    <ChevronDown className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
                                {cfg.desc}
                            </p>

                            <form onSubmit={handleSubmit} className="mt-4">
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
                                    className="w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-[15px] text-[var(--color-ink)] outline-none transition focus:border-[#2f7bff] focus:ring-2 focus:ring-[#2f7bff]/20 disabled:opacity-60"
                                />

                                <label className="mt-3 flex cursor-pointer items-center gap-2 text-[13.5px] text-[var(--color-ink-muted)]">
                                    <input
                                        type="checkbox"
                                        checked={agree}
                                        onChange={(e) => {
                                            setAgree(e.target.checked);
                                            if (status === "error")
                                                setStatus("idle");
                                        }}
                                        className="h-4 w-4 rounded border-[var(--color-line-strong)] accent-[#2f7bff]"
                                    />
                                    <span>
                                        개인정보 수집·이용에 동의합니다{" "}
                                        <span className="text-[var(--color-ink-subtle)]">
                                            (필수)
                                        </span>
                                    </span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={status === "submitting"}
                                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(45deg,#00acee_20%,#185aea_80%)] px-4 py-3 text-[15px] font-semibold text-white shadow-[0_8px_24px_-6px_rgba(47,123,255,0.5)] transition hover:brightness-110 disabled:opacity-60"
                                >
                                    {status === "submitting"
                                        ? "처리 중…"
                                        : "무료로 구독하기"}
                                </button>

                                {status === "error" && (
                                    <p className="mt-2 text-[13px] text-[#d33]">
                                        이메일 주소와 필수 동의를 확인해 주세요
                                    </p>
                                )}
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* 하단 컨트롤: 맨 위로 + 구독 토글 알약 */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    aria-label="맨 위로"
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-ink-muted)] shadow-[0_8px_24px_-10px_rgba(20,40,80,0.4)] transition hover:text-[var(--color-ink)]"
                >
                    <ArrowUp className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full border bg-white px-5 py-3 text-[15px] font-bold shadow-[0_8px_24px_-8px_rgba(20,40,80,0.4)] transition",
                        open
                            ? "border-[var(--color-line)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                            : "border-[#c7d9ff] text-[#2461d8] hover:border-[#2f7bff]",
                    )}
                >
                    <Flame className="h-4 w-4 text-[#ff7a3d]" />
                    {cfg.pill}
                </button>
            </div>
        </div>
    );
}
