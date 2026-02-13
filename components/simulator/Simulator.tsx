import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, Search, ShieldAlert, Diamond } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SynergyBuffTab } from "./SynergyBuffTab";
import { ResultTab } from "./Result";
import { ArkPassiveBoard } from "./ArkPassiveBoard.tsx";
import engravingIconMap from "@/components/profile/tabs/engravingsIdTable.json";
import JewelryTooltip from "@/components/profile/Tooltip/JewelryTooltip.tsx";
import { CharacterInfo } from "@/types.ts";
import { SimTab } from "./SimulatorNav";
import ArkCoreTooltip from "@/components/profile/Tooltip/ArkCoreTooltip.tsx";

type CharacterInfoCompat = CharacterInfo & { CharacterName?: string };

// 🔹 Props 인터페이스: activeTab 추가
interface SimulatorProps {
    character?: CharacterInfoCompat | null;
    activeTab: SimTab;
    onEquipmentUpdate: (partName: string, data: any) => void;
}

interface EquipmentItemProps {
    item: any;
    i: number;
    theme: any;
    tooltip: any;
    quality: number | string;
    reinforceLevel: string;
    advancedReinforce: string | number;
    itemName: string;
    REINFORCE_OPTIONS: Array<{ label: string; value: number; tier: number }>;
    setHoveredIndex: (idx: number | null) => void;
    setHoveredData: (data: any) => void;
    onUpdate: (partName: string, data: any) => void;
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
    Effects: ArkEffect[];
}

/* ---------------------- 상수 및 스타일 (기존 유지) ---------------------- */
const gradeStyles: any = {
    일반: {
        bg: "from-zinc-800 to-zinc-950",
        border: "border-white/10",
        text: "text-zinc-400",
        accent: "bg-zinc-500",
    },
    고급: {
        bg: "from-[#1a2e1a] to-[#0a0f0a]",
        border:
            "border-[#48c948]/30 shadow-[0_0_10px_rgba(72,201,72,0.05)]",
        text: "text-[#4edb4e]",
        accent: "bg-[#48c948]",
    },
    희귀: {
        bg: "from-[#1a2a3e] to-[#0a0d12]",
        border: "border-[#00b0fa]/30 shadow-[0_0_10px_rgba(0,176,250,0.1)]",
        text: "text-[#33c2ff]",
        accent: "bg-[#00b0fa]",
    },
    영웅: {
        bg: "from-[#2e1a3e] to-[#120a1a]",
        border: "border-[#ce43fb]/30 shadow-[0_0_10px_rgba(206,67,251,0.1)]",
        text: "text-[#d966ff]",
        accent: "bg-[#ce43fb]",
    },
    전설: {
        bg: "from-[#41321a] to-[#1a120a]",
        border: "border-[#f99200]/40 shadow-[0_0_10px_rgba(249,146,0,0.15)]",
        text: "text-[#ffaa33]",
        accent: "bg-[#f99200]",
    },
    유물: {
        bg: "from-[#351a0a] to-[#0a0a0a]",
        border: "border-[#fa5d00]/50 shadow-[0_0_10px_rgba(250,93,0,0.2)]",
        text: "text-[#ff7526]",
        accent: "bg-[#fa5d00]",
    },
    고대: {
        bg: "from-[#3d3325] to-[#0f0f10]",
        border: "border-[#e9d2a6]/40",
        text: "text-[#e9d2a6]",
        accent: "bg-[#e9d2a6]",
    },
    에스더: {
        bg: "from-[#0d2e2e] to-[#050505]",
        border:
            "border-[#2edbd3]/60 shadow-[0_0_12px_rgba(46,219,211,0.2)]",
        text: "text-[#45f3ec]",
        accent: "bg-[#2edbd3]",
    },
};

/* ---------------------- Interfaces & Utils (기존 유지) ---------------------- */
interface Equipment {
    Type: string;
    Name: string;
    Icon: string;
    Grade: string;
    Tooltip: string;
}

const cleanText = (text: any): string => {
    if (!text) return "";
    if (typeof text === "string") return text.replace(/<[^>]*>?/gm, "").trim();
    return "";
};

const getQualityColor = (q: number) => {
    if (q === 100) return "text-[#FF8000] border-[#FF8000]";
    if (q >= 90) return "text-[#CE43FB] border-[#CE43FB]";
    if (q >= 70) return "text-[#00B0FA] border-[#00B0FA]";
    if (q >= 30) return "text-[#00D100] border-[#00D100]";
    return "text-[#FF4040] border-[#FF4040]";
};

const FALLBACK_ABILITY_STONE_ICON =
    "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/game/ico_ability_stone_symbol.png";

function safeClone<T>(v: T): T {
    try {
        return JSON.parse(JSON.stringify(v));
    } catch {
        return v;
    }
}

/* =======================
   ✅ GEM TYPES / CONSTANTS (파일 전역 - 단 한번만 선언)
   ======================= */
type GemKind = "홍염" | "멸화" | "겁화" | "작열" | "광휘";
type GemPick = { kind: GemKind; level: number };

const GEM_KINDS: GemKind[] = ["홍염", "멸화", "겁화", "작열"];
const GEM_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

// ✅ 선택 시 아이콘 바뀌는 맵
const GEM_ICON_URL: Record<GemKind, Record<number, string>> = {
    홍염: {
        1: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_56.png",
        2: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_57.png",
        3: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_58.png",
        4: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_59.png",
        5: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_60.png",
        6: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_61.png",
        7: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_62.png",
        8: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_63.png",
        9: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_64.png",
        10: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_65.png",
    },
    멸화: {
        1: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_46.png",
        2: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_47.png",
        3: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_48.png",
        4: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_49.png",
        5: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_50.png",
        6: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_51.png",
        7: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_52.png",
        8: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_53.png",
        9: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_54.png",
        10: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_55.png",
    },
    겁화: {
        1: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_96.png",
        2: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_97.png",
        3: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_98.png",
        4: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_99.png",
        5: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_100.png",
        6: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_101.png",
        7: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_102.png",
        8: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_103.png",
        9: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_104.png",
        10: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_105.png",
    },
    작열: {
        1: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_106.png",
        2: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_107.png",
        3: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_108.png",
        4: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_109.png",
        5: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_110.png",
        6: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_111.png",
        7: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_112.png",
        8: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_113.png",
        9: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_114.png",
        10: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_115.png",
    },
};

// ✅ 4티어 겁화/작열만 공격력 증가(합산용)
const T4_ATK_BONUS_BY_LEVEL: Record<number, number> = {
    1: 0.0,
    2: 0.05,
    3: 0.1,
    4: 0.2,
    5: 0.3,
    6: 0.45,
    7: 0.6,
    8: 0.8,
    9: 1.0,
    10: 1.2,
};

function inferGemKindFromEquippedGem(gem: any): GemKind | null {
    if (!gem) return null;

    // 1) 가장 우선: gem.Name 같은 필드가 있으면 거기서 찾기
    const directText = String(gem?.Name || "");

    // 2) Tooltip이 있으면 JSON을 문자열로 만들어서 통째로 검색 (필드명이 달라도 잡힘)
    let tooltipText = "";
    try {
        const t =
            typeof gem?.Tooltip === "string" ? JSON.parse(gem.Tooltip) : gem?.Tooltip;
        tooltipText = typeof t === "string" ? t : JSON.stringify(t);
    } catch {
        tooltipText = String(gem?.Tooltip || "");
    }

    const hay = (directText + " " + tooltipText).toLowerCase();

    // ✅ 키워드 기반 판별 (순서 중요: 광휘 먼저)
    if (hay.includes("광휘")) return "광휘";
    if (hay.includes("겁화")) return "겁화";
    if (hay.includes("작열")) return "작열";
    if (hay.includes("멸화")) return "멸화";
    if (hay.includes("홍염")) return "홍염";

    return null;
}

/* =======================
   ✅ EquipmentItem (기존 유지)
   ======================= */
// EquipmentItemProps 인터페이스에 onUpdate 추가 필요
const EquipmentItem = ({
                           item,
                           i,
                           theme,
                           tooltip,
                           quality,
                           reinforceLevel,
                           advancedReinforce,
                           itemName,
                           REINFORCE_OPTIONS,
                           setHoveredIndex,
                           setHoveredData,
                           onUpdate, // ✅ 추가: 부모에게 상태를 전달할 콜백
                       }: any) => {
    const [localQuality, setLocalQuality] = useState(quality);
    const [localAdv, setLocalAdv] = useState(advancedReinforce);
    const [selectedOption, setSelectedOption] = useState(() => {
        const level = reinforceLevel.replace("+", "");
        return (
            REINFORCE_OPTIONS.find((opt: any) => String(opt.value) === level) ||
            REINFORCE_OPTIONS[0]
        );
    });

    // ✅ 추가: 값이 변경될 때마다 부모(Simulator)로 데이터 전달
    useEffect(() => {
        onUpdate(itemName, {
            quality: Number(localQuality),
            level: selectedOption.value,
            tier: selectedOption.tier,
            advancedReinforce: Number(localAdv)
        });
    }, [localQuality, localAdv, selectedOption, itemName, onUpdate]);

    useEffect(() => {
        const level = reinforceLevel.replace("+", "");
        const found = REINFORCE_OPTIONS.find((opt: any) => String(opt.value) === level);

        if (found) {
            // 현재 로컬 상태와 부모의 원본 props가 다를 때만 업데이트 (덮어쓰기 방지)
            // 만약 사용자가 수정한 상태라면 이 조건문은 실행되지 않습니다.
            setLocalQuality((prev: any) => (prev !== quality ? quality : prev));
            setLocalAdv((prev: any) => (prev !== advancedReinforce ? advancedReinforce : prev));

            setSelectedOption((prev: any) => {
                if (prev.value === found.value && prev.tier === found.tier) return prev;
                return found;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reinforceLevel, quality, advancedReinforce]);
// REINFORCE_OPTIONS는 배열이므로 의존성에 넣으면 매번 실행될 수 있어 제외하거나 useMemo 처리가 필요합니다.

    const handleKeyDown = (e: any) => {
        if (e.key === "Enter") e.currentTarget.blur();
    };

    return (
        <div
            onMouseEnter={() => { setHoveredIndex(i); setHoveredData(tooltip); }}
            onMouseLeave={() => { setHoveredIndex(null); setHoveredData(null); }}
            className="relative group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors h-[62px] cursor-help"
        >
            <div className="relative shrink-0">
                <div className={`p-0.5 rounded-lg border shadow-lg bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow || ""}`}>
                    <img src={item.Icon} className="w-10 h-10 rounded-md object-cover bg-black/20" alt={itemName} />
                </div>
                <input
                    type="number"
                    min="0"
                    max="100"
                    value={localQuality}
                    onChange={(e) => setLocalQuality(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`absolute -bottom-1 -right-1 w-7 px-0.5 rounded-md text-[10px] font-black border border-zinc-700 bg-zinc-900 text-center focus:outline-none focus:ring-1 focus:ring-yellow-500 ${getQualityColor(Number(localQuality))} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors`}
                />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-[12px] truncate mb-1 ${theme.text}`}>{itemName}</h3>
                <div className="flex items-center gap-2">
                    <select
                        className="bg-zinc-800 text-white/70 text-[10px] px-2 py-0.5 rounded border border-zinc-700 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer scrollbar-hide"
                        value={`${selectedOption.tier}-${selectedOption.value}`}
                        onChange={(e) => {
                            const [tier, val] = e.target.value.split("-");
                            const found = REINFORCE_OPTIONS.find((opt: any) => opt.tier === Number(tier) && opt.value === Number(val));
                            if (found) setSelectedOption(found);
                        }}
                    >
                        {REINFORCE_OPTIONS.map((opt: any) => (
                            <option key={`${opt.tier}-${opt.value}`} value={`${opt.tier}-${opt.value}`} className="bg-zinc-900 text-white">
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded border border-sky-700 focus-within:border-sky-500 transition-colors">
                        <span className="text-sky-400 text-[10px] font-bold">상재</span>
                        <input
                            type="number"
                            min="0"
                            max="20"
                            value={localAdv}
                            onChange={(e) => setLocalAdv(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-5 bg-transparent text-sky-400 text-[10px] font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

/* =======================
   ✅ GemSlot (드롭다운 + 아이콘 변경 + 툴팁 유지)
   ======================= */
type GemSlotProps = {
    gem: any;
    index: number;

    hoverIdx: number | null;
    hoverData: any;
    setHoverIdx: (v: number | null) => void;
    setHoverData: (v: any) => void;

    isCenter?: boolean;

    pick: GemPick | null;
    setPick: (index: number, pick: GemPick | null) => void;
};

const GemSlot = ({
                     gem,
                     index,
                     hoverIdx,
                     hoverData,
                     setHoverIdx,
                     setHoverData,
                     isCenter = false,
                     pick,
                     setPick,
                 }: GemSlotProps) => {
    const sizeClasses = isCenter ? "w-14 h-14" : "w-12 h-12";

    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener("mousedown", onDown);
        return () => window.removeEventListener("mousedown", onDown);
    }, [open]);

    let skillIcon = gem?.Icon;
    let gradeColor = "#1f2937";

    // ✅ 기존 gem tooltip에서 아이콘/등급색 추출 유지
    try {
        if (gem?.Tooltip) {
            const tooltip =
                typeof gem.Tooltip === "string" ? JSON.parse(gem.Tooltip) : gem.Tooltip;
            skillIcon = tooltip.Element_001?.value?.slotData?.iconPath || gem.Icon;
            const gradeName = tooltip.Element_001?.value?.leftStr0 || gem.Grade || "";

            if (gradeName.includes("고대")) gradeColor = "#2a4d4f";
            else if (gradeName.includes("유물")) gradeColor = "#4d2b14";
            else if (gradeName.includes("전설")) gradeColor = "#45381a";
        }
    } catch {
        skillIcon = gem?.Icon;
    }

    // ✅ 핵심: pick이 있으면 그 아이콘으로 덮어쓰기
    if (pick) {
        const pickedIcon = GEM_ICON_URL[pick.kind]?.[pick.level];
        if (pickedIcon) skillIcon = pickedIcon;
    }

    const label = pick ? `Lv.${pick.level} ${pick.kind}` : gem ? `Lv.${gem.Level}` : "선택";

    const selectPick = (kind: GemKind, level: number) => {
        setPick(index, { kind, level });
        setOpen(false);
    };

    const clearPick = () => {
        setPick(index, null);
        setOpen(false);
    };

    return (
        <div
            ref={wrapRef}
            className="relative group flex flex-col items-center"
            onMouseEnter={() => {
                setHoverIdx(index);
                setHoverData(gem);
            }}
            onMouseLeave={() => {
                setHoverIdx(null);
                setHoverData(null);
            }}
        >
            <button
                type="button"
                className="flex flex-col items-center cursor-pointer select-none"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
            >
                {gem || pick ? (
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
                            draggable={false}
                        />
                    </div>
                ) : (
                    <div className={`${sizeClasses} rounded-full bg-white/5 opacity-10 border border-zinc-800`} />
                )}

                <span className="mt-1 text-zinc-500 text-[11px] font-bold group-hover:text-zinc-300 transition-colors whitespace-nowrap">
          {label}
        </span>
            </button>

            {/* ✅ 기존 툴팁 유지 */}
            {hoverIdx === index && hoverData && (
                <div
                    className="absolute left-[80%] top-0 z-[9999] pl-4 pt-2 pointer-events-auto"
                    style={{ width: "max-content" }}
                >
                    <div className="animate-in fade-in zoom-in-95 duration-150">
                        <JewelryTooltip gemData={hoverData} />
                    </div>
                </div>
            )}

            {/* ✅ 드롭다운 */}
            {open && (
                <div
                    className="absolute z-[99999] mt-2 left-1/2 -translate-x-1/2 w-[210px] rounded-2xl border border-white/10 bg-[#0b0f14]/95 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.65)] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                        <div className="text-[12px] font-semibold text-zinc-200">보석 선택</div>
                        <button
                            type="button"
                            onClick={clearPick}
                            className="text-[11px] text-zinc-300/80 hover:text-zinc-200 underline underline-offset-2"
                        >
                            해제
                        </button>
                    </div>

                    <div className="max-h-[240px] overflow-auto">
                        {GEM_KINDS.map((kind) => (
                            <div key={kind} className="px-3 py-2 border-b border-white/5">
                                <div className="text-[12px] text-zinc-200/90 mb-2">{kind}</div>
                                <div className="grid grid-cols-5 gap-1.5 pb-1">
                                    {GEM_LEVELS.map((lv) => {
                                        const active = pick?.kind === kind && pick?.level === lv;
                                        return (
                                            <button
                                                key={`${kind}-${lv}`}
                                                type="button"
                                                onClick={() => selectPick(kind, lv)}
                                                className={[
                                                    "h-7 rounded-xl text-[11px] font-semibold",
                                                    "border border-white/10",
                                                    active ? "bg-white/15 text-white" : "bg-black/20 text-zinc-200/90 hover:bg-white/10",
                                                ].join(" ")}
                                            >
                                                {lv}
                                            </button>
                                        );
                                    })}
                                </div>

                                {(kind === "겁화" || kind === "작열") && (
                                    <div className="text-[10px] text-zinc-400 mt-1">(4티어: 공격력 증가 합산 대상)</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ---------------------- Empty State Search UI ---------------------- */
const NoCharacterView = ({
                             onSearch,
                             searching,
                             error,
                         }: {
    onSearch: (name: string) => void;
    searching: boolean;
    error: string | null;
}) => {
    const [name, setName] = useState("");

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6">
            <div className="w-full max-w-xl bg-[#121213] border border-white/5 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <ShieldAlert className="text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white">캐릭터 정보가 없습니다.</h2>
                        <p className="text-sm text-zinc-400 mt-1">시뮬레이터를 사용하려면 캐릭터를 먼저 검색해 주세요.</p>
                    </div>
                </div>

                <div className="mt-6 flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18}/>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="캐릭터 이름 입력"
                            className="w-full pl-10 pr-3 h-12 rounded-xl bg-zinc-950/40 border border-zinc-800 text-zinc-200 outline-none focus:border-indigo-500/40"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onSearch(name.trim());
                            }}
                        />
                    </div>

                    <button
                        onClick={() => onSearch(name.trim())}
                        disabled={searching || !name.trim()}
                        className="h-12 px-5 rounded-xl bg-indigo-600 text-white font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500 transition"
                    >
                        {searching ? "검색중..." : "검색"}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>
                )}
            </div>
        </div>
    );
};

/* ---------------------- 메인 컴포넌트 ---------------------- */
export const Simulator: React.FC<SimulatorProps> = ({character: propCharacter, activeTab, onEquipmentUpdate}) => {
    const location = useLocation();

    /** ✅ 우선순위: props > location.state.character > null */
    const initialCharacter = useMemo(() => {
        const stateChar = (location.state as any)?.character ?? null;
        return (propCharacter ?? stateChar) as CharacterInfoCompat | null;
    }, [location.state, propCharacter]);

    // ✅ 원본 캐릭터 (절대 직접 수정 X)
    const [character, setCharacter] = useState<CharacterInfoCompat | null>(
        initialCharacter
    );

    // ✅ 시뮬에서만 사용할 캐릭터 사본
    const [simCharacter, setSimCharacter] = useState<CharacterInfoCompat | null>(
        initialCharacter ? safeClone(initialCharacter) : null
    );

    // ✅ 아크패시브: 원본/시뮬 분리
    const [originalArkPassive, setOriginalArkPassive] = useState<any>(null);
    const [simArkPassive, setSimArkPassive] = useState<any>(null);

    const characterName = useMemo(() => {
        return character?.CharacterName ?? (character as any)?.name ?? "";
    }, [character]);

    // 상세 데이터들(원본)
    const [loading, setLoading] = useState(false);
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [arkGrid, setArkGrid] = useState<ArkCoreData | null>(null);
    const [gems, setGems] = useState<any>(null);
    const [engravings, setEngravings] = useState<any>(null);

    const [arkCoreHoverIdx, setArkCoreHoverIdx] = useState<any>(null);
    const [arkCoreHoverData, setArkCoreHoverData] = useState<any>(null);

    // 툴팁 상태 관리
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [hoveredData, setHoveredData] = useState<any>(null);

    const [accHoverIdx, setAccHoverIdx] = useState<number | null>(null);
    const [accHoverData, setAccHoverData] = useState<any>(null);

    const [jewlryHoverIdx, setJewlryHoverIdx] = useState<any>(null);
    const [jewlryHoverData, setJewlryHoverData] = useState<any>(null);

    const getItemsByType = (types: string[]) =>
        equipments.filter((item) => types.includes(item.Type));

    // Simulator 컴포넌트 내부 상단에 추가
    const TABS = ["진화", "깨달음", "도약"] as const;
    type TabType = (typeof TABS)[number];

    const [activeArkTab, setActiveArkTab] = useState<TabType>("깨달음");
    const [[page, direction], setPage] = useState([0, 0]);
    const [hoverInfo, setHoverInfo] = useState<{
        effect: any;
        rect: DOMRect | null;
    } | null>(null);

    const [engrHoverIdx, setEngrHoverIdx] = useState<number | null>(null);
    const [engrHoverName, setEngrHoverName] = useState<string | null>(null);
    const [engrHoverDesc, setEngrHoverDesc] = useState<string>("");

    // ✅ 보석 선택 상태 (슬롯 0~10, 총 11개)
    const [gemPicks, setGemPicks] = useState<Record<number, GemPick | null>>(
        () => {
            const init: Record<number, GemPick | null> = {};
            for (let i = 0; i <= 10; i++) init[i] = null;
            return init;
        }
    );

    const setPickAt = (i: number, p: GemPick | null) =>
        setGemPicks((prev) => ({ ...prev, [i]: p }));

// ✅ 총 공격력% 합산 (pick 우선, 없으면 초기 장착 보석에서도 계산)
// - 대상: 겁화 / 작열 / 광휘
    const totalGemAtkBonus = useMemo(() => {
        let sum = 0;

        for (let idx = 0; idx <= 10; idx++) {
            const pick = gemPicks[idx];

            // 1) 사용자가 드롭다운으로 선택한 경우 → 그걸 우선
            if (pick) {
                if (pick.kind === "겁화" || pick.kind === "작열" || pick.kind === "광휘") {
                    sum += T4_ATK_BONUS_BY_LEVEL[pick.level] ?? 0;
                }
                continue;
            }

            // 2) pick이 없으면 → 현재 장착된 보석(gems?.Gems[idx])에서 추론해서 계산
            const equipped = gems?.Gems?.[idx];
            if (!equipped) continue;

            const kind = inferGemKindFromEquippedGem(equipped);
            const level = Number(equipped?.Level);

            if (!Number.isFinite(level) || level <= 0) continue;

            if (kind === "겁화" || kind === "작열" || kind === "광휘") {
                sum += T4_ATK_BONUS_BY_LEVEL[level] ?? 0;
            }
        }

        return sum;
    }, [gemPicks, gems]);


    const formatPct = (n: number) => `${n.toFixed(2)}%`;

    // Simulator 컴포넌트 내부 상단에 추가
    const [arkData, setArkData] = useState<any>(null);

    // 데이터가 로드되면 시뮬레이션 상태에 복사
    useEffect(() => {
        if (originalArkPassive) {
            setArkData(JSON.parse(JSON.stringify(originalArkPassive)));
        }
    }, [originalArkPassive]);

    const updateLevel = (nodeName: string, delta: number, maxLv: number) => {
        if (!arkData) return;

        setArkData((prev: any) => {
            const next = JSON.parse(JSON.stringify(prev));
            let effectIndex = next.Effects.findIndex(
                (e: any) =>
                    e.Name.includes(activeArkTab) &&
                    e.Description.replace(/\s+/g, "").includes(
                        nodeName.replace(/\s+/g, "")
                    )
            );

            if (effectIndex === -1 && delta > 0) {
                next.Effects.push({
                    Name: `[아크 패시브] ${activeArkTab} 티어`,
                    Description: `${nodeName} Lv.0`,
                });
                effectIndex = next.Effects.length - 1;
            }

            if (effectIndex !== -1) {
                const currentLvMatch =
                    next.Effects[effectIndex].Description.match(/Lv\.(\d+)/);
                let currentLv = currentLvMatch ? parseInt(currentLvMatch[1]) : 0;
                const nextLv = Math.min(Math.max(currentLv + delta, 0), maxLv);

                next.Effects[effectIndex].Description =
                    next.Effects[effectIndex].Description.replace(
                        /Lv\.\d+/,
                        `Lv.${nextLv}`
                    );
            }
            return next;
        });
    };

    const engravingDescToHtml = (desc: string) => {
        if (!desc) return "";

        let html = desc
            .replace(
                /<FONT\s+COLOR=['"](#?[0-9a-fA-F]{6})['"]>/g,
                `<span style="color:$1">`
            )
            .replace(/<\/FONT>/g, `</span>`);

        html = html.replace(/\n/g, "<br />");
        return html;
    };

    // ✅ [추가] 젬 효과(추가피해/보스피해/공격력) 레벨을 사용자 입력으로만 변경 가능하게
    type EditableGemEffectKey = "atk" | "add" | "boss";
    const GEM_EFFECT_RATE: Record<EditableGemEffectKey, number> = {
        atk: 0.04,
        add: 0.08,
        boss: 0.08,
    };

    const clampLv = (n: number) => {
        if (!Number.isFinite(n)) return 0;
        return Math.min(120, Math.max(0, Math.floor(n)));
    };

    const isAtkEffect = (name: string) => {
        const n = (name || "").replace(/\s+/g, "");
        // "공격력"만 타겟 (무기 공격력 같은 다른 문구는 제외하고 싶으면 아래 조건 유지)
        return n.includes("공격력") && !n.includes("무기공격력");
    };
    const isAddEffect = (name: string) => {
        const n = (name || "").replace(/\s+/g, "");
        return n.includes("추가피해") || n.includes("추가피해") || n.includes("추가피해량") || n.includes("추가피해");
    };
    const isBossEffect = (name: string) => {
        const n = (name || "").replace(/\s+/g, "");
        // "보스 등급 이상 몬스터에게 주는 피해" 계열
        return n.includes("보스") && (n.includes("피해") || n.includes("몬스터에게주는피해") || n.includes("등급이상"));
    };

    const getEditableKey = (effectName: string): EditableGemEffectKey | null => {
        if (isAtkEffect(effectName)) return "atk";
        if (isAddEffect(effectName)) return "add";
        if (isBossEffect(effectName)) return "boss";
        return null;
    };

    // ✅ 편집 가능한 3종 레벨 상태
    const [gemEffectLv, setGemEffectLv] = useState<Record<EditableGemEffectKey, number>>({
        atk: 0,
        add: 0,
        boss: 0,
    });

    // ✅ arkGrid 로딩/변경 시: 서버에서 내려오는 레벨을 초기값으로 세팅(있으면)
    useEffect(() => {
        const effects = arkGrid?.Effects ?? [];
        if (!effects.length) return;

        const next = { ...gemEffectLv };

        for (const e of effects) {
            const key = getEditableKey(e?.Name || "");
            if (!key) continue;

            const lv = clampLv(Number((e as any)?.Level ?? 0));
            next[key] = lv;
        }

        // 실제로 값이 달라졌을 때만 set
        if (next.atk !== gemEffectLv.atk || next.add !== gemEffectLv.add || next.boss !== gemEffectLv.boss) {
            setGemEffectLv(next);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arkGrid]);

    const gemEffectValuePct = (key: EditableGemEffectKey, lv: number) => {
        const pct = clampLv(lv) * (GEM_EFFECT_RATE[key] ?? 0);
        return `${pct.toFixed(2)}%`;
    };

    const parseEffectTooltipLine = (rawTooltip: string) => {
        const text = String(rawTooltip || "")
            .replace(/<[^>]*>?/gm, "")
            .replace(/\s*\+\s*$/, "");
        const splitPos = text.lastIndexOf(" +");
        if (splitPos === -1) return { desc: text, val: "" };
        const desc = text.substring(0, splitPos);
        const val = text.substring(splitPos + 1);
        return { desc, val };
    };

    const handleGemEffectLvChange = (key: EditableGemEffectKey, nextRaw: string) => {
        // 빈칸 허용: 입력 중일 땐 0으로 보이게
        const n = nextRaw === "" ? 0 : clampLv(Number(nextRaw));
        setGemEffectLv((prev) => ({ ...prev, [key]: n }));
    };

    const handleLvKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
    };


    // 2. 데이터 로딩
    useEffect(() => {
        if (!characterName) return;

        setLoading(true);
        Promise.all([
            fetch(`/equipment?name=${encodeURIComponent(characterName)}`).then((r) => r.json()),
            fetch(`/arkgrid?name=${encodeURIComponent(characterName)}`).then((r) => r.json()),
            fetch(`/gems?name=${encodeURIComponent(characterName)}`).then((r) => r.json()),
            fetch(`/engravings?name=${encodeURIComponent(characterName)}`).then((r) => r.json()),
            fetch(`/arkpassive?name=${encodeURIComponent(characterName)}`).then((r) => r.json()),
        ])
            .then(([eqData, arkData2, gemData, engData, passiveData]) => {
                setEquipments(Array.isArray(eqData) ? eqData : []);
                setArkGrid(arkData2 ?? null);
                setGems(gemData ?? null);
                setEngravings(engData ?? null);

                setOriginalArkPassive(passiveData ?? null);
                setSimArkPassive(passiveData ? safeClone(passiveData) : null);
            })
            .catch((err) => {
                console.error("데이터 로딩 실패:", err);
                setEquipments([]);
                setArkGrid(null);
                setGems(null);
                setEngravings(null);
                setOriginalArkPassive(null);
                setSimArkPassive(null);
            })
            .finally(() => setLoading(false));
    }, [characterName]);

    // 3. 데이터 가공
    const leftEquipList = useMemo(() => {
        const weapon = equipments.filter((i) => i.Type === "무기");
        const armors = equipments.filter((i) =>
            ["투구", "상의", "하의", "장갑", "어깨"].includes(i.Type)
        );
        return [...weapon.slice(0, 1), ...armors];
    }, [equipments]);

    const accessories = useMemo(() => {
        return equipments.filter((i) =>
            ["목걸이", "귀걸이", "반지", "팔찌"].includes(i.Type)
        );
    }, [equipments]);

    const normalizeEngravingName = (name: string) => {
        return (name || "")
            .replace(/\[[^\]]*]/g, "")
            .replace(/\([^)]*\)/g, "")
            .replace(/\s+/g, " ")
            .trim();
    };

    const getEngravingIconUrl = (name: string) => {
        const key = normalizeEngravingName(name);
        return (engravingIconMap as Record<string, string>)[key] || "";
    };

    /** 🔹 악세사리 부위별/연마단계별 최대 스탯 */
    const MAX_STATS: Record<string, number[]> = {
        "반지":   [11091, 11349, 11865, 12897],
        "귀걸이": [11944, 12222, 12778, 13889],
        "목걸이": [15357, 15714, 16428, 17857]
    };

    /** 🔹 효과 이름 축약 맵 */
    /** 🔹 악세사리 부위별 효과 이름 축약 맵 */
    const SHORT_NAMES: Record<string, Record<string, string>> = {
        // 모든 악세사리 공통 옵션
        common: {
            "무기공격력_FIXED": "무공(고정)",
            "공격력_FIXED": "공격력(고정)",
            "최대 생명력": "최생",
            "최대 마나": "최마",
            "상태이상 공격 지속시간": "상태이상",
            "전투 중 생명력 회복량": "전투회복"
        },

        // 목걸이 전용
        necklace: {
            "추가 피해": "추피",
            "적에게 주는 피해": "적주피",
            "낙인력": "낙인력",
            "세레나데, 신앙, 조화 게이지 획득량": "서포터 아덴 획득"
        },

        // 귀걸이 전용
        earring: {
            "무기공격력_PCT": "무공(%)",
            "공격력_PCT": "공격력(%)",
            "파티원 회복 효과": "파티회복",
            "파티원 보호막 효과": "파티보호"
        },

        // 반지 전용
        ring: {
            "치명타 적중률": "치적",
            "치명타 피해": "치피",
            "아군 공격력 강화 효과": "아공강",
            "아군 피해량 강화 효과": "아피강"
        }
    };

    /** 🔹 효과 수치별 등급 판정 기준 */
    type Thresholds = { 상: number; 중: number; 하: number };

    const ACC_THRESHOLDS: Record<string, Record<string, Thresholds>> = {
        // 1. 모든 악세사리 공통 옵션
        common: {
            "무기공격력_FIXED": { 상: 960, 중: 480, 하: 195 },
            "공격력_FIXED": { 상: 390, 중: 195, 하: 80 },
            "최대 생명력": { 상: 6500, 중: 3250, 하: 1300 },
            "최대 마나": { 상: 30, 중: 15, 하: 6 },
            "상태이상 공격 지속시간": { 상: 1.0, 중: 0.5, 하: 0.2 },
            "전투 중 생명력 회복량": { 상: 50, 중: 25, 하: 10 },
        },

        // 2. 목걸이 전용 옵션
        necklace: {
            "추가 피해": { 상: 2.6, 중: 1.6, 하: 0.7 },
            "적에게 주는 피해": { 상: 2.0, 중: 1.2, 하: 0.55 },
            "낙인력": { 상: 8.0, 중: 4.8, 하: 2.15 },
            "세레나데, 신앙, 조화 게이지 획득량": { 상: 6.0, 중: 3.6, 하: 1.6 },
        },

        // 3. 귀걸이 전용 옵션
        earring: {
            "무기공격력_PCT": { 상: 3.0, 중: 1.8, 하: 0.8 },
            "공격력_PCT": { 상: 1.55, 중: 0.95, 하: 0.4 },
            "파티원 회복 효과": { 상: 3.5, 중: 2.1, 하: 0.95 },
            "파티원 보호막 효과": { 상: 3.5, 중: 2.1, 하: 0.95 },
        },

        // 4. 반지 전용 옵션
        ring: {
            "치명타 적중률": { 상: 1.55, 중: 0.95, 하: 0.4 },
            "치명타 피해": { 상: 4.0, 중: 2.4, 하: 1.1 },
            "아군 공격력 강화 효과": { 상: 5.0, 중: 3.0, 하: 1.35 },
            "아군 피해량 강화 효과": { 상: 7.5, 중: 4.5, 하: 2.0 },
        },
    };

    const BRACELET_OPTIONS = {
        "추피(악마/대악마)": ["2.5%", "3%", "3.5%"],
        "치피(치명타 적중시 피증 1.5%)": ["6.8%", "8.4%", "10%"],
        "무공(생명)": ["6900", "7800", "8700"],
        "무공(스탯)": ["7200", "8100", "9000"],
        "적주피(재사용 대기시간 2% 증가)": ["4.5%", "5%", "5.5%"],
        "치적(치명타 적중시 피증 1.5%)": ["3.4%", "4.2%", "5%"],
        "치피": ["6.8%", "8.4%", "10%"],
        "무공": ["7200%", "8100%", "9000%"],
        "적중 시 무공(공이속 1%)": ["1160", "1320", "1480"],
        "비방향성 공격": ["2.5%", "3%", "3.5%"],
        "백어택 스킬": ["2.5%", "3%", "3.5%"],
        "헤드어택 스킬": ["2.5%", "3%", "3.5%"],
        "적주피": ["2%", "2.5%", "3%"],
        "추피": ["3%", "3.5%", "4%"],
        "치적": ["3.4%", "3.5%", "4%"],
        "힘민지": ["10000", "13000", "16000"],
        "공이속": ["4%", "5%", "6%"]
    };
    /** 🎨 [유틸리티] 등급별 색상 클래스 */
    const getGradeColor = (grade: string) => {
        const colors: Record<string, string> = {
            "상": "text-yellow-400 font-black",
            "중": "text-purple-400 font-bold",
            "하": "text-blue-400 font-medium"
        };
        return colors[grade] || "text-zinc-500 font-bold";
    };
    const handleGradeChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
        rawName: string,
        isPercent: boolean,
        inputRef: HTMLInputElement | null
    ) => {
        const grade = e.target.value as '상' | '중' | '하';
        if (!grade || !rawName || !inputRef) return;

        // 1. 적절한 데이터 키 매핑 (resolveTargetKey 로직 통합)
        let targetKey = rawName;
        if (rawName === "공격력") targetKey = isPercent ? "공격력_PCT" : "공격력_FIXED";
        if (rawName === "무기 공격력") targetKey = isPercent ? "무기공격력_PCT" : "무기공격력_FIXED";

        // 2. 모든 카테고리에서 해당 옵션의 임계값(상,중,하 객체) 찾기
        const criteria = getCriteria(targetKey);
        const newValue = criteria ? criteria[grade] : undefined;

        if (newValue !== undefined) {
            // 3. 값 입력 (고정값은 소수점 제외, 퍼센트는 2자리 유지)
            const displayValue = isPercent ? `+${newValue.toFixed(2)}%` : `+${newValue}`;
            inputRef.value = displayValue;

            // 4. 색상 및 스타일 실시간 업데이트
            const colorClass = getDynamicStatColor(rawName, displayValue);
            inputRef.className = `w-14 bg-transparent text-right text-[10px] font-bold outline-none border-b border-transparent focus:border-white/20 transition-all ${colorClass}`;

            console.log(`${targetKey} 등급 변경: ${grade} (${displayValue})`);
        }
    };

    /** 🔍 모든 카테고리(common, necklace 등)를 뒤져서 특정 옵션의 기준치를 반환 */
    const getCriteria = (targetKey: string): Thresholds | null => {
        for (const category in ACC_THRESHOLDS) {
            if (ACC_THRESHOLDS[category][targetKey]) {
                return ACC_THRESHOLDS[category][targetKey];
            }
        }
        return null;
    };

    /** 🏷️ UI용 이름을 데이터용 키로 변환 */
    const resolveTargetKey = (name: string, isPercent: boolean): string => {
        if (name === "공격력") return isPercent ? "공격력_PCT" : "공격력_FIXED";
        if (name === "무기 공격력") return isPercent ? "무기공격력_PCT" : "무기공격력_FIXED";
        return name;
    };

    /** 🔹 수치에 따른 동적 색상 반환 함수 */
    const getDynamicStatColor = (name: string, valueStr: string) => {
        if (valueStr === "-" || !valueStr) return "text-white/20";

        const num = parseFloat(String(valueStr).replace(/[^0-9.]/g, ""));
        const isPercent = String(valueStr).includes("%");
        const targetKey = resolveTargetKey(name, isPercent);

        // 부위별 카테고리 내부에서 실제 수치 기준(상, 중, 하)을 가져옴
        const criteria = getCriteria(targetKey);

        if (!criteria) return "text-zinc-500";

        // 수치 비교 (상/중/하)
        if (num >= criteria.상) return "text-yellow-400 font-black";
        if (num >= criteria.중) return "text-purple-400 font-bold";
        return "text-blue-400 font-medium";
    };

    const getAccessoryStats = (tooltip: any) => {
        // Object.values의 결과를 any[]로 단언하여 속성 접근 허용
        const elements = Object.values(tooltip) as any[];

        // 1. 기본 효과 찾기
        const baseElement = elements.find(el =>
            el?.type === 'ItemPartBox' && el?.value?.Element_000?.includes('기본 효과')
        );
        const baseText = baseElement?.value?.Element_001 || "";

        const statMatch = baseText.match(/(?:힘|민첩|지능)\s*\+(\d+)/);
        const currentStat = statMatch ? parseInt(statMatch[1]) : 0;

        // 2. 연마 효과 찾기
        const polishElement = elements.find(el =>
            el?.type === 'ItemPartBox' && el?.value?.Element_000?.includes('연마 효과')
        );
        const polishHtml = polishElement?.value?.Element_001 || "";
        const polishLevel = (polishHtml.match(/img src/g) || []).length;

        // 3. 연마 옵션 파싱
        const grindContent = cleanText(polishHtml);
        const effects = [...grindContent.matchAll(/([가-힣\s,]+?)\s*\+([\d.]+%?)/g)].map(m => ({
            name: m[1].trim(),
            value: m[2],
        }));
        // 등급 선택 시 실행될 함수 예시

        return { currentStat, polishLevel, effects };
    };
    // 4. 탭별 렌더링 함수 (CharacterCard 방식)
    const renderContent = () => {
        switch (activeTab) {
            case "info":
                return (
                    <div className="flex flex-col gap-6 p-4 text-zinc-300 min-h-screen max-w-[1200px] mx-auto">
                        <div className="flex-1 min-w-0 space-y-6">
                            {/* 왼쪽: 장비 섹션 */}
                            <section className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 items-stretch bg-[#121213] p-5 rounded-2xl border border-white/5">
                                {/* 왼쪽: 전투 장비 Section */}


                                <div className="w-full lg:w-[40%] flex flex-col shrink-0">
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-4">
                                        <div className="w-1.5 h-5 bg-blue-950 rounded-full" />
                                        <h1 className="text-base font-extrabold text-white tracking-tight uppercase">
                                            전투 장비
                                        </h1>
                                    </div>

                                    <div className="flex flex-col">
                                        {getItemsByType(["무기", "투구", "상의", "하의", "장갑", "어깨"])
                                            .sort((a, b) =>
                                                a.Type === "무기" ? 1 : b.Type === "무기" ? -1 : 0
                                            )
                                            .map((item, i) => {
                                                let tooltip;
                                                try {
                                                    tooltip = JSON.parse(item.Tooltip);
                                                } catch (e) {
                                                    return null;
                                                }

                                                const quality = tooltip?.Element_001?.value?.qualityValue ?? 0;
                                                const reinforceLevel = item.Name.match(/\+(\d+)/)?.[0] || "";

                                                // 1. 부위명 단순화 로직 (매핑 객체 활용)
                                                const TYPE_MAP: { [key: string]: string } = {
                                                    "무기": "무기",
                                                    "투구": "머리장식",
                                                    "상의": "상의",
                                                    "하의": "하의",
                                                    "장갑": "장갑",
                                                    "어깨": "견갑"
                                                };

                                                // item.Type 기반으로 찾되 없으면 이름에서 추출
                                                const partName = TYPE_MAP[item.Type] ||
                                                    ["무기", "투구", "상의", "하의", "장갑", "어깨"].find(p => item.Name.includes(p)) ||
                                                    "장비";

                                                const rawGrade = (item.Grade || "").trim();
                                                let currentGrade = "일반";
                                                if (rawGrade.includes("에스더")) currentGrade = "에스더";
                                                else if (rawGrade.includes("고대")) currentGrade = "고대";
                                                else if (rawGrade.includes("유물")) currentGrade = "유물";
                                                else if (rawGrade.includes("전설")) currentGrade = "전설";
                                                const theme = gradeStyles[currentGrade] || gradeStyles["일반"];

                                                const advMatch = cleanText(tooltip?.Element_005?.value || "").match(
                                                    /\[상급\s*재련\]\s*(\d+)단계/
                                                );
                                                const advancedReinforce = advMatch ? advMatch[1] : "0";

                                                const REINFORCE_OPTIONS = [
                                                    ...Array.from({ length: 20 }, (_, i) => ({ label: `4티어 +${25 - i}`, value: 25 - i, tier: 4 })),
                                                    ...Array.from({ length: 17 }, (_, i) => ({ label: `일리아칸 +${25 - i}`, value: 25 - i, tier: 3 })),
                                                    ...Array.from({ length: 17 }, (_, i) => ({ label: `아브 +${25 - i}`, value: 25 - i, tier: 2 })),
                                                ].filter((opt) => opt.value >= 9 || (opt.tier === 4 && opt.value >= 6));

                                                return (
                                                    <EquipmentItem
                                                        key={item.Name}
                                                        item={item}
                                                        i={i}
                                                        theme={theme}
                                                        tooltip={tooltip}
                                                        quality={quality}
                                                        reinforceLevel={reinforceLevel}
                                                        advancedReinforce={advancedReinforce}
                                                        /* 2. itemName 대신 단순화된 partName 전달 */
                                                        itemName={partName}
                                                        REINFORCE_OPTIONS={REINFORCE_OPTIONS}
                                                        setHoveredIndex={setHoveredIndex}
                                                        setHoveredData={setHoveredData}
                                                        onUpdate={onEquipmentUpdate}
                                                    />
                                                );
                                            })}
                                    </div>
                                </div>


                                {/* [오른쪽: 액세서리 Section] */}






                                {/* [오른쪽: 액세서리 Section] */}
                                <div className="w-full lg:flex-1 flex flex-col min-w-0">
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-4">
                                        <div className="w-1.5 h-5 bg-blue-950 rounded-full" />
                                        <h1 className="text-base font-extrabold text-white tracking-tight uppercase">
                                            악세사리
                                        </h1>
                                    </div>

                                    <div className="flex flex-col">
                                        {getItemsByType(["목걸이", "귀걸이", "반지", "팔찌"])
                                            .filter((item) => {
                                                try {
                                                    const tooltip = JSON.parse(item.Tooltip);
                                                    if (item.Name?.includes('팔찌')) return true;
                                                    return tooltip.Element_001?.value?.qualityValue !== undefined;
                                                } catch (e) { return false; }
                                            })
                                            .map((item, i) => {
                                                const tooltip = JSON.parse(item.Tooltip);
                                                const itemName = item.Name || "아이템 이름";
                                                const isBracelet = itemName.includes('팔찌');
                                                const quality = tooltip.Element_001?.value?.qualityValue ?? 0;

                                                const { currentStat, polishLevel, effects: normalEffects } = getAccessoryStats(tooltip);

                                                // 팔찌 기본 스탯 추출
                                                let braceletStats: any[] = [];
                                                if (isBracelet) {
                                                    const rawContent = cleanText(tooltip.Element_005?.value?.Element_001 || "");
                                                    braceletStats = [...rawContent.matchAll(/([가-힣\s]+?)\s*\+([\d.]+%?)/g)]
                                                        .map(m => ({ name: m[1].trim(), value: m[2] }))
                                                        .filter(e => ["특화", "치명", "신속", "힘", "민첩", "지능", "체력"].includes(e.name));
                                                }

                                                const partName = ["목걸이", "귀걸이", "반지", "팔찌"].find(p => itemName.includes(p)) || "장신구";
                                                const rawGrade = (item.Grade || "").trim();
                                                const gradeKey = ["고대", "유물", "전설", "영웅"].find(g => rawGrade.includes(g)) || "일반";
                                                const theme = gradeStyles[gradeKey] || gradeStyles["일반"];

                                                return (
                                                    <div key={i} className="relative group flex flex-nowrap items-center gap-2 lg:gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors h-[62px] cursor-help min-w-0">
                                                        {/* 아이콘 및 품질 */}
                                                        <div className="relative shrink-0">
                                                            <div className={`p-0.5 rounded-lg border shadow-lg bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow || ""}`}>
                                                                <img src={item.Icon} className="w-10 h-10 rounded-md object-cover bg-black/20" alt="" />
                                                            </div>
                                                            {!isBracelet && (
                                                                <div className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(quality)} bg-zinc-900 ${theme.text}`}>
                                                                    {quality}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* [메인 정보 영역] */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`font-bold text-[12px] tracking-tight ${theme.text}`}>
                                                                {partName}
                                                            </h3>

                                                            {!isBracelet ? (
                                                                <div className="flex flex-col gap-1 mt-1 whitespace-nowrap group/row relative">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-[11px] text-[#FFD200] font-bold opacity-90">힘민지</span>
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="number"
                                                                                className="bg-transparent text-[11px] text-white font-bold w-7 outline-none text-right"
                                                                                defaultValue={((currentStat / (MAX_STATS[partName]?.[polishLevel] || 1)) * 100).toFixed(1)}
                                                                            />
                                                                            <span className="text-[9px] text-white/40 ml-0.5">%</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-[85px] h-1 bg-white/10 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-[#FFD200]/70" style={{ width: `${(currentStat / (MAX_STATS[partName]?.[polishLevel] || 1)) * 100}%` }} />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                                                    {[0, 1, 2, 3].map((idx) => {
                                                                        const isDataColumn = idx % 2 === 0;
                                                                        const dataIdx = idx / 2;
                                                                        const name = isDataColumn ? (braceletStats[dataIdx]?.name || "선택") : "선택";
                                                                        const value = isDataColumn ? (braceletStats[dataIdx]?.value || "0") : "0";
                                                                        return (
                                                                            <div key={idx} className="flex items-center h-4 gap-0.5">
                                                                                <select className="bg-white text-[10px] text-black font-bold outline-none h-full cursor-pointer rounded" defaultValue={name}>
                                                                                    {["선택", "특화", "치명", "신속", "힘", "민첩", "지능", "체력"].map(s => (
                                                                                        <option key={s} value={s}>{s}</option>
                                                                                    ))}
                                                                                </select>
                                                                                <input type="text" className="bg-white text-[10px] text-black font-bold w-8 outline-none h-full border-b border-white/5 rounded" defaultValue={value} />
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* [추가 효과 영역] */}
                                                        <div className="w-[180px] flex flex-col gap-0.5 border-l border-white/5 pl-2 shrink-0">
                                                            {isBracelet ? (
                                                                [0, 1, 2].map((idx) => {
                                                                    const bracDisplayId = `brac-stat-display-${i}-${idx}`;
                                                                    const handleBracChange = (rowElem: HTMLElement) => {
                                                                        const mainSelect = rowElem.querySelector('.main-select') as HTMLSelectElement;
                                                                        const gradeSelect = rowElem.querySelector('.grade-select') as HTMLSelectElement;
                                                                        const displaySpan = document.getElementById(bracDisplayId);
                                                                        if (!mainSelect || !gradeSelect || !displaySpan) return;
                                                                        const effectData = BRACELET_OPTIONS[mainSelect.value];
                                                                        const grade = gradeSelect.value;
                                                                        if (effectData) {
                                                                            const gradeIdx = grade === "상" ? 2 : grade === "중" ? 1 : 0;
                                                                            displaySpan.innerText = effectData[gradeIdx];
                                                                            displaySpan.className = `w-12 text-right text-[10px] ${getGradeColor(grade)}`;
                                                                        } else {
                                                                            displaySpan.innerText = "-";
                                                                            displaySpan.className = "w-12 text-right text-[10px] text-zinc-500 font-medium";
                                                                        }
                                                                    };
                                                                    return (
                                                                        <div key={idx} className="flex items-center justify-between gap-1 group/row h-3 mb-1">
                                                                            <select className="main-select bg-zinc-100 text-[10px] text-black font-bold rounded px-0.5 outline-none w-20 truncate h-full py-0" onChange={(e) => handleBracChange(e.target.closest('.group\\/row')!)}>
                                                                                <option value="">부여 효과</option>
                                                                                {Object.keys(BRACELET_OPTIONS).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                                            </select>
                                                                            <div className="flex items-center gap-1 h-full">
                                                                                <select className="grade-select bg-white text-[9px] text-black font-bold rounded border border-zinc-200 outline-none h-full py-0" defaultValue="중" onChange={(e) => handleBracChange(e.target.closest('.group\\/row')!)}>
                                                                                    <option value="상">상</option><option value="중">중</option><option value="하">하</option>
                                                                                </select>
                                                                                <span id={bracDisplayId} className="w-12 text-right text-[10px] font-medium text-zinc-500">-</span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : (
                                                                [0, 1, 2].map((idx) => {
                                                                    const effect = normalEffects[idx];
                                                                    const accDisplayId = `acc-eff-display-${i}-${idx}`;
                                                                    const accType = partName === "목걸이" ? 'necklace' : (partName === "귀걸이" ? 'earring' : 'ring');
                                                                    const availableOptions = { ...SHORT_NAMES.common, ...SHORT_NAMES[accType] };

                                                                    // 💡 수정된 역추적 로직: 데이터 이름에서 공백을 제거하고 정확한 Key 매칭
                                                                    const getInitialSelectValue = () => {
                                                                        if (!effect) return "";
                                                                        const isPct = String(effect.value).includes("%");
                                                                        const cleanName = effect.name.replace(/\s/g, ""); // "무기 공격력" -> "무기공격력"

                                                                        let searchKey = cleanName;
                                                                        if (searchKey === "공격력") searchKey = isPct ? "공격력_PCT" : "공격력_FIXED";
                                                                        if (searchKey === "무기공격력") searchKey = isPct ? "무기공격력_PCT" : "무기공격력_FIXED";

                                                                        // "세레나데, 신앙, 조화 게이지 획득량" 같은 긴 이름 처리
                                                                        if (!availableOptions[searchKey]) {
                                                                            searchKey = Object.keys(availableOptions).find(k => k.replace(/\s/g, "").includes(cleanName)) || "";
                                                                        }

                                                                        return availableOptions[searchKey] ? searchKey : "";
                                                                    };

                                                                    const getInitialGrade = (matchedKey: string) => {
                                                                        if (!effect || !matchedKey) return "";
                                                                        const num = parseFloat(effect.value.replace(/[^0-9.]/g, ""));
                                                                        const criteria = ACC_THRESHOLDS[accType]?.[matchedKey] || ACC_THRESHOLDS.common[matchedKey];
                                                                        if (!criteria) return "";
                                                                        if (num >= criteria.상) return "상";
                                                                        if (num >= criteria.중) return "중";
                                                                        return "하";
                                                                    };

                                                                    const initialValue = getInitialSelectValue();
                                                                    const initialGrade = getInitialGrade(initialValue);

                                                                    const refreshAccValue = (rowElem: HTMLElement) => {
                                                                        const effectSelect = rowElem.querySelector('.effect-select') as HTMLSelectElement;
                                                                        const gradeSelect = rowElem.querySelector('.grade-select') as HTMLSelectElement;
                                                                        const displaySpan = document.getElementById(accDisplayId);
                                                                        if (!effectSelect || !gradeSelect || !displaySpan) return;

                                                                        const thresholdKey = effectSelect.value;
                                                                        const selectedGrade = gradeSelect.value as '상' | '중' | '하';
                                                                        const criteria = ACC_THRESHOLDS[accType]?.[thresholdKey] || ACC_THRESHOLDS.common[thresholdKey];
                                                                        if (criteria && selectedGrade) {
                                                                            const val = criteria[selectedGrade];
                                                                            const isPercent = thresholdKey.includes("_PCT") ||
                                                                                !["무기공격력_FIXED", "공격력_FIXED", "최대 생명력", "최대 마나", "전투 중 생명력 회복량"].includes(thresholdKey);
                                                                            displaySpan.innerText = isPercent ? `${val.toFixed(2)}%` : val.toLocaleString();
                                                                            displaySpan.className = `w-10 text-right text-[10px] ${getGradeColor(selectedGrade)}`;
                                                                        } else {
                                                                            displaySpan.innerText = "-";
                                                                            displaySpan.className = "w-10 text-right text-[10px] text-zinc-500 font-bold";
                                                                        }
                                                                    };

                                                                    return (
                                                                        <div key={idx} className="flex items-center justify-between gap-1 group/row h-3 mb-1">
                                                                            <select
                                                                                className="effect-select bg-zinc-100 text-[10px] text-black font-bold rounded px-0.5 outline-none w-24 truncate cursor-pointer h-full py-0"
                                                                                defaultValue={initialValue}
                                                                                onChange={(e) => refreshAccValue(e.target.closest('.group\\/row')!)}
                                                                            >
                                                                                <option value="">효과 선택</option>
                                                                                {Object.keys(availableOptions).map((fullName) => (
                                                                                    <option key={fullName} value={fullName}>
                                                                                        {fullName.replace("_FIXED", "").replace("_PCT", "")}
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <div className="flex items-center gap-1 h-full">
                                                                                <select
                                                                                    className="grade-select bg-white text-[9px] text-black font-bold rounded border border-zinc-200 outline-none h-full py-0"
                                                                                    defaultValue={initialGrade}
                                                                                    onChange={(e) => refreshAccValue(e.target.closest('.group\\/row')!)}
                                                                                >
                                                                                    <option value="">등급</option>
                                                                                    <option value="상">상</option>
                                                                                    <option value="중">중</option>
                                                                                    <option value="하">하</option>
                                                                                </select>
                                                                                <span id={accDisplayId} className={`w-10 text-right text-[10px] leading-none ${getGradeColor(initialGrade)}`}>
                                                    {effect?.value || "-"}
                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>



                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                                {/* [좌측 박스] 아크 그리드 섹션 */}
                                <section className="bg-[#121213] pt-5 pb-2 px-5 rounded-2xl border border-white/5 shadow-2xl flex flex-col h-fit">
                                    {/* 타이틀 영역 */}
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-1">
                                        <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                                        <h1 className="text-[15px] font-extrabold text-white tracking-tight uppercase">
                                            아크 그리드
                                        </h1>
                                    </div>

                                    {/* 6행 1열 레이아웃 */}
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

                                            // 모달 열기/닫기 핸들러
                                            const handleRowClick = (e: React.MouseEvent) => {
                                                // select 박스를 클릭했을 때는 모달이 열리지 않도록 방어 코드 추가 가능
                                                if ((e.target as HTMLElement).closest('select')) return;

                                                if (arkCoreHoverIdx === i) {
                                                    setArkCoreHoverIdx(null);
                                                    setArkCoreHoverData(null);
                                                } else {
                                                    setArkCoreHoverIdx(i);
                                                    const parsedTooltip = typeof slot.Tooltip === 'string' ? JSON.parse(slot.Tooltip) : slot.Tooltip;
                                                    setArkCoreHoverData({ core: parsedTooltip, gems: slot.Gems });
                                                }
                                            };
                                            return (
                                                <div
                                                    key={i}
                                                    // 1. 전체 열에 클릭 이벤트 등록 및 커서 변경
                                                    onClick={handleRowClick}
                                                    className={`relative group flex items-center gap-3 rounded-xl transition-all h-[62px] px-2 pl-0 cursor-pointer
                ${arkCoreHoverIdx === i ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'}`}
                                                >
                                                    {/* 아이콘 영역: 이제 부모가 클릭을 담당하므로 onClick 제거 */}
                                                    <div className="relative shrink-0">
                                                        <div className={`w-12 h-12 rounded-xl p-[2px] transition-all flex items-center justify-center
                    bg-gradient-to-br ${theme.bg} overflow-hidden
                    border ${arkCoreHoverIdx === i ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'border-[#e9d2a6]/10'} 
                    shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] active:scale-95`}
                                                        >
                                                            <img src={slot.Icon} className="w-full h-full object-contain filter drop-shadow-md" alt="" />
                                                            {slot.Gems?.length > 0 && (
                                                                <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-black/60 flex items-center justify-center shadow-md ${theme.accent}`}>
                                                                    <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_2px_#fff]"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* 2. 모달 위치: 열(Row) 전체를 기준으로 아이콘 옆에 고정 */}
                                                    {/* 2. 모달 위치: 행(Row) 전체의 오른쪽 끝(left-full)에 고정 */}
                                                    {arkCoreHoverIdx === i && arkCoreHoverData && (
                                                        <div
                                                            className="absolute left-full ml-4 top-0 z-[100] pointer-events-auto"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {/* 애니메이션: 오른쪽에서 나타나는 효과 */}
                                                            <div className="animate-in fade-in slide-in-from-left-4 duration-200">
                                                                <ArkCoreTooltip
                                                                    data={arkCoreHoverData.core}
                                                                    Gems={arkCoreHoverData.gems}
                                                                    currentPoint={slot.Point}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 텍스트 정보 */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-[10.5px] font-bold leading-tight opacity-80 ${theme.text}`}>
                                                            {category}
                                                        </div>
                                                        <div className={`text-[13px] font-extrabold mt-0.5 truncate ${theme.text}`}>
                                                            {subName}
                                                        </div>
                                                    </div>

                                                    {/* 포인트 정보 (Select) */}
                                                    <div className="shrink-0 text-right group/point relative">
                                                        {/* select 클릭 시 부모의 rowClick이 발생하지 않도록 stopPropagation 적용 */}
                                                        <div className="flex items-center group/point" onClick={(e) => e.stopPropagation()}>
                                                            <div className="relative flex items-center">
                                                                <select
                                                                    className="bg-white/5 border border-white/10 rounded-md
                            text-[13px] font-black text-white/90
                            outline-none cursor-pointer appearance-none text-center
                            w-12 h-7
                            hover:bg-white/10 hover:border-[#FFD200]/50
                            focus:border-[#FFD200] focus:ring-1 focus:ring-[#FFD200]/30
                            transition-all duration-200
                            group-hover/point:text-[#FFD200]
                            [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                                                    value={slot.Point}
                                                                    onChange={(e) => {
                                                                        const newPoint = parseInt(e.target.value);
                                                                        const updatedSlots = [...arkGrid.Slots];
                                                                        updatedSlots[i] = { ...updatedSlots[i], Point: newPoint };
                                                                        setArkGrid({ ...arkGrid, Slots: updatedSlots });
                                                                    }}
                                                                >
                                                                    {Array.from({ length: 21 }, (_, idx) => 20 - idx).map((num) => (
                                                                        <option key={num} value={num} className="bg-[#1a1a1b] text-white">
                                                                            {num}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <div className="absolute right-1.5 pointer-events-none opacity-40 group-hover/point:opacity-100 group-hover/point:text-[#FFD200]">
                                                                    <svg className="w-2 h-2 fill-current" viewBox="0 0 20 20">
                                                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>


                                {/* [우측 박스] 젬 효과 섹션 */}
                                <section className="bg-[#121213] p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col h-full">
                                    {/* 타이틀 영역 */}
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-4">
                                        <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                                        <h1 className="text-[15px] font-extrabold text-white tracking-tight uppercase">
                                            젬 효과
                                        </h1>
                                    </div>

                                    {/* ✅ 젬 효과 리스트 */}
                                    <div className="flex flex-col gap-4">
                                        {arkGrid?.Effects?.map((effect, i) => {
                                            const { desc, val } = parseEffectTooltipLine(effect.Tooltip);
                                            const editableKey = getEditableKey(effect.Name || "");
                                            const isEditable = Boolean(editableKey);
                                            const cleanText = effect.Tooltip
                                                .replace(/<[^>]*>?/gm, '')
                                                .replace(/\s*\+\s*$/, '');
                                            const shownLv = isEditable && editableKey ? gemEffectLv[editableKey] : effect.Level;
                                            const shownVal =
                                                isEditable && editableKey ? gemEffectValuePct(editableKey, gemEffectLv[editableKey]) : val;
                                            return (
                                                <div key={i} className="flex flex-col gap-1 px-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-zinc-100 font-bold text-[13px]">{effect.Name}</span>

                                                        {/* ✅ 여기: 추가피해/보스피해/공격력만 레벨 입력 가능 */}
                                                        {isEditable && editableKey ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-zinc-400 font-black tracking-widest uppercase">Lv.</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={120}
                                                                    value={gemEffectLv[editableKey]}
                                                                    onChange={(e) => handleGemEffectLvChange(editableKey, e.target.value)}
                                                                    onKeyDown={handleLvKeyDown}
                                                                    onWheel={(e) => {
                                                                        // 스크롤로 숫자 튀는거 방지(원하면 제거)
                                                                        (e.currentTarget as HTMLInputElement).blur();
                                                                    }}
                                                                    className="w-[68px] h-[22px] rounded-md bg-zinc-950/40 border border-zinc-700 text-zinc-200 text-[11px] font-black text-center outline-none focus:border-indigo-500/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                />
                                                                <span className="text-[10px] text-zinc-500 font-bold">/ 120</span>
                                                            </div>
                                                        ) : (
                                                            <span className="bg-zinc-800/50 px-2 py-0.5 rounded text-zinc-400 text-[10px] font-black tracking-widest uppercase">
                                                                Lv.{shownLv}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* ✅ 바로 아래 값: 레벨 변경 즉시 반영 */}
                                                    <div className="text-[12px] text-zinc-400 font-medium leading-relaxed">
                                                        {desc}{" "}
                                                        <span className="text-[#ffd200] font-bold ml-1">{shownVal}</span>
                                                    </div>

                                                    {/* (선택) 편집 대상이면, 어떤 규칙인지 작은 힌트 */}
                                                    {isEditable && editableKey && (
                                                        <div className="text-[10px] text-zinc-500 mt-0.5">
                                                            1레벨당{" "}
                                                            {editableKey === "atk"
                                                                ? `공격력 +${GEM_EFFECT_RATE.atk.toFixed(2)}%`
                                                                : editableKey === "add"
                                                                    ? `추가 피해 +${GEM_EFFECT_RATE.add.toFixed(2)}%`
                                                                    : `보스 피해 +${GEM_EFFECT_RATE.boss.toFixed(2)}%`}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>

                            {/* ===================== 2.5) 아크 패시브 보드 ===================== */}
                            <section className="mt-10 space-y-4">
                                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-white">
                                    <h2 className="text-xl font-bold">아크 패시브</h2>
                                </div>

                                <ArkPassiveBoard
                                    character={character}
                                    data={simArkPassive}
                                    onChangeData={setSimArkPassive}
                                    onReset={() => setSimArkPassive(originalArkPassive ? safeClone(originalArkPassive) : null)}
                                />
                            </section>

                            {/*보석*/}
                            <section className="mt-10 w-full flex flex-col items-center px-4 select-none">
                                <div className="w-full max-w-3xl flex items-center justify-between border-b border-zinc-800/50 pb-2 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                        <h1 className="text-base font-extrabold text-zinc-200 tracking-tight uppercase">보석</h1>
                                    </div>

                                    <div className="flex items-center gap-2.5 px-3 py-1.5 backdrop-blur-sm">
                                        <div className="ml-2 flex items-center gap-2 pl-2 border-l border-white/10">
                                            <div className="w-1 h-3 bg-rose-400 rounded-full" />
                                            <span className="text-[12px] text-[#efeff0] font-semibold leading-none">
                        기본 공격력 합: +{formatPct(totalGemAtkBonus)}
                      </span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="relative w-full max-w-2xl rounded-[40px] border border-white/5 flex items-center justify-center min-h-[280px] md:min-h-[280px] overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                                    style={{
                                        background: "radial-gradient(circle at center, #1a202c 0%, #0d1117 40%, #05070a 100%)",
                                    }}
                                >
                                    <div className="absolute inset-0 z-0 pointer-events-none rounded-[40px] overflow-hidden">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.15)_0%,_transparent_70%)] animate-pulse" />
                                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0%,_rgba(139,92,246,0.08)_15%,_transparent_30%,_rgba(56,189,248,0.08)_60%,_transparent_100%)]" />
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.4)_100%)]" />
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center gap-2 transform scale-[0.85] sm:scale-100 transition-all duration-500">
                                        <div className="flex items-center gap-12 md:gap-20 mb-1">
                                            <div className="flex gap-3">
                                                {[0, 1].map((idx) => (
                                                    <GemSlot
                                                        key={idx}
                                                        gem={gems?.Gems?.[idx]}
                                                        index={idx}
                                                        hoverIdx={jewlryHoverIdx}
                                                        hoverData={jewlryHoverData}
                                                        setHoverIdx={setJewlryHoverIdx}
                                                        setHoverData={setJewlryHoverData}
                                                        pick={gemPicks[idx]}
                                                        setPick={setPickAt}
                                                    />
                                                ))}
                                            </div>

                                            <div className="flex gap-3">
                                                {[2, 3].map((idx) => (
                                                    <GemSlot
                                                        key={idx}
                                                        gem={gems?.Gems?.[idx]}
                                                        index={idx}
                                                        hoverIdx={jewlryHoverIdx}
                                                        hoverData={jewlryHoverData}
                                                        setHoverIdx={setJewlryHoverIdx}
                                                        setHoverData={setJewlryHoverData}
                                                        pick={gemPicks[idx]}
                                                        setPick={setPickAt}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-4 md:gap-6 -mt-1 relative">
                                            <GemSlot
                                                gem={gems?.Gems?.[4]}
                                                index={4}
                                                hoverIdx={jewlryHoverIdx}
                                                hoverData={jewlryHoverData}
                                                setHoverIdx={setJewlryHoverIdx}
                                                setHoverData={setJewlryHoverData}
                                                pick={gemPicks[4]}
                                                setPick={setPickAt}
                                            />

                                            <div className="relative">
                                                <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full scale-150 animate-pulse" />
                                                <GemSlot
                                                    gem={gems?.Gems?.[5]}
                                                    index={5}
                                                    hoverIdx={jewlryHoverIdx}
                                                    hoverData={jewlryHoverData}
                                                    setHoverIdx={setJewlryHoverIdx}
                                                    setHoverData={setJewlryHoverData}
                                                    pick={gemPicks[5]}
                                                    setPick={setPickAt}
                                                    isCenter={true}
                                                />
                                            </div>

                                            <GemSlot
                                                gem={gems?.Gems?.[6]}
                                                index={6}
                                                hoverIdx={jewlryHoverIdx}
                                                hoverData={jewlryHoverData}
                                                setHoverIdx={setJewlryHoverIdx}
                                                setHoverData={setJewlryHoverData}
                                                pick={gemPicks[6]}
                                                setPick={setPickAt}
                                            />
                                        </div>

                                        <div className="flex items-center gap-12 md:gap-20 -mt-1">
                                            <div className="flex gap-3">
                                                {[7, 8].map((idx) => (
                                                    <GemSlot
                                                        key={idx}
                                                        gem={gems?.Gems?.[idx]}
                                                        index={idx}
                                                        hoverIdx={jewlryHoverIdx}
                                                        hoverData={jewlryHoverData}
                                                        setHoverIdx={setJewlryHoverIdx}
                                                        setHoverData={setJewlryHoverData}
                                                        pick={gemPicks[idx]}
                                                        setPick={setPickAt}
                                                    />
                                                ))}
                                            </div>

                                            <div className="flex gap-3">
                                                {[9, 10].map((idx) => (
                                                    <GemSlot
                                                        key={idx}
                                                        gem={gems?.Gems?.[idx]}
                                                        index={idx}
                                                        hoverIdx={jewlryHoverIdx}
                                                        hoverData={jewlryHoverData}
                                                        setHoverIdx={setJewlryHoverIdx}
                                                        setHoverData={setJewlryHoverData}
                                                        pick={gemPicks[idx]}
                                                        setPick={setPickAt}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/*각인*/}
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
                        </div>
                    </div>
                );

            case "synergy":
                return <SynergyBuffTab character={character} />;

            case "result":
                return <ResultTab character={character} />;

            default:
                return null;
        }
    };

    if (loading)
        return (
            <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500 w-8 h-8 mb-3" />
                <span className="text-zinc-500 text-sm font-bold">정보 동기화 중...</span>
            </div>
        );

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
