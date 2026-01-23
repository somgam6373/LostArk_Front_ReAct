import React, { useEffect, useState } from 'react';
import { Loader2, ShieldAlert, Zap, Sparkles, Layers, ChevronRight,Diamond  } from 'lucide-react';
import EquipmentTooltip from "@/components/profile/Tooltip/EquipmentTooltip.tsx";
import AccessoryTooltip from '@/components/profile/Tooltip/AccessoryTooltip.tsx';
import ArkCoreTooltip from '@/components/profile/Tooltip/ArkCoreTooltip.tsx';
import JewelryTooltip from '@/components/profile/Tooltip/JewelryTooltip.tsx';
import engravingIconMap from "./engravingsIdTable.json";
import mokoko from "../../../assets/모코코.png";

/* ================= 인터페이스 ================= */
// --장비 인터페이스
interface Equipment {
    Type: string;
    Name: string;
    Icon: string;
    Grade: string;
    Tooltip: string;
}
// --- 각인 인터페이스  ---
interface ArkGem {
    Icon: string;
    Grade: string;
    Tooltip: string;
}

interface ArkEffect {
    Name: string;
    Level: number;
    Tooltip: string;
}

interface ArkSlot {
    Index: number;
    Icon: string;
    Name: string;
    Point: number;
    Grade: string;
    Tooltip: string | object;
    Gems?: any[];
}

interface ArkCoreData {
    Slots: ArkSlot[];
    Effects: ArkEffect[]; // 데이터에 맞게 수정됨
}

interface CardEffectItem {
    Name: string;
    Description: string;
}

interface CardEffect {
    Items: CardEffectItem[];
}
interface Card {
    Name: string;
    Icon: string;
    AwakeCount: number;
}
interface CardData {
    Cards: Card[];
    Effects: CardEffect[];
}

interface GemCombatProps {
    gems: any;
    skillData: any[];
}

/* ✅ 아크 패시브 각인(우측 “활성 각인 (아크 패시브)”에 쓰는 데이터) */
type ArkPassiveEffect = {
    Name: string;
    Description?: string;
    Icon?: string; // 있으면 사용
    Level?: number; // 각인서 활성 단계(0~4)
    AbilityStoneLevel?: number; // 스톤 추가 활성(0~4)
    AbilityStoneIcon?: string; // 있으면 사용
};

type EngravingsResponse = {
    ArkPassiveEffects?: ArkPassiveEffect[];
};

/** 어빌리티 스톤 아이콘: 데이터에 없으면 이걸로 대체 */
const FALLBACK_ABILITY_STONE_ICON =
    'https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_7_206.png';


/* ================= 컴포넌트 ================= */
export const CombatTab = ({ character }: { character: any }) => {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [arkGrid, setArkGrid] = useState<ArkCoreData | null>(null);
    const [engravings, setEngravings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [gems, setGems] = useState<any>(null);
    const [avatars, setAvatars] = useState<any[]>([]);
    const [avatarViewMode, setAvatarViewMode] = useState<'skin' | 'inner'>('skin');
    const [cards, setCards] = useState<CardData | null>(null);
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [arkPassive, setArkPassive] = useState<any>(null);
    const [skillData, setSkillData] = useState<any[]>([]);
    const [activePassiveTab, setActivePassiveTab] = useState('진화');
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    const [hoveredData, setHoveredData] = React.useState<any>(null);
    const [accHoverIdx, setAccHoverIdx] = React.useState<number | null>(null);
    const [accHoverData, setAccHoverData] = React.useState<any>(null);
    const [arkCoreHoverIdx, setArkCoreHoverIdx] = React.useState<any>(null);
    const [arkCoreHoverData, setArkCoreHoverData] = React.useState<any>(null);
    const [jewlryHoverIdx , setJewlryHoverIdx] = React.useState<any>(null);
    const [jewlryHoverData, setJewlryHoverData] = React.useState<any>(null);


    const normalizeEngravingName = (name: string) => {
        return (name || "")
            .replace(/\[[^\]]*]/g, "")     // [강화] 같은거 제거
            .replace(/\([^)]*\)/g, "")     // (중력 해방) 같은거 제거
            .replace(/\s+/g, " ")
            .trim();
    };

    const getEngravingIconUrl = (name: string) => {
        const key = normalizeEngravingName(name);
        return (engravingIconMap as Record<string, string>)[key] || "";
    };

    const cleanText = (text: any): string => {
        if (!text) return '';

        if (typeof text === 'string') {
            return text.replace(/<[^>]*>?/gm, '').trim();
        }

        if (typeof text === 'object' && typeof text.Text === 'string') {
            return cleanText(text.Text);
        }

        return '';
    };

    const GemSlot = ({ gem, index, hoverIdx, hoverData, setHoverIdx, setHoverData, isCenter = false }: any) => {
        // 1. 아이콘 크기 고정 (요청하신 대로 컴팩트하게 유지)
        const sizeClasses = isCenter ? "w-20 h-20" : "w-[72px] h-[72px]";

        if (!gem) return <div className={`${sizeClasses} rounded-full bg-white/5 opacity-10 border border-zinc-800`} />;

        let skillIcon = gem.Icon;
        let gradeColor = "#1f2937"; // 기본 배경색 (zinc-800 계열)

        try {
            if (gem.Tooltip) {
                const tooltip = JSON.parse(gem.Tooltip);
                skillIcon = tooltip.Element_001?.value?.slotData?.iconPath || gem.Icon;
                const gradeName = tooltip.Element_001?.value?.leftStr0 || gem.Grade || "";

                // 등급에 따른 배경색 지정 (보석 등급 고유색의 투명도 버전)
                if (gradeName.includes("고대")) gradeColor = "#2a4d4f";      // 고대
                else if (gradeName.includes("유물")) gradeColor = "#4d2b14"; // 유물
                else if (gradeName.includes("전설")) gradeColor = "#45381a"; // 전설
            }
        } catch (e) { skillIcon = gem.Icon; }

        return (
            <div
                className="relative group flex flex-col items-center"
                onMouseLeave={() => { setHoverIdx(null); setHoverData(null); }}
            >
                <div
                    className="flex flex-col items-center cursor-help"
                    onMouseEnter={() => { setHoverIdx(index); setHoverData(gem); }}
                >
                    <div
                        className={`${sizeClasses} rounded-full transition-all duration-300 group-hover:scale-105 flex items-center justify-center overflow-hidden border border-zinc-700/50 shadow-lg`}
                        style={{
                            // 2. 아이콘 배경색만 등급에 맞게 변경
                            background: `radial-gradient(circle at center, ${gradeColor} 0%, #07090c 100%)`,
                        }}
                    >
                        <img
                            src={skillIcon}
                            alt=""
                            className="w-full h-full object-cover scale-110 drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]"
                        />
                    </div>

                    {/* 레벨 표시 */}
                    <span className="mt-1 text-zinc-500 text-[11px] font-bold group-hover:text-zinc-300 transition-colors">
                    Lv.{gem.Level}
                </span>
                </div>

                {/* 툴팁: 보석 바로 옆에 뜨도록 조정 */}
                {hoverIdx === index && hoverData && (
                    <div className="absolute left-full top-0 z-[9999] pl-3 pointer-events-none">
                        <div className="animate-in fade-in zoom-in-95 duration-150">
                            <JewelryTooltip gemData={hoverData} />
                        </div>
                    </div>
                )}
            </div>
        );
    };


    /* ================= 데이터 로딩 ================= */
    useEffect(() => {
        if (!character?.CharacterName) return;
        setLoading(true);

        Promise.all([
            fetch(`/equipment?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/arkgrid?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/engravings?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/gems?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/avatars?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/cards?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/arkpassive?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/combat-skills?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json())
        ])
            .then(([eqData, arkData, engData, gemData, avatarData, cardData, passiveData, skillData]) => {
                setEquipments(Array.isArray(eqData) ? eqData : []);
                setArkGrid(arkData);
                setEngravings(engData);
                setGems(gemData); // 보석 데이터 저장
                setAvatars(Array.isArray(avatarData) ? avatarData : []);
                setCards(cardData);
                setArkPassive(passiveData);
                setSkillData(skillData);
            })
            .catch(err => console.error('데이터 로딩 실패:', err))
            .finally(() => setLoading(false));
    }, [character?.CharacterName]);

    /* ================= 유틸 ================= */
    const getItemsByType = (types: string[]) =>
        equipments.filter(i => types.includes(i.Type));

    const getQualityColor = (q: number) => {
        if (q === 100) return 'text-[#FF8000] border-[#FF8000]';
        if (q >= 90) return 'text-[#CE43FB] border-[#CE43FB]';
        if (q >= 70) return 'text-[#00B0FA] border-[#00B0FA]';
        if (q >= 30) return 'text-[#00D100] border-[#00D100]';
        return 'text-[#FF4040] border-[#FF4040]';
    };
    const gradeStyles: any = {
            '일반': {
                bg: 'from-zinc-800 to-zinc-950',
                border: 'border-white/10',
                text: 'text-zinc-400',
                glow: '',
                accent: 'bg-zinc-500'
            },
            '고급': {
                bg: 'from-[#1a2e1a] to-[#0a0f0a]',
                border: 'border-[#48c948]/30 shadow-[0_0_10px_rgba(72,201,72,0.05)]',
                text: 'text-[#4edb4e] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
                glow: 'shadow-[#48c948]/5',
                accent: 'bg-[#48c948]'
            },
            '희귀': {
                bg: 'from-[#1a2a3e] to-[#0a0d12]',
                border: 'border-[#00b0fa]/30 shadow-[0_0_10px_rgba(0,176,250,0.1)]',
                text: 'text-[#33c2ff] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
                glow: 'shadow-[#00b0fa]/10',
                accent: 'bg-[#00b0fa]'
            },
            '영웅': {
                bg: 'from-[#2e1a3e] to-[#120a1a]',
                border: 'border-[#ce43fb]/30 shadow-[0_0_10px_rgba(206,67,251,0.1)]',
                text: 'text-[#d966ff] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
                glow: 'shadow-[#ce43fb]/10',
                accent: 'bg-[#ce43fb]'
            },
            '전설': {
                bg: 'from-[#41321a] to-[#1a120a]',
                border: 'border-[#f99200]/40 shadow-[0_0_10px_rgba(249,146,0,0.15)]',
                text: 'text-[#ffaa33] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
                glow: 'shadow-[#f99200]/15',
                accent: 'bg-[#f99200]'
            },
            '유물': {
                bg: 'from-[#351a0a] to-[#0a0a0a]',
                border: 'border-[#fa5d00]/50 shadow-[0_0_10px_rgba(250,93,0,0.2)]',
                text: 'text-[#ff7526] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
                glow: 'shadow-[#fa5d00]/25 drop-shadow-[0_0_15px_rgba(250,93,0,0.35)]',
                accent: 'bg-[#fa5d00]'
            },
            '고대': {
                bg: 'from-[#3d3325] to-[#0f0f10]',
                border: 'border-[#e9d2a6]/40',
                text: 'text-[#e9d2a6]',
                glow: 'shadow-[#e9d2a6]/25 drop-shadow-[0_0_15px_rgba(233,210,166,0.3)]',
                accent: 'bg-[#e9d2a6]'
            },
            '에스더': {
                bg: 'from-[#0d2e2e] to-[#050505]',
                border: 'border-[#2edbd3]/60 shadow-[0_0_12px_rgba(46,219,211,0.2)]',
                text: 'text-[#45f3ec] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
                glow: 'shadow-[#2edbd3]/30 drop-shadow-[0_0_18px_rgba(46,219,211,0.4)]',
                accent: 'bg-[#2edbd3]'
            }
    };

    /* ================= 로딩 ================= */
    if (loading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500 w-8 h-8 mb-3" />
                <span className="text-zinc-500 text-sm">정보를 불러오는 중...</span>
            </div>
        );
    }


    /* ================= 렌더 ================= */
    return (
        <div className="flex flex-col lg:flex-row gap-10 p-6 bg-[#0f0f0f] text-zinc-300 min-h-screen max-w-[1800px] mx-auto">

            {/* 왼쪽 섹션: 장비 & 각인 & 아크패시브 */}
            <div className="flex-1 min-w-0 space-y-10">
                <section className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start bg-[#121213] p-6 rounded-3xl border border-white/5">
                    {/* 왼쪽: 전투 장비 Section (가로 너비 유지) */}
                    <div className="w-full lg:w-[40%] flex flex-col">
                        {/* 타이틀 영역 */}
                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                            <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                            <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                전투 장비
                            </h1>
                        </div>

                        <div className="flex flex-col gap-2">
                            {getItemsByType(['무기', '투구', '상의', '하의', '장갑', '어깨'])
                                .sort((a, b) => (a.Type === '무기' ? 1 : b.Type === '무기' ? -1 : 0))
                                .map((item, i) => {
                                    let tooltip;
                                    try { tooltip = JSON.parse(item.Tooltip); } catch (e) { return null; }

                                    const quality = tooltip?.Element_001?.value?.qualityValue ?? 0;
                                    const reinforceLevel = item.Name.match(/\+(\d+)/)?.[0] || '';
                                    const itemName = cleanText(item.Name).replace(/\+\d+\s/, '');

                                    const rawGrade = (item.Grade || "").trim();
                                    let currentGrade = "일반";

                                    if (rawGrade.includes('에스더') || item.Name.includes('에스더')) {
                                        currentGrade = '에스더';
                                    } else if (rawGrade.includes('고대')) {
                                        currentGrade = '고대';
                                    } else if (rawGrade.includes('유물')) {
                                        currentGrade = '유물';
                                    } else if (rawGrade.includes('전설')) {
                                        currentGrade = '전설';
                                    } else if (rawGrade.includes('영웅')) {
                                        currentGrade = '영웅';
                                    } else if (rawGrade.includes('희귀')) {
                                        currentGrade = '희귀';
                                    } else if (rawGrade.includes('고급')) {
                                        currentGrade = '고급';
                                    }
                                    const theme = gradeStyles[currentGrade] || gradeStyles['일반'];
                                    let advancedReinforce = "0";
                                    const advMatch = cleanText(tooltip?.Element_005?.value || "").match(/\[상급\s*재련\]\s*(\d+)단계/);
                                    if (advMatch) advancedReinforce = advMatch[1];

                                    return (
                                        <div key={item.Name}
                                            // 마우스 이벤트를 다시 최상위 div로 복구하여 모달 위에서도 유지가 가능하게 함
                                             onMouseEnter={() => {
                                                 setHoveredIndex(i);
                                                 setHoveredData(tooltip);
                                             }}
                                             onMouseLeave={() => {
                                                 setHoveredIndex(null);
                                                 setHoveredData(null);
                                             }}
                                             className="relative group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors h-[72px] cursor-help"
                                        >
                                            {/* 아이콘 영역 */}
                                            <div className="relative shrink-0">
                                                <div className={`p-0.5 rounded-lg border shadow-lg bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow || ''}`}>
                                                    <img src={item.Icon} className="w-12 h-12 rounded-md object-cover bg-black/20" alt={itemName} />
                                                    {(currentGrade === '고대' || currentGrade === '에스더') && (
                                                        <div className="absolute inset-0 rounded-lg shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] pointer-events-none" />
                                                    )}
                                                </div>

                                                <div className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(quality)} bg-zinc-900 text-[#e9d2a6]`}>
                                                    {quality}
                                                </div>

                                                {/* --- 툴팁 모달: 아이콘 바로 오른쪽 밀착 --- */}
                                                {hoveredIndex === i && hoveredData && (
                                                    <div
                                                        className="absolute left-full top-0 z-[9999] pointer-events-auto flex items-start"
                                                        // ml-3 대신 패딩을 사용하여 마우스 이동 경로(Bridge)를 확보
                                                        style={{ paddingLeft: '12px', width: 'max-content' }}
                                                    >
                                                        <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                                                            <EquipmentTooltip data={hoveredData} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 정보 영역 */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-[14px] truncate mb-0.5 ${theme.text}`}>
                                                    {itemName}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white/50 text-[12px]">재련 {reinforceLevel}</span>
                                                    {advancedReinforce !== "0" && (
                                                        <span className="text-sky-400 text-[12px] font-bold">상재 +{advancedReinforce}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                    {/* 오른쪽: 액세서리 Section (가로 너비 확장 및 내부 비율 조정) */}
                    <div className="w-full lg:w-[60%] flex flex-col">
                        {/* 타이틀 영역 */}
                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                            <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                            <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                악세사리
                            </h1>
                        </div>

                        <div className="flex flex-col gap-2">
                            {getItemsByType(['목걸이', '귀걸이', '반지', '팔찌'])
                                .filter(item => {
                                    try {
                                        const tooltip = JSON.parse(item.Tooltip);
                                        return (tooltip.Element_001?.value?.qualityValue ?? 0) !== -1;
                                    } catch(e) { return false; }
                                })
                                .map((item, i) => {
                                    const tooltip = JSON.parse(item.Tooltip);
                                    const quality = tooltip.Element_001?.value?.qualityValue ?? 0;
                                    const itemName = item.Name || "아이템 이름";

                                    const rawGrade = (item.Grade || "").trim();
                                    let currentGrade = "일반";
                                    if (rawGrade.includes('고대')) currentGrade = '고대';
                                    else if (rawGrade.includes('유물')) currentGrade = '유물';
                                    else if (rawGrade.includes('전설')) currentGrade = '전설';
                                    else if (rawGrade.includes('영웅')) currentGrade = '영웅';

                                    const theme = gradeStyles[currentGrade] || gradeStyles['일반'];
                                    const passive = cleanText(tooltip.Element_007?.value?.Element_001 || '').match(/\d+/)?.[0] || '0';
                                    const tierStr = tooltip.Element_001?.value?.leftStr2 || "";
                                    const tier = tierStr.replace(/[^0-9]/g, "").slice(-1) || "4";

                                    const grindContent = cleanText(tooltip.Element_006?.value?.Element_001 || tooltip.Element_005?.value?.Element_001 || '');
                                    const effects = [...grindContent.matchAll(/([가-힣\s]+?)\s*\+([\d.]+%?)/g)].map(m => ({
                                        name: m[1].trim(),
                                        value: m[2]
                                    }));

                                    const shortNames = {
                                        '추가 피해': '추피', '적에게 주는 피해': '적주피', '치명타 적중률': '치적', '치명타 피해': '치피',
                                        '공격력': '공격력', '무기 공격력': '무공', '조화 게이지 획득량': '아덴획득', '낙인력': '낙인력',
                                        '파티원 회복 효과': '파티회복', '파티원 보호막 효과': '파티보호', '아군 공격력 강화 효과': '아공강',
                                        '아군 피해량 강화 효과': '아피강', '최대 생명력': '최생', '최대 마나': '최마',
                                        '전투 중 생명력 회복량': '전투회복', '상태이상 공격 지속시간': '상태이상'
                                    };

                                    return (
                                        <div key={i}
                                            // 마우스 이동 시 툴팁 유지를 위해 전체 행에 이벤트 적용
                                             onMouseEnter={() => {
                                                 setAccHoverIdx(i);
                                                 setAccHoverData(tooltip);
                                             }}
                                             onMouseLeave={() => {
                                                 setAccHoverIdx(null);
                                                 setAccHoverData(null);
                                             }}
                                             className="relative group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors h-[72px] cursor-help"
                                        >
                                            {/* 아이콘 및 품질 (툴팁 기준점) */}
                                            <div className="relative shrink-0">
                                                <div className={`p-0.5 rounded-lg border shadow-lg bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow || ''}`}>
                                                    <img src={item.Icon} className="w-12 h-12 rounded-md object-cover bg-black/20" alt="" />
                                                    {currentGrade === '고대' && (
                                                        <div className="absolute inset-0 rounded-lg shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] pointer-events-none" />
                                                    )}
                                                </div>

                                                <div className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(quality)} bg-zinc-900 ${theme.text}`}>
                                                    {quality}
                                                </div>

                                                {/* --- 툴팁 모달: 아이콘 바로 오른쪽 밀착 및 유지 --- */}
                                                {accHoverIdx === i && accHoverData && (
                                                    <div
                                                        className="absolute left-full top-0 z-[9999] pointer-events-auto flex items-start"
                                                        // paddingLeft를 통해 아이콘과 모달 사이의 마우스 인식 끊김 방지
                                                        style={{ paddingLeft: '12px', width: 'max-content' }}
                                                    >
                                                        <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                                                            <AccessoryTooltip data={accHoverData} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 이름 및 티어 정보 */}
                                            <div className="flex-[2] min-w-0">
                                                <h3 className={`font-bold text-[14px] truncate mb-0.5 ${theme.text}`}>
                                                    {itemName}
                                                </h3>
                                                <div className="flex gap-4 text-[11px]">
                                                    <span className="text-orange-400 font-bold">깨달음 +{passive}</span>
                                                    <span className="text-white/40 font-medium">{tier}티어</span>
                                                </div>
                                            </div>

                                            {/* 연마 효과 영역 (기존 로직 유지) */}
                                            <div className="w-24 flex flex-col justify-center items-end border-l border-white/5 pl-3 shrink-0">
                                                {[0, 1, 2].map((idx) => {
                                                    const rawName = effects[idx]?.name || '';
                                                    const val = effects[idx]?.value || '-';
                                                    const dispName = shortNames[rawName] || rawName || '-';

                                                    const getDynamicColor = (name, valueStr) => {
                                                        if (valueStr === '-' || !valueStr) return 'text-white/20';
                                                        const num = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
                                                        const isPercent = valueStr.includes('%');
                                                        const thresholds = {
                                                            '추가 피해': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '적에게 주는 피해': { 상: 2.0, 중: 1.2, 하: 0.55 },
                                                            '치명타 적중률': { 상: 1.55, 중: 0.95, 하: 0.4 },
                                                            '치명타 피해': { 상: 4.0, 중: 2.4, 하: 1.1 },
                                                            '조화 게이지 획득량': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '낙인력': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '파티원 회복 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '파티원 보호막 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '아군 공격력 강화 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '아군 피해량 강화 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '공격력_PCT': { 상: 1.55, 중: 0.95, 하: 0.4 },
                                                            '공격력_FIXED': { 상: 390, 중: 195, 하: 80 },
                                                            '무기 공격력_PCT': { 상: 3.0, 중: 1.8, 하: 0.8 },
                                                            '무기 공격력_FIXED': { 상: 960, 중: 480, 하: 195 },
                                                            '최대 생명력': { 상: 4000, 중: 2400, 하: 1100 },
                                                            '최대 마나': { 상: 45, 중: 27, 하: 12 },
                                                            '상태이상 공격 지속시간': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '전투 중 생명력 회복량': { 상: 125, 중: 75, 하: 34 }
                                                        };

                                                        let targetKey = name;
                                                        if (name === '공격력') targetKey = isPercent ? '공격력_PCT' : '공격력_FIXED';
                                                        else if (name === '무기 공격력') targetKey = isPercent ? '무기 공격력_PCT' : '무기 공격력_FIXED';

                                                        const criteria = thresholds[targetKey];
                                                        if (!criteria) return 'text-zinc-500';
                                                        if (num >= criteria.상) return 'text-yellow-400 font-black';
                                                        if (num >= criteria.중) return 'text-purple-400 font-bold';
                                                        return 'text-blue-400 font-medium';
                                                    };

                                                    return (
                                                        <div key={idx} className="flex justify-between w-full text-[11px] leading-tight gap-2">
                                                            <span className="text-white/40 font-medium truncate">{dispName}</span>
                                                            <span className={`${getDynamicColor(rawName, val)} font-bold`}>{val}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                            <div className="flex items-center gap-4 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 h-[72px]">
                                팔찌 효율 계산 행
                            </div>
                        </div>
                    </div>
                </section>

                {/*====================보석 시작=============================*/}
                <section className="mt-10 w-full flex flex-col items-center px-4 select-none">
                    {/* 1. 헤더 (컴팩트 유지) */}
                    <div className="w-full max-w-3xl flex items-center justify-between border-b border-zinc-800/50 pb-2 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                            <h1 className="text-lg font-extrabold text-zinc-200 tracking-tight uppercase">보석</h1>
                        </div>
                        <div className="flex items-center gap-2.5 px-3 py-1.5 backdrop-blur-sm">
                            {/* 젬 포인트 바: 특성치와 구분되도록 sky-400 컬러 적용 */}
                            <div className="w-1 h-3 bg-sky-400 rounded-full"></div>

                            <span className="text-[13px] text-[#efeff0] font-semibold tracking-tight leading-none truncate">
                                {gems?.Effects?.Description?.replace(/<[^>]*>?/gm, '').trim() || "정보 없음"}
                            </span>
                        </div>
                    </div>

                    {/* 2. 메인 보드: 컴팩트한 사이즈 + 휘황찬란 배경 복구 */}
                    <div className="relative w-full max-w-2xl rounded-[40px] border border-white/5 flex items-center justify-center min-h-[320px] md:min-h-[380px] overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                         style={{
                             background: `radial-gradient(circle at center, #1a202c 0%, #0d1117 40%, #05070a 100%)`,
                         }}>

                        {/* 3. 배경 특수 효과 (내부에서만 작동하도록 제한) */}
                        <div className="absolute inset-0 z-0 pointer-events-none rounded-[40px] overflow-hidden">
                            {/* 중앙 마력 응집 */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.15)_0%,_transparent_70%)] animate-pulse" />

                            {/* 소용돌이 성운 효과 */}
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0%,_rgba(139,92,246,0.08)_15%,_transparent_30%,_rgba(56,189,248,0.08)_60%,_transparent_100%)] animate-[spin_25s_linear_infinite]" />

                            {/* 하단 심연 그라데이션 */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.4)_100%)]" />

                            {/* 미세 별무리 질감 */}
                            <div className="absolute inset-0 opacity-[0.04] mix-blend-screen"
                                 style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')` }} />
                        </div>

                        {/* 4. 보석 배치 (컴팩트 간격 고정) */}
                        <div className="relative z-10 flex flex-col items-center gap-2 transform scale-[0.85] sm:scale-100 transition-all duration-500">
                            {/* 1행 */}
                            <div className="flex items-center gap-12 md:gap-20 mb-1">
                                <div className="flex gap-3">
                                    <GemSlot gem={gems?.Gems?.[0]} index={0} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                    <GemSlot gem={gems?.Gems?.[1]} index={1} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                </div>
                                <div className="flex gap-3">
                                    <GemSlot gem={gems?.Gems?.[2]} index={2} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                    <GemSlot gem={gems?.Gems?.[3]} index={3} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                </div>
                            </div>

                            {/* 2행 */}
                            <div className="flex items-center justify-center gap-4 md:gap-6 -mt-1 relative">
                                <GemSlot gem={gems?.Gems?.[4]} index={4} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                <div className="relative">
                                    {/* 중앙 보석 후광 (컴팩트하게 조정) */}
                                    <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full scale-150 animate-pulse"></div>
                                    <GemSlot gem={gems?.Gems?.[5]} index={5} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} isCenter={true} />
                                </div>
                                <GemSlot gem={gems?.Gems?.[6]} index={6} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                            </div>

                            {/* 3행 */}
                            <div className="flex items-center gap-12 md:gap-20 -mt-1">
                                <div className="flex gap-3">
                                    <GemSlot gem={gems?.Gems?.[7]} index={7} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                    <GemSlot gem={gems?.Gems?.[8]} index={8} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                </div>
                                <div className="flex gap-3">
                                    <GemSlot gem={gems?.Gems?.[9]} index={9} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                    <GemSlot gem={gems?.Gems?.[10]} index={10} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* [우측] 장착 카드 섹션 (가로 정렬) */}
                <section className="flex-1 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">

                            <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                            <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                카드
                            </h1>

                            {selectedCard && (
                                <span className="text-[10px] text-orange-500 font-bold animate-pulse">
                                    ● {selectedCard} 상세 보기 중
                                </span>
                            )}
                        </div>
                        {cards?.Effects?.[0] && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-500 font-medium">
                                    {cards.Effects[0].Items[cards.Effects[0].Items.length - 1].Name.split(' 6세트')[0]}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 카드 6종 그리드 */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {cards?.Cards.map((card, idx) => {
                            const isSelected = selectedCard === card.Name;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedCard(isSelected ? null : card.Name)}
                                    className={`cursor-pointer rounded border transition-all duration-200 overflow-hidden group ${
                                        isSelected
                                            ? 'border-orange-500 ring-2 ring-orange-500/20 translate-y-[-4px]'
                                            : 'border-white/5 hover:border-white/20 hover:translate-y-[-2px]'
                                    }`}
                                >
                                    <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden">
                                        <img
                                            src={card.Icon}
                                            className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                                            alt=""
                                        />
                                        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-1.5 h-1.5 rounded-full border-[1px] border-black/40 ${
                                                    i < card.AwakeCount ? 'bg-yellow-400 shadow-[0_0_4px_#fbbf24]' : 'bg-zinc-800'
                                                }`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`p-1.5 text-center transition-colors ${isSelected ? 'bg-orange-600 text-white' : 'bg-[#1c1c1c] text-zinc-400'}`}>
                                        <p className="text-[11px] font-bold truncate">{card.Name}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 카드 세트 효과 요약 배너 (조건부 렌더링) */}
                    <div className="min-h-[100px] transition-all duration-300">
                        {selectedCard ? (
                            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-zinc-900/50 rounded border border-orange-500/20 animate-in fade-in slide-in-from-top-2">
                                <h3 className="text-[12px] text-orange-400 font-black mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-3.5 bg-orange-500 rounded-sm"></span>
                                    {cards?.Effects[0]?.Items[0].Name.split(' 2세트')[0]} 세트 효과
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                    {cards?.Effects[0]?.Items.map((item: any, i: number) => (
                                        <div key={i} className="flex flex-col py-1.5 border-b border-white/5">
                                            <span className="text-[11px] text-orange-300/80 font-bold mb-0.5">{item.Name}</span>
                                            <span className="text-[12px] text-zinc-200 leading-relaxed font-medium">{item.Description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* 카드를 선택하지 않았을 때 보여줄 가이드 문구 */
                            <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                                <p className="text-zinc-500 text-sm font-medium">카드를 클릭하면 상세 세트 효과를 확인할 수 있습니다.</p>
                            </div>
                        )}
                    </div>
                </section>
                {/* ================= 아바타 섹션 수정 끝 ================= */}
            </div>


            {/* 오른쪽 섹션: 장비 & 각인 & 아크패시브 */}

            <div className="flex-1 min-w-0 flex flex-col space-y-10">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#121213] p-6 rounded-xl border border-white/5 items-stretch">
                    {/* 왼쪽: 코어 섹션 */}
                    <section className="flex flex-col">
                        {/* 타이틀 영역 */}
                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                            <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                            <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                아크 그리드
                            </h1>
                        </div>

                        {/* 6행 1열 레이아웃: p-0 또는 p-1 등으로 왼쪽 여백 최소화 */}
                        <div className="flex flex-col gap-1">
                            {arkGrid?.Slots?.map((slot, i) => {
                                const nameParts = slot.Name.split(/\s*:\s*/);
                                const category = nameParts[0];
                                const subName = nameParts[1];

                                const rawGrade = (slot.Grade || "").trim();
                                let currentGrade = "일반";
                                if (rawGrade.includes('고대')) currentGrade = '고대';
                                else if (rawGrade.includes('유물')) currentGrade = '유물';
                                else if (rawGrade.includes('전설')) currentGrade = '전설';
                                else if (rawGrade.includes('영웅')) currentGrade = '영웅';

                                // 등급에 따른 테마 가져오기
                                const theme = gradeStyles[currentGrade] || gradeStyles['일반'];

                                return (
                                    <div key={i}
                                        // p-1.5로 줄여서 전체적으로 왼쪽으로 더 붙임
                                         className="relative group flex items-center gap-3 rounded-xl hover:bg-white/[0.04] transition-colors h-[72px] cursor-help"
                                         onMouseEnter={() => {
                                             setArkCoreHoverIdx(i);
                                             const parsedTooltip = typeof slot.Tooltip === 'string' ? JSON.parse(slot.Tooltip) : slot.Tooltip;
                                             setArkCoreHoverData({ core: parsedTooltip, gems: slot.Gems });
                                         }}
                                         onMouseLeave={() => {
                                             setArkCoreHoverIdx(null);
                                             setArkCoreHoverData(null);
                                         }}
                                    >
                                        {/* [좌측] 아이콘 영역 */}
                                        <div className="relative shrink-0">
                                            {/* 아이콘 배경: 고대 등급 고정 */}
                                            <div className={`w-14 h-14 rounded-xl p-[2px] transition-all flex items-center justify-center
                                            bg-gradient-to-br ${theme.bg} overflow-hidden
                                            border border-[#e9d2a6]/10 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]`}>

                                                <img src={slot.Icon} className="w-full h-full object-contain filter drop-shadow-md" alt="" />

                                                {/* 젬 장착 표시: 등급에 맞는 색상(theme.accent) 적용 */}
                                                {slot.Gems?.length > 0 && (
                                                    <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-black/60 flex items-center justify-center shadow-md ${theme.accent}`}>
                                                        <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_2px_#fff]"></div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 툴팁 모달 */}
                                            {arkCoreHoverIdx === i && arkCoreHoverData && (
                                                <div
                                                    className="absolute left-full top-0 z-[9999] pointer-events-auto flex items-start"
                                                    style={{ paddingLeft: '12px', width: 'max-content' }}
                                                >
                                                    <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                                                        <ArkCoreTooltip
                                                            data={arkCoreHoverData.core}
                                                            Gems={arkCoreHoverData.gems}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* [중앙] 텍스트 정보: 간격 gap-3으로 왼쪽으로 당김 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[12px] font-bold text-sky-400/90 leading-tight">
                                                {category}
                                            </div>
                                            <div className={`text-[14px] font-extrabold mt-0.5 truncate ${theme.text}`}>
                                                {subName}
                                            </div>
                                        </div>

                                        {/* [우측] 포인트 정보 */}
                                        <div className="shrink-0 text-right pr-1">
                        <span className="text-[15px] font-black text-[#f18c2d] tracking-tighter">
                            {slot.Point}P
                        </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                    {/* 오른쪽: 젬 효과 섹션 */}
                    <section className="flex flex-col border-l border-zinc-800/30 md:pl-8">
                        {/* 타이틀 영역 높이 통일 */}
                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                            <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                            <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                젬 효과
                            </h1>
                        </div>

                        {/* 젬 효과 리스트 */}
                        <div className="flex flex-col gap-5">
                            {arkGrid?.Effects?.map((effect, i) => {
                                const cleanText = effect.Tooltip
                                    .replace(/<[^>]*>?/gm, '')
                                    .replace(/\s*\+\s*$/, '');

                                const splitPos = cleanText.lastIndexOf(' +');
                                const desc = cleanText.substring(0, splitPos);
                                const val = cleanText.substring(splitPos + 1);

                                return (
                                    <div key={i} className="flex flex-col leading-snug">
                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-100 font-bold text-[14px]">{effect.Name}</span>
                                            <span className="text-zinc-500 text-[11px] font-bold">Lv.{effect.Level}</span>
                                        </div>
                                        <div className="text-[13px] text-zinc-400 font-medium">
                                            {desc} <span className="text-[#ffd200] font-bold">{val}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>


                {/* ✅ 여기만 교체됨: 활성 각인 (아크 패시브) 1열 N행 */}
                <section className="bg-[#121213] rounded-xl border border-white/5 p-6 space-y-6 shadow-2xl">
                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                        <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                        <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                            활성 각인
                        </h1>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        {(engravings?.ArkPassiveEffects ?? []).map((eng, i) => {
                            const n = typeof eng.Level === 'number' ? eng.Level : 0;
                            const m = typeof eng.AbilityStoneLevel === 'number' ? eng.AbilityStoneLevel : 0;
                            const iconUrl = getEngravingIconUrl(eng.Name);
                            const stoneIcon = eng.AbilityStoneIcon || FALLBACK_ABILITY_STONE_ICON;

                            return (
                                /* bg-opacity와 transition을 활용한 호버 효과 */
                                <div key={i} className="flex items-center justify-between px-4 py-2 rounded-sm group transition-all duration-200 cursor-default">

                                    <div className="flex items-center min-w-0">
                                        {/* 1. 각인 원형 아이콘 */}
                                        <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-black/60 mr-4 border border-[#3e444d]">
                                            <img src={iconUrl} alt={eng.Name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        {/* 2. 단계 표시 (이미지 고증) */}
                                        <div className="flex items-center gap-1.5 mr-5">
                                            <Diamond
                                                size={14}
                                                className="text-[#f16022] fill-[#f16022] drop-shadow-[0_0_5px_rgba(241,96,34,0.5)]"
                                            />
                                            <span className="text-[#a8a8a8] text-sm font-medium">x</span>
                                            <span className="text-white text-xl font-bold leading-none tabular-nums">{n}</span>
                                        </div>

                                        {/* 3. 각인명 및 스톤 레벨 */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-[#efeff0] font-bold text-[17px] tracking-tight truncate">
                                                {eng.Name}
                                            </span>

                                            {m > 0 && (
                                                <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5">
                                                    <img src={stoneIcon} alt="Stone" className="w-4 h-5 object-contain brightness-125" />
                                                    <div className="flex items-baseline gap-0.5">
                                                        <span className="text-[#5e666f] text-[11px] font-bold">Lv.</span>
                                                        <span className="text-[#00ccff] text-[17px] font-black">{m}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                </section>
                {/* ================= 아바타 섹션 수정 시작 ================= */}
                <section className="bg-[#121213] rounded-xl border border-white/5 p-6 space-y-6 shadow-2xl">
                    {/* 데이터 처리 및 본체 전용 합산 로직 */}
                    {(() => {
                        const avatarTypes = ['무기 아바타', '머리 아바타', '상의 아바타', '하의 아바타', '얼굴1 아바타', '얼굴2 아바타', '악기 아바타', '이동 효과'];

                        // [리스트용] 현재 탭에 따라 보여줄 데이터
                        const displayAvatars = avatarTypes.map(type => {
                            const parts = avatars.filter(a => a.Type === type);
                            const innerAvatar = parts.find(a => a.IsInner === true);
                            const skinAvatar = parts.find(a => a.IsInner === false);
                            const active = avatarViewMode === 'skin' ? (skinAvatar || innerAvatar) : (innerAvatar || skinAvatar);
                            return { type, active };
                        }).filter(item => item.active);

                        // [합산용 수정] 무기 아바타를 포함하여 본체 스탯을 정확히 계산
                        const totalInnerStat = avatarTypes.reduce((acc, type) => {
                            const parts = avatars.filter(a => a.Type === type);
                            // 1. 우선 IsInner가 true인 것을 찾음
                            // 2. 만약 본체/덧입기 구분이 없는 부위라면 첫 번째 아이템을 참조
                            const target = parts.find(a => a.IsInner === true) || parts[0];

                            if (target) {
                                const match = target.Tooltip.match(/(?:힘|민첩|지능)\s*\+([\d.]+)%/);
                                return acc + (match ? parseFloat(match[1]) : 0);
                            }
                            return acc;
                        }, 0);

                        return (
                            <>
                                {/* 헤더 부분 */}
                                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                                        <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                            아바타
                                        </h1>

                                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 shadow-inner">
                                            <button
                                                onClick={() => setAvatarViewMode('skin')}
                                                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                                                    avatarViewMode === 'skin' ? 'bg-sky-500 text-white' : 'text-zinc-500'
                                                }`}
                                            >
                                                덧입기
                                            </button>
                                            <button
                                                onClick={() => setAvatarViewMode('inner')}
                                                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                                                    avatarViewMode === 'inner' ? 'bg-amber-500 text-white' : 'text-zinc-500'
                                                }`}
                                            >
                                                본체
                                            </button>
                                        </div>
                                    </div>

                                    {/* 본체 고정 스탯 배지 */}
                                    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
                                        <div className="w-1 h-3 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></div>
                                        <span className="text-[12px] text-zinc-400 font-bold">힘민지 총합</span>
                                        <span className="text-[14px] text-white font-black tracking-tight tabular-nums">
                            {totalInnerStat.toFixed(2)}%
                        </span>
                                    </div>
                                </div>

                                {/* 리스트 본문 */}
                                <div className="flex flex-col gap-1.5">
                                    {displayAvatars.map(({ type, active }) => {
                                        const isLegendary = active.Grade === "전설";
                                        const statMatch = active.Tooltip.match(/(?:힘|민첩|지능)\s*\+([\d.]+)%/);

                                        return (
                                            <div key={type} className="flex items-center justify-between px-4 py-2 rounded-sm group transition-all duration-200 hover:bg-white/[0.02]">
                                                <div className="flex items-center min-w-0">
                                                    <div className={`w-10 h-10 shrink-0 rounded-lg overflow-hidden border-2 flex items-center justify-center transition-all ${
                                                        isLegendary
                                                            ? 'border-orange-500/40 bg-gradient-to-br from-[#3e270a] to-zinc-900'
                                                            : 'border-purple-500/40 bg-gradient-to-br from-[#2a133d] to-zinc-900'
                                                    } mr-4`}>
                                                        <img src={active.Icon} className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" alt="" />
                                                    </div>

                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">{type}</span>
                                                            <span className={`text-[10px] font-black ${isLegendary ? 'text-orange-400' : 'text-purple-400'}`}>
                                                {active.Grade}
                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-[17px] font-bold text-[#efeff0] truncate">
                                                                {active.Name}
                                                            </p>
                                                            <span className="text-[11px] text-emerald-400 font-bold">
                                                {statMatch ? statMatch[0] : ''}
                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        );
                    })()}
                </section>
            </div>
        </div>
    );
};