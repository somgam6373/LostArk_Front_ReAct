import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Shield, Calculator, Gavel, Settings, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const menuItems = [
        { label: '홈', icon: Home, path: '/' },
        { label: '군단장 레이드', icon: Shield, path: '/raidPage' },
        { label: '전투 시뮬레이터', icon: Calculator, path: '/simulatorPage' },
        { label: '경매 계산기', icon: Gavel, path: '/auctionPage' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 1. 뒷배경 (Overlay) - 모바일에서 더 짙게 처리하여 몰입감 향상 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md md:backdrop-blur-sm"
                    />

                    {/* 2. 사이드바 메뉴창 */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        // 모바일에서는 화면의 80%, 데스크톱은 300px 고정
                        className="fixed top-0 left-0 bottom-0 z-[201] w-[80vw] md:w-[300px] bg-white dark:bg-[#0c0c0d] shadow-[20px_0_60px_rgba(0,0,0,0.5)] border-r border-white/5"
                    >
                        <div className="flex flex-col h-full">
                            {/* 헤더 부분: 모바일 터치 영역을 위해 패딩 유지 및 폰트 조정 */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
                                <h2 className="text-xl md:text-2xl font-black text-midnight dark:text-white tracking-tighter">
                                    LOAPANG
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-2xl active:scale-90 transition-all"
                                >
                                    <X size={22} className="text-slate-500 dark:text-zinc-400" />
                                </button>
                            </div>

                            {/* 메뉴 리스트: 모바일에서 버튼 간격 및 터치감 최적화 */}
                            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 no-scrollbar">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => {
                                            navigate(item.path);
                                            onClose();
                                        }}
                                        className="w-full flex items-center gap-4 px-5 py-4 md:py-3.5 rounded-2xl text-slate-600 dark:text-zinc-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-[0.98] active:bg-indigo-50 dark:active:bg-indigo-500/20 transition-all group"
                                    >
                                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-900 group-hover:bg-white dark:group-hover:bg-zinc-800 transition-colors">
                                            <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                                        </div>
                                        <span className="text-[16px] md:text-[15px] tracking-tight">{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* 하단 푸터: 모바일 하단바 여백(Safe Area) 고려 */}
                            <div className="p-6 pb-10 md:pb-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-zinc-950/30">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between text-[11px] md:text-[12px] text-zinc-500 font-black uppercase tracking-widest">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            v 1.2.0
                                        </span>
                                        <span className="text-zinc-400">Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;