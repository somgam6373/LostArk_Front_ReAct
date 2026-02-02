import React, { useState } from 'react';
import { Coins, ScrollText } from 'lucide-react';
import GoldCalculator from '@/components/raid/GoldCalculator';
import CheatSheet from '@/components/raid/CheatSheet';

const RaidPage = () => {
    const [activeTab, setActiveTab] = useState<'gold' | 'cheat'>('cheat');

    return (
        // 모바일에서는 좌우 여백을 줄여 컨텐츠 영역 확보 (px-4 -> md:px-6)
        <div className="max-w-6xl mx-auto py-2 md:py-4 px-4 md:px-6 space-y-6 md:space-y-8">

            {/* 탭 네비게이션: 모바일에서 상단 고정 및 너비 최적화 */}
            <nav className="flex justify-center sticky top-0 z-40 py-2 bg-slate-50/50 dark:bg-zinc-950/50 backdrop-blur-sm lg:relative lg:bg-transparent lg:backdrop-blur-none">
                <div className="w-full md:w-auto bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-zinc-800 flex gap-1">
                    <button
                        onClick={() => setActiveTab('cheat')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-full text-xs md:text-sm font-bold transition-all ${
                            activeTab === 'cheat'
                                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                        }`}
                    >
                        <ScrollText size={18} className="shrink-0" />
                        <span>컨닝페이퍼</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('gold')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-full text-xs md:text-sm font-bold transition-all ${
                            activeTab === 'gold'
                                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                        }`}
                    >
                        <Coins size={18} className="shrink-0" />
                        <span>골드 계산기</span>
                    </button>
                </div>
            </nav>

            {/* 컨텐츠 렌더링 */}
            <main className="transition-all duration-300">
                {activeTab === 'gold' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <GoldCalculator />
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <CheatSheet />
                    </div>
                )}
            </main>
        </div>
    );
};

export default RaidPage;