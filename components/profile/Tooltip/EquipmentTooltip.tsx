import React from 'react';

const cleanText = (str: string) => {
    if (!str) return '';
    return str
        .replace(/<BR>/gi, '\n')          // <BR> -> 줄바꿈
        .replace(/<[^>]*>?/gm, '')        // 모든 HTML 태그 제거
        .replace(/\n\s+/g, '\n')          // 줄바꿈 뒤 공백 제거
        .trim();
};

interface TooltipProps {
    data: any;
    className?: string;
}

const EquipmentTooltip = ({ data, className = "" }: TooltipProps) => {
    if (!data) return null;
    // --- 1. 데이터 추출 영역 ---

    // 헤더 정보 (이름, 등급, 레벨, 품질)
    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const quality = titleInfo.qualityValue ?? -1;
    const itemLevelStr = cleanText(titleInfo.leftStr2 || "");
    const gradeName = titleInfo.leftStr0?.split(' ')[0] || "고대";
    const itemIcon = titleInfo.slotData?.iconPath;
    const itemGrade = titleInfo.leftStr0; // "고대 머리 방어구" 등
    const itemLevelAndTier = cleanText(titleInfo.leftStr2 || ""); // "아이템 레벨 1705 (티어 4)"

    const elements = Object.values(data) as any[];

    // 1. [기본 효과] 찾기 - 물리/마법 방어력, 힘/민/지, 체력
    const baseEffectObj = elements.find((el: any) =>
        el?.type === 'ItemPartBox' &&
        cleanText(el?.value?.Element_000) === '기본 효과'
    );

    // 2. [추가 효과] 찾기 - 추가 피해(무기), 생명 활성력(방어구)
    const addEffectObj = elements.find((el: any) =>
        el?.type === 'ItemPartBox' &&
        cleanText(el?.value?.Element_000).includes('추가 효과')
    );

    // 3. [아크 패시브] 찾기 - 진화/깨달음 포인트
    const arcPassiveObj = elements.find((el: any) =>
        el?.type === 'ItemPartBox' &&
        cleanText(el?.value?.Element_000).includes('아크 패시브')
    );

    // 4. [상급 재련] 찾기
    const advRefineObj = elements.find((el: any) =>
        typeof el?.value === 'string' && el.value.includes('[상급 재련]')
    );

    // 5. [내구도] 찾기
    const durabilityObj = elements.find((el: any) => el?.type === 'ShowMeTheMoney');

    // 등급별 테마 (고대: 오렌지/브라운, 유물: 오렌지/레드)
    const themes: any = {
        '고대': 'from-[#3d3325] to-[#1a1a1c] text-[#e9d2a6] border-[#e9d2a6]/30',
        '유물': 'from-[#412608] to-[#1a1a1c] text-[#f99200] border-[#f99200]/30',
    };
    const theme = themes[gradeName] || themes['고대'];
    return (
        <div className={`absolute z-[9999] w-80 bg-[#121213] border border-white/10 rounded shadow-2xl overflow-hidden ${className}`}>
            {/* 헤더 섹션 (생략 가능) */}
            {/* --- 상단 헤더 섹션 --- */}
            <div className={`p-4 bg-gradient-to-br ${theme.split(' ').slice(0, 2).join(' ')} border-b border-white/10`}>
                <div className="flex gap-4 items-start">
                    {/* 아이템 아이콘 */}
                    <div className="relative shrink-0">
                        <div className="p-0.5 rounded-lg bg-gradient-to-br from-white/20 to-transparent border border-white/20 shadow-lg">
                            <img src={itemIcon} className="w-14 h-14 rounded-md object-cover" alt="" />
                        </div>
                    </div>

                    {/* 이름 및 등급 정보 */}
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-[18px] font-black leading-tight drop-shadow-md truncate ${theme.split(' ')[2]}`}>
                            {itemName}
                        </h4>
                        <div className="mt-1.5 space-y-0.5">
                            <div className="text-[12px] font-bold text-white/70">
                                {cleanText(itemGrade)}
                            </div>
                            <div className="text-[11px] font-medium text-white/40">
                                {itemLevelAndTier}
                            </div>
                            <div className="text-[11px] font-medium text-white/40">
                                {cleanText(advRefineObj.value).split('\n')[0]}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-5">
                {/* 품질 바 */}
                {quality !== -1 && (() => {
                    // 등급별 색상 로직 정의
                    const getQualityColor = (q) => {
                        if (q === 100) return '#FF8000'; // 고대/에스더
                        if (q >= 90) return '#CE43FB';  // 유물
                        if (q >= 70) return '#00B0FA';  // 전설
                        if (q >= 30) return '#00D100';  // 영웅
                        return '#919191';               // 일반/희귀 (기본값)
                    };

                    const color = getQualityColor(quality);

                    return (
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <span className="text-white/30 text-[10px] font-bold uppercase tracking-tight">Quality</span>
                                <span className="text-[13px] font-bold" style={{ color }}>{quality}</span>
                            </div>
                            {/* 미니 바 */}
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full transition-all duration-500"
                                    style={{
                                        width: `${quality}%`,
                                        backgroundColor: color
                                    }}
                                />
                            </div>
                        </div>
                    );
                })()}

            <div className="p-4 space-y-5">
                {/* [세부 정보] 섹션 */}
                <div className="space-y-3">
                    <div className="text-white/30 text-[10px] font-black uppercase tracking-widest border-b border-white/5 pb-1">
                        [세부 정보]
                    </div>

                    {/* 물리/마법 방어력 + 힘/민/지/체 (기본 효과) */}
                    {baseEffectObj?.value?.Element_001 && (
                        <div className="text-zinc-200 text-[13px] leading-relaxed whitespace-pre-line font-medium">
                            {cleanText(baseEffectObj.value.Element_001)}
                        </div>
                    )}

                    {/* 추가 피해 / 생명 활성력 (추가 효과) */}
                    {addEffectObj?.value?.Element_001 && (
                        <div className="text-sky-400 text-[13px] font-bold">
                            {cleanText(addEffectObj.value.Element_001)}
                        </div>
                    )}
                </div>
            </div>
        </div>

        </div>
    );
};


export default EquipmentTooltip;