import React, { useMemo, useState } from "react";

type SynergyKey =
    | "critRate"
    | "backHead"
    | "critDmg"
    | "defDown"
    | "dmgUp"
    | "atkUp";

type SynergyItem = {
    id: string;
    label: string;
    key: SynergyKey;
};

type SynergyGroup = {
    title: string;
    key: SynergyKey;
    desc?: string;
    items: SynergyItem[];
};

const GROUPS: SynergyGroup[] = [
    {
        title: "치적",
        key: "critRate",
        items: [
            { id: "crit_gunslinger", label: "기상술사", key: "critRate" },
            { id: "crit_bm", label: "배틀마스터", key: "critRate" },
            { id: "crit_striker", label: "스트라이커", key: "critRate" },
            { id: "crit_arcana", label: "아르카나", key: "critRate" },
            { id: "crit_de", label: "건슬링어", key: "critRate" },
            { id: "crit_devilhunter", label: "데빌헌터", key: "critRate" },
        ],
    },
    {
        title: "백헤드",
        key: "backHead",
        items: [
            { id: "bh_blade", label: "블레이드", key: "backHead" },
            { id: "bh_warlord", label: "워로드", key: "backHead" },
        ],
    },
    {
        title: "치피증",
        key: "critDmg",
        items: [
            { id: "cd_gunslinger", label: "창술사", key: "critDmg" },
            { id: "cd_holy", label: "홀리나이트", key: "critDmg" },
        ],
    },
    {
        title: "방깎",
        key: "defDown",
        items: [
            { id: "dd_summoner", label: "서머너", key: "defDown" },
            { id: "dd_reaper", label: "리퍼", key: "defDown" },
            { id: "dd_warlord", label: "워로드", key: "defDown" },
            { id: "dd_destroyer", label: "디스트로이어", key: "defDown" },
            { id: "dd_blaster", label: "블래스터", key: "defDown" },
            { id: "dd_gunlancer", label: "한자사(예시)", key: "defDown" },
        ],
    },
    {
        title: "피증",
        key: "dmgUp",
        items: [
            { id: "du_hawkeye", label: "호크아이", key: "dmgUp" },
            { id: "du_infighter", label: "인파이터", key: "dmgUp" },
            { id: "du_soulfist", label: "소울이터", key: "dmgUp" },
            { id: "du_slayer", label: "슬레이어", key: "dmgUp" },
            { id: "du_berserker", label: "버서커", key: "dmgUp" },
            { id: "du_dm", label: "데모닉", key: "dmgUp" },
            { id: "du_sorc", label: "소서리스", key: "dmgUp" },
            { id: "du_breaker", label: "브레이커", key: "dmgUp" },
        ],
    },
    {
        title: "공증",
        key: "atkUp",
        items: [
            { id: "au_scouter", label: "스카우터", key: "atkUp" },
            { id: "au_soulfist", label: "기공사", key: "atkUp" },
        ],
    },
];

const CHIP_COLOR: Record<SynergyKey, string> = {
    critRate: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    backHead: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    critDmg: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200",
    defDown: "border-sky-500/30 bg-sky-500/10 text-sky-200",
    dmgUp: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    atkUp: "border-indigo-500/30 bg-indigo-500/10 text-indigo-200",
};

function cx(...a: Array<string | false | null | undefined>) {
    return a.filter(Boolean).join(" ");
}

export const SynergyBuffTab: React.FC = () => {
    const [selected, setSelected] = useState<Record<string, boolean>>({});

    const selectedList = useMemo(() => {
        const flat = GROUPS.flatMap((g) => g.items.map((it) => ({ ...it, group: g })));
        return flat.filter((it) => selected[it.id]);
    }, [selected]);

    const selectedCount = selectedList.length;

    const toggle = (id: string) => {
        setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const clearAll = () => setSelected({});

    return (
        <div className="space-y-8">
            {/* 상단 헤더 */}
            <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-7">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xl font-black text-white">시너지 및 버프</div>
                        <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                            딜러 시너지를 선택해서 계산에 반영할 수 있게 하는 영역입니다.
                            <span className="text-zinc-500"> (중첩 불가/중첩 규칙은 너 로직에 맞게 적용)</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="text-[12px] font-black px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-zinc-200">
                            선택 {selectedCount}개
                        </div>
                        <button
                            onClick={clearAll}
                            className="text-[12px] font-black px-3 py-1.5 rounded-full border border-white/10 bg-zinc-900/40 text-zinc-300 hover:bg-white/[0.06] transition"
                        >
                            전체 해제
                        </button>
                    </div>
                </div>

                {/* 선택된 항목 태그 */}
                {selectedCount > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                        {selectedList.map((it) => (
                            <button
                                key={it.id}
                                onClick={() => toggle(it.id)}
                                className={cx(
                                    "text-[12px] font-black px-3 py-1.5 rounded-full border transition hover:opacity-90",
                                    CHIP_COLOR[it.key]
                                )}
                                title="클릭하면 해제"
                            >
                                {it.group.title} · {it.label} ✕
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 그룹 리스트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {GROUPS.map((group) => (
                    <div
                        key={group.key}
                        className="bg-[#121213] border border-white/5 rounded-3xl p-6"
                    >
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-5 rounded-full bg-emerald-500/80" />
                                <div className="text-lg font-extrabold text-white tracking-tight">
                                    {group.title}
                                </div>
                            </div>

                            <div className={cx("text-[11px] font-black px-3 py-1 rounded-full border", CHIP_COLOR[group.key])}>
                                {group.items.filter((it) => selected[it.id]).length} / {group.items.length}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {group.items.map((it) => {
                                const isOn = !!selected[it.id];
                                return (
                                    <label
                                        key={it.id}
                                        className={cx(
                                            "group cursor-pointer select-none rounded-2xl border px-3 py-3 transition",
                                            isOn
                                                ? "border-emerald-500/30 bg-emerald-500/10"
                                                : "border-white/10 bg-zinc-950/40 hover:bg-white/[0.04]"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                      <span
                          className={cx(
                              "w-5 h-5 rounded-md border flex items-center justify-center transition",
                              isOn
                                  ? "border-emerald-500/50 bg-emerald-500/20"
                                  : "border-white/15 bg-black/30"
                          )}
                      >
                        <input
                            type="checkbox"
                            checked={isOn}
                            onChange={() => toggle(it.id)}
                            className="accent-emerald-500 w-4 h-4"
                        />
                      </span>

                                            <span className={cx("text-sm font-black transition", isOn ? "text-white" : "text-zinc-300")}>
                        {it.label}
                      </span>
                                        </div>

                                        <div className="mt-2 text-[11px] text-zinc-500 font-semibold">
                                            {group.title} 시너지
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* 하단 안내 */}
            <div className="bg-zinc-950/40 border border-white/5 rounded-3xl p-6">
                <div className="text-sm text-zinc-400 leading-relaxed">
                    ⚠️ 실제 로스트아크 시너지는 <span className="text-zinc-200 font-bold">중첩 규칙</span>,{" "}
                    <span className="text-zinc-200 font-bold">적용 대상</span>,{" "}
                    <span className="text-zinc-200 font-bold">유지 시간/가동률</span> 등에 따라 값이 달라질 수 있습니다.
                    <div className="mt-2 text-zinc-500">
                        여기서는 “UI 선택값”만 만들고, 계산 반영은 너가 시뮬레이터 로직에서 처리하면 됩니다.
                    </div>
                </div>
            </div>
        </div>
    );
};
