import React from 'react';

// --- 등급별 텍스트 색상 정의 ---
const gradeTextStyles: Record<string, string> = {
    '일반': 'text-zinc-400',
    '고급': 'text-[#4edb4e]',
    '희귀': 'text-[#33c2ff]',
    '영웅': 'text-[#d966ff]',
    '전설': 'text-[#ffaa33]',
    '유물': 'text-[#ff7526]',
    '고대': 'text-[#e9d2a6]',
    '에스더': 'text-[#45f3ec]',
};

interface SkillTooltipProps {
    description: string;
    selectedTripods: any[];
    rune: any;
}

export const SkillTooltip = ({ description, selectedTripods, rune }: SkillTooltipProps) => {
    // 룬 등급에 따른 색상 추출 (기본값은 amber-500)
    const runeTextColor = rune ? (gradeTextStyles[rune.Grade] || 'text-amber-500') : '';

    return (
        <div className="absolute left-[190px] top-0 w-72 p-4 bg-[#1c1c1e]/95 border border-white/20 rounded-xl shadow-2xl
        opacity-0 invisible transition-all duration-200 z-[110] pointer-events-none
        group-hover:opacity-100 group-hover:visible translate-x-2 group-hover:translate-x-0 backdrop-blur-xl">
            <div className="space-y-3 text-left">
                {/* 스킬 설명 */}
                <p className="text-[12px] text-zinc-400 leading-relaxed break-keep border-l-2 border-purple-500 pl-2 italic">
                    {description || "상세 정보 없음"}
                </p>

                {/* 트라이포드 리스트 */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                    {selectedTripods.length > 0 ? (
                        selectedTripods.map((tp, ti) => (
                            <span key={ti} className="text-[10px] text-purple-300 font-bold bg-purple-500/5 px-1.5 py-0.5 rounded border border-purple-500/10">
                                {tp.Name}
                            </span>
                        ))
                    ) : (
                        <span className="text-[10px] text-zinc-600">선택된 트라이포드 없음</span>
                    )}
                </div>

                {/* 룬 정보: 등급별 색상 적용 */}
                {rune && (
                    <div className={`text-[11px] font-bold bg-white/[0.03] p-2 rounded border border-white/5 ${runeTextColor}`}>
                        룬: {rune.Name}
                    </div>
                )}
            </div>
        </div>
    );
};