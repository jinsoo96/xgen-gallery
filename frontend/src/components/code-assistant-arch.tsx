import {
    User,
    Server,
    Boxes,
    Search,
    Sparkles,
    Database,
    Network,
    Code2,
    ChevronDown,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * 코드 어시스턴트 아키텍처 (공개-안전 버전).
 * 자연어 질문/코드 검색 요청이 API 서버를 거쳐 ① 인덱싱 ② 하이브리드 검색
 * ③ AI 재정렬·답변으로 분기되고, 각 저장소를 거쳐 통합 결과로 수렴하는 흐름.
 * 색 의미 — 파랑: 입출력 노드 / 흰색: 처리 단계 / 초록: 데이터 저장소.
 */

const LINE = "#c2cdee";

type Step = {
    n: number;
    icon: LucideIcon;
    title: string;
    sub: string;
    points: string[];
    db: { icon: LucideIcon; name: string; tag: string; note?: string };
};

const STEPS: Step[] = [
    {
        n: 1,
        icon: Boxes,
        title: "인덱싱 파이프라인",
        sub: "배치",
        points: ["소스 코드 수집 · 전처리", "인덱싱 · 임베딩"],
        db: { icon: Database, name: "Vector DB", tag: "Qdrant" },
    },
    {
        n: 2,
        icon: Search,
        title: "하이브리드 검색",
        sub: "키워드 + 벡터",
        points: ["키워드 검색 (BM25)", "벡터 유사도 검색"],
        db: { icon: Database, name: "키워드 인덱스", tag: "BM25" },
    },
    {
        n: 3,
        icon: Sparkles,
        title: "AI 재정렬 · 답변",
        sub: "Re-rank + LLM",
        points: ["AI 재정렬 (Re-rank)", "LLM 답변 생성"],
        db: {
            icon: Network,
            name: "코드 그래프 DB",
            tag: "PostgreSQL",
            note: "호출 / 의존 관계",
        },
    },
];

function VLine({ h = "h-5" }: { h?: string }) {
    return <div className={cn("mx-auto w-px", h)} style={{ background: LINE }} />;
}

function Arrow() {
    return (
        <div className="flex flex-col items-center">
            <VLine />
            <ChevronDown className="-mt-1 h-4 w-4" style={{ color: "#9fb0dc" }} />
        </div>
    );
}

function Bracket({ dir }: { dir: "down" | "up" }) {
    const verticals = (
        <div className="grid grid-cols-3">
            {[0, 1, 2].map((i) => (
                <VLine key={i} h="h-4" />
            ))}
        </div>
    );
    const rail = (
        <div className="px-[16.667%]">
            <div className="h-px" style={{ background: LINE }} />
        </div>
    );
    return dir === "down" ? (
        <div>
            <VLine h="h-4" />
            {rail}
            {verticals}
        </div>
    ) : (
        <div>
            {verticals}
            {rail}
            <VLine h="h-4" />
            <ChevronDown className="mx-auto -mt-1 h-4 w-4" style={{ color: "#9fb0dc" }} />
        </div>
    );
}

function IoNode({ icon: Icon, title, sub }: { icon: LucideIcon; title: string; sub: string }) {
    return (
        <div className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-xl border border-[#c2cdee] bg-[#eaf0fc] px-6 py-4 text-center">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#2f3aa0]">
                <Icon className="h-5 w-5" />
            </span>
            <div className="text-left">
                <div className="text-[16px] font-bold leading-tight text-[var(--color-ink)]">
                    {title}
                </div>
                <div className="mt-0.5 text-[13px] leading-tight text-[var(--color-ink-subtle)]">
                    {sub}
                </div>
            </div>
        </div>
    );
}

function StepCard({ step }: { step: Step }) {
    return (
        <div className="rounded-xl border border-[#dbe2f4] bg-white p-5">
            <div className="flex items-center gap-2.5">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00acee] to-[#185aea] text-[13px] font-bold text-white">
                    {step.n}
                </span>
                <step.icon className="h-5 w-5 text-[#2f7bff]" />
                <div className="leading-tight">
                    <div className="text-[15px] font-bold text-[var(--color-ink)]">
                        {step.title}
                    </div>
                    <div className="text-[12.5px] text-[var(--color-ink-subtle)]">
                        {step.sub}
                    </div>
                </div>
            </div>
            <ul className="mt-4 space-y-2">
                {step.points.map((p) => (
                    <li
                        key={p}
                        className="flex items-start gap-2 text-[13.5px] leading-snug text-[var(--color-ink-muted)]"
                    >
                        <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-[2px]"
                            style={{ background: "#2f7bff" }}
                        />
                        {p}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function DbCard({ db }: { db: Step["db"] }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-[#cfe6d6] bg-[#f1faf4] px-4 py-4">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#1f9d57]">
                <db.icon className="h-5 w-5" />
            </span>
            <div className="text-left">
                <div className="text-[15px] font-bold leading-tight text-[var(--color-ink)]">
                    {db.name}
                </div>
                <div className="mt-0.5 text-[12.5px] font-medium leading-tight text-[#1f8a4d]">
                    {db.tag}
                </div>
                {db.note && (
                    <div className="mt-0.5 text-[12px] leading-tight text-[var(--color-ink-subtle)]">
                        {db.note}
                    </div>
                )}
            </div>
        </div>
    );
}

export function CodeAssistantArchitecture() {
    return (
        <div className="overflow-x-auto">
            <div className="mx-auto min-w-[760px] max-w-4xl">
                <IoNode
                    icon={User}
                    title="사용자 (개발자)"
                    sub="자연어 질문 / 코드 검색 요청"
                />
                <Arrow />
                <IoNode icon={Server} title="API 서버" sub="Async 처리" />
                <Bracket dir="down" />
                <div className="grid grid-cols-3 gap-5">
                    {STEPS.map((s) => (
                        <div key={s.n} className="flex flex-col">
                            <StepCard step={s} />
                            <Arrow />
                            <DbCard db={s.db} />
                        </div>
                    ))}
                </div>
                <Bracket dir="up" />
                <IoNode
                    icon={Code2}
                    title="통합 결과 제공"
                    sub="관련 코드 + 호출 / 의존 흐름 + AI 답변"
                />
            </div>
        </div>
    );
}
