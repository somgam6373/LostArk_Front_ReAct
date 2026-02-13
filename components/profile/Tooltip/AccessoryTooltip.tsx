import React from 'react';

const cleanText = (str: any) => {
    if (!str) return '';
    const target = typeof str === 'string' ? str : JSON.stringify(str);
    return target
        .replace(/<P ALIGN='CENTER'>/gi, '')
        .replace(/<\/P>/gi, '\n')
        .replace(/<BR>/gi, '\n')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\\r\\n/g, '\n')
        .replace(/\n\s+/g, '\n')
        .trim();
};

const thresholds: Record<string, { 상: number; 중: number; 하: number }> = {
    '추가 피해': { 상: 2.6, 중: 1.6, 하: 0.6 },
    '적에게 주는 피해': { 상: 2.0, 중: 1.2, 하: 0.55 },
    '치명타 적중률': { 상: 1.55, 중: 0.95, 하: 0.4 },
    '치명타 피해': { 상: 4.0, 중: 2.4, 하: 1.1 },
    '조화 게이지 획득량': { 상: 2.6, 중: 1.6, 하: 0.6 },
    '세레나데, 신앙, 조화 게이지 획득량': { 상: 2.6, 중: 1.6, 하: 0.6 },
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

const MAX_STATS: Record<string, number[]> = {
    "반지":   [11091, 11349, 11865, 12897],
    "귀걸이": [11944, 12222, 12778, 13889],
    "목걸이": [15357, 15714, 16428, 17857]
};

interface TooltipProps {
    data: any;
    className?: string;
}

const AccessoryTooltip = ({ data, className = "" }: TooltipProps) => {
    if (!data) return null;

    const elements = Object.values(data) as any[];
    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const quality = titleInfo.qualityValue ?? -1;
    const itemGradeName = titleInfo.leftStr0?.split(' ')[0] || "고대";
    const itemGradeFull = titleInfo.leftStr0;
    const itemLevelAndTier = cleanText(titleInfo.leftStr2 || "");
    const itemIcon = titleInfo.slotData?.iconPath;

    const bindingInfo = cleanText(data.Element_002?.value || "");
    const tradeInfo = cleanText(data.Element_003?.value || "").replace('|', '');

    const baseEffectObj = elements.find((el: any) => el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000) === '기본 효과');
    const specialEffectObj = elements.find((el: any) => el?.type === 'ItemPartBox' && ["연마 효과", "팔찌 효과", "특수 효과", "추가 효과"].includes(cleanText(el?.value?.Element_000)));
    const arcPassiveObj = elements.find((el: any) => el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000).includes('아크 패시브'));

    const themes: any = {
        '일반': { bg: 'from-[#222]/40', border: 'border-white/20', text: 'text-[#ffffff]' },
        '고급': { bg: 'from-[#1a2e1a]/40', border: 'border-[#48c948]/30', text: 'text-[#48c948]' },
        '희귀': { bg: 'from-[#1a2a3e]/40', border: 'border-[#00b0fa]/30', text: 'text-[#00b0fa]' },
        '영웅': { bg: 'from-[#2e1a3e]/40', border: 'border-[#ce43fb]/30', text: 'text-[#ce43fb]' },
        '고대': { bg: 'from-[#3d3325] to-transparent', text: 'text-[#d6aa71]', border: 'border-[#d6aa71]/50' },
        '유물': { bg: 'from-[#2a1a12]/60 to-transparent', text: 'text-[#e7a15d]', border: 'border-[#a6632d]/40' },
        '전설': { bg: 'from-[#362e15]/60 to-transparent', text: 'text-[#f9ae00]', border: 'border-[#f9ae00]/30' },
        '에스더': { bg: 'from-[#0d2e2e]/40', border: 'border-[#2edbd3]/60', text: 'text-[#2edbd3]', glow: 'shadow-[#2edbd3]/30' }
    };
    const theme = themes[itemGradeName] || themes['고대'];

    const renderGrindEffect = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, i) => {
            const match = line.match(/([가-힣\s,]+)\s*([\+\-]?[\d\.]+)(%?)/);
            if (!match) return <div key={i}>{line}</div>;
            const name = match[1].trim();
            const value = parseFloat(match[2]);
            const isPercent = match[3] === '%';
            let targetKey = name;
            if (name === '공격력') targetKey = isPercent ? '공격력_PCT' : '공격력_FIXED';
            else if (name === '무기 공격력') targetKey = isPercent ? '무기 공격력_PCT' : '무기 공격력_FIXED';
            const criteria = thresholds[targetKey];
            let colorClass = "text-blue-400";
            if (criteria) {
                if (value >= criteria.상) colorClass = "text-yellow-400 font-bold";
                else if (value >= criteria.중) colorClass = "text-purple-400 font-bold";
                else if (value >= criteria.하) colorClass = "text-blue-400";
            }
            return <div key={i} className={colorClass}>{line}</div>;
        });
    };

    const getQualityColorHex = (q: number) => {
        if (q === 100) return '#FF8000';
        if (q >= 90) return '#CE43FB';
        if (q >= 70) return '#00B0FA';
        if (q >= 30) return '#00D100';
        return '#919191';
    };


    return (
        <div
            className={`relative w-[300px] flex flex-col border border-white/10 rounded-md shadow-2xl overflow-hidden font-sans transition-all duration-200 ${className}`}
            style={{ maxHeight: '50vh' }} // 위치 결정권은 부모에게 넘기고 높이만 유지
        >
            {/* 1. 헤더 섹션 (고정 및 불투명) */}
            <div className={`p-2 shrink-0 bg-[#111111] bg-gradient-to-br ${theme.bg} border-b border-white/10 z-10`}>
                <div className="flex gap-3 items-center">
                    <div className="relative shrink-0 w-[50px] h-[50px]">
                        <div className={`w-full h-full overflow-hidden rounded-md border-[1.5px] ${theme.border} bg-black bg-gradient-to-br ${theme.bg}`}>
                            <img
                                src={itemIcon}
                                className="w-full h-full object-cover"
                                alt=""
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-[14px] font-bold leading-tight drop-shadow-md truncate ${theme.text}`}>
                            {itemName}
                        </h4>
                        <div className="mt-1 flex items-center gap-2">
                            {/* 등급 정보 */}
                            <span className="text-[12px] font-bold text-white/60">
                                {cleanText(itemGradeFull)}
                            </span>
                            {/* 구분선 (선택 사항) */}
                            <span className="w-[2px] h-2.5 bg-white/30" />
                            {/* 티어 정보 - 포인트 컬러 적용 */}
                            <span className="text-[12px] font-bold text-white/60">
                                {itemLevelAndTier.replace('아이템 ', '')}
                            </span>

                            <span className="w-[2px] h-2.5 bg-white/30" />
                            {arcPassiveObj && (
                                <div className="text-[11.5px] font-bold text-[#ffcf4d]">{cleanText(arcPassiveObj.value.Element_001)}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. 본문 섹션 (60% 투명도 및 스크롤) */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#111111]/10 backdrop-blur-md
                /* Webkit 스크롤바 커스텀 */
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-white/5
                [&::-webkit-scrollbar-thumb]:bg-white/20
                [&::-webkit-scrollbar-thumb]:rounded-full
                hover:[&::-webkit-scrollbar-thumb]:bg-white/40">

                <div className="p-3 grid grid-cols-2 gap-x-4 max-h-[60vh] overflow-y-auto bg-[#111111]/40">

                    {/* 왼쪽 칼럼
                    귀속/거래 정보 */}
                    <div className="space-y-1 col-span-1 border-r border-white/5 pr-4">
                        {specialEffectObj?.value?.Element_001 && (
                            <div className="pt-1 border-t border-white/5">
                                <div className="text-[11.5px] font-bold whitespace-pre-line leading-relaxed">
                                    {renderGrindEffect(cleanText(specialEffectObj.value.Element_001))}
                                </div>
                            </div>
                        )}
                        <div className={`pt-4 text-[12px] font-bold ${tradeInfo.includes('불가') ? 'text-red-500' : 'text-cyan-500'}`}>
                           [{tradeInfo}]
                        </div>
                    </div>

                    <div className="space-y-4">
                    {/* 품질 (간격 축소) */}
                    {quality !== -1 && (
                        <div className="space-y-0.5 w-28">
                            <div className="flex justify-between items-end">
                                <span className="text-white/40 text-[11px]">품질</span>
                                <span className="text-[12px] font-bold" style={{ color: getQualityColorHex(quality) }}>{quality}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/40 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full transition-all duration-700" style={{ width: `${quality}%`, backgroundColor: getQualityColorHex(quality) }} />
                            </div>
                        </div>
                    )}

                    {/* 효과 정보들 */}
                    <div className="space-y-4">
                        {baseEffectObj?.value?.Element_001 && (() => {
                            const part = ["목걸이", "귀걸이", "반지"].find(p => itemName.includes(p)) || "목걸이";
                            const rawPolishHtml = data.Element_006?.value?.Element_001 || "";
                            const polishLevel = (rawPolishHtml.match(/img src/g) || []).length;
                            const currentStatMatch = baseEffectObj.value.Element_001.match(/\+(\d+)/);
                            const currentStat = currentStatMatch ? parseInt(currentStatMatch[1]) : 0;
                            const maxValue = MAX_STATS[part][polishLevel];
                            const percentage = maxValue ? (currentStat / maxValue) * 100 : 0;

                            return (
                                <div className="space-y-0.5 w-28"> {/* 간격 축소 */}
                                    <div className="flex justify-between items-center">
                                        <div className="text-[#FFD200] text-[11.5px] font-bold py-0.5">
                                            힘민지: {percentage.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="h-1 w-full bg-white/40 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#FFD200]/60 transition-all duration-500" style={{ width: `${Math.min(100, percentage)}%` }} />
                                    </div>
                                    <div className="text-white/90 text-[12px] leading-relaxed whitespace-pre-line font-medium pt-1">
                                        {cleanText(baseEffectObj.value.Element_001)}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* 하단 데코 라인 */}
            <div className="h-[1px] shrink-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        </div>
    );
};

export default AccessoryTooltip;