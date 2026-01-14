import React from "react";

type Props = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
};

export const TabNavigation: React.FC<Props> = ({ activeTab, setActiveTab }) => {
    const tabs = ["전투", "스킬", "아크 패시브", "캐릭터"];

    return (
        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            {tabs.map((t) => (
                <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-black tracking-widest transition-all ${
                        activeTab === t
                            ? "bg-zinc-900/60 border border-white/10 text-white"
                            : "text-zinc-500 hover:text-zinc-200"
                    }`}
                >
                    {t}
                </button>
            ))}
        </div>
    );
};
