import React from 'react';

export const SidebarAds: React.FC<{ side: 'left' | 'right' }> = ({ side }) => {
    return (
        <>
            {/* [데스크톱 전용] 기존 고정형 사이드바 (건드리지 않음) */}
            <div className={`hidden lg:flex flex-col fixed top-24 ${side === 'left' ? 'left-12' : 'right-12'} w-56 h-[calc(100vh-12rem)]`}>
                <p className="text-[10px] font-black text-slate-300 dark:text-white/20 uppercase tracking-[0.3em] mb-4 text-center">Sponsored</p>
                <div className="w-full h-full bg-white dark:bg-surface rounded-[3rem] shadow-xl dark:shadow-none border border-slate-100 dark:border-white/10 flex flex-col items-center justify-start p-10 space-y-12">
                    <div className="w-full aspect-[2/3] bg-slate-50 dark:bg-void rounded-[2rem] flex flex-col items-center justify-center border border-slate-100 dark:border-white/5">
                        <p className="text-[11px] font-black text-slate-300 dark:text-white/10 uppercase italic tracking-widest">Ad Area</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-12 h-1 px-4 bg-midnight/10 dark:bg-white/10 rounded-full"></div>
                        <p className="text-xs text-slate-400 dark:text-white/40 font-bold leading-relaxed">
                            {side === 'left' ? '아크라시아를 위한 최적의 파트너십' : 'PREMIUM SPONSORS'}
                        </p>
                        <p className="text-[10px] text-slate-300 dark:text-white/20 font-medium leading-relaxed">
                            {side === 'left' ? 'LOAPANG은 모험가분들과 함께 성장합니다.' : 'Your brand could be featured here.'}
                        </p>
                    </div>

                    <div className="w-full aspect-[2/3] bg-slate-50 dark:bg-void rounded-[2rem] flex flex-col items-center justify-center border border-slate-100 dark:border-white/5">
                        <p className="text-[11px] font-black text-slate-300 dark:text-white/10 uppercase italic tracking-widest">Ad Area</p>
                    </div>
                </div>
            </div>

            {/* [모바일 전용] 인라인 배너형 레이아웃 (새로 추가) */}
            <div className="lg:hidden w-full my-6">
                <p className="text-[8px] font-black text-slate-300 dark:text-white/20 uppercase tracking-[0.3em] mb-2 px-4">Sponsored</p>
                <div className="mx-4 bg-white dark:bg-surface rounded-3xl border border-slate-100 dark:border-white/10 p-4 flex items-center gap-4">
                    {/* 광고 영역 (작은 썸네일 형태) */}
                    <div className="w-20 h-20 bg-slate-50 dark:bg-void rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-white/5 shrink-0">
                        <p className="text-[8px] font-black text-slate-300 dark:text-white/10 uppercase italic text-center px-1">Ad Area</p>
                    </div>

                    {/* 텍스트 영역 */}
                    <div className="flex-1">
                        <p className="text-[11px] text-slate-600 dark:text-white/60 font-black leading-tight mb-1">
                            {side === 'left' ? '아크라시아 최적의 파트너' : 'PREMIUM SPONSOR'}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-white/30 font-medium leading-relaxed line-clamp-2">
                            {side === 'left' ? 'LOAPANG은 모든 모험가분들을 응원합니다.' : '귀하의 브랜드가 여기에 위치할 수 있습니다.'}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};