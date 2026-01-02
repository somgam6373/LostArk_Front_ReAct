
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
          className="fixed bottom-8 left-1/2 z-50 w-[95%] max-w-3xl"
        >
          <div className="bg-midnight dark:bg-surface/80 text-white px-8 py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-none flex items-center justify-between border border-white/10 backdrop-blur-xl bg-opacity-95 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-14 h-14 bg-white/10 dark:bg-void rounded-2xl flex items-center justify-center text-midnight-light dark:text-white border border-white/20 dark:border-white/5 shadow-inner">
                <Sparkles size={28} className="text-yellow-400" />
              </div>
              <div>
                <p className="font-black text-lg tracking-tight">LOAPANG: 아크 패시브 시뮬레이터 대규모 업데이트!</p>
                <p className="text-sm text-slate-300 dark:text-white/60 font-medium mt-1">내 캐릭터의 가상 데미지와 보석 효율을 지금 바로 계산해보세요.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <button className="px-6 py-2.5 bg-white dark:bg-white text-midnight dark:text-void font-black text-sm rounded-xl hover:bg-slate-100 transition-all shadow-lg active:scale-95">
                지금 확인하기
              </button>
              <button 
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
