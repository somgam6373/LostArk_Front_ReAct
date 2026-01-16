import React, { useEffect, useState } from 'react';
import {Loader2, Hexagon, ShieldAlert, Zap, Diamond, ChevronRight} from 'lucide-react';
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
        const sizeClasses = isCenter ? "w-22 h-22" : "w-[76px] h-[76px]";

        if (!gem) return <div className={`${sizeClasses} rounded-full bg-white/5 opacity-10`} />;

        let skillIcon = gem.Icon;
        let gemThemeColor = "#ffffff"; // 기본값

        try {
            if (gem.Tooltip) {
                const tooltip = JSON.parse(gem.Tooltip);
                skillIcon = tooltip.Element_001?.value?.slotData?.iconPath || gem.Icon;
                const gradeName = tooltip.Element_001?.value?.leftStr0 || gem.Grade || "";

                // 등급별 고유 테마 색상 설정
                if (gradeName.includes("고대")) {
                    gemThemeColor = "#dcc999"; // 고대: 청량한 시안/화이트
                } else if (gradeName.includes("유물")) {
                    gemThemeColor = "#fa5d00"; // 유물: 주황
                } else if (gradeName.includes("전설")) {
                    gemThemeColor = "#f9ba2e"; // 전설: 황금
                }
            }
        } catch (e) { skillIcon = gem.Icon; }

        return (
            <div
                className="relative group flex flex-col items-center gap-2"
                onMouseLeave={() => { setHoverIdx(null); setHoverData(null); }}
            >
                <div
                    className="flex flex-col items-center cursor-help"
                    onMouseEnter={() => { setHoverIdx(index); setHoverData(gem); }}
                >
                    {/* [디자인 가이드 반영]
                  1. border와 background가 등급 색상에 따라 자연스럽게 동화됨
                  2. 강력한 inset shadow로 깊이감 형성
                */}
                    <div
                        className={`${sizeClasses} rounded-full transition-all duration-300 group-hover:scale-110 flex items-center justify-center overflow-hidden border`}
                        style={{
                            // 요청하신 배경 스타일 적용 (등급 색상을 미세하게 섞어 일체감 부여)
                            background: `linear-gradient(180deg, ${gemThemeColor}15 0%, #07090c 100%)`,
                            // 테두리 선이 튀지 않도록 배경과 같은 계열의 투명도 적용
                            borderColor: `${gemThemeColor}55`,
                            // 안쪽으로 깊게 퍼지는 100px 그림자로 아이콘이 배경에 안착된 느낌
                            boxShadow: `
                            inset 0 0 40px rgba(0,0,0,0.9), 
                            inset 0 0 100px rgba(0,0,0,0.8),
                            0 0 15px ${gemThemeColor}33
                        `,
                        }}
                    >
                        <img
                            src={skillIcon}
                            alt=""
                            className="w-full h-full object-cover scale-110 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                        />
                    </div>

                    {/* 레벨 표시 */}
                    <span className="mt-1.5 text-zinc-400 text-[12px] font-bold tracking-tighter drop-shadow-md group-hover:text-white">
                    Lv.{gem.Level}
                </span>
                </div>

                {/* 툴팁 영역 */}
                {hoverIdx === index && hoverData && (
                    <div className="absolute left-full top-0 z-[9999] pl-4 -ml-2 h-full flex items-start">
                        <div className="animate-in fade-in zoom-in-95 duration-200">
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
            fetch(`/arkpassive?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json())
        ])
            .then(([eqData, arkData, engData, gemData, avatarData, cardData, passiveData]) => {
                setEquipments(Array.isArray(eqData) ? eqData : []);
                setArkGrid(arkData);
                setEngravings(engData);
                setGems(gemData); // 보석 데이터 저장
                setAvatars(Array.isArray(avatarData) ? avatarData : []);
                setCards(cardData);
                setArkPassive(passiveData);
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
        '일반': { bg: 'from-[#222] to-[#111]', border: 'border-white/20', text: 'text-[#ffffff]' },
        '고급': { bg: 'from-[#1a2e1a] to-[#111]', border: 'border-[#48c948]/30', text: 'text-[#48c948]' },
        '희귀': { bg: 'from-[#1a2a3e] to-[#111]', border: 'border-[#00b0fa]/30', text: 'text-[#00b0fa]' },
        '영웅': { bg: 'from-[#2e1a3e] to-[#111]', border: 'border-[#ce43fb]/30', text: 'text-[#ce43fb]' },
        '전설': { bg: 'from-[#41321a] to-[#111]', border: 'border-[#f99200]/30', text: 'text-[#f99200]' },
        '유물': {
            // [기존 고대 스타일을 유물로 적용]
            bg: 'from-[#2a1a12] to-[#111111]',
            border: 'border-[#a6632d]/50',
            text: 'text-[#e7a15d]',
            glow: 'shadow-[#a6632d]/20'
        },
        '고대': {
            // [요청하신 고대 전용 스타일 적용]
            bg: 'from-[#3d3325] to-[#1a1a1c]',
            border: 'border-[#e9d2a6]/30',
            text: 'text-[#c69c6d]',
            glow: 'shadow-[#e9d2a6]/10'
        },
        '에스더': {
            bg: 'from-[#0d2e2e] to-[#111111]',
            border: 'border-[#2edbd3]/60',
            text: 'text-[#2edbd3]',
            glow: 'shadow-[#2edbd3]/30'
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
                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                            <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                            <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                전투 장비
                            </h1>
                        </div>

                        <div className="flex flex-col gap-2">
                            {
                                getItemsByType(['무기', '투구', '상의', '하의', '장갑', '어깨'])
                                    .sort((a, b) => (a.Type === '무기' ? 1 : b.Type === '무기' ? -1 : 0))
                                    .map((item, i) => {
                                        let tooltip;
                                        try { tooltip = JSON.parse(item.Tooltip); } catch (e) { return null; }

                                        const quality = tooltip?.Element_001?.value?.qualityValue ?? 0;
                                        const reinforceLevel = item.Name.match(/\+(\d+)/)?.[0] || '';
                                        const itemName = cleanText(item.Name).replace(/\+\d+\s/, '');

                                        // 등급 판별 로직
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
                                                 className="relative group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors h-[72px] cursor-help"
                                                 onMouseEnter={() => {
                                                     setHoveredIndex(i);
                                                     setHoveredData(tooltip);
                                                 }}
                                                 onMouseLeave={() => {
                                                     setHoveredIndex(null);
                                                     setHoveredData(null);
                                                 }}
                                            >
                                                <div className="relative shrink-0">
                                                    {/* 아이콘 박스 */}
                                                    <div className={`p-0.5 rounded-lg border shadow-lg bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow || ''}`}>
                                                        <img src={item.Icon} className="w-12 h-12 rounded-md object-cover bg-black/20" alt={itemName} />
                                                        {(currentGrade === '고대' || currentGrade === '에스더') && (
                                                            <div className="absolute inset-0 rounded-lg shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] pointer-events-none" />
                                                        )}
                                                    </div>

                                                    {/* 품질 표시 영역 */}
                                                    <div className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(quality)} bg-zinc-900 text-[#e9d2a6]`}>
                                                        {quality}
                                                    </div>
                                                </div>

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

                                                {/* 툴팁 렌더링 영역 */}
                                                {hoveredIndex === i && hoveredData && (
                                                    <div className="absolute left-full top-0 -ml-2 pl-4 z-[9999] h-full flex items-start">
                                                        <EquipmentTooltip data={hoveredData} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                            }
                        </div>
                    </div>
                    {/* 오른쪽: 액세서리 Section (가로 너비 확장 및 내부 비율 조정) */}
                    <div className="w-full lg:w-[60%] flex flex-col">
                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                            <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                            <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                악세사리
                            </h1>
                        </div>

                        <div className="flex flex-col gap-2">
                            {/* 1. 일반 악세사리 리스트 */}
                            {/* 1. 일반 악세사리 리스트 */}
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

                                    // --- 등급 판별 로직 추가 ---
                                    const rawGrade = (item.Grade || "").trim();
                                    let currentGrade = "일반";
                                    if (rawGrade.includes('고대')) currentGrade = '고대';
                                    else if (rawGrade.includes('유물')) currentGrade = '유물';
                                    else if (rawGrade.includes('전설')) currentGrade = '전설';
                                    else if (rawGrade.includes('영웅')) currentGrade = '영웅';

                                    // 정의된 gradeStyles 테마 가져오기 (전투 장비와 동일한 객체 사용)
                                    const theme = gradeStyles[currentGrade] || gradeStyles['일반'];

                                    // 데이터 추출: 깨달음 포인트
                                    const passive = cleanText(tooltip.Element_007?.value?.Element_001 || '').match(/\d+/)?.[0] || '0';

                                    // 티어 추출
                                    const tierStr = tooltip.Element_001?.value?.leftStr2 || "";
                                    const tier = tierStr.replace(/[^0-9]/g, "").slice(-1) || "4";

                                    // 연마 효과 추출 로직 (기존과 동일)
                                    const grindContent = cleanText(tooltip.Element_006?.value?.Element_001 || tooltip.Element_005?.value?.Element_001 || '');
                                    const effects = [...grindContent.matchAll(/([가-힣\s]+?)\s*\+([\d.]+%?)/g)].map(m => ({
                                        name: m[1].trim(),
                                        value: m[2]
                                    }));

                                    const shortNames = {
                                        // 딜러 관련 핵심 옵션
                                        '추가 피해': '추피',
                                        '적에게 주는 피해': '적주피',
                                        '치명타 적중률': '치적',
                                        '치명타 피해': '치피',
                                        '공격력': '공격력',
                                        '무기 공격력': '무공',

                                        // 서포터 관련 핵심 옵션
                                        '조화 게이지 획득량': '아덴획득',
                                        '낙인력': '낙인력',
                                        '파티원 회복 효과': '파티회복',
                                        '파티원 보호막 효과': '파티보호',
                                        '아군 공격력 강화 효과': '아공강',
                                        '아군 피해량 강화 효과': '아피강',

                                        // 공통/유틸 옵션
                                        '최대 생명력': '최생',
                                        '최대 마나': '최마',
                                        '전투 중 생명력 회복량': '전투회복',
                                        '상태이상 공격 지속시간': '상태이상'
                                    };

                                    return (
                                        <div key={i}
                                             className="relative group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors h-[72px] cursor-help"
                                             onMouseEnter={() => {
                                                 setAccHoverIdx(i);
                                                 setAccHoverData(tooltip);
                                             }}
                                             onMouseLeave={() => {
                                                 setAccHoverIdx(null);
                                                 setAccHoverData(null);
                                             }}>

                                            {/* 아이콘 및 품질 */}
                                            <div className="relative shrink-0">
                                                {/* 등급별 배경 및 테두리 적용 */}
                                                <div className={`p-0.5 rounded-lg border shadow-lg bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow || ''}`}>
                                                    <img src={item.Icon} className="w-12 h-12 rounded-md object-cover bg-black/20" alt="" />

                                                    {/* 고대 등급 이상 내부 광채 */}
                                                    {currentGrade === '고대' && (
                                                        <div className="absolute inset-0 rounded-lg shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] pointer-events-none" />
                                                    )}
                                                </div>

                                                {/* 품질 수치 영역: 텍스트 색상을 테마에 맞춤 (혹은 고정 #e9d2a6) */}
                                                <div className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(quality)} bg-zinc-900 ${theme.text}`}>
                                                    {quality}
                                                </div>
                                            </div>

                                            {/* 이름 및 티어 정보 */}
                                            <div className="flex-[2] min-w-0">
                                                {/* 등급별 텍스트 색상 적용 */}
                                                <h3 className={`font-bold text-[14px] truncate mb-0.5 ${theme.text}`}>
                                                    {itemName}
                                                </h3>
                                                <div className="flex gap-4 text-[11px]">
                                                    <span className="text-orange-400 font-bold">깨달음 +{passive}</span>
                                                    <span className="text-white/40 font-medium">{tier}티어</span>
                                                </div>
                                            </div>

                                            {/* 축약된 연마 효과 영역 (기존 로직 유지) */}
                                            <div className="w-24 flex flex-col justify-center items-end border-l border-white/5 pl-3 shrink-0">
                                                {[0, 1, 2].map((idx) => {
                                                    const rawName = effects[idx]?.name || '';
                                                    const val = effects[idx]?.value || '-';
                                                    const dispName = shortNames[rawName] || rawName || '-';

                                                    const getDynamicColor = (name: string, valueStr: string) => {
                                                        if (valueStr === '-' || !valueStr) return 'text-white/20';
                                                        const num = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
                                                        const isPercent = valueStr.includes('%');

                                                        const thresholds: Record<string, { 상: number; 중: number; 하: number }> = {
                                                            // --- 딜러 관련 옵션 ---
                                                            '추가 피해': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '적에게 주는 피해': { 상: 2.0, 중: 1.2, 하: 0.55 },
                                                            '치명타 적중률': { 상: 1.55, 중: 0.95, 하: 0.4 },
                                                            '치명타 피해': { 상: 4.0, 중: 2.4, 하: 1.1 },

                                                            // --- 서포터 관련 옵션 (보내주신 리스트 기반) ---
                                                            '조화 게이지 획득량': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '낙인력': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '파티원 회복 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '파티원 보호막 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '아군 공격력 강화 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                            '아군 피해량 강화 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },

                                                            // --- 공격력 / 무기 공격력 (단위에 따라 기준 분리) ---
                                                            '공격력_PCT': { 상: 1.55, 중: 0.95, 하: 0.4 },
                                                            '공격력_FIXED': { 상: 390, 중: 195, 하: 80 },
                                                            '무기 공격력_PCT': { 상: 3.0, 중: 1.8, 하: 0.8 },
                                                            '무기 공격력_FIXED': { 상: 960, 중: 480, 하: 195 },

                                                            // --- 유틸 및 생존 옵션 ---
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
                                                        <div key={idx} className="flex justify-between w-full text-[11px] leading-tight">
                                                            <span className="text-white/60 font-normal truncate mr-1">{dispName}</span>
                                                            <span className={getDynamicColor(rawName, val)}>{val}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {accHoverIdx === i && accHoverData && (
                                                <div className="absolute left-full top-0 -ml-2 pl-4 z-[9999] h-full flex items-start">
                                                    <AccessoryTooltip data={accHoverData} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                            {/* 2. 팔찌 효율 계산 행 */}
                            <div className="flex items-center gap-4 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 h-[72px]">
                                팔찌 효율 계산 행
                            </div>
                        </div>
                    </div>
                </section>

                {/*====================보석 시작=============================*/}
                <section className="mt-10 w-full flex flex-col items-center px-4">
                    {/* 헤더 부분: 화면이 작아지면 세로로 정렬되거나 간격 조정 */}
                    <div className="w-full max-w-6xl flex flex-wrap items-center justify-between border-b border-zinc-800 pb-2 mb-8 gap-4">
                        <div className="flex items-center gap-2"> {/* flex로 정렬하고 gap으로 간격 조절 */}
                            <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                            <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                보석
                            </h1>
                        </div>
                        <div className="text-[10px] md:text-[12px] bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full border border-blue-500/20 font-black shadow-[0_0_10px_rgba(59,130,246,0.2)] whitespace-nowrap">
                            {gems?.Effects?.Description?.replace(/<[^>]*>?/gm, '').trim() || "정보 없음"}
                        </div>
                    </div>

                    {/* 인게임 UI 배경 메인 컨테이너 */}
                    {/* overflow-hidden을 추가하고 컨텐츠에 scale을 적용하여 넘침 방지 */}
                    <div className="relative w-full max-w-5xl rounded-[30px] border border-zinc-700/50 shadow-2xl flex items-center justify-center min-h-[300px] md:min-h-[400px]"
                         style={{
                             background: `linear-gradient(180deg, #0f1217 0%, #07090c 100%)`,
                             boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
                         }}>

                        {/* 배경 효과 */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[200px] md:h-[400px] bg-blue-900/20 rounded-full blur-[80px] md:blur-[120px]" />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none" />
                        </div>

                        {/* 보석 배치 레이아웃 - 모바일 환경에서 scale을 사용하여 크기 자동 조절 */}
                        <div className="relative z-10 flex flex-col items-center gap-2 transform scale-[0.6] sm:scale-[0.8] md:scale-100 transition-transform duration-300">

                            {/* 1행: 간격을 gap-40에서 반응형 gap으로 수정 */}
                            <div className="flex items-center gap-20 md:gap-40">
                                <div className="flex gap-4">
                                    <GemSlot gem={gems?.Gems?.[0]} index={0} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                    <GemSlot gem={gems?.Gems?.[1]} index={1} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                </div>
                                <div className="flex gap-4 md:gap-6">
                                    <GemSlot gem={gems?.Gems?.[2]} index={2} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                    <GemSlot gem={gems?.Gems?.[3]} index={3} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                </div>
                            </div>

                            {/* 2행 */}
                            <div className="flex items-center justify-center gap-4 md:gap-6 -mt-2">
                                <GemSlot gem={gems?.Gems?.[4]} index={4} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                <GemSlot gem={gems?.Gems?.[5]} index={5} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} isCenter={true} />
                                <GemSlot gem={gems?.Gems?.[6]} index={6} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                            </div>

                            {/* 3행 */}
                            <div className="flex items-center gap-20 md:gap-40 -mt-2">
                                <div className="flex gap-4">
                                    <GemSlot gem={gems?.Gems?.[7]} index={7} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                    <GemSlot gem={gems?.Gems?.[8]} index={8} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                </div>
                                <div className="flex gap-4 md:gap-6">
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
            {/* ================= 2. 악세사리 섹션 ================= */}

            <div className="flex-1 min-w-0 flex flex-col space-y-10">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#121213] p-8 rounded-xl border border-white/5 items-stretch">
                    {/* 왼쪽: 코어 섹션 */}
                    <section className="flex flex-col">
                        {/* 타이틀 영역 */}
                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                            <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                            <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                아크 그리드
                            </h1>
                        </div>

                        {/* 그리드 레이아웃 */}
                        <div className="grid grid-cols-3 gap-y-12 gap-x-4">
                            {arkGrid?.Slots?.map((slot, i) => {
                                // ":" 기준으로 텍스트 분리
                                const nameParts = slot.Name.split(/\s*:\s*/);
                                const category = nameParts[0]; // "질서의 해 코어"
                                const subName = nameParts[1];   // "차지 인핸스" (색상 적용 대상)

                                // --- 등급 판별 로직 ---
                                const rawGrade = (slot.Grade || "").trim();
                                let currentGrade = "일반";
                                if (rawGrade.includes('고대')) currentGrade = '고대';
                                else if (rawGrade.includes('유물')) currentGrade = '유물';
                                else if (rawGrade.includes('전설')) currentGrade = '전설';
                                else if (rawGrade.includes('영웅')) currentGrade = '영웅';

                                const theme = gradeStyles[currentGrade] || gradeStyles['일반'];

                                return (
                                    <div key={i}
                                         className="relative group flex flex-col items-center cursor-help"
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
                                        <div className="relative w-16 h-16 mb-4 shrink-0">
                                            {/* 코어 아이콘 박스 */}
                                            <div className={`w-full h-full rounded-2xl p-1.5 border shadow-lg bg-gradient-to-br transition-all flex items-center justify-center
                                            ${theme.bg} ${theme.border} ${theme.glow || ''} group-hover:scale-105 duration-200`}>
                                                <img src={slot.Icon} className="w-full h-full object-contain filter drop-shadow-md" alt="" />
                                            </div>

                                            {/* 젬 장착 표시부 */}
                                            {slot.Gems?.length > 0 && (
                                                <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-[#7b2cff] rounded-full border-[3px] border-[#0c0c0d] flex items-center justify-center shadow-[0_0_8px_rgba(123,44,255,0.4)]">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_#fff]"></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 텍스트 영역 */}
                                        <div className="w-full text-center flex flex-col items-center">
                                            {/* 1. 카테고리: 화이트 계열로 고정 */}
                                            <span className="text-[12px] font-bold text-sky-400/90 leading-tight">
                                                {category}

                                            </span>

                                            {/* 2. 세부 이름 (차지 인핸스 등): 등급별 텍스트 색상(theme.text) 적용 */}
                                            <span className={`text-[12px] font-extrabold mt-0.5 leading-tight ${theme.text}`}>
                                                {subName}
                                            </span>

                                            {/* 3. 포인트 */}
                                            <span className="text-[14px] font-black text-[#f18c2d] mt-2 tracking-tighter">
                                                {slot.Point}p
                                            </span>
                                        </div>

                                        {/* 툴팁 모달 */}
                                        {arkCoreHoverIdx === i && arkCoreHoverData && (
                                            <div
                                                className="absolute left-full top-0 -ml-2 pl-4 z-[9999] h-full flex items-start pointer-events-auto animate-in fade-in slide-in-from-left-2 duration-200"
                                                onMouseEnter={() => setArkCoreHoverIdx(i)}
                                                onMouseLeave={() => {
                                                    setArkCoreHoverIdx(null);
                                                    setArkCoreHoverData(null);
                                                }}
                                            >
                                                <ArkCoreTooltip
                                                    data={arkCoreHoverData.core}
                                                    Gems={arkCoreHoverData.gems}
                                                />
                                            </div>
                                        )}
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
                                                <div className="flex items-center gap-1.5 ml-2 bg-black/20 px-2 py-0.5 rounded-sm border border-white/5">
                                                    <img src={stoneIcon} alt="Stone" className="w-4 h-5 object-contain brightness-125" />
                                                    <div className="flex items-baseline gap-0.5">
                                                        <span className="text-[#5e666f] text-[11px] font-bold">Lv.</span>
                                                        <span className="text-[#00ccff] text-[17px] font-black">{m}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* [추가] 마우스 호버 시 우측에 나타나는 요소 */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        {/* 활성화 상태를 나타내는 포인트 바 */}
                                        <div className="w-1 h-6 rounded-full bg-orange-500/0 group-hover:bg-orange-500 shadow-[0_0_10px_rgba(241,96,34,0.8)] transition-all duration-300" />

                                        {/* 상세 보기 화살표 (살짝 나타남) */}
                                        <ChevronRight
                                            size={18}
                                            className="text-zinc-600 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
                {/* ================= 아바타 섹션 수정 시작 ================= */}
                {/* ✅ 전체 섹션: 박스 디자인 적용 */}
                {/* 활성 각인 섹션과 동일한 bg, rounded, border, p-6 적용 */}
                <section className="bg-[#121213] rounded-xl border border-white/5 p-6 space-y-6 shadow-2xl">

                    {/* 헤더 부분: 활성 각인과 동일한 border-b 스타일 */}
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <div className="flex items-center gap-4">

                                <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                                <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                    아바타
                                </h1>

                            {/* 통합 토글 버튼 */}
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 shadow-inner">
                                <button
                                    onClick={() => setAvatarViewMode('skin')}
                                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                                        avatarViewMode === 'skin' ? 'bg-sky-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    덧입기
                                </button>
                                <button
                                    onClick={() => setAvatarViewMode('inner')}
                                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                                        avatarViewMode === 'inner' ? 'bg-amber-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    본체
                                </button>
                            </div>
                        </div>

                        {/* 총 추가 능력치 요약 */}
                        <div className="text-[12px] bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-md border border-emerald-500/20 font-bold">
                            기본 특성 <span className="ml-1 text-white">7.00%</span>
                        </div>
                    </div>

                    {/* 리스트 본문: flex-col 및 gap 조절 */}
                    <div className="flex flex-col gap-1.5">
                        {['무기 아바타', '머리 아바타', '상의 아바타', '하의 아바타', '얼굴1 아바타', '얼굴2 아바타', '악기 아바타', '이동 효과'].map((type) => {
                            const parts = avatars.filter(a => a.Type === type);
                            const innerAvatar = parts.find(a => a.IsInner === true);
                            const skinAvatar = parts.find(a => a.IsInner === false);

                            if (!innerAvatar && !skinAvatar) return null;

                            const activeDisplay = avatarViewMode === 'skin' ? (skinAvatar || innerAvatar) : (innerAvatar || skinAvatar);
                            const isLegendary = activeDisplay.Grade === "전설";
                            const statMatch = activeDisplay.Tooltip.match(/(?:힘|민첩|지능)\s*\+[\d.]+%/);

                            return (
                                /* 활성 각인 행(Row)과 동일한 padding(px-4 py-2),
                                   동일한 justify-between 및 group 애니메이션 적용
                                */
                                <div key={type} className="flex items-center justify-between px-4 py-2 rounded-sm group transition-all duration-200 cursor-default hover:bg-white/[0.02]">
                                    <div className="flex items-center min-w-0">
                                        {/* 1. 아바타 아이콘 (활성 각인 아이콘과 크기 통일) */}
                                        <div className={`w-10 h-10 shrink-0 rounded-lg overflow-hidden border-2 flex items-center justify-center transition-all ${
                                            isLegendary
                                                ? 'border-orange-500/40 bg-gradient-to-br from-[#3e270a] to-zinc-900'
                                                : 'border-purple-500/40 bg-gradient-to-br from-[#2a133d] to-zinc-900'
                                        } mr-4`}>
                                            <img src={activeDisplay.Icon} className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" alt="" />
                                        </div>

                                        {/* 2. 아바타 정보 */}
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider">{type}</span>
                                                <span className={`text-[10px] font-black ${isLegendary ? 'text-orange-400' : 'text-purple-400'}`}>
                                    {activeDisplay.Grade}
                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-[17px] font-bold text-[#efeff0] truncate">
                                                    {activeDisplay.Name}
                                                </p>
                                                <span className="text-[11px] text-emerald-400 font-bold">
                                    {statMatch ? statMatch[0] : '추가 효과 없음'}
                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
};