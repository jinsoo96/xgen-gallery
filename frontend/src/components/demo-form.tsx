"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/cn";

/* Localized copy — self-contained so the rest of i18n stays untouched. */
const COPY = {
    ko: {
        email: "회사 이메일",
        name: "성함",
        company: "회사",
        department: "부서",
        jobTitle: "직급",
        phone: "휴대전화번호",
        referral: "방문경로",
        referralPlaceholder: "선택해주세요",
        referralOptions: [
            "검색엔진 (구글, 네이버 등)",
            "지인 / 동료 추천",
            "광고",
            "SNS / 유튜브",
            "세미나 / 컨퍼런스",
            "기타",
        ],
        inquiry: "상담 내용",
        inquiryPlaceholder: "PoC 과제나 검토 중인 기술, 궁금한 점을 적어주세요.",
        agreePolicy: "[필수] 개인정보취급방침에 동의합니다",
        agreeCollect: "[필수] 개인정보 수집 및 이용 동의",
        agreeThird: "[필수] 제3자 정보제공 동의",
        agreeMarketing: "[선택] 마케팅 정보 수신 동의",
        submit: "상담 신청하기",
        submitting: "전송 중…",
        successTitle: "상담 신청이 접수되었습니다",
        successBody: "소중한 문의 감사합니다. 담당 연구원이 내용을 확인한 뒤 곧 연락드리겠습니다",
        successBadge: "영업일 1–2일 내 연락",
        successStepsTitle: "다음 단계",
        successSteps: [
            "접수하신 내용을 담당 연구원이 검토합니다",
            "영업일 1–2일 내 이메일 또는 전화로 연락드립니다",
            "과제에 맞는 PoC 범위와 일정을 함께 설계합니다",
        ],
        successSecondary: "AI 기술 둘러보기",
        again: "다시 신청하기",
        errRequired: "필수 항목입니다.",
        errEmail: "올바른 이메일 형식이 아닙니다.",
        errConsent: "필수 동의 항목입니다.",
        errSubmit: "전송에 실패했습니다. 잠시 후 다시 시도해주세요.",
    },
    en: {
        email: "Work email",
        name: "Full name",
        company: "Company",
        department: "Department",
        jobTitle: "Job title",
        phone: "Mobile phone",
        referral: "How did you hear about us?",
        referralPlaceholder: "Please select",
        referralOptions: [
            "Search engine",
            "Referral",
            "Advertisement",
            "Social media / YouTube",
            "Seminar / Conference",
            "Other",
        ],
        inquiry: "Consultation details",
        inquiryPlaceholder:
            "Describe your PoC scope, the tech you're evaluating, or any questions.",
        agreePolicy: "[Required] I agree to the Privacy Policy.",
        agreeCollect:
            "[Required] I consent to the collection and use of personal information.",
        agreeThird:
            "[Required] I consent to providing my information to third parties.",
        agreeMarketing: "[Optional] I agree to receive marketing communications.",
        submit: "Request consultation",
        submitting: "Submitting…",
        successTitle: "Request received",
        successBody: "Thank you for reaching out. A researcher will review your request and get back to you shortly",
        successBadge: "Reply within 1–2 business days",
        successStepsTitle: "What happens next",
        successSteps: [
            "A researcher reviews your request",
            "We reach out by email or phone within 1–2 business days",
            "We design the PoC scope and timeline together",
        ],
        successSecondary: "Explore our AI technology",
        again: "Submit another request",
        errRequired: "This field is required.",
        errEmail: "Please enter a valid email address.",
        errConsent: "Consent is required.",
        errSubmit: "Submission failed. Please try again in a moment.",
    },
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Fields = {
    email: string;
    name: string;
    company: string;
    department: string;
    jobTitle: string;
    phone: string;
    referralPath: string;
    inquiry: string;
    agreePrivacyPolicy: boolean;
    agreePrivacyCollect: boolean;
    agreeThirdParty: boolean;
    agreeMarketing: boolean;
};

const EMPTY: Fields = {
    email: "",
    name: "",
    company: "",
    department: "",
    jobTitle: "",
    phone: "",
    referralPath: "",
    inquiry: "",
    agreePrivacyPolicy: false,
    agreePrivacyCollect: false,
    agreeThirdParty: false,
    agreeMarketing: false,
};

const REQUIRED_TEXT = [
    "name",
    "company",
    "department",
    "jobTitle",
    "phone",
    "referralPath",
    "inquiry",
] as const;

const REQUIRED_CONSENTS = [
    "agreePrivacyPolicy",
    "agreePrivacyCollect",
    "agreeThirdParty",
] as const;

export function DemoForm() {
    const { locale } = useI18n();
    const c = COPY[locale === "en" ? "en" : "ko"];

    const [fields, setFields] = useState<Fields>(EMPTY);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
    const [submitError, setSubmitError] = useState<string | null>(null);

    const set = (k: keyof Fields, v: string | boolean) =>
        setFields((f) => ({ ...f, [k]: v }));

    const validate = (): boolean => {
        const e: Record<string, string> = {};
        REQUIRED_TEXT.forEach((k) => {
            if (!String(fields[k]).trim()) e[k] = c.errRequired;
        });
        if (!fields.email.trim()) e.email = c.errRequired;
        else if (!EMAIL_RE.test(fields.email)) e.email = c.errEmail;
        REQUIRED_CONSENTS.forEach((k) => {
            if (!fields[k]) e[k] = c.errConsent;
        });
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        setSubmitError(null);
        if (!validate()) return;
        setStatus("loading");
        try {
            const res = await fetch("/api/demo-request", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(fields),
            });
            if (!res.ok) throw new Error(String(res.status));
            setStatus("done");
        } catch {
            setStatus("idle");
            setSubmitError(c.errSubmit);
        }
    };

    if (status === "done") {
        return (
            <div className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white px-8 py-12 text-center shadow-xl">
                {/* 브랜드 그라데이션 상단 워시 — 흰 카드가 어두운 배경에 너무 도드라지지 않게 */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#2f7bff]/10 to-transparent"
                />

                <div className="relative">
                    {/* 그라데이션 체크 */}
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#2f7bff] to-[#7c5cff] shadow-[0_12px_30px_-8px_rgba(47,123,255,0.6)]">
                        <Check className="h-8 w-8 text-white" strokeWidth={3} />
                    </div>

                    <h2 className="mt-6 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                        {c.successTitle}
                    </h2>
                    <p className="mx-auto mt-2.5 max-w-md text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
                        {c.successBody}
                    </p>

                    {/* 응답 시간 배지 */}
                    <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#cfe0ff] bg-[#f3f7ff] px-3.5 py-1.5 text-[14px] font-semibold text-[#2461d8]">
                        <Clock className="h-3.5 w-3.5" />
                        {c.successBadge}
                    </span>

                    {/* 다음 단계 */}
                    <div className="mx-auto mt-8 max-w-sm rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-alt)] p-5 text-left">
                        <p className="text-[13px] font-bold uppercase tracking-wide text-[var(--color-ink-subtle)]">
                            {c.successStepsTitle}
                        </p>
                        <div className="mt-3 space-y-3">
                            {c.successSteps.map((s, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2f7bff] to-[#7c5cff] text-[13px] font-bold text-white">
                                        {i + 1}
                                    </span>
                                    <p className="text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                                        {s}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 액션 */}
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => {
                                setFields(EMPTY);
                                setErrors({});
                                setStatus("idle");
                            }}
                            className="inline-flex items-center justify-center rounded-full border border-[var(--color-line-strong)] px-5 py-2.5 text-[15px] font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-surface-alt)]"
                        >
                            {c.again}
                        </button>
                        <Link
                            href="/technology"
                            className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#2461d8] transition hover:text-[#1b4fb0]"
                        >
                            {c.successSecondary}
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-[var(--color-line)] bg-white p-7 shadow-xl sm:p-8"
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                    className="sm:col-span-2"
                    label={c.email}
                    type="email"
                    placeholder="name@company.com"
                    value={fields.email}
                    onChange={(v) => set("email", v)}
                    error={errors.email}
                />
                <Field
                    label={c.name}
                    value={fields.name}
                    onChange={(v) => set("name", v)}
                    error={errors.name}
                />
                <Field
                    label={c.phone}
                    type="tel"
                    placeholder="010-1234-5678"
                    value={fields.phone}
                    onChange={(v) => set("phone", v)}
                    error={errors.phone}
                />
                <Field
                    label={c.company}
                    value={fields.company}
                    onChange={(v) => set("company", v)}
                    error={errors.company}
                />
                <Field
                    label={c.department}
                    value={fields.department}
                    onChange={(v) => set("department", v)}
                    error={errors.department}
                />
                <Field
                    label={c.jobTitle}
                    value={fields.jobTitle}
                    onChange={(v) => set("jobTitle", v)}
                    error={errors.jobTitle}
                />
                <Select
                    label={c.referral}
                    placeholder={c.referralPlaceholder}
                    options={c.referralOptions}
                    value={fields.referralPath}
                    onChange={(v) => set("referralPath", v)}
                    error={errors.referralPath}
                />
                <Textarea
                    className="sm:col-span-2"
                    label={c.inquiry}
                    placeholder={c.inquiryPlaceholder}
                    value={fields.inquiry}
                    onChange={(v) => set("inquiry", v)}
                    error={errors.inquiry}
                />
            </div>

            <div className="mt-6 space-y-3 border-t border-[var(--color-line)] pt-5">
                <Consent
                    label={c.agreePolicy}
                    checked={fields.agreePrivacyPolicy}
                    onChange={(v) => set("agreePrivacyPolicy", v)}
                    error={errors.agreePrivacyPolicy}
                />
                <Consent
                    label={c.agreeCollect}
                    checked={fields.agreePrivacyCollect}
                    onChange={(v) => set("agreePrivacyCollect", v)}
                    error={errors.agreePrivacyCollect}
                />
                <Consent
                    label={c.agreeThird}
                    checked={fields.agreeThirdParty}
                    onChange={(v) => set("agreeThirdParty", v)}
                    error={errors.agreeThirdParty}
                />
                <Consent
                    label={c.agreeMarketing}
                    checked={fields.agreeMarketing}
                    onChange={(v) => set("agreeMarketing", v)}
                />
            </div>

            {submitError && (
                <p className="mt-4 text-[16px] text-red-600">{submitError}</p>
            )}

            <button
                type="submit"
                disabled={status === "loading"}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-ink)] px-5 py-3 text-[16px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
                {status === "loading" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {status === "loading" ? c.submitting : c.submit}
            </button>
        </form>
    );
}

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const FIELD_BASE =
    "w-full rounded-lg border bg-white px-3 py-2.5 text-[16px] text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-subtle)] focus:ring-2";

function fieldCls(error?: string) {
    return cn(
        FIELD_BASE,
        error
            ? "border-red-400 focus:ring-red-100"
            : "border-[var(--color-line)] focus:border-[var(--color-ink)] focus:ring-[var(--color-surface-hover)]",
    );
}

function Label({ label, className }: { label: string; className?: string }) {
    return (
        <span
            className={cn(
                "mb-1.5 block text-[14px] font-semibold text-[var(--color-ink)]",
                className,
            )}
        >
            {label} <span className="text-red-500">*</span>
        </span>
    );
}

function Field({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    error,
    className,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    error?: string;
    className?: string;
}) {
    return (
        <label className={cn("block", className)}>
            <Label label={label} />
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={fieldCls(error)}
            />
            {error && (
                <span className="mt-1 block text-[14px] text-red-600">{error}</span>
            )}
        </label>
    );
}

function Select({
    label,
    options,
    placeholder,
    value,
    onChange,
    error,
    className,
}: {
    label: string;
    options: readonly string[];
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    className?: string;
}) {
    return (
        <label className={cn("block", className)}>
            <Label label={label} />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(fieldCls(error), !value && "text-[var(--color-ink-subtle)]")}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((o) => (
                    <option key={o} value={o} className="text-[var(--color-ink)]">
                        {o}
                    </option>
                ))}
            </select>
            {error && (
                <span className="mt-1 block text-[14px] text-red-600">{error}</span>
            )}
        </label>
    );
}

function Textarea({
    label,
    value,
    onChange,
    placeholder,
    error,
    className,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    error?: string;
    className?: string;
}) {
    return (
        <label className={cn("block", className)}>
            <Label label={label} />
            <textarea
                value={value}
                placeholder={placeholder}
                rows={4}
                onChange={(e) => onChange(e.target.value)}
                className={cn(fieldCls(error), "resize-y")}
            />
            {error && (
                <span className="mt-1 block text-[14px] text-red-600">{error}</span>
            )}
        </label>
    );
}

function Consent({
    label,
    checked,
    onChange,
    error,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    error?: string;
}) {
    return (
        <label className="flex cursor-pointer items-start gap-2.5">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--color-line-strong)] accent-[var(--color-ink)]"
            />
            <span className="text-[15px] leading-snug text-[var(--color-ink-muted)]">
                {label}
                {error && <span className="ml-1 text-red-600">— {error}</span>}
            </span>
        </label>
    );
}
