import React, { useState } from 'react';
import { AlertTriangle, Swords, ChevronDown } from 'lucide-react';

const CheatSheet = () => {
    const [expandedRaid, setExpandedRaid] = useState<string | null>('서막 (에키드나)');
    const [selectedGate, setSelectedGate] = useState({ raid: '서막 (에키드나)', gate: '에키드나' });

    const raidList = [
        { title: '서막 (에키드나)', gates: ['다르키엘', '에키드나'] },
        { title: '1막 (에기르)', gates: ['일리아칸', '에기르'] },
        { title: '2막 (아브렐슈드)', gates: ['나로크', '아브렐슈드'] },
        { title: '3막 (모르둠)', gates: ['카멘', '나이트레아'] },
        { title: '4막 (아르모체)', gates: ['에키드나', '아브렐슈드'] },
        { title: '종막 (카제로스)', gates: ['카제로스(1관)', '카제로스(2관)'] },
    ];

    const mockData = [
        { hp: '210', name: '기믹 시작', action: '중앙 집결 및 시너지 정렬', type: 'normal' },
        { hp: '160', name: '핵심 전멸기', action: '특정 위치 사수 (x3 방향)', type: 'danger' },
        { hp: '120', name: '무력화 체크', action: '회오리 수류탄 던지기', type: 'major' },
        { hp: '50', name: '광폭화 주의', action: '최대 딜 집중', type: 'major' },
    ];

    const toggleRaid = (title: string) => {
        setExpandedRaid(expandedRaid === title ? null : title);
    };

    return (
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 lg:gap-8">

            {/* [모바일] 상단 레이드/관문 선택 메뉴 - RaidPage의 탭 아래에 고정 */}
            <div className="lg:hidden sticky top-[72px] z-30 -mx-4 px-4 py-3 bg-slate-50/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 space-y-3">
                {/* 레이드 선택 (가로 스크롤) */}
                <div className="flex overflow-x-auto no-scrollbar gap-2">
                    {raidList.map((raid) => (
                        <button
                            key={raid.title}
                            onClick={() => {
                                setExpandedRaid(raid.title);
                                setSelectedGate({ raid: raid.title, gate: raid.gates[0] });
                            }}
                            className={`flex-none px-4 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                                expandedRaid === raid.title
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                    : 'bg-white dark:bg-zinc-900 text-slate-500 border border-slate-200 dark:border-zinc-800'
                            }`}
                        >
                            {raid.title}
                        </button>
                    ))}
                </div>

                {/* 관문 선택 (가로 스크롤) */}
                <div className="flex overflow-x-auto no-scrollbar gap-2">
                    {raidList.find(r => r.title === expandedRaid)?.gates.map((gate, idx) => {
                        const isSelected = selectedGate.gate === gate;
                        return (
                            <button
                                key={gate}
                                onClick={() => setSelectedGate({ raid: expandedRaid!, gate })}
                                className={`flex-none px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${
                                    isSelected
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                                        : 'bg-transparent text-slate-400 border-slate-200 dark:border-zinc-800'
                                }`}
                            >
                                {idx + 1}관: {gate}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* [데스크톱] 사이드바 아코디언 (기존 유지) */}
            <aside className="hidden lg:block lg:col-span-1 space-y-4">
                <div className="flex items-center gap-2 px-2 mb-6">
                    <Swords size={20} className="text-indigo-500" />
                    <h2 className="text-lg font-black text-slate-800 dark:text-zinc-200">레이드 목록</h2>
                </div>

                <div className="space-y-2">
                    {raidList.map((raid) => {
                        const isExpanded = expandedRaid === raid.title;
                        return (
                            <div key={raid.title} className="overflow-hidden border border-slate-100 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
                                <button
                                    onClick={() => toggleRaid(raid.title)}
                                    className={`w-full flex items-center justify-between px-5 py-4 font-bold transition-colors ${
                                        isExpanded ? 'text-indigo-600 dark:text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                                    }`}
                                >
                                    <span className="text-sm tracking-tight">{raid.title}</span>
                                    <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-500' : 'text-slate-300'}`} />
                                </button>

                                <div className={`flex flex-col bg-slate-50/50 dark:bg-zinc-950 transition-all duration-300 ease-in-out ${
                                    isExpanded ? 'max-h-40 opacity-100 py-2 border-t border-slate-50 dark:border-zinc-800' : 'max-h-0 opacity-0 overflow-hidden'
                                }`}>
                                    {raid.gates.map((gate, idx) => {
                                        const isSelected = selectedGate.raid === raid.title && selectedGate.gate === gate;
                                        return (
                                            <button
                                                key={gate}
                                                onClick={() => setSelectedGate({ raid: raid.title, gate })}
                                                className={`text-left px-8 py-3 text-xs font-bold transition-all border-l-4 ${
                                                    isSelected
                                                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
                                                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                                                }`}
                                            >
                                                {idx + 1}관문: {gate}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* [공통] 메인 정보 영역 */}
            <main className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-3xl lg:rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 shadow-sm self-start overflow-hidden">
                <div className="p-6 lg:p-8 border-b border-slate-50 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-950/30">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{selectedGate.raid}</p>
                    <h3 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">{selectedGate.gate}</h3>
                </div>

                <div className="p-4 lg:p-8 space-y-3 lg:space-y-4">
                    {mockData.map((item, idx) => (
                        <div key={idx} className={`flex items-start lg:items-center gap-4 lg:gap-6 p-4 lg:p-5 rounded-2xl lg:rounded-3xl border-2 transition-all ${
                            item.type === 'danger'
                                ? 'border-red-100 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/10 shadow-sm'
                                : 'border-slate-50 dark:border-zinc-800'
                        }`}>
                            <div className="w-14 h-11 lg:w-20 lg:h-14 bg-slate-900 rounded-xl lg:rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-lg shadow-slate-200 dark:shadow-none">
                                <span className="text-[8px] lg:text-[10px] text-slate-400 font-bold uppercase">HP</span>
                                <span className="text-base lg:text-xl font-black text-white leading-none">{item.hp}</span>
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center gap-2 mb-0.5 lg:mb-1">
                                    <span className={`font-black text-sm lg:text-base truncate ${item.type === 'danger' ? 'text-red-500' : 'text-slate-800 dark:text-zinc-200'}`}>
                                        {item.name}
                                    </span>
                                    {item.type === 'danger' && <AlertTriangle size={14} className="text-red-500 animate-pulse shrink-0" />}
                                </div>
                                <p className="text-[12px] lg:text-sm text-slate-500 dark:text-zinc-400 font-medium leading-snug lg:leading-relaxed">{item.action}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default CheatSheet;