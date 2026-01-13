import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TabNavigation = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
    const tabs = ['전투', '스킬', '아크 패시브', '캐릭터', '길드'];

    // 회전 상태 관리를 위한 state
    const [isRotating, setIsRotating] = useState(false);
    const navigate = useNavigate();

    const goToSimulator = () => {
        // 이동하고자 하는 정확한 경로로 수정하세요 (예: '/simulator' 또는 '/sim')
        navigate('/simulatorPage');
    };

    const handleUpdateClick = () => {
        if (isRotating) return; // 이미 회전 중이면 중복 실행 방지

        setIsRotating(true);

        // 0.8초 후 회전 중지 (애니메이션 시간)
        setTimeout(() => {
            setIsRotating(false);
        }, 800);

        // 여기에 실제 업데이트 로직을 추가하세요
        console.log("데이터 업데이트 중...");
    };

    return (
        <div className="flex gap-1 overflow-x-auto bg-zinc-900/30 p-3 rounded-2xl border border-white/5 items-center">
            {tabs.map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 rounded-xl text-[13px] font-black transition-all whitespace-nowrap ${
                        activeTab === tab
                            ? 'bg-emerald-500 text-black'
                            : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    {tab}
                </button>
            ))}

            <div className="flex-1" />

            <div className="flex gap-2 pr-2">

                <button                     
                    onClick={goToSimulator}
                    className="
                    /* 레이아웃 & 정렬 */
        flex items-center justify-center gap-2
        px-4 py-1.5

        /* 기본 색상 & 텍스트 */
        bg-zinc-100 text-zinc-950
        text-[14px] font-bold
        rounded-lg

        /* 효과 & 애니메이션 */
        transition-all duration-200 shadow-md
        hover:bg-[#7C3AED] hover:text-white
        active:scale-95"
                    >
                    <span>
                        시뮬레이터 전환
                    </span>
                </button>

                <button
                    onClick={handleUpdateClick}
                    className="
                        flex items-center justify-center gap-2
                        px-4 py-1.5
                        bg-zinc-100 text-zinc-950
                        rounded-lg
                        text-[14px] font-bold
                        hover:bg-[#7C3AED] hover:text-white
                        transition-all duration-200 shadow-md
                        active:scale-95  /* 클릭 시 살짝 작아지는 효과 추가 */
                    "
                >
                    <RefreshCw
                        className={`w-4 h-4 transition-transform ${isRotating ? 'animate-spin' : ''}`}
                    />
                    <span>업데이트</span>
                </button>
            </div>
        </div>
    );
};