import React, { useState } from 'react';
import { CharacterInfo } from '../../types.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { CharacterHeader } from './CharacterHeader';
import { TabNavigation } from './TabNavigation';
import { CombatTab } from './tabs/CombatTab';
import { SkillTab } from "@/components/profile/tabs/SkillTab.tsx";
import { ArkPassiveTab } from "@/components/profile/tabs/ArkPassiveTab.tsx";
import { CharacterDetailTab } from "@/components/profile/tabs/CharacterDetailTab.tsx";
import { Jewely } from "@/components/profile/Jewerly.tsx";

export const CharacterCard: React.FC<{
    character: CharacterInfo;
    characterName: string;
    onUpdate: () => void;
    isCooldown: boolean;
    timeLeft: number;
}> = ({ character, characterName, onUpdate, isCooldown, timeLeft }) => {
    const [activeTab, setActiveTab] = useState('전투');
    const navigate = useNavigate();

    const goToSimulator = () => {
        const name = (characterName || '').trim();
        if (!name) {
            navigate('/simulatorPage');
            return;
        }
        navigate(`/simulatorPage?name=${encodeURIComponent(name)}`);
    };

    const renderContent = () => {
        switch (activeTab) {
            case '전투': return <CombatTab character={character} />;
            case '스킬': return <SkillTab character={character} />;
            case '아크 패시브': return <ArkPassiveTab character={character} />;
            case '캐릭터': return <CharacterDetailTab character={character}/>;
            default: return <CombatTab character={character} />;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full px-0 lg:px-0">

            {/* [좌측 구역]: 캐릭터 요약 정보 및 네비게이션 */}
            <aside className="w-full lg:w-[420px] shrink-0 lg:sticky lg:top-24 h-fit space-y-3 lg:space-y-5">

                {/* 1. 캐릭터 헤더 (상단 프로필) */}
                <div className="bg-zinc-900/60 rounded-none md:rounded-2xl lg:rounded-3xl border-y md:border border-zinc-800/50 overflow-hidden shadow-2xl">
                    <CharacterHeader character={character} />
                </div>

                {/* 2. 탭 네비게이션 (모바일에서 매우 중요) */}
                {/* z-index 40으로 설정하여 다른 요소 위로, 모바일에서는 top-0에 고정 */}
                <div className="sticky top-0 lg:static z-40 bg-zinc-950/80 lg:bg-zinc-900/60 backdrop-blur-xl lg:backdrop-blur-none border-y md:border border-zinc-800/50 p-1.5 lg:p-3 shadow-xl">
                    <TabNavigation
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onUpdate={onUpdate}
                        onSimulator={goToSimulator}
                        isCooldown={isCooldown}
                        timeLeft={timeLeft}
                    />
                </div>

                {/* 3. 보석 정보 (모바일에서는 요약된 정보 노출 권장) */}
                <div className="bg-zinc-900/60 rounded-none md:rounded-2xl lg:rounded-3xl border-y md:border border-zinc-800/50 overflow-hidden shadow-2xl">
                    <Jewely character={character} />
                </div>
            </aside>

            {/* [우측 구역]: 메인 콘텐츠 (탭 내용) */}
            <main className="flex-1 min-w-0 pb-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        /* 모바일에서 빠른 전환을 위해 y축 이동값 축소(10 -> 4) */
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="min-h-[300px] lg:min-h-[600px] px-4 lg:px-0"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};