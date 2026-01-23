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

// --- [등급별 스타일 정의 포함] ---
const gradeStyles: any = {
    '일반': { bg: 'from-zinc-800 to-zinc-950', border: 'border-white/10', text: 'text-zinc-400', glow: '', accent: 'bg-zinc-500' },
    '고급': { bg: 'from-[#1a2e1a] to-[#0a0f0a]', border: 'border-[#48c948]/30', text: 'text-[#4edb4e]', glow: 'shadow-[#48c948]/5', accent: 'bg-[#48c948]' },
    '희귀': { bg: 'from-[#1a2a3e] to-[#0a0d12]', border: 'border-[#00b0fa]/30', text: 'text-[#33c2ff]', glow: 'shadow-[#00b0fa]/10', accent: 'bg-[#00b0fa]' },
    '영웅': { bg: 'from-[#2e1a3e] to-[#120a1a]', border: 'border-[#ce43fb]/30', text: 'text-[#d966ff]', glow: 'shadow-[#ce43fb]/10', accent: 'bg-[#ce43fb]' },
    '전설': { bg: 'from-[#41321a] to-[#1a120a]', border: 'border-[#f99200]/40', text: 'text-[#ffaa33]', glow: 'shadow-[#f99200]/15', accent: 'bg-[#f99200]' },
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

interface ArkCoreTooltipProps {
    data: any;
    Gems?: any[];
}

const ArkCoreTooltip = ({ data, Gems }: ArkCoreTooltipProps) => {
    if (!data) return null;

    const elements = Object.values(data) as any[];

    // 데이터 추출
    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const itemGradeRaw = cleanText(titleInfo.leftStr0 || "");
    const itemIcon = titleInfo.slotData?.iconPath;

    // --- 등급 판별 로직 ---
    let currentGrade = "일반";
    if (itemGradeRaw.includes('에스더')) currentGrade = '에스더';
    else if (itemGradeRaw.includes('고대')) currentGrade = '고대';
    else if (itemGradeRaw.includes('유물')) currentGrade = '유물';
    else if (itemGradeRaw.includes('전설')) currentGrade = '전설';
    else if (itemGradeRaw.includes('영웅')) currentGrade = '영웅';
    else if (itemGradeRaw.includes('희귀')) currentGrade = '희귀';
    else if (itemGradeRaw.includes('고급')) currentGrade = '고급';

    const theme = gradeStyles[currentGrade] || gradeStyles['일반'];

    const coreSubTitle = elements.find(el => el?.value?.Element_000 === "코어 타입")?.value?.Element_001 || "";
    const coreSupplyPointRaw = elements.find(el => el?.value?.Element_000 === "코어 공급 의지력")?.value?.Element_001 || "";
    const coreSupplyPoint = coreSupplyPointRaw.replace(/[^0-9]/g, "");

    const coreOptionRaw = elements.find(el =>
        cleanText(el?.value?.Element_000) === "코어 옵션"
    )?.value?.Element_001 || "";
    const coreCondition = elements.find(el => el?.value?.Element_000 === "코어 옵션 발동 조건")?.value?.Element_001;

    const allOptionLines = coreOptionRaw
        .replace(/<br>|<BR>/gi, '\n')
        .split('\n')
        .map(line => cleanText(line))
        .filter(Boolean);
    const headerSummaryLines = allOptionLines.filter(line => line.trim().startsWith('['));

    return (
        <div className="w-80 bg-[#1C1D21] border border-white/10 rounded-lg shadow-2xl overflow-hidden font-sans text-sm shadow-black/80">
            {/* 헤더 영역: 등급별 테마 적용 */}
            <div className={`p-4 bg-gradient-to-br ${theme.bg} border-b border-black/30 relative overflow-hidden`}>
                {/* 배경 광채 효과 (고대/에스더 이상) */}
                {['고대', '에스더'].includes(currentGrade) && (
                    <div className={`absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent`} />
                )}

                <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div className={`text-[15px] font-bold ${theme.text}`}>{itemName}</div>
                        {coreSupplyPoint && (
                            <div className={`px-2 py-0.5 rounded text-[11px] font-bold border ${theme.accent.replace('bg-', 'border-')}/30 ${theme.text.replace('text-', 'bg-')}/10 ${theme.text}`}>
                                {coreSupplyPoint}P 공급
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="relative shrink-0">
                            {/* 아이콘 테두리에도 테마 적용 */}
                            <div className={`p-0.5 rounded-md border ${theme.border} ${theme.glow}`}>
                                <img src={itemIcon} className="w-14 h-14 rounded-md object-cover bg-black/40" alt="" />
                            </div>
                        </div>

                        <div className="flex flex-col flex-1 min-w-0">
                            <div className={`text-[13px] font-bold ${theme.text} truncate leading-tight`}>
                                {itemGradeRaw}
                            </div>
                            <div className="text-[11px] text-zinc-400 font-medium leading-tight mb-1.5">
                                {coreSubTitle}
                            </div>

                            <div className="mt-0 flex flex-col gap-1.5">
                                {headerSummaryLines.slice(0, 2).map((line, i) => {
                                    const pointMatch = line.match(/^(\[\d+(?:~\d+)?P\])(.*)/);
                                    if (!pointMatch) return null;

                                    return (
                                        <div key={i} className="flex gap-1.5 items-start">
                                            <span className="text-[12px] font-black shrink-0 text-[#f18c2d] leading-[1.4]">
                                                {pointMatch[1]}
                                            </span>
                                            <span className="text-[12px] font-semibold text-zinc-100 leading-[1.4] break-keep whitespace-pre-wrap">
                                                {pointMatch[2].trim().split(/(\d+(?:\.\d+)?%)/).map((part, index) =>
                                                    /(\d+(?:\.\d+)?%)/.test(part)
                                                        ? <span key={index} className="text-green-400 font-bold">{part}</span>
                                                        : part
                                                )}
                                            </span>
                                        </div>
                                    );
                                })}
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
                            try { gemTooltip = typeof gem.Tooltip === 'string' ? JSON.parse(gem.Tooltip) : gem.Tooltip; }
                            catch { return null; }

                            const gemEffect = gemTooltip?.Element_005?.value?.Element_001 || "";
                            const gemPointMatch = (gemTooltip?.Element_004?.value?.Element_001 || "").match(/젬 포인트\s*:\s*(\d+)/);
                            const gemPoint = gemPointMatch ? gemPointMatch[1] : null;
                            const gemName = cleanText(gemTooltip?.Element_000?.value);

                            return (
                                <div key={idx} className="bg-black/40 border border-white/5 p-3 rounded-md flex gap-3 items-start">
                                    <img src={gem.Icon} className={`w-10 h-10 rounded bg-zinc-900 border ${theme.border} p-1`} alt="" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <div className={`text-[13px] font-bold ${theme.text} truncate`}>{gemName}</div>
                                            {gemPoint && <span className="text-[11px] text-[#9299FF] font-bold shrink-0">+{gemPoint}P</span>}
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