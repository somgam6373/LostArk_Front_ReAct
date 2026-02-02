import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingBanner: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(true);

  return (
      <AnimatePresence>
        {isVisible && (
            <motion.div
                initial={{ y: 100, x: '-50%', opacity: 0 }}
                animate={{ y: 0, x: '-50%', opacity: 1 }}
                exit={{ y: 100, x: '-50%', opacity: 0 }}
                // 모바일에서는 bottom-4로 하단 여백 최적화
                className="fixed bottom-4 md:bottom-8 left-1/2 z-50 w-[92%] md:w-[95%] max-w-3xl"
            >
              <div className="bg-midnight dark:bg-surface/80 text-white px-5 py-5 md:px-8 md:py-6 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-none border border-white/10 backdrop-blur-xl bg-opacity-95 overflow-hidden relative">

                {/* 배경 장식 (모바일에서도 유지) */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>

                {/* 메인 컨텐츠 레이아웃: 모바일 flex-col, PC flex-row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">

                  <div className="flex items-center gap-4 md:gap-6">
                    {/* 아이콘 크기 미세 조정 */}
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 dark:bg-void rounded-xl md:rounded-2xl flex items-center justify-center text-midnight-light dark:text-white border border-white/20 dark:border-white/5 shrink-0 shadow-inner">
                      <Sparkles size={24} className="text-yellow-400 md:size-[28px]" />
                    </div>
                    <div>
                      <p className="font-black text-base md:text-lg tracking-tight leading-tight">
                        아크 패시브 시뮬레이터 업데이트!
                      </p>
                      <p className="text-[12px] md:text-sm text-slate-300 dark:text-white/60 font-medium mt-1 leading-snug">
                        내 캐릭터의 가상 데미지를 지금 바로 계산해보세요.
                      </p>
                    </div>

                    {/* 모바일 전용 닫기 버튼 (아이콘 옆 배치로 공간 절약) */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="md:hidden absolute top-0 right-0 p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X size={20} className="text-slate-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                    {/* 버튼: 모바일에서 가로 꽉 차게 */}
                    <button className="flex-1 md:flex-none px-6 py-3 bg-white dark:bg-white text-midnight dark:text-void font-black text-sm rounded-xl hover:bg-slate-100 transition-all shadow-lg active:scale-95">
                      지금 확인하기
                    </button>

                    {/* 데스크톱 전용 닫기 버튼 */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="hidden md:block p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X size={24} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
  );
};