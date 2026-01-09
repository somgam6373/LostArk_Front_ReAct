import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, CheckCircle, Loader2, Info } from 'lucide-react';

interface DifficultyDto {
    type: 'Normal' | 'Hard';
    gold: number;
    extraRewardCost: number;
}

interface RaidDto {
    title: string;
    difficulty: DifficultyDto[];
}

const RaidPage = () => {
    const [raids, setRaids] = useState<RaidDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRaids, setSelectedRaids] = useState<{title: string, diff: 'Normal' | 'Hard', extra: boolean}[]>([]);

    useEffect(() => {
        fetch('http://localhost:8080/raid')
            .then(res => res.json())
            .then(data => { setRaids(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const toggleRaid = (title: string, diff: 'Normal' | 'Hard') => {
        setSelectedRaids(prev => {
            const exists = prev.find(r => r.title === title);
            if (exists) {
                if (exists.diff === diff) return prev.filter(r => r.title !== title);
                return prev.map(r => r.title === title ? { ...r, diff } : r);
            }
            return [...prev, { title, diff, extra: false }];
        });
    };

    // 🚀 클릭 문제 해결: 더보기 토글 함수 추가
    const toggleExtraReward = (title: string) => {
        setSelectedRaids(prev =>
            prev.map(r => r.title === title ? { ...r, extra: !r.extra } : r)
        );
    };

    const calculateTotalGold = () => {
        return selectedRaids.reduce((total, selected) => {
            const raid = raids.find(r => r.title === selected.title);
            const diffInfo = raid?.difficulty.find(d => d.type === selected.diff);
            if (!diffInfo) return total;
            return total + (selected.extra ? diffInfo.gold - diffInfo.extraRewardCost : diffInfo.gold);
        }, 0);
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-96 gap-4">
            <Loader2 className="animate-spin text-slate-400" size={40} />
            <p className="text-slate-500 dark:text-zinc-400 text-sm font-medium tracking-widest">LOADING RAIDS...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 space-y-10 transition-colors duration-300">
            {/* 상단 대시보드 */}
            <header className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-zinc-800 gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <h1 className="text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">주간 골드 계산기</h1>
                    <p className="text-slate-400 dark:text-zinc-500 text-sm font-medium">이번 주 레이드 순수익을 확인하세요.</p>
                </div>
                <div className="bg-slate-50 dark:bg-zinc-950 px-8 py-5 rounded-[2rem] border border-slate-100 dark:border-zinc-800 text-right min-w-[260px]">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Total Net Gold</span>
                    <div className="flex items-center justify-end gap-2 mt-1">
                        <motion.span
                            key={calculateTotalGold()}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black text-yellow-500 dark:text-yellow-400 tracking-tighter drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]"
                        >
                            {calculateTotalGold().toLocaleString()}
                        </motion.span>
                        <span className="text-lg font-bold text-slate-400 dark:text-zinc-600">G</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {raids.map((raid) => {
                    const selection = selectedRaids.find(r => r.title === raid.title);

                    return (
                        <div key={raid.title} className={`relative bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 transition-all duration-300 ${
                            selection
                                ? 'border-slate-800 dark:border-indigo-900/50'
                                : 'border-slate-100 dark:border-zinc-800 shadow-sm'
                        }`}>
                            <div className="p-8 space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{raid.title}</h3>
                                    {selection && <CheckCircle className="text-slate-800 dark:text-indigo-400" size={24} />}
                                </div>

                                {/* 난이도 버튼 - 톤 다운된 컬러 적용 */}
                                <div className="grid grid-cols-2 gap-3">
                                    {raid.difficulty.map((diff) => (
                                        <button
                                            key={diff.type}
                                            onClick={() => toggleRaid(raid.title, diff.type)}
                                            className={`flex flex-col items-center py-5 rounded-3xl transition-all border-2 ${
                                                selection?.diff === diff.type
                                                    ? 'bg-slate-800 dark:bg-indigo-950 border-slate-800 dark:border-indigo-800 text-white'
                                                    : 'bg-white dark:bg-zinc-950 border-slate-100 dark:border-zinc-800 text-slate-400 dark:text-zinc-500 hover:border-slate-200 dark:hover:border-zinc-700'
                                            }`}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest mb-1">{diff.type}</span>
                                            <span className="text-lg font-bold">{diff.gold.toLocaleString()} G</span>
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence>
                                    {selection && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-6 border-t border-slate-50 dark:border-zinc-800 space-y-5">
                                                {/* 전체 보상 더보기 영역 */}
                                                <label className="flex justify-between items-center bg-slate-50 dark:bg-zinc-950 p-5 rounded-[1.5rem] border border-slate-100 dark:border-zinc-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
                                                    <div className="flex items-center gap-3 text-slate-600 dark:text-zinc-400">
                                                        <Coins size={18} className="text-amber-500" />
                                                        <span className="text-xs font-bold tracking-tight">전체 보상 더보기</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-sm font-black text-red-500 dark:text-red-400">
                                                            -{raid.difficulty.find(d => d.type === selection.diff)?.extraRewardCost.toLocaleString()} G
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            checked={selection.extra}
                                                            onChange={() => toggleExtraReward(raid.title)}
                                                            className="w-6 h-6 accent-slate-800 dark:accent-indigo-500 cursor-pointer rounded-lg"
                                                        />
                                                    </div>
                                                </label>
                                                <div className="flex justify-between items-center px-2">
                                                    <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Estimated Profit</span>
                                                    <span className="text-2xl font-black text-slate-800 dark:text-zinc-100">
                                                        {(() => {
                                                            const d = raid.difficulty.find(d => d.type === selection.diff);
                                                            return (selection.extra ? d!.gold - d!.extraRewardCost : d!.gold).toLocaleString();
                                                        })()} <span className="text-lg text-slate-400 font-bold ml-0.5">G</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
            </div>

            <footer className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800">
                <Info size={20} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed">
                    실시간으로 서버 데이터를 동기화합니다. 레이드 보상 및 더보기 비용은 게임 내 수치와 일치하도록 관리됩니다.
                </p>
            </footer>
        </div>
    );
};

export default RaidPage;