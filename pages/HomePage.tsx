import React, { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (!q) return;
        navigate(`/profilePage?name=${encodeURIComponent(q)}`);
    };

    return (
        <motion.div
            key="home"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            /* 1. justify-center를 제거하여 위에서부터 시작하게 함
               2. pt-32 (또는 pt-20)를 사용하여 상단 여백을 원하는 만큼 조절
            */
            className="flex flex-col items-center min-h-screen pt-20 mx-auto max-w-4xl px-4"
        >
            {/* 로고 섹션 (간격을 더 좁힘) */}
            <div className="text-center mb-12">
                <h1 className="text-[80px] font-black tracking-tighter text-white mb-2 leading-none">
                    LOAPANG
                </h1>
                <p className="text-zinc-400 text-lg font-medium tracking-wide">
                    로스트아크 고효율 전적 검색 및 전투 시뮬레이터
                </p>
            </div>

            {/* 검색창 섹션 */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative group mb-8">
                <div className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-900 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <div className="relative z-10">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        placeholder="캐릭터명을 입력하세요"
                        className="w-full h-24 px-10 rounded-[2.5rem] bg-zinc-900/90 border-2 border-white/10 focus:border-indigo-500 outline-none text-2xl font-bold shadow-2xl transition-all text-white placeholder:text-zinc-700"
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-white text-black rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center"
                    >
                        <Search size={28} strokeWidth={3} />
                    </button>
                </div>
            </form>


            {/* 통계 섹션 (이 부분도 위로 당겨지길 원한다면 mt를 줄이세요) */}
            <div className="mt-24 grid grid-cols-3 gap-12 w-full max-w-2xl border-t border-white/5 pt-12">
                {/* ... 통계 내용 동일 */}
            </div>
        </motion.div>
    );
};

export default HomePage;