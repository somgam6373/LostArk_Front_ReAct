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


export const CharacterCard: React.FC<{
    character: CharacterInfo;
    characterName: string;
    onUpdate: () => void; // ✅ ProfilePage의 handleUpdateClick
}> = ({ character, characterName, onUpdate }) => {
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
            case '스킬': return <SkillTab skills={(character as any).skills} />;
            case '아크 패시브': return <ArkPassiveTab character={character} />;
            case '캐릭터': return <CharacterDetailTab />;
            default: return <CombatTab character={character} />;
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ✅ 카드 위 버튼 바 (원복) */}
            <div className="flex justify-end gap-2 pr-2">
                <button
                    onClick={goToSimulator}
                    className="
            flex items-center justify-center gap-2
            px-4 py-1.5
            bg-zinc-100 text-zinc-950
            text-[14px] font-bold
            rounded-lg
            transition-all duration-200 shadow-md
            hover:bg-[#7C3AED] hover:text-white
            active:scale-95
          "
                >
                    시뮬레이터 전환
                </button>

                <button
                    onClick={onUpdate}
                    className="
            flex items-center justify-center gap-2
            px-4 py-1.5
            bg-zinc-900/40 text-zinc-200
            text-[14px] font-bold
            rounded-lg
            border border-white/10
            transition-all duration-200 shadow-md
            hover:bg-zinc-800/60
            active:scale-95
          "
                >
                    업데이트
                </button>
            </div>

            <CharacterHeader character={character} />
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="min-h-[400px]"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
