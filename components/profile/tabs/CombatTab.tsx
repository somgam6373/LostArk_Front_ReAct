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
    'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/game/ico_ability_stone_symbol.png';


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
// ✅ 활성 각인 툴팁 hover
    const [engrHoverIdx, setEngrHoverIdx] = useState<number | null>(null);
    const [engrHoverName, setEngrHoverName] = useState<string | null>(null);
    const [engrHoverDesc, setEngrHoverDesc] = useState<string>("");

    //모바일 모달 호출
    const [selectedEquip, setSelectedEquip] = useState<any>(null);
    const [selectedAcc, setSelectedAcc] = useState<any>(null);


    const engravingDescToHtml = (desc: string) => {
        if (!desc) return "";

        // <FONT COLOR='#99ff99'>텍스트</FONT> → <span style="color:#99ff99">텍스트</span>
        let html = desc
            .replace(/<FONT\s+COLOR=['"](#?[0-9a-fA-F]{6})['"]>/g, `<span style="color:$1">`)
            .replace(/<\/FONT>/g, `</span>`);

        // 줄바꿈이 올 수도 있으니 처리
        html = html.replace(/\n/g, "<br />");

        return html;
    };


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
        const sizeClasses = isCenter ? "w-14 h-14" : "w-12 h-12";

        if (!gem) return <div className={`${sizeClasses} rounded-full bg-white/5 opacity-10 border border-zinc-800`} />;

        let skillIcon = gem.Icon;
        let gradeColor = "#1f2937";

        try {
            if (gem.Tooltip) {
                const tooltip = typeof gem.Tooltip === 'string' ? JSON.parse(gem.Tooltip) : gem.Tooltip;
                skillIcon = tooltip.Element_001?.value?.slotData?.iconPath || gem.Icon;
                const gradeName = tooltip.Element_001?.value?.leftStr0 || gem.Grade || "";

                if (gradeName.includes("고대")) gradeColor = "#2a4d4f";
                else if (gradeName.includes("유물")) gradeColor = "#4d2b14";
                else if (gradeName.includes("전설")) gradeColor = "#45381a";
            }
        } catch (e) { skillIcon = gem.Icon; }

        return (
            /* 최상위 컨테이너: 여기에 MouseLeave를 걸어야 툴팁으로 이동해도 사라지지 않음 */
            <div
                className="relative group flex flex-col items-center"
                onMouseEnter={() => { setHoverIdx(index); setHoverData(gem); }}
                onMouseLeave={() => { setHoverIdx(null); setHoverData(null); }}
            >
                <div className="flex flex-col items-center cursor-help">
                    <div
                        className={`${sizeClasses} rounded-full transition-all duration-300 group-hover:scale-105 flex items-center justify-center overflow-hidden border border-zinc-700/50 shadow-lg`}
                        style={{
                            background: `radial-gradient(circle at center, ${gradeColor} 0%, #07090c 100%)`,
                        }}
                    >
                        <img
                            src={skillIcon}
                            alt=""
                            className="w-full h-full object-cover scale-110 drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]"
                        />
                    </div>
                    <span className="mt-1 text-zinc-500 text-[11px] font-bold group-hover:text-zinc-300 transition-colors">
                    Lv.{gem.Level}
                </span>
                </div>

                {/* 툴팁: pointer-events-auto(기본값)를 유지하여 마우스 상호작용 허용 */}
                {hoverIdx === index && hoverData && (
                    <div
                        className="absolute left-[80%] top-0 z-[9999] pl-4 pt-2 pointer-events-auto"
                        style={{ width: 'max-content' }}
                    >
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
        <div className="flex flex-col gap-6 p-0 sm:p-4 text-zinc-300 min-h-screen max-w-[1200px] mx-auto">

            {/* 왼쪽 섹션: 장비 & 각인 & 아크패시브 */}
            <div className="flex-1 min-w-0 space-y-6">

                {/* 상단 장비 & 액세서리 섹션 */}
                <section className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 items-stretch bg-[#121213] p-3 sm:p-5 rounded-none sm:rounded-2xl border-y sm:border border-white/5">

                    {/* [왼쪽: 전투 장비 Section] */}
                    <div className="w-full lg:w-[38%] flex flex-col shrink-0">
                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-1 mx-1">
                            <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                            <h1 className="text-[14px] sm:text-[15px] font-extrabold text-white tracking-tight uppercase">
                                전투 장비 & 스톤
                            </h1>
                        </div>
                        <div className="flex flex-col">
                            {getItemsByType(['무기', '투구', '상의', '하의', '장갑', '어깨', '어빌리티 스톤'])
                                .sort((a, b) => {
                                    if (a.Type === '어빌리티 스톤') return 1;
                                    if (b.Type === '어빌리티 스톤') return -1;
                                    return a.Type === '무기' ? -1 : b.Type === '무기' ? 1 : 0;
                                })
                                .map((item, i) => {
                                    let tooltip;
                                    try { tooltip = JSON.parse(item.Tooltip); } catch (e) { return null; }

                                    const isStone = item.Type === '어빌리티 스톤';
                                    const quality = tooltip?.Element_001?.value?.qualityValue ?? -1;
                                    const reinforceLevel = item.Name.match(/\+(\d+)/)?.[0] || '';
                                    const itemName = cleanText(item.Name).replace(/\+\d+\s/, '');

                                    const rawGrade = (item.Grade || "").trim();
                                    let currentGrade = "일반";
                                    if (rawGrade.includes('에스더') || item.Name.includes('에스더')) currentGrade = '에스더';
                                    else if (rawGrade.includes('고대')) currentGrade = '고대';
                                    else if (rawGrade.includes('유물')) currentGrade = '유물';
                                    else if (rawGrade.includes('전설')) currentGrade = '전설';

                                    const theme = gradeStyles[currentGrade] || gradeStyles['일반'];
                                    let advancedReinforce = "0";
                                    const advMatch = cleanText(tooltip?.Element_005?.value || "").match(/\[상급\s*재련\]\s*(\d+)단계/);
                                    if (advMatch) advancedReinforce = advMatch[1];

                                    let stoneStats = "";
                                    if (isStone) {
                                        const stoneData = Object.values(tooltip?.Element_007?.value?.Element_000?.contentStr || {}) as any[];
                                        stoneStats = stoneData
                                            .filter(el => el.contentStr.includes('Lv.'))
                                            .map(el => el.contentStr.match(/Lv\.(\d+)/)?.[1] || '0')
                                            .join(' ');
                                    }

                                    return (
                                        <div key={item.Name}
                                            // PC: 마우스 호버 시 툴팁 표시
                                             onMouseEnter={() => { setHoveredIndex(i); setHoveredData(tooltip); }}
                                             onMouseLeave={() => { setHoveredIndex(null); setHoveredData(null); }}
                                            // 모바일/클릭: 클릭 시 모달 툴팁 표시
                                             onClick={() => setSelectedEquip(tooltip)}
                                             className="relative group flex items-center gap-2 sm:gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors h-[60px] cursor-pointer sm:cursor-help"
                                        >
                                            <div className="relative shrink-0">
                                                <div className={`p-0.5 rounded-lg border shadow-lg bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow || ''}`}>
                                                    <img src={item.Icon} className="w-9 h-9 sm:w-10 sm:h-10 rounded-md object-cover bg-black/20" alt={itemName} />
                                                </div>
                                                {quality !== -1 && (
                                                    <div className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(quality)} bg-zinc-900 text-[#e9d2a6]`}>
                                                        {quality}
                                                    </div>
                                                )}

                                                {/* PC용 호버 툴팁 (숨김 처리 로직은 컴포넌트 내부 isMobile에 의존하거나 CSS로 제어) */}
                                                {hoveredIndex === i && hoveredData && (
                                                    <div className="absolute left-full top-0 z-[9999] pointer-events-auto hidden sm:flex" style={{ paddingLeft: '12px' }}>
                                                        <EquipmentTooltip data={hoveredData} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-[11px] sm:text-[13px] truncate ${theme.text}`}>{itemName}</h3>
                                                <div className="flex items-center gap-2">
                                                    {isStone ? (
                                                        <span className="text-blue-400 text-[11px] font-bold">세공 {stoneStats}</span>
                                                    ) : (
                                                        <>
                                                            <span className="text-white/50 text-[11px]">재련 {reinforceLevel}</span>
                                                            {advancedReinforce !== "0" && <span className="text-sky-400 text-[11px] font-bold">상재 +{advancedReinforce}</span>}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* 모바일 전용 모달 툴팁 (AnimatePresence로 부드럽게 표시) */}
                        {selectedEquip && (
                            <EquipmentTooltip
                                data={selectedEquip}
                                onClose={() => setSelectedEquip(null)}
                            />
                        )}
                    </div>

                    {/* [오른쪽: 액세서리 Section] */}

                    {/* [오른쪽: 액세서리 Section] */}
                    <div className="w-full lg:flex-1 flex flex-col min-w-0">
                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-1 mx-1">
                            <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                            <h1 className="text-[14px] sm:text-[15px] font-extrabold text-white tracking-tight uppercase">
                                악세사리
                            </h1>
                        </div>

                        <div className="flex flex-col">
                            {getItemsByType(['목걸이', '귀걸이', '반지', '팔찌'])
                                .filter(item => {
                                    try {
                                        const tooltip = JSON.parse(item.Tooltip);
                                        if (item.Name?.includes('팔찌')) return true;
                                        return (tooltip.Element_001?.value?.qualityValue ?? 0) !== -1;
                                    } catch(e) { return false; }
                                })
                                .map((item, i) => {
                                    const tooltip = JSON.parse(item.Tooltip);
                                    const isBracelet = item.Name?.includes('팔찌');
                                    const quality = tooltip.Element_001?.value?.qualityValue ?? 0;
                                    const itemName = item.Name || "아이템 이름";
                                    const rawGrade = (item.Grade || "").trim();

                                    let currentGrade = "일반";
                                    if (rawGrade.includes('고대')) currentGrade = '고대';
                                    else if (rawGrade.includes('유물')) currentGrade = '유물';
                                    else if (rawGrade.includes('전설')) currentGrade = '전설';

                                    const theme = gradeStyles[currentGrade] || gradeStyles['일반'];
                                    const passive = cleanText(tooltip.Element_007?.value?.Element_001 || '').match(/\d+/)?.[0] || '0';
                                    const tier = (tooltip.Element_001?.value?.leftStr2 || "").replace(/[^0-9]/g, "").slice(-1) || "4";

                                    // 효과 파싱 로직
                                    const rawContent = cleanText(
                                        isBracelet
                                            ? tooltip.Element_005?.value?.Element_001
                                            : (tooltip.Element_006?.value?.Element_001 || tooltip.Element_005?.value?.Element_001 || '')
                                    );

                                    // 정규식 추출
                                    const allEffects = [...rawContent.matchAll(/([가-힣\s]+?)\s*\+([\d.]+%?)/g)].map(m => ({
                                        name: m[1].trim(),
                                        value: m[2]
                                    }));

                                    // 팔찌일 경우 특화와 치명만 필터링, 일반 악세는 기존대로
                                    const displayEffects = isBracelet
                                        ? allEffects.filter(e => e.name === '특화' || e.name === '치명')
                                        : allEffects;

                                    const shortNames = {
                                        "추가 피해": "추피", "적에게 주는 피해": "적주피", "치명타 적중률": "치적",
                                        "치명타 피해": "치피", "공격력": "공격력", "무기 공격력": "무공",
                                        "낙인력": "낙인력", "파티원 회복 효과": "파티회복",
                                        "파티원 보호막 효과": "파티보호", "아군 공격력 강화 효과": "아공강",
                                        "아군 피해량 강화 효과": "아피강", "최대 생명력": "최생", "최대 마나": "최마",
                                        "전투 중 생명력 회복량": "전투회복", "상태이상 공격 지속시간": "상태이상", "세레나데, 신앙, 조화 게이지 획득량":"서포터 아덴 획득량"
                                    };
                                    return (
                                        <div key={i}
                                             onMouseEnter={() => { setAccHoverIdx(i); setAccHoverData(tooltip); }}
                                             onMouseLeave={() => { setAccHoverIdx(null); setAccHoverData(null); }}
                                             className="relative group flex items-center gap-2 sm:gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors h-[60px] cursor-help min-w-0"
                                        >
                                            {/* 아이콘 영역 */}
                                            <div className="relative shrink-0">
                                                <div className={`p-0.5 rounded-lg border shadow-lg bg-gradient-to-br ${theme.bg} ${theme.border}`}>
                                                    <img src={item.Icon} className="w-9 h-9 sm:w-10 sm:h-10 rounded-md object-cover bg-black/20" alt="" />
                                                </div>
                                                {!isBracelet && (
                                                    <div className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[9px] font-black border ${getQualityColor(quality)} bg-zinc-900 ${theme.text}`}>
                                                        {quality}
                                                    </div>
                                                )}
                                                {accHoverIdx === i && accHoverData && (
                                                    <div className="absolute left-full top-0 z-[9999] pointer-events-auto hidden sm:flex" style={{ paddingLeft: '12px' }}>
                                                        <AccessoryTooltip data={accHoverData} className="!static !mt-0 !left-0" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* 중앙: 정보 영역 */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-[11px] sm:text-[13px] truncate ${theme.text}`}>{itemName}</h3>
                                                <div className="flex gap-1.5 text-[11px]">
                                                    <span className="text-orange-400 font-bold">깨달음 +{passive}</span>
                                                    <span className="text-white/80">{tier}T</span>
                                                </div>
                                            </div>

                                            {/* 오른쪽: 특화/치명만 노출 (빨간색) */}
                                            <div className="w-[85px] sm:w-[100px] flex flex-col justify-center items-end border-l border-white/5 pl-2 shrink-0 overflow-hidden">
                                                {(isBracelet ? [0, 1] : [0, 1, 2]).map((idx) => {
                                                    const targetEffect = displayEffects[idx];
                                                    const rawName = targetEffect?.name || '';
                                                    const val = targetEffect?.value || '-';
                                                    const dispName = shortNames[rawName] || rawName || '-';

                                                    const getDynamicColor = (name, valueStr) => {
                                                        if (valueStr === '-' || !valueStr) return 'text-white/20';
                                                        if (isBracelet && (name === '특화' || name === '치명')) return 'text-white-500 font-black';
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
                                                        <div key={idx} className="flex justify-between w-full text-[12px] font-semi-bold leading-tight items-center">
                                                            <span className="text-white/40 truncate shrink mr-1">{dispName}</span>
                                                            <span className={`${getDynamicColor(rawName, val)} whitespace-nowrap shrink-0`}>{val}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                            <div className="flex items-center gap-4 p-2.5 rounded-xl border border-white/5 h-[60px] text-[10px] px-4 text-white/50">
                                팔찌 효율 계산 행
                            </div>
                        </div>
                    </div>

                </section>



                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 items-start px-0">

                    {/* [좌측 박스] 아크 그리드 섹션 */}
                    <section className="bg-[#121213] pt-5 pb-2 px-4 sm:px-5 rounded-none sm:rounded-2xl border-y sm:border border-white/5 shadow-2xl flex flex-col h-fit">
                        {/* 타이틀 영역: px-1로 미세 조정 */}
                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-1 mx-1">
                            <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                            <h1 className="text-[14px] sm:text-[15px] font-extrabold text-white tracking-tight uppercase">
                                아크 그리드
                            </h1>
                        </div>

                        {/* 리스트 영역 */}
                        <div className="flex flex-col gap-0.5 mb-0">
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

                                const theme = gradeStyles[currentGrade] || gradeStyles['일반'];

                                return (
                                    <div key={i}
                                         className="relative group flex items-center gap-3 rounded-xl hover:bg-white/[0.04] transition-all h-[62px] cursor-help px-1 sm:px-2"
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
                                        {/* 아이콘 영역: 모바일에서 크기 살짝 축소 */}
                                        <div className="relative shrink-0">
                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl p-[2px] transition-all flex items-center justify-center
                                bg-gradient-to-br ${theme.bg} overflow-hidden
                                border border-[#e9d2a6]/10 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]`}>
                                                <img src={slot.Icon} className="w-full h-full object-contain filter drop-shadow-md" alt="" />
                                                {slot.Gems?.length > 0 && (
                                                    <div className={`absolute bottom-0.5 right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-black/60 flex items-center justify-center shadow-md ${theme.accent}`}>
                                                        <div className="w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_2px_#fff]"></div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 툴팁 모달: 모바일에서는 숨기거나 클릭 방식으로 유도 (여기서는 PC 기준 유지) */}
                                            {arkCoreHoverIdx === i && arkCoreHoverData && (
                                                <div className="absolute left-full top-0 z-[100] pl-3 pointer-events-auto hidden sm:flex">
                                                    <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                                                        <ArkCoreTooltip
                                                            data={arkCoreHoverData.core}
                                                            Gems={arkCoreHoverData.gems}
                                                            currentPoint={slot.Point}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 텍스트 정보 */}
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-[9.5px] sm:text-[10.5px] font-bold leading-tight opacity-70 ${theme.text}`}>
                                                {category}
                                            </div>
                                            <div className={`text-[12px] sm:text-[13px] font-extrabold mt-0.5 truncate ${theme.text}`}>
                                                {subName}
                                            </div>
                                        </div>

                                        {/* 포인트 정보 */}
                                        <div className="shrink-0 text-right pr-1">
                            <span className={`text-[13px] sm:text-[14px] font-extrabold mt-0.5 truncate ${theme.text}`}>
                                {slot.Point}P
                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* [우측 박스] 젬 효과 섹션 */}
                    <section className="bg-[#121213] p-4 sm:p-6 rounded-none sm:rounded-2xl border-y sm:border border-white/5 shadow-2xl flex flex-col h-full">
                        {/* 타이틀 영역 */}
                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-4">
                            <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                            <h1 className="text-[14px] sm:text-[15px] font-extrabold text-white tracking-tight uppercase">
                                젬 효과
                            </h1>
                        </div>

                        {/* 젬 효과 리스트 */}
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {arkGrid?.Effects?.map((effect, i) => {
                                const cleanText = effect.Tooltip
                                    .replace(/<[^>]*>?/gm, '')
                                    .replace(/\s*\+\s*$/, '');

                                const splitPos = cleanText.lastIndexOf(' +');
                                const desc = cleanText.substring(0, splitPos);
                                const val = cleanText.substring(splitPos + 1);

                                return (
                                    <div key={i} className="flex flex-col gap-1 px-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-zinc-100 font-bold text-[12px] sm:text-[13px] break-keep">{effect.Name}</span>
                                            <span className="bg-zinc-800/50 px-2 py-0.5 rounded text-zinc-400 text-[9px] font-black tracking-widest uppercase shrink-0">
                                Lv.{effect.Level}
                            </span>
                                        </div>
                                        <div className="text-[11px] sm:text-[12px] text-zinc-400 font-medium leading-relaxed break-keep">
                                            {desc} <span className="text-[#ffd200] font-bold ml-1">{val}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>



                {/* 1. 가장 큰 부모 div */}
                <div className="w-full max-w-[1200px] mx-auto bg-[#121213] sm:rounded-2xl border-y sm:border border-white/5 shadow-2xl p-0 sm:p-4">

                    {/* 2. 각인 섹션 컨테이너: 모바일에서 flex-col로 변경 */}
                    <div
                        className="flex flex-col lg:flex-row gap-0 sm:gap-4 h-full w-full"
                        onMouseLeave={() => {
                            setEngrHoverIdx(null);
                            setEngrHoverName(null);
                            setEngrHoverDesc("");
                        }}
                    >
                        {/* [왼쪽 Section]: 활성 각인 리스트 */}
                        <section className="w-full lg:basis-1/2 flex-1 bg-[#1c1c1e]/50 sm:rounded-xl border-b sm:border border-white/5 p-4 shadow-inner min-w-0">
                            <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-4">
                                <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                                <h1 className="text-[14px] sm:text-[15px] font-extrabold text-white tracking-tight uppercase">
                                    활성 각인
                                </h1>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                {(engravings?.ArkPassiveEffects ?? []).map((eng, i) => {
                                    const n = typeof eng.Level === "number" ? eng.Level : 0;
                                    const m = typeof eng.AbilityStoneLevel === "number" ? eng.AbilityStoneLevel : 0;
                                    const iconUrl = getEngravingIconUrl(eng.Name);
                                    const stoneIcon = eng.AbilityStoneIcon || FALLBACK_ABILITY_STONE_ICON;

                                    return (
                                        <div
                                            key={i}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer border
                            ${engrHoverIdx === i ? 'bg-white/10 border-white/10 shadow-md' : 'bg-transparent border-transparent hover:bg-white/[0.03]'}`}
                                            /* 모바일 사용성을 위해 클릭 시에도 상태가 변경되도록 onClick 추가 가능 */
                                            onMouseEnter={() => {
                                                setEngrHoverIdx(i);
                                                setEngrHoverName(eng.Name || null);
                                                setEngrHoverDesc(eng.Description || "");
                                            }}
                                            onClick={() => {
                                                setEngrHoverIdx(i);
                                                setEngrHoverName(eng.Name || null);
                                                setEngrHoverDesc(eng.Description || "");
                                            }}
                                        >
                                            <div className="flex items-center min-w-0 gap-3">
                                                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full overflow-hidden bg-black/60 border border-zinc-700">
                                                    <img src={iconUrl} alt={eng.Name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex items-center gap-1 px-1 py-1 rounded-md shrink-0">
                                                    <Diamond
                                                        size={12}
                                                        className="text-[#f16022] fill-[#f16022]"
                                                    />
                                                    <div className="flex items-baseline gap-0.5">
                                                        <span className="text-zinc-500 text-[9px] font-bold uppercase">X</span>
                                                        <span className="text-white text-[14px] sm:text-[15px] font-black tabular-nums">{n}</span>
                                                    </div>
                                                </div>
                                                <span className="text-[#efeff0] font-bold text-[13px] sm:text-[14px] truncate">{eng.Name}</span>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0">
                                                {m > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <img src={stoneIcon} alt="Stone" className="w-3.5 h-4.5 brightness-125" />
                                                        <span className="text-zinc-400 text-[8px] font-bold uppercase">Lv.</span>
                                                        <span className="text-[#00ccff] text-[13px] sm:text-[14px] font-black">{m}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* [오른쪽 Section]: 상세 설명 (모바일에서는 리스트 아래에 표시) */}
                        <section className={`w-full lg:basis-1/2 flex-1 bg-[#1c1c1e]/50 sm:rounded-xl border-b sm:border border-white/5 p-4 min-h-[120px] lg:min-h-[400px] flex flex-col min-w-0 ${!engrHoverName && 'hidden lg:flex'}`}>
                            {engrHoverName ? (
                                <div className="animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl shrink-0">
                                            <img src={getEngravingIconUrl(engrHoverName)} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-0.5">각인 효과</div>
                                            <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">{engrHoverName}</h2>
                                        </div>
                                    </div>

                                    <div
                                        className="text-[13px] sm:text-[14px] leading-snug text-zinc-300 bg-black/30 p-4 rounded-xl border border-white/5 shadow-inner"
                                        dangerouslySetInnerHTML={{ __html: engravingDescToHtml(engrHoverDesc) }}
                                    />
                                </div>
                            ) : (
                                <div className="my-auto flex flex-col items-center justify-center space-y-2 opacity-20">
                                    <div className="w-10 h-10 rounded-full border border-dashed border-white flex items-center justify-center text-lg font-bold text-white">?</div>
                                    <p className="text-xs font-medium text-white tracking-tight text-center">각인을 선택하여 상세 내용을 확인하세요</p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>

                {/* [우측] 장착 카드 섹션 */}
                <section className="flex-1 space-y-4 px-0 sm:px-0">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2 px-4 sm:px-0">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_8px_rgba(30,58,138,0.5)]"></div>
                            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
                                카드
                            </h1>
                        </div>

                        {cards?.Effects?.[0] && (
                            <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">
                    {cards.Effects[0].Items[cards.Effects[0].Items.length - 1].Name.split(' 6세트')[0]}
                </span>
                            </div>
                        )}
                    </div>

                    {/* 카드 6종 그리드: 모바일 좌우 여백 확보 */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 px-4 sm:px-0">
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
                                        {/* 각성 단계 점: 모바일 대응 크기 축소 */}
                                        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5 sm:gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full border-[0.5px] border-black/40 ${
                                                    i < card.AwakeCount ? 'bg-yellow-400 shadow-[0_0_4px_#fbbf24]' : 'bg-zinc-800'
                                                }`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`p-1 sm:p-1.5 text-center transition-colors ${isSelected ? 'bg-orange-600 text-white' : 'bg-[#1c1c1c] text-zinc-400'}`}>
                                        <p className="text-[9px] sm:text-[11px] font-bold truncate">{card.Name}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 카드 세트 효과 요약 배너: 모바일에서 화면 끝까지 밀착(rounded-none) */}
                    <div className="min-h-[100px] mt-2 sm:mt-4">
                        <div className={`p-4 sm:p-5 bg-gradient-to-br from-zinc-800/40 to-zinc-950/60 sm:rounded-xl border-y sm:border transition-all duration-300 ${selectedCard ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/5'}`}>
                            <h3 className="text-[11px] sm:text-[12px] text-orange-400 font-black mb-3 flex items-center gap-2">
                                <span className={`w-1 h-3 sm:w-1.5 sm:h-3.5 rounded-sm transition-colors ${selectedCard ? 'bg-orange-500' : 'bg-zinc-600'}`}></span>
                                {cards?.Effects[0]?.Items[0].Name.split(' 2세트')[0]} 세트 효과
                            </h3>

                            {/* 효과 리스트: 모바일에서도 가독성 있게 텍스트 크기 및 간격 조정 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 sm:gap-y-2">
                                {cards?.Effects[0]?.Items.map((item: any, i: number) => (
                                    <div key={i} className="flex flex-col py-2 border-b border-white/5 last:border-0 md:last:border-b">
                        <span className="text-[10px] sm:text-[11px] text-orange-300/80 font-bold mb-0.5">
                            {item.Name}
                        </span>
                                        <span className="text-[11px] sm:text-[11.5px] text-zinc-300 leading-relaxed font-medium break-keep">
                            {item.Description}
                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>


            {/* 오른쪽 섹션: 장비 & 각인 & 아크패시브 */}
            <div className="flex-1 min-w-0 flex flex-col space-y-4 sm:space-y-10 px-0 sm:px-0">
                {/* ================= 아바타 섹션 수정 시작 ================= */}
                <section className="bg-[#121213] sm:rounded-xl border-y sm:border border-white/5 p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl">
                    {(() => {
                        const avatarTypes = ['무기 아바타', '머리 아바타', '상의 아바타', '하의 아바타', '얼굴1 아바타', '얼굴2 아바타', '악기 아바타', '이동 효과'];

                        const displayAvatars = avatarTypes.map(type => {
                            const parts = avatars.filter(a => a.Type === type);
                            const innerAvatar = parts.find(a => a.IsInner === true);
                            const skinAvatar = parts.find(a => a.IsInner === false);
                            const active = avatarViewMode === 'skin' ? (skinAvatar || innerAvatar) : (innerAvatar || skinAvatar);
                            return { type, active };
                        }).filter(item => item.active);

                        const totalInnerStat = avatarTypes.reduce((acc, type) => {
                            const parts = avatars.filter(a => a.Type === type);
                            const target = parts.find(a => a.IsInner === true) || parts[0];
                            if (target) {
                                const match = target.Tooltip.match(/(?:힘|민첩|지능)\s*\+([\d.]+)%/);
                                return acc + (match ? parseFloat(match[1]) : 0);
                            }
                            return acc;
                        }, 0);

                        return (
                            <>
                                {/* 헤더 부분: 모바일 대응 레이아웃 */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-3">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-1.5 h-5 bg-blue-950 rounded-full"></div>
                                        <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase leading-none">
                                            아바타
                                        </h1>

                                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 shadow-inner scale-90 sm:scale-100 origin-left">
                                            <button onClick={() => setAvatarViewMode('skin')} className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-md transition-all ${avatarViewMode === 'skin' ? 'bg-sky-500 text-white' : 'text-zinc-500'}`}>덧입기</button>
                                            <button onClick={() => setAvatarViewMode('inner')} className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-md transition-all ${avatarViewMode === 'inner' ? 'bg-amber-500 text-white' : 'text-zinc-500'}`}>본체</button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-2.5 px-1 sm:px-3">
                                        <div className="w-1 h-3 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></div>
                                        <span className="text-[11px] sm:text-[12px] text-zinc-500 font-bold leading-none">힘민지 총합</span>
                                        <span className="text-[13px] sm:text-[14px] text-white font-black tracking-tight tabular-nums leading-none">{totalInnerStat.toFixed(2)}%</span>
                                    </div>
                                </div>

                                {/* 리스트 본문 */}
                                <div className="flex flex-col">
                                    {displayAvatars.map(({ type, active }) => {
                                        const isLegendary = active.Grade === "전설";
                                        const statMatch = active.Tooltip.match(/(?:힘|민첩|지능)\s*\+([\d.]+)%/);

                                        let tintInfo: any[] = [];
                                        try {
                                            const tooltipData = JSON.parse(active.Tooltip);
                                            const tintGroup = Object.values(tooltipData).find((el: any) => el?.type === 'ItemTintGroup') as any;
                                            if (tintGroup?.value?.itemData) {
                                                tintInfo = Object.values(tintGroup.value.itemData);
                                            }
                                        } catch (e) {}

                                        return (
                                            <div key={type} className="flex flex-nowrap items-center justify-between px-1 sm:px-4 py-2 sm:py-1 group hover:bg-white/[0.02] border-b border-white/[0.03] last:border-0 min-w-0">
                                                {/* 왼쪽 세트: 아이콘 + 이름 정보 */}
                                                <div className="flex items-center min-w-0 gap-3 sm:gap-4 flex-1">
                                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg overflow-hidden border-2 flex items-center justify-center ${
                                                        isLegendary
                                                            ? 'border-orange-500/40 bg-gradient-to-br from-[#3e270a] to-zinc-900 shadow-[inset_0_0_8px_rgba(249,146,0,0.2)]'
                                                            : 'border-purple-500/40 bg-gradient-to-br from-[#2a133d] to-zinc-900 shadow-[inset_0_0_8px_rgba(206,67,251,0.2)]'
                                                    }`}>
                                                        <img src={active.Icon} className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform group-hover:scale-110" alt="" />
                                                    </div>

                                                    <div className="flex flex-col justify-center min-w-0 overflow-hidden">
                                                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                                                            <span className="text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase tracking-wider leading-none truncate">{type}</span>
                                                            <span className={`text-[9px] sm:text-[10px] font-black leading-none ${isLegendary ? 'text-orange-400' : 'text-purple-400'}`}>
                                                    {active.Grade}
                                                </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                                            <p className="text-[13px] sm:text-[14px] font-bold text-[#efeff0] truncate leading-tight">
                                                                {active.Name}
                                                            </p>
                                                            <span className="text-[10px] sm:text-[11px] text-emerald-400 font-bold whitespace-nowrap leading-none">
                                                    {statMatch ? statMatch[0] : ''}
                                                </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 오른쪽 세트: 염색 정보 */}
                                                {tintInfo.length > 0 && (
                                                    <div className="flex items-center gap-1.5 sm:gap-2 ml-2 sm:ml-4 shrink-0 self-center">
                                                        {tintInfo.map((tint, idx) => (
                                                            <div key={idx} className="flex flex-col items-center justify-center min-w-[36px] sm:min-w-[42px]">
                                                                <div
                                                                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm border border-white/20 shadow-sm shrink-0 mb-1"
                                                                    style={{ backgroundColor: tint.baseColor }}
                                                                />
                                                                <div className="flex flex-col items-center">
                                                        <span className="text-[9px] sm:text-[11px] text-zinc-500 font-mono uppercase tracking-tighter leading-none">
                                                            {tint.baseColor.replace('#', '')}
                                                        </span>
                                                                    <div className="h-[12px] sm:h-[14px] flex items-center justify-center">
                                                                        {tint.glossValue && tint.glossValue !== "0%" ? (
                                                                            <span className="text-[8px] sm:text-[10px] text-sky-400/70 font-bold leading-none">
                                                                    {tint.glossValue}
                                                                </span>
                                                                        ) : (
                                                                            <span className="invisible text-[8px] sm:text-[10px]">0%</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
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