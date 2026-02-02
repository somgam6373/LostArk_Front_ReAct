import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Coins, Loader2, LayoutGrid, Check, Plus, Zap,
    RotateCcw, X, ChevronRight, BarChart3, Sword,
    Shield, Sparkles, MinusCircle, ChevronDown, Calculator
} from 'lucide-react';

// 카테고리별 아이콘 매핑
const categoryIcons: Record<string, React.ReactNode> = {
    '군단장 레이드': <Sword size={18} />,
    '어비스 던전': <Shield size={18} />,
    '카제로스 레이드': <Sparkles size={18} />,
    '기타': <LayoutGrid size={18} />,
};

const GoldCalculator = () => {
    const [raids, setRaids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState<string>('');
    const [selectedRaids, setSelectedRaids] = useState<any[]>([]);
    const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

    useEffect(() => {
        fetch('/goldCalculator')
            .then(res => res.json())
            .then(data => {
                setRaids(data);
                if (data.length > 0) setActiveType(data[0].type);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const raidTypes = Array.from(new Set(raids.map(r => r.type)));

    const handleDiffChange = (title: string, diff: string) => {
        setSelectedRaids(prev => {
            const exists = prev.find(r => r.title === title);
            if (exists) {
                if (exists.diff === diff) return prev.filter(r => r.title !== title);
                return prev.map(r => r.title === title ? { ...r, diff, selectedGates: [], extraGates: [] } : r);
            }
            return [...prev, { title, diff, selectedGates: [], extraGates: [] }];
        });
    };

    const toggleGateSequential = (title: string, targetGate: string) => {
        setSelectedRaids(prev => prev.map(r => {
            if (r.title !== title) return r;
            const raidInfo = raids.find(rd => rd.title === title);
            if (!raidInfo) return r;
            const allGates = raidInfo.difficulty.filter((d: any) => d.difficulty === r.diff).map((d: any) => d.gate);
            const targetIndex = allGates.indexOf(targetGate);
            const isAlreadySelected = r.selectedGates.includes(targetGate);
            const newSelected = isAlreadySelected ? allGates.slice(0, targetIndex) : allGates.slice(0, targetIndex + 1);
            return { ...r, selectedGates: newSelected, extraGates: r.extraGates.filter((eg: any) => newSelected.includes(eg)) };
        }));
    };

    const toggleExtra = (title: string, gate: string) => {
        setSelectedRaids(prev => prev.map(r => {
            if (r.title !== title) return r;
            return { ...r, extraGates: r.extraGates.includes(gate) ? r.extraGates.filter((g: any) => g !== gate) : [...r.extraGates, gate] };
        }));
    };

    const calculateTotalGold = () => {
        return selectedRaids.reduce((total, selected) => {
            const raid = raids.find(r => r.title === selected.title);
            if (!raid) return total;
            return total + selected.selectedGates.reduce((gateSum: number, gateName: string) => {
                const gateData = raid.difficulty.find((d: any) => d.difficulty === selected.diff && d.gate === gateName);
                if (!gateData) return gateSum;
                const isExtra = selected.extraGates.includes(gateName);
                return gateSum + (isExtra ? gateData.gold - gateData.extraRewardCost : gateData.gold);
            }, 0);
        }, 0);
    };

    // 요약 컴포넌트 (중복 제거를 위해 추출)
    const SummaryContent = () => (
        <>
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">상세 요약</h3>
                {selectedRaids.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <Check size={12} strokeWidth={3} />
                        <span className="text-[10px] font-black">{selectedRaids.length}</span>
                    </div>
                )}
            </div>

            <div className="space-y-6 max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedRaids.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-sm font-medium text-slate-300 dark:text-zinc-700 font-bold uppercase tracking-widest">Empty</p>
                    </div>
                ) : (
                    selectedRaids.map((sr) => {
                        const raidData = raids.find(r => r.title === sr.title);
                        let subTotalGold = 0;
                        let subTotalDeduction = 0;

                        sr.selectedGates.forEach((gn: string) => {
                            const g = raidData?.difficulty.find((d: any) => d.difficulty === sr.diff && d.gate === gn);
                            if (g) {
                                subTotalGold += g.gold;
                                if (sr.extraGates.includes(gn)) subTotalDeduction += g.extraRewardCost;
                            }
                        });

                        return (
                            <div key={sr.title} className="space-y-2 pb-5 border-b border-slate-50 dark:border-zinc-800 last:border-0">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[15px] font-bold text-slate-800 dark:text-zinc-100">{sr.title}</span>
                                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 rounded font-black uppercase">{sr.diff}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-700 dark:text-zinc-300">
                                        {(subTotalGold - subTotalDeduction).toLocaleString()} G
                                    </span>
                                </div>
                                <div className="bg-slate-50/50 dark:bg-zinc-800/30 rounded-xl p-3 space-y-1.5">
                                    <div className="flex justify-between text-[11px] font-medium text-slate-500">
                                        <span>기본 획득 골드</span>
                                        <span className="font-bold">+{subTotalGold.toLocaleString()} G</span>
                                    </div>
                                    {subTotalDeduction > 0 && (
                                        <div className="flex justify-between text-[11px] font-medium text-red-500 dark:text-red-400">
                                            <span>더보기 비용 차감</span>
                                            <span className="font-bold">-{subTotalDeduction.toLocaleString()} G</span>
                                        </div>
                                    )}
                                    <div className="h-px bg-slate-200/50 dark:bg-zinc-700/50 my-1" />
                                    <p className="text-[10px] text-slate-400 truncate">{sr.selectedGates.join(', ')} 선택</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {selectedRaids.length > 0 && (
                <div className="mt-6 pt-6 border-t-2 border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">최종 합계</span>
                        <div className="text-right">
                            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                                {calculateTotalGold().toLocaleString()}
                            </span>
                            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 ml-1">G</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {setSelectedRaids([]); setIsMobileSummaryOpen(false);}}
                        className="w-full py-3.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <RotateCcw size={14} /> 전체 초기화
                    </button>
                </div>
            )}
        </>
    );

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-black text-indigo-500"><Loader2 className="animate-spin" /></div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-2 md:px-8 md:py-4 space-y-2 bg-slate-50 dark:bg-zinc-950 min-h-screen pb-24 md:pb-4 transition-colors duration-300">
            {/* [상단] 헤더 - 모바일에서 패딩 및 폰트 미세 조정 */}
            <header className="mb-4 relative overflow-hidden bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
                <div className="absolute top-0 left-0 w-full h-full -z-0">
                    <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8">
                    <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <p className="text-[11px] md:text-[13px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">Weekly Estimated Gold</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">
                                {calculateTotalGold().toLocaleString()}
                            </h1>
                            <span className="text-xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-slate-400 to-slate-500 dark:from-zinc-500 dark:to-zinc-400">G</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3">
                        <button onClick={() => setSelectedRaids([])} className="group relative flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-transparent text-slate-900 dark:text-zinc-200 rounded-2xl text-sm font-bold border border-white/50 dark:border-white/10 shadow-sm backdrop-blur-md transition-all active:scale-95">
                            <RotateCcw size={18} className="relative z-10 opacity-70 group-hover:rotate-[-180deg] transition-all duration-500" />
                            <span className="relative z-10">전체 초기화</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-4">
                {/* [좌측] 카테고리 탭 - 모바일 가로 스크롤 / 데스크톱 세로 유지 */}
                <aside className="w-full lg:w-64 shrink-0 lg:space-y-6">
                    <div className="hidden lg:block px-4">
                        <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 size={16} strokeWidth={2.5} className="text-indigo-500" /> Categories
                        </h2>
                    </div>

                    <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar gap-2 px-1 pb-2 lg:pb-0 lg:px-2">
                        {raidTypes.map((type) => {
                            const isActive = activeType === type;
                            const exampleRaid = raids.find(r => r.type === type);
                            const titleName = exampleRaid ? exampleRaid.title : '';

                            return (
                                <button
                                    key={type}
                                    onClick={() => setActiveType(type)}
                                    className={`flex-none lg:w-full group relative flex flex-col items-start px-4 py-3 lg:px-5 lg:py-4 rounded-[1rem] lg:rounded-[1.25rem] transition-all duration-200 ${
                                        isActive ? 'bg-indigo-600 lg:bg-slate-100 dark:lg:bg-zinc-800 shadow-sm' : 'bg-white dark:bg-zinc-900 lg:bg-transparent lg:hover:bg-slate-50 lg:dark:hover:bg-zinc-900/50'
                                    }`}
                                >
                                    {isActive && <div className="hidden lg:block absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-full" />}
                                    <div className="flex items-center min-w-0 text-left gap-2">
                                        <span className={`text-[10px] lg:text-[12px] font-semibold uppercase tracking-widest transition-colors ${
                                            isActive ? 'text-white lg:text-indigo-600 dark:lg:text-indigo-400' : 'text-slate-400'
                                        }`}>{type}</span>
                                        <span className={`hidden lg:block w-[1px] h-3 ${isActive ? 'bg-slate-300 dark:bg-slate-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                        <span className={`hidden lg:block text-[14px] font-medium tracking-tight truncate ${
                                            isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'
                                        }`}>{titleName}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <main className="flex-1">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                        {/* [중앙] 레이드 카드 */}
                        <div className="grid gap-4 md:gap-6 min-h-[300px]">
                            {raids.filter(r => r.type === activeType).map((raid) => {
                                const selection = selectedRaids.find(s => s.title === raid.title);
                                const diffTypes = Array.from(new Set(raid.difficulty.map((d: any) => d.difficulty)));

                                return (
                                    <div key={raid.title} className="bg-white dark:bg-zinc-900 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 dark:border-zinc-800">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                                            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">{raid.title}</h3>
                                            <div className="inline-flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl w-fit">
                                                {diffTypes.map((diff: any) => (
                                                    <button key={diff} onClick={() => handleDiffChange(raid.title, diff)} className={`px-3 py-1.5 md:py-2 rounded-lg text-[11px] md:text-[12px] font-bold transition-all ${selection?.diff === diff ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                                                        {diff}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {selection ? (
                                                raid.difficulty.filter((d: any) => d.difficulty === selection.diff).map((g: any) => {
                                                    const isGateSelected = selection.selectedGates.includes(g.gate);
                                                    const isExtraSelected = selection.extraGates.includes(g.gate);
                                                    return (
                                                        <div key={g.gate} className={`flex items-center group rounded-xl md:rounded-2xl p-3 md:p-4 transition-colors ${isGateSelected ? 'bg-indigo-50/50 dark:bg-indigo-500/5' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'}`}>
                                                            <button onClick={() => toggleGateSequential(raid.title, g.gate)} className={`w-5 h-5 md:w-6 md:h-6 rounded-md border-2 flex items-center justify-center transition-all ${isGateSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-zinc-700 bg-transparent'}`}>
                                                                {isGateSelected && <Check size={12} strokeWidth={4} />}
                                                            </button>
                                                            <div className="ml-3 md:ml-4 flex-1 cursor-pointer" onClick={() => toggleGateSequential(raid.title, g.gate)}>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-sm md:text-base font-bold ${isGateSelected ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{g.gate}</span>
                                                                    <span className="text-[10px] md:text-xs text-slate-400 font-medium">{g.gold.toLocaleString()} G</span>
                                                                </div>
                                                            </div>
                                                            {isGateSelected && (
                                                                <button onClick={() => toggleExtra(raid.title, g.gate)} className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${isExtraSelected ? 'bg-yellow-600 text-white border-yellow-700' : 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}>더보기</button>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl text-slate-300 font-bold text-xs md:text-sm">난이도를 먼저 선택해 주세요</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* [우측] 요약창 (데스크톱 유지) */}
                        <aside className="hidden lg:block sticky top-8">
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-zinc-800">
                                <SummaryContent />
                            </div>
                        </aside>
                    </div>
                </main>
            </div>

            {/* [모바일 전용] 하단 고정바 */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-zinc-800 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between gap-4">
                    <div onClick={() => setIsMobileSummaryOpen(true)} className="cursor-pointer">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Total</span>
                            <ChevronDown size={10} className="text-slate-400" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{calculateTotalGold().toLocaleString()}</span>
                            <span className="text-xs font-bold text-indigo-500">G</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileSummaryOpen(true)}
                        className="flex-1 bg-slate-900 dark:bg-indigo-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-transform active:scale-95"
                    >
                        상세 내역 확인 ({selectedRaids.length})
                    </button>
                </div>
            </div>

            {/* [모바일 전용] 하단 상세 내역 Drawer */}
            <AnimatePresence>
                {isMobileSummaryOpen && (
                    <>
                        {/* 배경 오버레이 */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileSummaryOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]"
                        />

                        {/* 모바일 드로워 (스와이프 기능 추가) */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}

                            // --- 스와이프(Drag) 설정 시작 ---
                            drag="y" // 세로 방향으로 드래그 가능
                            dragConstraints={{ top: 0, bottom: 0 }} // 위로는 못 올라가게 제한
                            dragElastic={0.2} // 경계를 넘었을 때의 탄성
                            onDragEnd={(event, info) => {
                                // 아래로 100px 이상 빠르게 내리거나 드래그하면 닫힘
                                if (info.offset.y > 100 || info.velocity.y > 500) {
                                    setIsMobileSummaryOpen(false);
                                }
                            }}
                            // --- 스와이프(Drag) 설정 끝 ---

                            className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-[2.5rem] z-[70] p-8 shadow-2xl border-t border-white/20 touch-none"
                        >
                            {/* 상단 드래그 핸들 바 (시각적 힌트) */}
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full mx-auto mb-8 cursor-grab active:cursor-grabbing" />

                            {/* 내부 콘텐츠 영역 - 스크롤이 필요한 경우를 위해 overflow 처리 */}
                            <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                                <SummaryContent />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GoldCalculator;