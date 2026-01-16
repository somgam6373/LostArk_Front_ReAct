import React, { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

/**
 * ✅ 결과 화면 레이아웃 (로스트빌드 결과 화면 모방)
 * - 상단: 전체 평균 DPS/총딜 요약 (좌/우 구분 없이)
 * - 본문: 가운데 기준 좌/우
 *   - 좌: 스킬 리스트(아이콘/이름/쿨타임/비중바/예상딜)
 *   - 우: 선택된 스킬 상세(이름/예상딜/쿨타임/DPS + 적용버프 태그 영역 + 그래프/케이스 영역 자리)
 *
 * ⚠️ 실제 계산값/스킬 데이터는 나중에 너 로직/백엔드에서 주입하면 됨.
 */

type SkillRow = {
    id: string;
    name: string;
    icon: string;
    cooldownSec: number;
    expectedDamage: number; // 총 기대피해량
    expectedDps: number; // 스킬 단위 DPS(표시용)
    tags?: string[]; // 적용 버프(표시용)
};

function formatKoreanNumber(n: number) {
    // 대충 "억/만" 흉내(정밀 포맷은 나중에 교체)
    if (n >= 100000000) return `${(n / 100000000).toFixed(2)}억`;
    if (n >= 10000) return `${(n / 10000).toFixed(0)}만`;
    return `${Math.floor(n)}`;
}

function cx(...a: Array<string | false | null | undefined>) {
    return a.filter(Boolean).join(" ");
}

const MOCK_SKILLS: SkillRow[] = [
    {
        id: "s1",
        name: "데스 피날레 - 사신화",
        icon: "https://cdn-lostark.game.onstove.com/efui_iconatlas/sh_skill/sh_skill_01_6.png",
        cooldownSec: 61.8,
        expectedDamage: 4244950000,
        expectedDps: 686800000,
        tags: ["아드레날린6", "정밀의", "전투 특화 III", "약포 6.5", "만찬"],
    },
    {
        id: "s2",
        name: "킬로틴 스윙 - 사신화",
        icon: "https://cdn-lostark.game.onstove.com/efui_iconatlas/sh_skill/sh_skill_01_28.png",
        cooldownSec: 21.27,
        expectedDamage: 1552000000,
        expectedDps: 210000000,
        tags: ["정밀의", "만찬"],
    },
    {
        id: "s3",
        name: "소울 시너스 - 사신화",
        icon: "https://cdn-lostark.game.onstove.com/efui_iconatlas/sh_skill/sh_skill_01_26.png",
        cooldownSec: 18.43,
        expectedDamage: 1262000000,
        expectedDps: 180000000,
        tags: ["아드레날린6"],
    },
    {
        id: "s4",
        name: "베스티지 - 사신화",
        icon: "https://cdn-lostark.game.onstove.com/efui_iconatlas/sh_skill/sh_skill_01_25.png",
        cooldownSec: 15.6,
        expectedDamage: 1069000000,
        expectedDps: 160000000,
    },
];

export const ResultTab: React.FC<{
    // 나중에: 실제 계산된 스킬 결과를 props로 받으면 됨
    skills?: SkillRow[];
}> = ({ skills = MOCK_SKILLS }) => {
    const [selectedId, setSelectedId] = useState<string>(skills[0]?.id ?? "");
    const selectedSkill = useMemo(
        () => skills.find((s) => s.id === selectedId) ?? skills[0],
        [skills, selectedId]
    );

    const totalExpectedDamage = useMemo(
        () => skills.reduce((acc, s) => acc + (s.expectedDamage ?? 0), 0),
        [skills]
    );

    const avgDps = useMemo(() => {
        // "평균 DPS" 정의는 너 계산 방식에 맞게 바꿔야 함.
        // 여기선 단순 합계 DPS / 스킬 개수로 임시.
        const sum = skills.reduce((acc, s) => acc + (s.expectedDps ?? 0), 0);
        return skills.length ? sum / skills.length : 0;
    }, [skills]);

    // 좌측 바(비율) 계산
    const maxDamage = useMemo(
        () => Math.max(1, ...skills.map((s) => s.expectedDamage ?? 0)),
        [skills]
    );

    return (
        <div className="max-w-[1800px] mx-auto px-6 py-6 text-zinc-200 space-y-8">
            {/* ===================== 상단 요약(전체 평균/총딜) ===================== */}
            <section className="bg-zinc-950/40 border border-white/5 rounded-3xl p-7">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                        <div className="text-2xl font-black text-white tracking-tight">
                            결과
                        </div>
                        <div className="mt-2 text-sm text-zinc-400">
                            모든 스킬을 계산한 평균적인 기대 딜 값을 표시합니다.
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10">
                            <div className="text-[11px] font-black text-zinc-400">총 기대 피해량</div>
                            <div className="mt-1 text-xl font-black text-white">
                                {formatKoreanNumber(totalExpectedDamage)}
                            </div>
                        </div>

                        <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10">
                            <div className="text-[11px] font-black text-zinc-400">평균 DPS(임시)</div>
                            <div className="mt-1 text-xl font-black text-emerald-300">
                                {formatKoreanNumber(avgDps)}
                            </div>
                        </div>

                        <div className="px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/10">
                            <div className="text-[11px] font-black text-zinc-400">스킬 개수</div>
                            <div className="mt-1 text-xl font-black text-white">
                                {skills.length}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===================== 본문: 좌/우 2열 ===================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* ----------------- 좌측: 스킬 리스트 ----------------- */}
                <section className="lg:col-span-5 bg-[#121213] border border-white/5 rounded-3xl p-6">
                    <div className="flex items-end justify-between border-b border-white/10 pb-3 mb-4">
                        <h2 className="text-lg font-extrabold text-white tracking-tight">
                            스킬
                        </h2>
                        <div className="text-[12px] font-black text-zinc-500">
                            정렬: 스킬데미지(임시)
                        </div>
                    </div>

                    <div className="space-y-2">
                        {skills
                            .slice()
                            .sort((a, b) => (b.expectedDamage ?? 0) - (a.expectedDamage ?? 0))
                            .map((s) => {
                                const active = s.id === selectedId;
                                const ratio = Math.max(
                                    0.06,
                                    Math.min(1, (s.expectedDamage ?? 0) / maxDamage)
                                );

                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedId(s.id)}
                                        className={cx(
                                            "w-full text-left group rounded-2xl border transition p-3",
                                            active
                                                ? "bg-emerald-500/10 border-emerald-500/20"
                                                : "bg-zinc-950/30 border-white/10 hover:bg-white/[0.04]"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* 아이콘 */}
                                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-black/20 shrink-0">
                                                <img
                                                    src={s.icon}
                                                    alt={s.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* 이름/쿨 */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-black text-[14px] text-white/90 truncate">
                                                        {s.name}
                                                    </div>
                                                    <span className="text-[11px] text-zinc-500 font-bold shrink-0">
                            {s.cooldownSec.toFixed(2)}s
                          </span>
                                                </div>

                                                {/* 바 */}
                                                <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-emerald-400/70"
                                                        style={{ width: `${ratio * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* 딜 수치 */}
                                            <div className="shrink-0 text-right">
                                                <div className="text-[14px] font-black text-white">
                                                    {formatKoreanNumber(s.expectedDamage)}
                                                </div>
                                                <div className="text-[11px] font-bold text-zinc-500">
                                                    DPS {formatKoreanNumber(s.expectedDps)}
                                                </div>
                                            </div>

                                            <ChevronRight
                                                className={cx(
                                                    "w-4 h-4 shrink-0 transition",
                                                    active ? "text-emerald-300" : "text-zinc-600 group-hover:text-zinc-400"
                                                )}
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                    </div>
                </section>

                {/* ----------------- 우측: 선택 스킬 상세 ----------------- */}
                <section className="lg:col-span-7 bg-zinc-950 border border-white/5 rounded-3xl p-6">
                    {!selectedSkill ? (
                        <div className="text-zinc-500 text-sm">스킬을 선택해 주세요.</div>
                    ) : (
                        <div className="space-y-6">
                            {/* 헤더 */}
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-black/20 shrink-0">
                                    <img
                                        src={selectedSkill.icon}
                                        alt={selectedSkill.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="text-xl font-black text-white truncate">
                                        {selectedSkill.name}
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-3">
                                        <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10">
                                            <div className="text-[11px] font-black text-zinc-500">기대 피해량</div>
                                            <div className="text-[16px] font-black text-white mt-0.5">
                                                {formatKoreanNumber(selectedSkill.expectedDamage)}
                                            </div>
                                        </div>

                                        <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10">
                                            <div className="text-[11px] font-black text-zinc-500">쿨타임</div>
                                            <div className="text-[16px] font-black text-white mt-0.5">
                                                {selectedSkill.cooldownSec.toFixed(2)}s
                                            </div>
                                        </div>

                                        <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10">
                                            <div className="text-[11px] font-black text-zinc-500">DPS</div>
                                            <div className="text-[16px] font-black text-emerald-300 mt-0.5">
                                                {formatKoreanNumber(selectedSkill.expectedDps)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 적용 버프(태그) */}
                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                                <div className="text-[12px] font-black text-zinc-400 mb-3">
                                    적용 버프
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {(selectedSkill.tags ?? []).length ? (
                                        selectedSkill.tags!.map((t) => (
                                            <span
                                                key={t}
                                                className="text-[12px] font-black px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                                            >
                        {t}
                      </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-zinc-500">
                      적용된 버프가 없습니다.
                    </span>
                                    )}
                                </div>
                            </div>

                            {/* 그래프/분해 영역(자리만 만들어 둠) */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 min-h-[260px]">
                                    <div className="text-[12px] font-black text-zinc-400 mb-3">
                                        타수/분해(예정)
                                    </div>
                                    <div className="text-sm text-zinc-500">
                                        여기에는 로스트빌드처럼 도넛 차트/타수별 피해량 표시를 붙이면 됩니다.
                                    </div>
                                </div>

                                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 min-h-[260px]">
                                    <div className="text-[12px] font-black text-zinc-400 mb-3">
                                        CASE/확률(예정)
                                    </div>
                                    <div className="text-sm text-zinc-500">
                                        여기에는 CASE별 발동확률, 조건(치명/에테르/패턴 등) 리스트를 붙이면 됩니다.
                                    </div>
                                </div>
                            </div>

                            {/* 추가 상세 버튼 자리 */}
                            <div className="flex justify-end">
                                <button className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-200 font-black text-sm hover:bg-white/[0.06] transition">
                                    모션 계산 상세보기
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
