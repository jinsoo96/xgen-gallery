import { cn } from "@/lib/cn";

/**
 * 보안·거버넌스 페이지용 개념 일러스트 모음.
 * 외부 이미지 없이 인라인 SVG로 그려 사이트 톤(블루 #2f7bff·틸 #0f9d8f)에 맞춘다.
 * 각 컴포넌트는 부드러운 그라데이션 패널 안에 SVG를 담아 섹션 도입부 우측에 배치.
 */
function Panel({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-[var(--color-line)] bg-gradient-to-br from-[#f2f7ff] via-white to-[#eef8f5] p-5",
                className,
            )}
        >
            {children}
        </div>
    );
}

/** 다층 통제 — 겹겹이 쌓인 방패 레이어. */
export function LayeredControlArt({ className }: { className?: string }) {
    return (
        <Panel className={className}>
            <svg viewBox="0 0 320 200" fill="none" className="w-full" aria-hidden="true">
                <defs>
                    <linearGradient id="lc-shield" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor="#3b82f6" />
                        <stop offset="1" stopColor="#1b4fb0" />
                    </linearGradient>
                </defs>
                <circle cx="160" cy="100" r="80" fill="#dbeafe" opacity="0.5" />
                <rect x="96" y="70" width="150" height="96" rx="18" fill="#c9ddff" />
                <rect x="84" y="58" width="150" height="96" rx="18" fill="#e5eeff" />
                <rect
                    x="72"
                    y="46"
                    width="150"
                    height="96"
                    rx="18"
                    fill="#ffffff"
                    stroke="#cfe0ff"
                    strokeWidth="2"
                />
                <path
                    d="M147 58 l26 10 v20 c0 21 -14 33 -26 40 c-12 -7 -26 -19 -26 -40 v-20 z"
                    fill="url(#lc-shield)"
                />
                <path
                    d="M136 92 l8 8 l16 -18"
                    stroke="#ffffff"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle cx="236" cy="58" r="6" fill="#5eead4" />
                <circle cx="70" cy="150" r="5" fill="#93c5fd" />
            </svg>
        </Panel>
    );
}

/** 가드 모델 — 게이트에서 안전한 요청은 통과, 위험한 요청은 차단. */
export function GuardModelArt({ className }: { className?: string }) {
    return (
        <Panel className={className}>
            <svg viewBox="0 0 320 200" fill="none" className="w-full" aria-hidden="true">
                <defs>
                    <linearGradient id="gm-gate" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor="#3b82f6" />
                        <stop offset="1" stopColor="#1b4fb0" />
                    </linearGradient>
                </defs>
                <circle cx="160" cy="100" r="80" fill="#dbeafe" opacity="0.5" />
                {/* gate */}
                <rect x="150" y="42" width="14" height="116" rx="7" fill="url(#gm-gate)" />
                {/* row A — pass */}
                <rect x="34" y="58" width="46" height="22" rx="7" fill="#eff4ff" stroke="#cfe0ff" />
                <path d="M84 69 H148" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="2 4" />
                <path d="M166 69 H236" stroke="#0f9d8f" strokeWidth="2.5" />
                <circle cx="248" cy="69" r="12" fill="#0f9d8f" />
                <path
                    d="M242 69 l4 4 l8 -9"
                    stroke="#ffffff"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* row B — pass */}
                <rect x="34" y="90" width="46" height="22" rx="7" fill="#eff4ff" stroke="#cfe0ff" />
                <path d="M84 101 H148" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="2 4" />
                <path d="M166 101 H236" stroke="#0f9d8f" strokeWidth="2.5" />
                <circle cx="248" cy="101" r="12" fill="#0f9d8f" />
                <path
                    d="M242 101 l4 4 l8 -9"
                    stroke="#ffffff"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* row C — blocked */}
                <rect x="34" y="122" width="46" height="22" rx="7" fill="#fdeeee" stroke="#f6caca" />
                <path d="M84 133 H146" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="2 4" />
                <circle cx="157" cy="133" r="13" fill="#ef4444" />
                <path
                    d="M152 128 l10 10 M162 128 l-10 10"
                    stroke="#ffffff"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                />
            </svg>
        </Panel>
    );
}

/** 데이터 보호 — 문서 원문에서 개인정보를 마스킹, 자물쇠로 보호. */
export function DataProtectionArt({ className }: { className?: string }) {
    return (
        <Panel className={className}>
            <svg viewBox="0 0 320 200" fill="none" className="w-full" aria-hidden="true">
                <defs>
                    <linearGradient id="dp-lock" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor="#3b82f6" />
                        <stop offset="1" stopColor="#1b4fb0" />
                    </linearGradient>
                </defs>
                <circle cx="160" cy="100" r="80" fill="#dbeafe" opacity="0.5" />
                {/* document */}
                <rect
                    x="96"
                    y="32"
                    width="128"
                    height="136"
                    rx="12"
                    fill="#ffffff"
                    stroke="#cfe0ff"
                    strokeWidth="2"
                />
                {/* text lines / masked bars */}
                <rect x="112" y="52" width="84" height="8" rx="4" fill="#e2e8f0" />
                <rect x="112" y="72" width="58" height="8" rx="4" fill="#2f7bff" />
                <rect x="112" y="92" width="96" height="8" rx="4" fill="#e2e8f0" />
                <rect x="112" y="112" width="44" height="8" rx="4" fill="#2f7bff" />
                <rect x="166" y="112" width="42" height="8" rx="4" fill="#e2e8f0" />
                <rect x="112" y="132" width="72" height="8" rx="4" fill="#e2e8f0" />
                {/* lock badge */}
                <circle cx="206" cy="150" r="22" fill="url(#dp-lock)" />
                <rect x="196" y="147" width="20" height="15" rx="3" fill="#ffffff" />
                <path
                    d="M200 147 v-4 a6 6 0 0 1 12 0 v4"
                    stroke="#ffffff"
                    strokeWidth="2.6"
                    fill="none"
                />
                <circle cx="206" cy="154" r="2.4" fill="#1b4fb0" />
            </svg>
        </Panel>
    );
}

/** 감사 로그 — 통제 이벤트가 행 단위로 기록·검증. */
export function AuditLogArt({ className }: { className?: string }) {
    const rows = [
        { tag: "#2f7bff", y: 84 },
        { tag: "#0f9d8f", y: 106 },
        { tag: "#f5a623", y: 128 },
        { tag: "#60a5fa", y: 150 },
    ];
    return (
        <Panel className={className}>
            <svg viewBox="0 0 320 200" fill="none" className="w-full" aria-hidden="true">
                <circle cx="160" cy="100" r="80" fill="#dbeafe" opacity="0.5" />
                <rect
                    x="58"
                    y="40"
                    width="204"
                    height="126"
                    rx="14"
                    fill="#ffffff"
                    stroke="#cfe0ff"
                    strokeWidth="2"
                />
                <path d="M58 66 h204" stroke="#eef2fb" strokeWidth="2" />
                <circle cx="74" cy="53" r="4" fill="#cbd5e1" />
                <circle cx="88" cy="53" r="4" fill="#cbd5e1" />
                <rect x="196" y="49" width="52" height="8" rx="4" fill="#eef2fb" />
                {rows.map((r) => (
                    <g key={r.y}>
                        <rect x="74" y={r.y} width="28" height="12" rx="4" fill={r.tag} />
                        <rect
                            x="112"
                            y={r.y + 1}
                            width="96"
                            height="10"
                            rx="5"
                            fill="#e9eef7"
                        />
                        <circle cx="238" cy={r.y + 6} r="10" fill="#0f9d8f" />
                        <path
                            d={`M233 ${r.y + 6} l3.5 3.5 l7 -8`}
                            stroke="#ffffff"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </g>
                ))}
            </svg>
        </Panel>
    );
}

/** AI 위험도 등급 — 저·중·고·초고위험을 계기판으로 관리. */
export function RiskGaugeArt({ className }: { className?: string }) {
    return (
        <Panel className={className}>
            <svg viewBox="0 0 320 200" fill="none" className="w-full" aria-hidden="true">
                <circle cx="160" cy="112" r="80" fill="#dbeafe" opacity="0.45" />
                {/* gauge segments (semicircle, center 160,140 r70) */}
                <g strokeWidth="16" fill="none" strokeLinecap="round">
                    <path d="M90 140 A70 70 0 0 1 110.5 90.5" stroke="#0f9d8f" />
                    <path d="M110.5 90.5 A70 70 0 0 1 160 70" stroke="#3b82f6" />
                    <path d="M160 70 A70 70 0 0 1 209.5 90.5" stroke="#f5a623" />
                    <path d="M209.5 90.5 A70 70 0 0 1 230 140" stroke="#ef4444" />
                </g>
                {/* needle → 중~고 경계 방향 */}
                <path
                    d="M160 140 L182 92"
                    stroke="#1b4fb0"
                    strokeWidth="5"
                    strokeLinecap="round"
                />
                <circle cx="160" cy="140" r="9" fill="#1b4fb0" />
                <circle cx="160" cy="140" r="3.5" fill="#ffffff" />
                {/* legend dots */}
                <g>
                    <circle cx="96" cy="172" r="5" fill="#0f9d8f" />
                    <circle cx="139" cy="172" r="5" fill="#3b82f6" />
                    <circle cx="182" cy="172" r="5" fill="#f5a623" />
                    <circle cx="225" cy="172" r="5" fill="#ef4444" />
                </g>
            </svg>
        </Panel>
    );
}
