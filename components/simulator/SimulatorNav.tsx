import React from "react";
import { UserCircle2, PlayCircle } from 'lucide-react';

export type SimTab = "info" | "synergy" | "result";

interface SimulatorNavProps {
    currentTab: SimTab;
    onTabChange: (tab: SimTab) => void;
    onGoToProfile: () => void;
    onRunSimulation: () => void;
}

export const SimulatorNav: React.FC<SimulatorNavProps> = ({
                                                              currentTab,
                                                              onTabChange,
                                                              onGoToProfile,
                                                              onRunSimulation,
                                                          }) => {
    const tabs = [
        { key: "info", label: "정보" },
        { key: "synergy", label: "시너지" },
        { key: "result", label: "결과" },
    ] as const;

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="grid grid-cols-3 gap-1 p-0.5 bg-black/40 rounded-xl border border-white/5">
                {tabs.map((t) => {
                    const isActive = currentTab === t.key;
                    return (
                        <button
                            key={t.key}
                            onClick={() => onTabChange(t.key)}
                            className={`
                                py-2.5 rounded-lg text-[11px] font-black tracking-tighter transition-all duration-200
                                ${isActive
                                ? "bg-emerald-950 text-emerald-100 shadow-lg shadow-emerald-950/80 ring-1 ring-emerald-500/20"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                            }
                            `}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-1.5 mt-1">
                <button
                    onClick={onGoToProfile}
                    className="group flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-zinc-900/60 text-zinc-500 text-[10px] font-bold rounded-lg border border-white/5 hover:border-zinc-700 hover:text-zinc-300 transition-all active:scale-[0.97]"
                >
                    <UserCircle2 size={13} className="ㅠgroup-hover:scale-110 transition-transform" />
                    프로필 페이지
                </button>

                <button
                    onClick={onRunSimulation}
                    className="group flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-emerald-950 text-[10px] font-black rounded-lg hover:bg-emerald-400 transition-all active:scale-[0.97] shadow-sm"
                >
                    <PlayCircle size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    시뮬레이션 실행
                </button>
            </div>
        </div>
    );
};