import React, { useEffect, useState } from 'react';
import {Loader2, Hexagon, ShieldAlert, Zap} from 'lucide-react';
import EquipmentTooltip from "@/components/profile/Tooltip/EquipmentTooltip.tsx";
import AccessoryTooltip from '@/components/profile/Tooltip/AccessoryTooltip.tsx';
import ArkCoreTooltip from '@/components/profile/Tooltip/ArkCoreTooltip.tsx';

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


    const cleanText = (text: string) =>
        text ? text.replace(/<[^>]*>?/gm, '').trim() : '';

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

    /* ================= 로딩 ================= */
    if (loading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500 w-8 h-8 mb-3" />
                <span className="text-zinc-500 text-sm">정보를 불러오는 중...</span>
            </div>
        );
    }

    /* 아크패시브 스타일 설정 */
    const passiveConfigs: any = {
        '진화': { color: 'text-blue-400' },
        '깨달음': { color: 'text-purple-400'},
        '도약': { color: 'text-amber-400'},
    };


    /* ================= 렌더 ================= */
    return (
        <div className="flex flex-col lg:flex-row gap-10 p-6 bg-[#0f0f0f] text-zinc-300 min-h-screen max-w-[1800px] mx-auto">

            {/* 왼쪽 섹션: 장비 & 각인 & 아크패시브 */}
            <div className="flex-1 min-w-0 space-y-10">
                <section className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start bg-zinc-950 p-6 rounded-3xl border border-white/5">
                    {/* 왼쪽: 전투 장비 Section (가로 너비 유지) */}
                    <div className="w-full lg:w-[40%] flex flex-col">
                        <div className="flex justify-between items-end border-b border-white/10 pb-2 mb-4">
                            <h2 className="text-lg font-bold text-white/90 tracking-tight">전투 장비</h2>
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

                                    let advancedReinforce = "0";
                                    const advMatch = cleanText(tooltip?.Element_005?.value || "").match(/\[상급\s*재련\]\s*(\d+)단계/);
                                    if (advMatch) advancedReinforce = advMatch[1];

                                    return (
                                        /* 부모에 relative 추가 */
                                        <div key={item.Name}
                                            /* 1. group 클래스를 유지하여 내부 요소들의 상태를 통합 관리합니다. */
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
                                            {/* 아이템 콘텐츠 영역 */}
                                            <div className="relative shrink-0">
                                                <div className="p-0.5 rounded-lg bg-gradient-to-br from-white/20 to-transparent border border-white/10">
                                                    <img src={item.Icon} className="w-12 h-12 rounded-md object-cover" alt="" />
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(quality)} bg-zinc-900`}>
                                                    {quality}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white/90 font-bold text-[14px] truncate mb-0.5">{itemName}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white/50 text-[12px]">재련 {reinforceLevel}</span>
                                                    {advancedReinforce !== "0" && (
                                                        <span className="text-sky-400 text-[12px] font-bold">상재 +{advancedReinforce}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 2. 툴팁 렌더링 영역: '끊김 방지 브릿지' 적용 */}
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
                        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
                            <h2 className="text-lg font-bold text-white/90 tracking-tight">악세사리</h2>
                            <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                아크 패시브 ON
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
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

                                    // 데이터 추출: 깨달음 포인트
                                    const passive = cleanText(tooltip.Element_007?.value?.Element_001 || '').match(/\d+/)?.[0] || '0';

                                    // [수정] JSON 구조에 맞춘 티어 추출 (leftStr2: "아이템 티어 4" -> "4")
                                    const tierStr = tooltip.Element_001?.value?.leftStr2 || "";
                                    const tier = tierStr.replace(/[^0-9]/g, "").slice(-1) || "4"; // 문자열 중 가장 마지막 숫자 하나만 가져옴

                                    // 연마 효과 추출 및 축약 로직
                                    const grindContent = cleanText(tooltip.Element_006?.value?.Element_001 || tooltip.Element_005?.value?.Element_001 || '');
                                    const effects = [...grindContent.matchAll(/([가-힣\s]+?)\s*\+([\d.]+%?)/g)].map(m => ({
                                        name: m[1].trim(),
                                        value: m[2]
                                    }));

                                    const shortNames = {
                                        '적에게 주는 피해': '적피',
                                        '전투 중 생명력 회복량': '전투회복',
                                        '추가 피해': '추피',
                                        '무기 공격력': '무공',
                                        '공격력': '공격력',
                                        '파티원 회복 효과': '파티회복',
                                        '아군 피해량 강화 효과': '아피',
                                        '치명타 피해': '치피',
                                        '치명타 적중률': '치적',
                                        '아군 공격력 강화 효과': '아공강'
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
                                             }}
                                        >
                                            {/* 아이콘 및 품질 */}
                                            <div className="relative shrink-0">
                                                <div className="p-0.5 rounded-lg bg-white/5 border border-white/10">
                                                    <img src={item.Icon} className="w-12 h-12 rounded-md object-cover" alt="" />
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(quality)} bg-zinc-900`}>
                                                    {quality}
                                                </div>
                                            </div>

                                            {/* 이름 및 티어 정보 */}
                                            <div className="flex-[2] min-w-0">
                                                <h3 className="text-white/90 font-bold text-[14px] truncate mb-0.5">{itemName}</h3>
                                                <div className="flex gap-4 text-[11px]">
                                                    <span className="text-orange-400 font-bold">깨달음 +{passive}</span>
                                                    <span className="text-white/40 font-medium">{tier}티어</span>
                                                </div>
                                            </div>

                                            {/* 축약된 연마 효과 영역 */}
                                            <div className="w-24 flex flex-col justify-center items-end border-l border-white/5 pl-3 shrink-0">
                                                {[0, 1, 2].map((idx) => {
                                                    const rawName = effects[idx]?.name || '';
                                                    const val = effects[idx]?.value || '-';
                                                    const dispName = shortNames[rawName] || rawName || '-';
                                                    const isHighlight = idx === 0 || idx === 2;

                                                    return (
                                                        <div key={idx} className={`flex justify-between w-full text-[10px] leading-tight ${isHighlight ? 'text-orange-300/90 font-bold' : 'text-white/40'}`}>
                                                            <span className="text-white/20 font-normal truncate mr-1">{dispName}</span>
                                                            <span>{val}</span>
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
                                <div className="relative shrink-0">
                                    <div className="p-0.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/20 shadow-inner">
                                        <div className="w-12 h-12 rounded-md bg-zinc-900 flex items-center justify-center">
                                            <span className="text-[10px] font-black text-purple-400">BRC</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-[2] min-w-0">
                                    <h3 className="text-purple-400/90 font-bold text-[13px] uppercase tracking-wider mb-0.5">Bracelet Efficiency</h3>
                                    <div className="flex gap-3 text-[11px] text-white/40">
                                        <div className="flex gap-2">
                                            <span>순환</span>
                                            <span>기습</span>
                                        </div>
                                        <span className="text-white/20">고정 옵션</span>
                                    </div>
                                </div>

                                <div className="w-24 flex flex-col justify-center items-end border-l border-purple-500/20 pl-3 shrink-0">
                                    <div className="text-[10px] text-white/30 font-medium mb-0.5">상승량</div>
                                    <div className="text-[16px] font-black text-emerald-400 leading-none tracking-tighter">
                                        +14.25%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================= 아바타 섹션 수정 시작 ================= */}
                <section className="w-full space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold text-white">아바타</h2>

                            {/* [추가] 통합 토글 버튼 */}
                            <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 shadow-inner">
                                <button
                                    onClick={() => setAvatarViewMode('skin')}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                                        avatarViewMode === 'skin' ? 'bg-sky-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    덧입기
                                </button>
                                <button
                                    onClick={() => setAvatarViewMode('inner')}
                                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                                        avatarViewMode === 'inner' ? 'bg-amber-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    본체
                                </button>
                            </div>
                        </div>

                        {/* 총 추가 능력치 계산 (본체 슬롯 기준 고정) */}
                        {(() => {
                            const slotTypes = ['무기 아바타', '머리 아바타', '상의 아바타', '하의 아바타'];
// 총 추가 능력치 계산 (본체 우선 합산)
                            const totalStat = (() => {
                                // 능력치가 붙는 주요 아바타 부위 정의
                                const statSlotTypes = ['무기 아바타', '머리 아바타', '상의 아바타', '하의 아바타'];

                                return statSlotTypes.reduce((acc, type) => {
                                    const parts = avatars.filter(a => a.Type === type);

                                    // 1. 본체(IsInner: true)를 가장 먼저 찾음
                                    // 2. 본체가 없다면(빈 슬롯 방지) 덧입기(IsInner: false)를 찾음
                                    const activeForStat = parts.find(a => a.IsInner === true) || parts.find(a => a.IsInner === false);

                                    if (activeForStat) {
                                        // Tooltip 내의 "민첩 +2.00%" 혹은 "힘 +1.00%" 등의 패턴 추출
                                        const match = activeForStat.Tooltip.match(/(?:힘|민첩|지능)\s*\+([\d.]+)%/);
                                        return acc + (match ? parseFloat(match[1]) : 0);
                                    }
                                    return acc;
                                }, 0);
                            })();
                            return (
                                <div className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 font-bold">
                                    기본 특성 {totalStat.toFixed(2)}%
                                </div>
                            );
                        })()}
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                        {['무기 아바타', '머리 아바타', '상의 아바타', '하의 아바타', '얼굴1 아바타', '얼굴2 아바타', '악기 아바타', '이동 효과'].map((type) => {
                            const parts = avatars.filter(a => a.Type === type);
                            const innerAvatar = parts.find(a => a.IsInner === true);
                            const skinAvatar = parts.find(a => a.IsInner === false);

                            if (!innerAvatar && !skinAvatar) return null;

                            // [로직] 현재 모드에 따라 표시할 데이터 결정
                            const activeDisplay = avatarViewMode === 'skin'
                                ? (skinAvatar || innerAvatar)
                                : (innerAvatar || skinAvatar);

                            const isLegendary = activeDisplay.Grade === "전설";
                            const statMatch = activeDisplay.Tooltip.match(/(?:힘|민첩|지능)\s*\+[\d.]+%/);

                            return (
                                <div key={type} className="group bg-[#181818] rounded-lg border border-white/5 p-3 hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <div className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center overflow-hidden transition-all ${
                                                isLegendary
                                                    ? 'border-orange-500/40 bg-gradient-to-br from-[#3e270a] to-zinc-900'
                                                    : 'border-purple-500/40 bg-gradient-to-br from-[#2a133d] to-zinc-900'
                                            }`}>
                                                <img src={activeDisplay.Icon} className="w-11 h-11 object-contain group-hover:scale-110 transition-transform" alt="" />
                                            </div>
                                            {/* 현재 데이터 상태 라벨 (INNER/SKIN) */}
                                            <div className={`absolute -top-1 -right-1 px-1 rounded text-[8px] font-black border ${
                                                activeDisplay.IsInner ? 'bg-amber-500 border-amber-400' : 'bg-sky-500 border-sky-400'
                                            } text-white shadow-lg`}>
                                                {activeDisplay.IsInner ? 'INNER' : 'SKIN'}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{type}</span>
                                                <span className={`text-[10px] font-black ${isLegendary ? 'text-orange-400' : 'text-purple-400'}`}>
                                                    {activeDisplay.Grade}
                                                </span>
                                            </div>
                                            <p className="text-[14px] font-bold text-zinc-200 truncate mb-1">
                                                {activeDisplay.Name}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-emerald-400 font-bold">
                                                    {statMatch ? statMatch[0] : '추가 효과 없음'}
                                                </span>
                                                {/* 염색 여부 표시 (activeDisplay 기준) */}
                                                {(activeDisplay.Tooltip.includes("itemTintGroup") || activeDisplay.Tooltip.includes("염색 정보")) && (
                                                    <div className="flex gap-0.5 opacity-60">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* ... 성향 요약부 생략 ... */}
                </section>
                {/* ================= 아바타 섹션 수정 끝 ================= */}

                    {/* [우측] 장착 카드 섹션 (가로 정렬) */}
                <section className="flex-1 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-white">장착 카드</h2>
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
            </div>

            {/* ================= 2. 악세사리 섹션 ================= */}

            {/* 오른쪽 섹션: 장비 & 각인 & 아크패시브 */}
            <div className="flex-1 min-w-0 flex flex-col space-y-10">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#121213] p-8 rounded-xl border border-white/5 items-stretch">
                    {/* 왼쪽: 코어 섹션 */}
                    <section className="flex flex-col">
                        {/* 타이틀 영역 */}
                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                            <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                            <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                아크 코어
                            </h1>
                        </div>

                        {/* 그리드 레이아웃: 세로 배치이므로 높이(h)를 제거하거나 충분히 확보해야 합니다. */}
                        <div className="grid grid-cols-3 gap-y-12 gap-x-4">
                            {arkGrid?.Slots?.map((slot, i) => {
                                // ":"를 기준으로 텍스트 분리 (예: "질서의 해 코어 : 다크 문")
                                const nameParts = slot.Name.split(/\s*:\s*/);
                                const category = nameParts[0]; // "질서의 해 코어"
                                const subName = nameParts[1];   // "다크 문"

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
                                        {/* 1. 아이콘 영역 (18 = 72px) */}
                                        <div className="relative w-16 h-16 mb-4 shrink-0">
                                            <div className="w-full h-full bg-zinc-900/90 rounded-2xl p-2.5 border border-white/10 group-hover:border-purple-500/50 transition-all shadow-2xl flex items-center justify-center">
                                                <img src={slot.Icon} className="w-full h-full object-contain" alt="" />
                                            </div>
                                            {/* 젬 장착 표시부 (보라색 포인트) */}
                                            {slot.Gems?.length > 0 && (
                                                <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-purple-600 rounded-full border-[3px] border-[#121213] flex items-center justify-center shadow-lg">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                </div>
                                            )}
                                        </div>

                                        {/* 2. 텍스트 영역 (3단 수직 배치) */}
                                        <div className="w-full text-center flex flex-col items-center">
                                            {/* 카테고리 (질서의 해 코어 등) */}
                                            <span className="text-[12px] font-bold text-sky-400/90 leading-tight">
                                                {category}
                                            </span>
                                            {/* 세부 이름 (블레이드 러시 등) */}
                                            <span className="text-[12px] font-extrabold text-zinc-100 mt-0.5 leading-tight">
                                                {subName}
                                            </span>
                                            {/* 포인트 (14p 등) */}
                                            <span className="text-[14px] font-black text-[#f18c2d] mt-2 tracking-tighter">
                                                {slot.Point}p
                                            </span>
                                        </div>

                                        {/* --- 툴팁 모달 --- */}
                                        {arkCoreHoverIdx === i && arkCoreHoverData && (
                                            <div className={`absolute ${i % 3 === 2 ? 'right-full mr-6' : 'left-full ml-6'} top-0 z-[9999] pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200`}>
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




                {/* 3. 활성 각인 (수치형 디자인) */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-white">
                        <h2 className="text-xl font-bold">활성 각인 (아크 패시브)</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {engravings?.ArkPassiveEffects?.map((eng: any, i: number) => {
                            const match = eng.Description.match(/[\d.]+%+/);
                            const percentValue = match ? match[0] : "";
                            return (
                                <div key={i} className="bg-[#181818] p-4 rounded border border-white/5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-zinc-100 font-bold">{eng.Name}</span>
                                                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1 rounded">Lv.{eng.AbilityStoneLevel}</span>
                                            </div>
                                            {eng.AbilityStoneLevel && <p className="text-[11px] text-zinc-500 mt-1 italic">스톤: {eng.Level}단계</p>}
                                        </div>
                                        <span className="text-lg font-black text-yellow-500">{percentValue}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 4. 장착 보석 효과 섹션 (Description 태그 제거 로직 추가) */}
                <section className="space-y-4 mt-10">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-white">장착 보석 효과</h2>
                        </div>
                        {/* 수정 포인트: cleanText 유틸리티를 사용하여 HTML 태그 제거 */}
                        <div className="text-[12px] bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full border border-sky-500/20 font-bold">
                            {gems?.Effects?.Description
                                ? gems.Effects.Description.replace(/<[^>]*>?/gm, '').trim()
                                : "기본 공격력 증가 정보 없음"}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(() => {
                            // 스킬 이름별로 그룹화
                            const groupedSkills = gems?.Effects?.Skills?.reduce((acc: any, current: any) => {
                                const existing = acc.find((item: any) => item.Name === current.Name);
                                if (existing) {
                                    existing.Gems.push(current);
                                } else {
                                    acc.push({
                                        Name: current.Name,
                                        Icon: current.Icon,
                                        Gems: [current]
                                    });
                                }
                                return acc;
                            }, []);

                            return groupedSkills?.map((skillGroup: any, i: number) => (
                                <div key={i} className="bg-[#181818] p-3 rounded border border-white/5 flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        {/* 보석 아이콘 나열 */}
                                        <div className="flex gap-1 shrink-0">
                                            {skillGroup.Gems.map((gem: any, idx: number) => (
                                                <div key={idx} className="relative">
                                                    <img src={gem.Icon} className="w-9 h-9 rounded border border-white/10" alt="" />
                                                    <div className="absolute -bottom-1 -right-1 bg-black/80 text-[9px] text-white px-1 rounded font-bold border border-zinc-700 leading-tight">
                                                        {gems.Gems.find((g: any) => g.Slot === gem.GemSlot)?.Level || '?'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[14px] text-zinc-100 font-bold truncate">{skillGroup.Name}</span>
                                        </div>
                                    </div>

                                    {/* 효과 정보 세로 나열 */}
                                    <div className="flex flex-col gap-1.5">
                                        {skillGroup.Gems.map((gem: any, gemIdx: number) => (
                                            <div key={gemIdx} className="space-y-1">
                                                {gem.Description.map((desc: string, descIdx: number) => {
                                                    const isDamage = desc.includes("피해");
                                                    return (
                                                        <div
                                                            key={descIdx}
                                                            className={`text-[12px] py-1 flex items-center gap-2 transition-opacity hover:opacity-80
                                                            ${isDamage
                                                                ? 'text-orange-400'
                                                                : 'text-sky-400'
                                                            } font-semibold`}
                                                        >
                                                            {/* 아이콘: 색상과 일치하도록 불투명도 조절 가능 */}
                                                            <span className="text-[13px] shrink-0 opacity-90">
                                                                {isDamage ? '🔥' : '⏳'}
                                                            </span>

                                                            {/* 텍스트: 배경이 없으므로 가독성을 위해 자간(tracking) 조정 */}
                                                            <span className="flex-1 truncate tracking-tight">
                                                                {desc}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </section>
                {/* 3. 아크 패시브 상세 섹션 */}
                <section className="space-y-4 pt-4">
                    {/* 헤더 및 탭 메뉴 */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-4 gap-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                            아크 패시브 상세
                        </h2>

                        <div className="flex bg-zinc-900 p-1 rounded-lg border border-white/5">
                            {['진화', '깨달음', '도약'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActivePassiveTab(tab)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                                        activePassiveTab === tab
                                            ? `${passiveConfigs[tab].bg} ${passiveConfigs[tab].color} shadow-sm`
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 포인트 요약 카드 */}
                    {arkPassive?.Points && (
                        <div className={`p-5  ${passiveConfigs[activePassiveTab].border} ${passiveConfigs[activePassiveTab].bg} flex flex-col md:flex-row justify-between items-center gap-4`}>
                            {(() => {
                                const pointInfo = arkPassive.Points.find((p: any) => p.Name === activePassiveTab);
                                return (
                                    <>
                                        <div className="flex flex-col items-center md:items-start">
                                            <div className="flex flex-col relative pl-4">
                                                {/* 좌측 포인트 바: 배경색 없이 구별감을 주는 핵심 요소 */}
                                                <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-gradient-to-b from-orange-400 to-orange-600 shadow-[0_0_8px_rgba(251,146,60,0.4)]" />

                                                {/* 상단 라벨: 가독성을 위해 자간과 두께 조절 */}
                                                <span className="text-[12px] font-black text-white/40 uppercase tracking-[0.12em] leading-none mb-1.5">
                                                    현재 단계
                                                </span>

                                                {/* 메인 텍스트: 크기와 두께로 압도적인 시인성 확보 */}
                                                <span className="text-[30px] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60 tracking-tight leading-none">
                                                    {pointInfo?.Description || '정보 없음'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-px md:h-12 w-full md:w-px bg-white/10" />
                                        <div className="flex flex-col items-center md:items-end">
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">보유 포인트</span>
                                            <span className={`text-3xl font-black ${passiveConfigs[activePassiveTab].color}`}>
                                {pointInfo?.Value || 0} <span className="text-sm font-medium text-zinc-500">pts</span>
                            </span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {/* 활성 효과 그리드 (텍스트 정제 로직 포함) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {arkPassive?.Effects?.filter((e: any) => e.Name === activePassiveTab).length > 0 ? (
                            arkPassive.Effects
                                .filter((e: any) => e.Name === activePassiveTab)
                                .map((effect: any, i: number) => {
                                    const tooltip = JSON.parse(effect.ToolTip);

                                    // 텍스트 정제 함수 (FONT 태그 및 줄바꿈 제거)
                                    const clean = (text: string) => {
                                        if (!text) return "";
                                        return text
                                            .replace(/<FONT color='#.{6}'>/gi, '')
                                            .replace(/<\/FONT>/gi, '')
                                            .replace(/<BR>/gi, '\n')
                                            .replace(/\|\|/g, '\n')
                                            .replace(/<[^>]*>?/gm, '') // 기타 남은 모든 태그 제거
                                            .trim();
                                    };

                                    const cleanName = clean(effect.Description);
                                    const cleanDesc = clean(tooltip.Element_002?.value || "");

                                    return (
                                        <div key={i} className="bg-[#181818] p-4 rounded-lg border border-white/5 hover:border-white/10 transition-colors flex gap-4 group">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={effect.Icon}
                                                    className="w-12 h-12 rounded-lg bg-zinc-900 border border-white/10 group-hover:scale-105 transition-transform"
                                                    alt=""
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-[14px] font-bold text-zinc-100 truncate">
                                                        {/* "진화 1티어 치명 Lv.10"에서 "치명 Lv.10"만 추출 */}
                                                        {cleanName.split(' ').slice(2).join(' ')}
                                                    </h4>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${passiveConfigs[activePassiveTab].border} ${passiveConfigs[activePassiveTab].color}`}>
                                        T{cleanName.split(' ')[1]?.replace('티어', '') || '-'}
                                    </span>
                                                </div>
                                                <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 whitespace-pre-wrap">
                                                    {cleanDesc}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="col-span-full py-10 text-center bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800">
                                <p className="text-zinc-500 text-sm">활성화된 {activePassiveTab} 효과가 없습니다.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};