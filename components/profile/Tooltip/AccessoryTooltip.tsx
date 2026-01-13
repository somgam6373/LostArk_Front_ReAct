import React from 'react';

const cleanText = (str: string) => {
    if (!str) return '';
    return str
        .replace(/<BR>/gi, '\n')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\\r\\n/g, '\n')
        .replace(/\n\s+/g, '\n')
        .trim();
};

interface TooltipProps {
    data: any;
    className?: string;
}

const AccessoryTooltip = ({ data, className = "" }: TooltipProps) => {
    if (!data) return null;

    // --- 1. 데이터 추출 영역 ---
    const elements = Object.values(data) as any[];

    // 헤더 정보
    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const quality = titleInfo.qualityValue ?? -1;
    const itemGradeName = titleInfo.leftStr0?.split(' ')[0] || "고대";
    const itemGradeFull = titleInfo.leftStr0; // "고대 목걸이"
    const itemLevelAndTier = cleanText(titleInfo.leftStr2 || "");
    const itemIcon = titleInfo.slotData?.iconPath;

    // 1. [거래/귀속 정보]
    const bindingInfo = cleanText(data.Element_002?.value || "");
    const tradeInfo = cleanText(data.Element_003?.value || "").replace('|', '');

    // 2. [기본 효과] - 힘/민/지/체
    const baseEffectObj = elements.find((el: any) =>
        el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000) === '기본 효과'
    );

    // 3. [연마/팔찌/특수 효과] - 장신구의 핵심 옵션
    const specialEffectObj = elements.find((el: any) =>
        el?.type === 'ItemPartBox' &&
        ["연마 효과", "팔찌 효과", "특수 효과", "추가 효과"].includes(cleanText(el?.value?.Element_000))
    );

    // 4. [아크 패시브] - 깨달음/도약/진화 포인트
    const arcPassiveObj = elements.find((el: any) =>
        el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000).includes('아크 패시브')
    );

    // 5. [어빌리티 스톤/무작위 각인]
    const randomEffectObj = elements.find((el: any) => el?.value?.topStr === "무작위 각인 효과");

    // 등급별 테마 (제공해주신 방어구 테마와 통일)
    const themes: any = {
        '고대': 'from-[#3d3325] to-[#1a1a1c] text-[#e9d2a6] border-[#e9d2a6]/30',
        '유물': 'from-[#412608] to-[#1a1a1c] text-[#f99200] border-[#f99200]/30',
        '전설': 'from-[#362e15] to-[#1a1a1c] text-[#f9ae00] border-[#f9ae00]/30',
    };
    const theme = themes[itemGradeName] || themes['고대'];

    return (
        <div className={`z-[9999] w-80 bg-[#121213] border border-white/10 rounded shadow-2xl overflow-hidden ${className}`}>

            {/* --- 상단 헤더 섹션 --- */}
            <div className={`p-4 bg-gradient-to-br ${theme.split(' ').slice(0, 2).join(' ')} border-b border-white/10`}>
                <div className="flex gap-4 items-start">
                    <div className="relative shrink-0">
                        <div className="p-0.5 rounded-lg bg-gradient-to-br from-white/20 to-transparent border border-white/20 shadow-lg">
                            <img src={itemIcon} className="w-14 h-14 rounded-md object-cover" alt="" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-[18px] font-black leading-tight drop-shadow-md truncate ${theme.split(' ')[2]}`}>
                            {itemName}
                        </h4>
                        <div className="mt-1.5 space-y-0.5">
                            <div className="text-[12px] font-bold text-white/70">{cleanText(itemGradeFull)}</div>
                            <div className="text-[11px] font-medium text-white/40">{itemLevelAndTier}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-5">
                {/* 1. 거래 및 귀속 정보 (추가됨) */}
                {(bindingInfo || tradeInfo) && (
                    <div className="text-[11px] leading-tight space-y-0.5 border-b border-white/5 pb-3">
                        <div className="text-white/60">{bindingInfo}</div>
                        <div className="text-emerald-400 font-bold">{tradeInfo}</div>
                    </div>
                )}

                {/* 2. 품질 바 */}
                {quality !== -1 && (() => {
                    const getQualityColor = (q: number) => {
                        if (q === 100) return '#FF8000';
                        if (q >= 90) return '#CE43FB';
                        if (q >= 70) return '#00B0FA';
                        if (q >= 30) return '#00D100';
                        return '#919191';
                    };
                    const color = getQualityColor(quality);
                    return (
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <span className="text-white/30 text-[10px] font-bold uppercase tracking-tight">Quality</span>
                                <span className="text-[13px] font-bold" style={{ color }}>{quality}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full transition-all duration-500" style={{ width: `${quality}%`, backgroundColor: color }} />
                            </div>
                        </div>
                    );
                })()}

                {/* 3. 아크 패시브 (장신구 핵심) */}
                {arcPassiveObj && (
                    <div className="bg-[#f99200]/10 border border-[#f99200]/20 p-2.5 rounded flex justify-between items-center">
                        <span className="text-[10px] text-[#f99200] font-black uppercase tracking-widest">Arc Passive</span>
                        <span className="text-[13px] text-[#f99200] font-black">{cleanText(arcPassiveObj.value.Element_001)}</span>
                    </div>
                )}

                {/* 4. 세부 정보 섹션 */}
                <div className="space-y-4">
                    {/* 기본 효과 */}
                    {baseEffectObj?.value?.Element_001 && (
                        <div className="space-y-1">
                            <div className="text-white/30 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-1">
                                [기본 효과]
                            </div>
                            <div className="text-zinc-200 text-[13px] leading-relaxed whitespace-pre-line font-medium">
                                {cleanText(baseEffectObj.value.Element_001)}
                            </div>
                        </div>
                    )}

                    {/* 연마 / 팔찌 / 특수 효과 */}
                    {specialEffectObj?.value?.Element_001 && (
                        <div className="space-y-1">
                            <div className="text-white/30 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-1">
                                [{cleanText(specialEffectObj.value.Element_000)}]
                            </div>
                            <div className="text-sky-400 text-[13px] font-bold whitespace-pre-line leading-relaxed">
                                {cleanText(specialEffectObj.value.Element_001)}
                            </div>
                        </div>
                    )}

                    {/* 어빌리티 스톤 각인 효과 */}
                    {randomEffectObj && (
                        <div className="space-y-2">
                            <div className="text-white/30 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-1">
                                [무작위 각인 효과]
                            </div>
                            <div className="space-y-1.5">
                                {Object.values(randomEffectObj.value.contentStr).map((eff: any, idx: number) => (
                                    <div key={idx} className={`text-[13px] font-bold p-1 rounded-sm bg-white/5 ${eff.contentStr.includes('감소') ? 'text-red-400' : 'text-sky-300'}`}>
                                        {cleanText(eff.contentStr)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccessoryTooltip;