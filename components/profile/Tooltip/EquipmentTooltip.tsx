import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const cleanText = (str: any) => {
    if (!str) return '';
    const target = typeof str === 'string' ? str : JSON.stringify(str);
    return target
        .replace(/<P ALIGN='CENTER'>/gi, '')
        .replace(/<\/P>/gi, '\n')
        .replace(/<BR>/gi, '\n')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\n\s+/g, '\n')
        .trim();
};

interface TooltipProps {
    data: any;
    className?: string;
    onClose?: () => void;
}

const EquipmentTooltip = ({ data, className = "", onClose }: TooltipProps) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({
        top: 0,
        left: 0,
        maxHeight: 'auto',
        isReady: false
    });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useLayoutEffect(() => {
        if (!isMobile && tooltipRef.current && tooltipRef.current.parentElement) {
            const tooltip = tooltipRef.current;
            const parent = tooltip.parentElement;
            const parentRect = parent.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const safeTopLimit = 74;
            const safeBottomLimit = viewportHeight - 40;
            const tooltipWidth = 420; // PC 버전 고정 너비

            let finalTop = parentRect.top;
            let finalLeft = parentRect.right + 12;

            // 화면 오른쪽을 벗어나는 경우 왼쪽으로 배치
            if (finalLeft + tooltipWidth > viewportWidth) {
                finalLeft = parentRect.left - tooltipWidth - 12;
            }

            const tooltipHeight = tooltip.offsetHeight;
            // 화면 하단을 벗어나는 경우 위로 조정
            if (finalTop + tooltipHeight > safeBottomLimit) {
                finalTop = Math.max(safeTopLimit, safeBottomLimit - tooltipHeight);
            }

            setCoords({
                top: finalTop,
                left: finalLeft,
                maxHeight: `${Math.floor(safeBottomLimit - safeTopLimit)}px`,
                isReady: true
            });
        }
    }, [data, isMobile]);

    if (!data) return null;

    /* 데이터 파싱부 */
    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const quality = titleInfo.qualityValue ?? -1;
    const itemIcon = titleInfo.slotData?.iconPath;
    const itemGrade = cleanText(titleInfo.leftStr0 || "");
    const itemLevelAndTier = cleanText(titleInfo.leftStr2 || "");
    const gradeName = itemGrade.includes('에스더') ? '에스더' : (itemGrade.split(' ')[0] || "고대");
    const elements = Object.values(data) as any[];

    const findByTitle = (key: string) =>
        elements.find(el => cleanText(el?.value?.Element_000 || "").includes(key))?.value?.Element_001;

    const findSingleText = (keywords: string[]) =>
        elements.filter(el => el?.type === 'SingleTextBox' && keywords.some(k => String(el.value).includes(k)))
            .map(el => cleanText(el.value));

    const durabilityElement = elements.find(el =>
        el?.type === "ShowMeTheMoney" && String(el?.value).includes("내구도")
    );

    const baseEffect = findByTitle('기본 효과');
    const durability = durabilityElement ? cleanText(durabilityElement.value).split('|')[0] : null;
    const addEffect = findByTitle('추가 효과');
    const arkPassive = findByTitle('아크 패시브 포인트');
// 상급 재련 데이터 찾기 및 첫 줄만 추출
    const advRefineRaw = elements.find(el => el && String(el.value).includes('[상급 재련]'))?.value;
    const advRefine = advRefineRaw ? cleanText(advRefineRaw).split('\n')[0] : null;

// 결과 예시: "[상급 재련] 40단계"
    const engraveGroup = elements.find(el => el?.type === 'IndentStringGroup')?.value?.Element_000;
    const bottomInfos = findSingleText(['느낌이 난다', '내구도', '[제작]', '판매불가', '분해불가']);

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
    const theme = themes[gradeName] || themes['고대'];

    const Content = (
        <div
            ref={tooltipRef}
            style={!isMobile ? {
                top: coords.top,
                left: coords.left,
                maxHeight: coords.maxHeight,
                position: 'fixed',
                width: '300px', // PC 너비 확장
                visibility: coords.isReady ? 'visible' : 'hidden',
                opacity: coords.isReady ? 1 : 0
            } : {}}
            className={`${isMobile ? 'w-full max-h-[80vh] rounded-t-2xl pb-6' : 'rounded-xl'}
                z-[9999] overflow-y-auto bg-[#0d0d0f]/10 backdrop-blur-xl border-t border-x border-white/10 shadow-2xl
                ${theme.glow} font-sans ${className} transition-opacity duration-300`}
        >
            {/* 드래그 핸들 (모바일 전용) */}
            {isMobile && (
                <div className="flex justify-center py-2">
                    <div className="w-8 h-1 bg-white/10 rounded-full" />
                </div>
            )}

            {/* 헤더 */}
            <div className={`p-2 shrink-0 bg-[#111111] bg-gradient-to-br ${theme.bg} border-b border-white/10 z-10`}>
                <div className="flex gap-3 items-center">
                    <div className="relative shrink-0 w-[50px] h-[50px]">
                        {/* 부모 div에 theme.bg를 추가하고, 이미지는 투명 배경을 고려해 삽입합니다 */}
                        <div className={`w-full h-full overflow-hidden rounded-md border-[1.5px] ${theme.border} bg-black bg-gradient-to-br ${theme.bg}`}>
                            <img
                                src={itemIcon}
                                className="w-full h-full object-cover"
                                alt=""
                            />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-[14px] font-bold truncate ${theme.text}`}>{itemName}</h4>
                        <div className="text-[12px] text-white/50">{itemGrade}</div>
                    </div>
                </div>
                {isMobile && (
                    <button onClick={onClose} className="absolute top-2 right-2 p-1.5 text-white/20 hover:text-white">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* 본문: PC/모바일 공통 좌우 레이아웃 */}
            <div className="p-3 grid grid-cols-2 gap-x-5 gap-y-4 bg-[#111111]/10 backdrop-blur-md">

                {/* 왼쪽 컬럼: 기본 정보 및 수치 */}
                <div className="space-y-4 col-span-1 border-r border-white/5 pr-4">
                    <div className="text-[11.5px] leading-tight">
                        <div className="text-white font-bold">{itemLevelAndTier}</div>
                        {advRefine && (
                            <div className="text-[#ffcf4d] font-semibold mt-1 flex items-center gap-1">
                                {advRefine}
                            </div>
                        )}
                    </div>

                    {baseEffect && (
                        <div className="space-y-1">
                            <p className="text-white/60 text-[11px] font-bold uppercase tracking-tight">[기본 효과]</p>
                            <p className="text-white/90 text-[11px] whitespace-pre-line leading-relaxed font-medium">{cleanText(baseEffect)}</p>
                        </div>
                    )}
                </div>

                {/* 오른쪽 컬럼: 추가 효과 및 각인 */}
                <div className="space-y-1.5 col-span-1 w-28">
                    {quality !== -1 && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[11px] font-bold text-white/90 uppercase tracking-tight">
                                <span>품질 {quality}</span>
                            </div>
                            <div className="h-1 bg-white/40 rounded-full overflow-hidden">
                                    <div className="h-full transition-all duration-700" style={{ width: `${quality}%`, backgroundColor: quality === 100 ? '#FF8000' : quality >= 90 ? '#CE43FB' : '#00B0FA' }} />
                            </div>
                        </div>
                    )}
                    {addEffect && (
                        <div className="space-y-0">
                            <p className="text-white/30 text-[11px] font-bold uppercase tracking-tight">[추가 효과]</p>
                            <p className="text-white/90 text-[11px] font-semibold leading-relaxed">{cleanText(addEffect)}</p>
                        </div>
                    )}

                    {arkPassive && (
                        <div className="space-y-0y-1">
                            <p className="text-white/30  text-[11px] font-bold uppercase tracking-tight">[아크 패시브]</p>
                            <p className="text-white/90 text-[11px] font-bold leading-tight">{cleanText(arkPassive)}</p>
                        </div>
                    )}

                    {engraveGroup && (
                        <div className="space-y-0.5">
                            <p className="text-[#A9D0F5]/40 text-[11px] font-bold uppercase tracking-tight">[{cleanText(engraveGroup.topStr)}]</p>
                            <div className="space-y-1">
                                {Object.values(engraveGroup.contentStr).map((c: any, i: number) => {
                                    const t = cleanText(c.contentStr);
                                    if(!t) return null;
                                    return <p key={i} className={`text-[11px] font-medium leading-snug ${t.includes('감소') ? 'text-[#fe2e2e]' : 'text-white/80'}`}>{t}</p>;
                                })}
                            </div>
                        </div>
                    )}

                    {durability && (
                        <div className="space-y-0">
                            <p className="text-white/30 text-[11px] font-bold uppercase tracking-tight">[내구도]</p>
                            <p className="text-white/90 text-[11px] whitespace-pre-line leading-relaxed font-medium">{cleanText(durability)}</p>
                        </div>
                    )}
                </div>

                {/* 하단 정보: 전체 너비 사용 */}
                {bottomInfos.length > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-1 col-span-2">
                        {bottomInfos.map((info, i) => (
                            <p key={i} className="text-[10.5px] text-white/60 leading-tight">{info}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <div className="fixed inset-0 z-[10000] flex items-end justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                />
                <motion.div
                    className="relative w-full z-10 px-2"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                >
                    {Content}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="absolute top-0 left-0 pointer-events-none">
            <div className="pointer-events-auto">
                {Content}
            </div>
        </div>
    );
};

export default EquipmentTooltip;