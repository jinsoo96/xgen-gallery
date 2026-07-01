import Link from "next/link";
import { BookOpen, FileText, ArrowRight } from "lucide-react";

/**
 * 메인 — Resources 미리보기.
 * Documentation·Release Notes는 '기술 자산'이라 아이콘 카드로,
 * Research Team은 기술 자산이 아니라 '사람'이므로 일러스트 배너 카드로 차별화한다.
 */
const ASSETS: {
    icon: typeof BookOpen;
    title: string;
    body: string;
    href: string;
}[] = [
    {
        icon: BookOpen,
        title: "Documentation",
        body: "XGEN 사용자 매뉴얼 — 플랫폼·라이브러리 가이드와 레퍼런스",
        href: "/documentation",
    },
    {
        icon: FileText,
        title: "Release Notes",
        body: "XGEN 플랫폼의 새 기능, 개선사항, 버그 수정 이력",
        href: "/releases",
    },
];

/** 한 사람(아바타) 실루엣 — 머리 + 어깨. */
function Person({ cx, color }: { cx: number; color: string }) {
    return (
        <g fill={color}>
            <circle cx={cx} cy={47} r={11} />
            <path d={`M${cx - 17} 86 q0 -22 17 -22 q17 0 17 22 Z`} />
        </g>
    );
}

/** Research Team 일러스트 — 사람 셋을 지식 네트워크로 연결. */
function TeamArt() {
    return (
        <svg
            viewBox="0 0 320 128"
            className="h-full w-auto"
            role="img"
            aria-label="연구 팀"
        >
            {/* 연결 네트워크 */}
            <g
                stroke="#bcd5f3"
                strokeWidth="1.6"
                fill="none"
                strokeLinecap="round"
            >
                <path d="M70 38 L116 22 L160 36" />
                <path d="M160 36 L204 22 L250 38" />
            </g>
            <g>
                <circle cx="116" cy="22" r="3.5" fill="#06b6d4" />
                <circle cx="204" cy="22" r="3.5" fill="#1f9d57" />
            </g>
            {/* 사람 셋 */}
            <Person cx={70} color="#2f7bff" />
            <Person cx={160} color="#06b6d4" />
            <Person cx={250} color="#1f9d57" />
        </svg>
    );
}

export function HomeResources() {
    return (
        <section className="border-t border-[var(--color-line)] bg-[var(--color-surface-alt)]">
            <div className="mx-auto max-w-6xl px-6 py-28">
                <p className="font-mono text-[13px] uppercase tracking-widest text-[var(--color-ink-subtle)]">
                    / Resources
                </p>
                <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                    연구소에서 제공하는{" "}
                    <span className="bg-gradient-to-r from-[#00acee] to-[#185aea] bg-clip-text text-transparent">
                        기술 자산
                    </span>
                </h2>
                <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--color-ink-muted)]">
                    Enterprise AI를 위한 기술 문서, 연구 성과, 릴리즈 노트를 한곳에서
                    확인하세요
                </p>

                <div className="mt-12 grid gap-4 md:grid-cols-3">
                    {/* 기술 자산 — 아이콘 카드 */}
                    {ASSETS.map((it) => (
                        <Link
                            key={it.title}
                            href={it.href}
                            className="group flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[var(--color-ink)]"
                        >
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#2f7bff]/10 text-[#2f7bff]">
                                <it.icon className="h-5 w-5" />
                            </span>
                            <h3 className="mt-4 text-[18px] font-bold tracking-tight text-[var(--color-ink)]">
                                {it.title}
                            </h3>
                            <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                                {it.body}
                            </p>
                            <span className="mt-auto inline-flex items-center gap-1 pt-5 text-[14px] font-medium text-[var(--color-ink)] transition group-hover:gap-2">
                                바로가기
                                <ArrowRight className="h-3 w-3" />
                            </span>
                        </Link>
                    ))}

                    {/* Research Team — 일러스트 배너 카드 (기술 자산 아님) */}
                    <Link
                        href="/members"
                        className="group flex flex-col overflow-hidden rounded-2xl bg-white transition hover:-translate-y-0.5"
                    >
                        <div className="flex h-32 items-center justify-center bg-gradient-to-br from-[#eef4fc] via-[#eafaf7] to-[#ecf8f1]">
                            <TeamArt />
                        </div>
                        <div className="flex flex-1 flex-col p-6">
                            <h3 className="text-[18px] font-bold tracking-tight text-[var(--color-ink)]">
                                Research Team
                            </h3>
                            <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                                Plateer Labs를 만드는 멤버들을 소개합니다
                            </p>
                            <span className="mt-auto inline-flex items-center gap-1 pt-5 text-[14px] font-medium text-[var(--color-ink)] transition group-hover:gap-2">
                                멤버 보러가기
                                <ArrowRight className="h-3 w-3" />
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </section>
    );
}
