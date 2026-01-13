import React from 'react';

// 텍스트 정제 함수
const cleanText = (str: any) => {
    if (typeof str !== 'string') return '';
    return str
        .replace(/<BR>/gi, '\n')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

interface ArkCoreTooltipProps {
    data: any;    // 이미 파싱된 Tooltip 객체
    Gems?: any[]; // Gems 배열
}

const ArkCoreTooltip = ({ data, Gems }: ArkCoreTooltipProps) => {
    if (!data) return null;

    // 1. 현재 총 포인트 계산 (젬들의 포인트 합산)
    const currentTotalPoint = Gems?.reduce((acc, gem) => {
        try {
            const gemTooltip = typeof gem.Tooltip === 'string' ? JSON.parse(gem.Tooltip) : gem.Tooltip;
            // Element_004의 가공되지 않은 원본 텍스트 가져오기
            const rawPointText = gemTooltip?.Element_004?.value?.Element_001 || "";

            // "젬 포인트 : 10" 에서 숫자만 추출 (특수문자/공백 제거 후 매칭)
            // [\d]+ 를 사용하여 연속된 숫자를 모두 가져옵니다.
            const match = rawPointText.replace(/[^\d]/g, '');
            return acc + (match ? parseInt(match) : 0);
        } catch (e) {
            return acc;
        }
    }, 0) || 0;

    const elements = Object.values(data) as any[];

    // 2. 코어 정보 추출
    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const itemGrade = cleanText(titleInfo.leftStr0 || "");
    const itemIcon = titleInfo.slotData?.iconPath;

    const coreSubTitle = elements.find(el => el?.value?.Element_000 === "코어 타입")?.value?.Element_001 || "";
    const coreWillPowerRaw = elements.find(el => el?.value?.Element_000 === "코어 공급 의지력")?.value?.Element_001 || "0";
    const coreWillPower = coreWillPowerRaw.replace(/[^\d]/g, "");

    const coreOptionRaw = elements.find(el => el?.value?.Element_000 === "코어 옵션")?.value?.Element_001 || "";
    const coreCondition = elements.find(el => el?.value?.Element_000 === "코어 옵션 발동 조건")?.value?.Element_001;
    const jobLimit = elements.find(el => el?.type === "SingleTextBox" && el?.value && !el?.value.includes("분해") && !el.value.includes("["))?.value;

    const isRelic = itemGrade.includes("유물");
    const gradeColor = isRelic ? "text-[#FA5D00]" : "text-[#F9AE00]";
    const bgGradient = isRelic ? "from-[#2A1A0A] to-[#1C1D21]" : "from-[#242115] to-[#1C1D21]";

    return (
        <div className="w-80 bg-[#1C1D21] border border-white/10 rounded-lg shadow-2xl overflow-hidden font-sans text-sm shadow-black/50">
            {/* 헤더 영역 */}
            <div className={`p-4 bg-gradient-to-br ${bgGradient} border-b border-black/20`}>
                <div className="flex flex-col gap-3">
                    <div className={`text-[15px] font-bold text-center ${gradeColor}`}>{itemName}</div>
                    <div className="flex gap-4 items-center">
                        <img src={itemIcon} className="w-14 h-14 rounded-md border border-white/10 shadow-inner bg-black/40" alt="" />
                        <div className="flex flex-col">
                            <div className={`text-[13px] font-bold ${gradeColor}`}>{itemGrade}</div>
                            <div className="text-[11px] text-zinc-300 font-medium">
                                {coreSubTitle} <span className="text-white/10 mx-1">|</span>
                                <span className="text-[#9299FF] font-bold"> 의지력 {currentTotalPoint} / {coreWillPower}P</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-5 bg-[#1C1D21]">
                {/* 장착 젬 상세 */}
                {Gems && Gems.length > 0 && (
                    <div className="space-y-2">
                        {Gems.map((gem, idx) => {
                            let gemTooltip;
                            try {
                                gemTooltip = typeof gem.Tooltip === 'string' ? JSON.parse(gem.Tooltip) : gem.Tooltip;
                            } catch { return null; }

                            const gemEffect = gemTooltip?.Element_005?.value?.Element_001 || "";
                            const gemPointInfo = gemTooltip?.Element_004?.value?.Element_001 || "";
                            const gemPointMatch = gemPointInfo.match(/젬 포인트\s*:\s*(\d+)/);
                            const gemPoint = gemPointMatch ? gemPointMatch[1] : null;

                            return (
                                <div key={idx} className="bg-black/40 border border-white/5 p-3 rounded-md flex gap-3 items-start">
                                    <img src={gem.Icon} className="w-10 h-10 rounded bg-zinc-900 border border-[#F9AE00]/30 p-1" alt="" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <div className="text-[13px] font-bold text-[#F9AE00]">{cleanText(gemTooltip?.Element_000?.value)}</div>
                                            {gemPoint && <span className="text-[11px] text-[#9299FF] font-bold">+{gemPoint}P</span>}
                                        </div>
                                        <div className="text-[11px] text-zinc-300 leading-snug mt-1.5 whitespace-pre-line font-medium">
                                            {cleanText(gemEffect).split('\n')
                                                .filter(l => !l.includes('필요') && !l.includes('포인트'))
                                                .map((line, li) => (
                                                    <div key={li}>
                                                        {line.split(/(\d+(?:\.\d+)?%)/).map((p, pi) =>
                                                            p.endsWith('%') ? <span key={pi} className="text-[#24FD3A]">{p}</span> : p
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 코어 옵션 리스트 */}
                <div className="space-y-4">
                    {jobLimit && <div className="text-[13px] text-zinc-200 font-bold px-1">{cleanText(jobLimit)}</div>}
                    <div className="space-y-4">
                        {cleanText(coreOptionRaw).split('\n').map((line, i) => {
                            const pointMatch = line.match(/^(\[\d+P\])(.*)/);
                            if (pointMatch) {
                                const optionPoint = parseInt(pointMatch[1].replace(/[^0-9]/g, ""));
                                const isActive = currentTotalPoint >= optionPoint;
                                return (
                                    <div key={i} className="flex gap-1.5 items-start">
                                        <span className={`text-[13px] font-bold shrink-0 ${isActive ? 'text-[#F9AE00]' : 'text-zinc-800'}`}>{pointMatch[1]}</span>
                                        <span className={`text-[13px] leading-snug font-medium ${isActive ? 'text-zinc-200' : 'text-zinc-800'}`}>
                                            {pointMatch[2].trim().split(/(\d+(?:\.\d+)?%)/).map((p, idx) =>
                                                p.endsWith('%') ? <span key={idx} className={isActive ? "text-[#24FD3A]" : ""}>{p}</span> : p
                                            )}
                                        </span>
                                    </div>
                                );
                            }
                            return <div key={i} className="text-[12px] text-zinc-500 pl-1">{line}</div>;
                        })}
                    </div>
                </div>

                {/* 발동 조건 */}
                {coreCondition && (
                    <div className="pt-2 border-t border-white/5 text-[12px] text-zinc-500 leading-relaxed font-medium px-1 italic whitespace-pre-line">
                        {cleanText(coreCondition)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArkCoreTooltip;