import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {ChevronRight, Diamond, Loader2, Search, ShieldAlert} from "lucide-react";
import { SynergyBuffTab } from "./SynergyBuffTab";
import { ResultTab } from "./Result";
import EquipmentTooltip from "@/components/profile/Tooltip/EquipmentTooltip.tsx";
import AccessoryTooltip from "@/components/profile/Tooltip/AccessoryTooltip.tsx";
import ArkCoreTooltip from "@/components/profile/Tooltip/ArkCoreTooltip.tsx";
import JewelryTooltip from "@/components/profile/Tooltip/JewelryTooltip.tsx";
import { ArkPassiveBoard } from "./ArkPassiveBoard.tsx";

import engravingIconMap from "@/components/profile/tabs/engravingsIdTable.json";
import { CharacterInfo } from "../../types.ts";

type CharacterInfoCompat = CharacterInfo & { CharacterName?: string };

type ArkPassiveEffect = {
    Name: string;
    Description?: string;
    Icon?: string;
    Level?: number;
    AbilityStoneLevel?: number;
    AbilityStoneIcon?: string;
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

const FALLBACK_ABILITY_STONE_ICON =
    "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/game/ico_ability_stone_symbol.png";

/* ---------------------- Interfaces (CombatTab에서 필요한 것만) ---------------------- */
interface Equipment {
    Type: string;
    Name: string;
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
    Effects: ArkEffect[];
}

/* ---------------------- Utils ---------------------- */
const cleanText = (text: any): string => {
    if (!text) return "";
    if (typeof text === "string") return text.replace(/<[^>]*>?/gm, "").trim();
    if (typeof text === "object" && typeof text.Text === "string") return cleanText(text.Text);
    return "";
};

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

const getQualityColor = (q: number) => {
    if (q === 100) return "text-[#FF8000] border-[#FF8000]";
    if (q >= 90) return "text-[#CE43FB] border-[#CE43FB]";
    if (q >= 70) return "text-[#00B0FA] border-[#00B0FA]";
    if (q >= 30) return "text-[#00D100] border-[#00D100]";
    return "text-[#FF4040] border-[#FF4040]";
};

function safeClone<T>(v: T): T {
    try {
        // @ts-ignore
        if (typeof structuredClone === "function") return structuredClone(v);
    } catch {}
    return JSON.parse(JSON.stringify(v));
}

/**
 * ✅ 재련(+n) / 상급재련(상재) 파싱
 * - 재련: 아이템 이름에 "+23 ..." 형태로 존재
 * - 상재: tooltip 내 "[상급 재련] 40단계" 같은 텍스트에서 추출
 */
function parseReinforceAndAdvanced(item: Equipment, tooltip: any) {
    const reinforce = item?.Name?.match(/\+(\d+)/)?.[1] || ""; // "23"
    const reinforceLabel = reinforce ? `+${reinforce}` : "";

    const advSrc =
        cleanText(tooltip?.Element_005?.value || "") +
        " " +
        cleanText(tooltip?.Element_006?.value || "") +
        " " +
        cleanText(tooltip?.Element_007?.value || "");

    const advMatch = advSrc.match(/\[상급\s*재련\]\s*(\d+)\s*단계/);
    const advanced = advMatch?.[1] || "0";

    return { reinforceLabel, advanced };
}

/* ---------------------- Gem Slot (보석 UI) ---------------------- */
const GemSlot = ({
                     gem,
                     index,
                     hoverIdx,
                     hoverData,
                     setHoverIdx,
                     setHoverData,
                     isCenter = false,
                 }: any) => {
    const sizeClasses = isCenter ? "w-22 h-22" : "w-[76px] h-[76px]";
    if (!gem) return <div className={`${sizeClasses} rounded-full bg-white/5 opacity-10`} />;

    let skillIcon = gem.Icon;
    let gemThemeColor = "#ffffff";

    try {
        if (gem.Tooltip) {
            const tooltip = JSON.parse(gem.Tooltip);
            skillIcon = tooltip.Element_001?.value?.slotData?.iconPath || gem.Icon;
            const gradeName = tooltip.Element_001?.value?.leftStr0 || gem.Grade || "";

            if (gradeName.includes("고대")) gemThemeColor = "#dcc999";
            else if (gradeName.includes("유물")) gemThemeColor = "#fa5d00";
            else if (gradeName.includes("전설")) gemThemeColor = "#f9ba2e";
        }
    } catch (e) {
        skillIcon = gem.Icon;
    }

    return (
        <div
            className="relative group flex flex-col items-center gap-2"
            onMouseLeave={() => {
                setHoverIdx(null);
                setHoverData(null);
            }}
        >
            <div
                className="flex flex-col items-center cursor-help"
                onMouseEnter={() => {
                    setHoverIdx(index);
                    setHoverData(gem);
                }}
            >
                <div
                    className={`${sizeClasses} rounded-full transition-all duration-300 group-hover:scale-110 flex items-center justify-center overflow-hidden border`}
                    style={{
                        background: `linear-gradient(180deg, ${gemThemeColor}15 0%, #07090c 100%)`,
                        borderColor: `${gemThemeColor}55`,
                        boxShadow: `
              inset 0 0 40px rgba(0,0,0,0.9),
              inset 0 0 100px rgba(0,0,0,0.8),
              0 0 15px ${gemThemeColor}33
            `,
                    }}
                >
                    <img
                        src={skillIcon}
                        alt=""
                        className="w-full h-full object-cover scale-110 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                    />
                </div>

                <span className="mt-1.5 text-zinc-400 text-[12px] font-bold tracking-tighter drop-shadow-md group-hover:text-white">
          Lv.{gem.Level}
        </span>
            </div>

            {hoverIdx === index && hoverData && (
                <div className="absolute left-full top-0 z-[9999] pl-4 -ml-2 h-full flex items-start">
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                        <JewelryTooltip gemData={hoverData} />
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
                        <p className="text-sm text-zinc-400 mt-1">
                            시뮬레이터를 사용하려면 캐릭터를 먼저 검색해 주세요.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
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
                    <div className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ---------------------- Main Simulator ---------------------- */
type SimTab = "info" | "synergy" | "result";

export const Simulator: React.FC<{ character?: CharacterInfoCompat  | null }> = ({ character: propCharacter }) => {
    const location = useLocation();

    /** ✅ 우선순위: props > location.state.character > null */
    const initialCharacter = useMemo(() => {
        const stateChar = (location.state as any)?.character ?? null;
        return (propCharacter ?? stateChar) as CharacterInfo | null;
    }, [location.state, propCharacter]);

    // ✅ 원본 캐릭터 (절대 직접 수정 X)
    const [character, setCharacter] = useState<CharacterInfoCompat  | null>(initialCharacter);

    // ✅ 시뮬에서만 사용할 캐릭터 사본
    const [simCharacter, setSimCharacter] = useState<CharacterInfoCompat  | null>(
        initialCharacter ? safeClone(initialCharacter) : null
    );

    // ✅ 네비 탭
    const [tab, setTab] = useState<SimTab>("info");

    // 검색/로딩
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // 상세 데이터들(원본)
    const [loading, setLoading] = useState(false);
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [arkGrid, setArkGrid] = useState<ArkCoreData | null>(null);
    const [gems, setGems] = useState<any>(null);
    const [engravings, setEngravings] = useState<any>(null);

    // ✅ 아크패시브: 원본/시뮬 분리
    const [originalArkPassive, setOriginalArkPassive] = useState<any>(null);
    const [simArkPassive, setSimArkPassive] = useState<any>(null);

    // Hover states (툴팁)
    const [leftHoverIdx, setLeftHoverIdx] = useState<number | null>(null);
    const [leftHoverData, setLeftHoverData] = useState<any>(null);

    const [accHoverIdx, setAccHoverIdx] = useState<number | null>(null);
    const [accHoverData, setAccHoverData] = useState<any>(null);

    const [arkCoreHoverIdx, setArkCoreHoverIdx] = useState<number | null>(null);
    const [arkCoreHoverData, setArkCoreHoverData] = useState<any>(null);

    const [jewHoverIdx, setJewHoverIdx] = useState<number | null>(null);
    const [jewHoverData, setJewHoverData] = useState<any>(null);
    const [engrHoverIdx, setEngrHoverIdx] = useState<number | null>(null);
    const [engrHoverName, setEngrHoverName] = useState<string | null>(null);
    const [engrHoverDesc, setEngrHoverDesc] = useState<string>("");

    const engravingDescToHtml = (desc: string) => {
        if (!desc) return "";
        let html = desc
            .replace(/<FONT\s+COLOR=['"](#?[0-9a-fA-F]{6})['"]>/g, `<span style="color:$1">`)
            .replace(/<\/FONT>/g, `</span>`);
        return html.replace(/\n/g, "<br />");
    };



    useEffect(() => {
        setCharacter(initialCharacter);
        setSimCharacter(initialCharacter ? safeClone(initialCharacter) : null);
    }, [initialCharacter]);

    const characterName = useMemo(() => {
        return character?.CharacterName ?? character?.name ?? "";
    }, [character]);

    /** ✅ 캐릭터 검색 -> /stat 로 캐릭터 기본정보 확보 */
    const handleSearch = async (name: string) => {
        if (!name) return;
        setSearching(true);
        setSearchError(null);

        try {
            const res = await fetch(`/stat?name=${encodeURIComponent(name)}`);
            if (!res.ok) throw new Error("캐릭터 정보를 불러올 수 없습니다.");
            const data = await res.json();

            setCharacter(data);
            setSimCharacter(safeClone(data));
            setTab("info");
        } catch (e: any) {
            setSearchError(e?.message ?? "검색 실패");
        } finally {
            setSearching(false);
        }
    };

    /** ✅ 상세 데이터 로딩 */
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
            .then(([eqData, arkData, gemData, engData, passiveData]) => {
                setEquipments(Array.isArray(eqData) ? eqData : []);
                setArkGrid(arkData ?? null);
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

    const getItemsByType = (types: string[]) => equipments.filter((i) => types.includes(i.Type));

    /** ✅ 좌측: 무기 + 방어구 + 팔찌 */
    const leftEquipList = useMemo(() => {
        const armorTypes = ["투구", "상의", "하의", "장갑", "어깨"];
        const weapon = getItemsByType(["무기"]);
        const armors = getItemsByType(armorTypes);
        const bracelet = getItemsByType(["팔찌"]);

        return [...weapon.slice(0, 1), ...armors, ...bracelet.slice(0, 1)];
    }, [equipments]);

    /** ✅ 악세사리 정렬 */
    const accessories = useMemo(() => {
        const list = getItemsByType(["목걸이", "귀걸이", "반지", "팔찌"]).filter((item) => {
            try {
                const tooltip = JSON.parse(item.Tooltip);
                return (tooltip.Element_001?.value?.qualityValue ?? 0) !== -1;
            } catch {
                return true;
            }
        });

        const necklace = list.filter((x) => x.Type === "목걸이");
        const earrings = list.filter((x) => x.Type === "귀걸이");
        const rings = list.filter((x) => x.Type === "반지");
        const bracelet = list.filter((x) => x.Type === "팔찌");

        return [...necklace, ...earrings.slice(0, 2), ...rings.slice(0, 2), ...bracelet.slice(0, 1)];
    }, [equipments]);

    // 캐릭터 없으면 빈 화면 + 검색창
    if (!characterName) {
        return <NoCharacterView onSearch={handleSearch} searching={searching} error={searchError} />;
    }

    // 상세 로딩
    if (loading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500 w-8 h-8 mb-3" />
                <span className="text-zinc-500 text-sm">정보를 불러오는 중...</span>
            </div>
        );
    }

    const goToProfilePage = () => {
        if (!characterName) return;
        window.location.href = `/profilePage?name=${encodeURIComponent(character.CharacterName)}`;
    };

    return (
        <div className="text-zinc-200 space-y-8">
            {/* ===================== ✅ 네비게이션 바 ===================== */}
            <div className="mb-8">
                <div className="w-full flex items-center justify-between bg-zinc-950/60 border border-white/5 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                        {(
                            [
                                { key: "info", label: "정보" },
                                { key: "synergy", label: "시너지 및 버프" },
                                { key: "result", label: "결과" },
                            ] as const
                        ).map((t) => {
                            const active = tab === t.key;
                            return (
                                <button
                                    key={t.key}
                                    onClick={() => setTab(t.key)}
                                    className={[
                                        "px-5 py-2 rounded-xl text-sm font-black transition",
                                        active
                                            ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                                            : "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]",
                                    ].join(" ")}
                                >
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToProfilePage}
                            className="px-4 py-2 rounded-xl bg-white/90 text-black font-black text-sm hover:bg-white transition shadow"
                        >
                            캐릭터 정보 페이지로 전환
                        </button>

                        {/* ✅ 새 버튼: 시뮬레이션 실행 */}
                        <button
                            onClick={() => setTab("result")}
                            className="px-4 py-2 rounded-xl font-black text-sm
               bg-emerald-300/90 text-emerald-950
               border border-emerald-200/60
               hover:bg-emerald-300
               shadow-[0_8px_20px_rgba(16,185,129,0.15)]
               transition"
                        >
                            시뮬레이션 실행
                        </button>
                    </div>
                </div>
            </div>

            {/* ===================== ✅ 탭별 컨텐츠 ===================== */}
            {tab === "info" && (
                <>
                    {/* ===================== 1) 상단 2열: (CombatTab 디자인 이식) ===================== */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        {/* 좌측(무기/방어구) + 우측(악세) 를 CombatTab처럼 한 섹션 안에서 40/60으로 */}
                        <section className="lg:col-span-6 w-full bg-[#121213] p-6 rounded-3xl border border-white/5 overflow-visible">
                            <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
                                {/* 왼쪽: 전투 장비 (40%) */}
                                <div className="w-full lg:w-[40%] flex flex-col">
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                                        <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                                        <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">전투 장비</h1>
                                    </div>

                                    <div className="flex flex-col gap-2 overflow-visible">
                                        {leftEquipList
                                            .filter((x) => x.Type !== "팔찌") // 좌측은 무기/방어구만
                                            .map((item, idx) => {
                                                let tooltip: any = null;
                                                try { tooltip = JSON.parse(item.Tooltip); } catch {}

                                                const quality = tooltip?.Element_001?.value?.qualityValue ?? 0;
                                                const { reinforceLabel, advanced } = parseReinforceAndAdvanced(item, tooltip);
                                                const itemName = cleanText(item.Name).replace(/\+\d+\s*/, "").trim();

                                                // ✅ 등급 테마 (CombatTab 방식)
                                                const rawGrade = (item.Grade || "").trim();
                                                let currentGrade = "일반";
                                                if (rawGrade.includes("에스더") || item.Name.includes("에스더")) currentGrade = "에스더";
                                                else if (rawGrade.includes("고대")) currentGrade = "고대";
                                                else if (rawGrade.includes("유물")) currentGrade = "유물";
                                                else if (rawGrade.includes("전설")) currentGrade = "전설";
                                                else if (rawGrade.includes("영웅")) currentGrade = "영웅";
                                                else if (rawGrade.includes("희귀")) currentGrade = "희귀";
                                                else if (rawGrade.includes("고급")) currentGrade = "고급";

                                                const theme = (gradeStyles as any)[currentGrade] || (gradeStyles as any)["일반"];

                                                return (
                                                    <div
                                                        key={`${item.Type}|${item.Icon}|${item.Name}`}
                                                        className="relative group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors h-[72px] cursor-help overflow-visible"
                                                        onMouseEnter={() => { setLeftHoverIdx(idx); setLeftHoverData(tooltip); }}
                                                        onMouseLeave={() => { setLeftHoverIdx(null); setLeftHoverData(null); }}
                                                    >
                                                        {/* 아이콘 */}
                                                        <div className="relative shrink-0 overflow-visible">
                                                            <div className={`p-0.5 rounded-lg border shadow-lg bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow || ""}`}>
                                                                <img src={item.Icon} className="w-12 h-12 rounded-md object-cover bg-black/20" alt={itemName} />
                                                                {(currentGrade === "고대" || currentGrade === "에스더") && (
                                                                    <div className="absolute inset-0 rounded-lg shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] pointer-events-none" />
                                                                )}
                                                            </div>

                                                            {typeof quality === "number" && quality > 0 && (
                                                                <div className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(quality)} bg-zinc-900 text-[#e9d2a6]`}>
                                                                    {quality}
                                                                </div>
                                                            )}

                                                            {/* 툴팁: 아이콘 오른쪽 밀착 + 브릿지 */}
                                                            {leftHoverIdx === idx && leftHoverData && (
                                                                <div
                                                                    className="absolute left-full top-0 z-[9999] pointer-events-auto flex items-start"
                                                                    style={{ paddingLeft: "12px", width: "max-content" }}
                                                                >
                                                                    <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                                                                        <EquipmentTooltip data={leftHoverData} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* 정보 */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`font-bold text-[14px] truncate mb-0.5 ${theme.text}`}>
                                                                {itemName}
                                                            </h3>
                                                            <div className="flex items-center gap-2">
                                                                {reinforceLabel && <span className="text-white/50 text-[12px]">재련 {reinforceLabel}</span>}
                                                                {advanced !== "0" && <span className="text-sky-400 text-[12px] font-bold">상재 +{advanced}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                        {!leftEquipList.length && (
                                            <div className="text-sm text-zinc-500">무기/방어구 정보가 없습니다.</div>
                                        )}
                                    </div>
                                </div>

                                {/* 오른쪽: 악세사리 (60%) */}
                                <div className="w-full lg:w-[60%] flex flex-col overflow-visible">
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                                        <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                                        <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">악세사리</h1>
                                    </div>

                                    <div className="flex flex-col gap-2 overflow-visible">
                                        {accessories.map((item, i) => {
                                            let tooltip: any = null;
                                            try { tooltip = JSON.parse(item.Tooltip); } catch {}
                                            const quality = tooltip?.Element_001?.value?.qualityValue ?? 0;

                                            const rawGrade = (item.Grade || "").trim();
                                            let currentGrade = "일반";
                                            if (rawGrade.includes("고대")) currentGrade = "고대";
                                            else if (rawGrade.includes("유물")) currentGrade = "유물";
                                            else if (rawGrade.includes("전설")) currentGrade = "전설";
                                            else if (rawGrade.includes("영웅")) currentGrade = "영웅";

                                            const theme = (gradeStyles as any)[currentGrade] || (gradeStyles as any)["일반"];

                                            const passive = cleanText(tooltip?.Element_007?.value?.Element_001 || "").match(/\d+/)?.[0] || "0";
                                            const tierStr = tooltip?.Element_001?.value?.leftStr2 || "";
                                            const tier = tierStr.replace(/[^0-9]/g, "").slice(-1) || "4";

                                            return (
                                                <div
                                                    key={`${item.Type}|${item.Icon}|${item.Name}`}
                                                    className="relative group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors h-[72px] cursor-help overflow-visible"
                                                    onMouseEnter={() => { setAccHoverIdx(i); setAccHoverData(tooltip); }}
                                                    onMouseLeave={() => { setAccHoverIdx(null); setAccHoverData(null); }}
                                                >
                                                    <div className="relative shrink-0 overflow-visible">
                                                        <div className={`p-0.5 rounded-lg border shadow-lg bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow || ""}`}>
                                                            <img src={item.Icon} className="w-12 h-12 rounded-md object-cover bg-black/20" alt="" />
                                                            {currentGrade === "고대" && (
                                                                <div className="absolute inset-0 rounded-lg shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] pointer-events-none" />
                                                            )}
                                                        </div>

                                                        <div className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(quality)} bg-zinc-900 ${theme.text}`}>
                                                            {quality}
                                                        </div>

                                                        {accHoverIdx === i && accHoverData && (
                                                            <div
                                                                className="absolute left-full top-0 z-[9999] pointer-events-auto flex items-start"
                                                                style={{ paddingLeft: "12px", width: "max-content" }}
                                                            >
                                                                <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                                                                    <AccessoryTooltip data={accHoverData} />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-[2] min-w-0">
                                                        <h3 className={`font-bold text-[14px] truncate mb-0.5 ${theme.text}`}>
                                                            {item.Name || "아이템"}
                                                        </h3>
                                                        <div className="flex gap-4 text-[11px]">
                                                            <span className="text-orange-400 font-bold">깨달음 +{passive}</span>
                                                            <span className="text-white/40 font-medium">{tier}티어</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* 팔찌 “계산 행”은 기존처럼 자리만 유지 */}
                                        <div className="flex items-center gap-4 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 h-[72px]">
                                            팔찌 효율 계산 행
                                        </div>

                                        {!accessories.length && (
                                            <div className="text-sm text-zinc-500 bg-zinc-950/40 border border-white/5 rounded-xl p-4">
                                                악세사리 정보가 없습니다.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 우측: 아크그리드 + 젬효과 (CombatTab의 2열 카드 스타일) */}
                        <section className="lg:col-span-6 bg-[#121213] p-6 rounded-3xl border border-white/5 overflow-visible">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch overflow-visible">
                                {/* 아크 그리드 */}
                                <section className="flex flex-col overflow-visible">
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                                        <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                                        <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">아크 그리드</h1>
                                    </div>

                                    <div className="flex flex-col gap-1 overflow-visible">
                                        {arkGrid?.Slots?.map((slot, i) => {
                                            const nameParts = slot.Name.split(/\s*:\s*/);
                                            const category = nameParts[0];
                                            const subName = nameParts[1];

                                            const rawGrade = (slot.Grade || "").trim();
                                            let currentGrade = "일반";
                                            if (rawGrade.includes("고대")) currentGrade = "고대";
                                            else if (rawGrade.includes("유물")) currentGrade = "유물";
                                            else if (rawGrade.includes("전설")) currentGrade = "전설";
                                            else if (rawGrade.includes("영웅")) currentGrade = "영웅";

                                            const theme = (gradeStyles as any)[currentGrade] || (gradeStyles as any)["일반"];

                                            return (
                                                <div
                                                    key={i}
                                                    className="relative group flex items-center gap-3 rounded-xl hover:bg-white/[0.04] transition-colors h-[72px] cursor-help overflow-visible"
                                                    onMouseEnter={() => {
                                                        setArkCoreHoverIdx(i);
                                                        const parsed = typeof slot.Tooltip === "string" ? JSON.parse(slot.Tooltip) : slot.Tooltip;
                                                        setArkCoreHoverData({ core: parsed, gems: slot.Gems });
                                                    }}
                                                    onMouseLeave={() => {
                                                        setArkCoreHoverIdx(null);
                                                        setArkCoreHoverData(null);
                                                    }}
                                                >
                                                    <div className="relative shrink-0 overflow-visible">
                                                        <div
                                                            className={`w-14 h-14 rounded-xl p-[2px] transition-all flex items-center justify-center
                    bg-gradient-to-br ${theme.bg} overflow-hidden
                    border border-[#e9d2a6]/10 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]`}
                                                        >
                                                            <img src={slot.Icon} className="w-full h-full object-contain filter drop-shadow-md" alt="" />

                                                            {slot.Gems?.length > 0 && (
                                                                <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-black/60 flex items-center justify-center shadow-md ${theme.accent}`}>
                                                                    <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_2px_#fff]"></div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {arkCoreHoverIdx === i && arkCoreHoverData && (
                                                            <div
                                                                className="absolute left-full top-0 z-[9999] pointer-events-auto flex items-start"
                                                                style={{ paddingLeft: "12px", width: "max-content" }}
                                                            >
                                                                <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                                                                    <ArkCoreTooltip data={arkCoreHoverData.core} Gems={arkCoreHoverData.gems} />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[12px] font-bold text-sky-400/90 leading-tight">{category}</div>
                                                        <div className={`text-[14px] font-extrabold mt-0.5 truncate ${theme.text}`}>{subName}</div>
                                                    </div>

                                                    <div className="shrink-0 text-right pr-1">
                                                        <span className="text-[15px] font-black text-[#f18c2d] tracking-tighter">{slot.Point}P</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* 젬 효과 */}
                                <section className="flex flex-col border-l border-zinc-800/30 md:pl-8">
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                                        <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                                        <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">젬 효과</h1>
                                    </div>

                                    <div className="flex flex-col gap-5">
                                        {arkGrid?.Effects?.map((effect, i) => {
                                            const txt = effect.Tooltip.replace(/<[^>]*>?/gm, "").replace(/\s*\+\s*$/, "");
                                            const splitPos = txt.lastIndexOf(" +");
                                            const desc = splitPos >= 0 ? txt.substring(0, splitPos) : txt;
                                            const val = splitPos >= 0 ? txt.substring(splitPos + 1) : "";

                                            return (
                                                <div key={i} className="flex flex-col leading-snug">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-zinc-100 font-bold text-[14px]">{effect.Name}</span>
                                                        <span className="text-zinc-500 text-[11px] font-bold">Lv.{effect.Level}</span>
                                                    </div>
                                                    <div className="text-[13px] text-zinc-400 font-medium">
                                                        {desc} {val && <span className="text-[#ffd200] font-bold">{val}</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {!arkGrid?.Effects?.length && <div className="text-sm text-zinc-500">젬 효과 정보가 없습니다.</div>}
                                    </div>
                                </section>
                            </div>
                        </section>
                    </div>


                    {/* ===================== 2) 보석 ===================== */}
                    <section className="mt-10 w-full flex flex-col items-center">
                        <div className="w-full max-w-5xlxl flex items-center justify-between border-b border-zinc-800 pb-2 mb-8">
                            <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-tight">보석</h2>
                            <div className="text-[12px] bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full border border-blue-500/20 font-black shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                                {gems?.Effects?.Description?.replace(/<[^>]*>?/gm, "").trim() || "정보 없음"}
                            </div>
                        </div>
                        <div
                            className="relative w-full max-w-5xl p-8 rounded-[40px] border border-zinc-700/50 shadow-2xl flex items-center justify-center min-h-[400px]"
                            style={{
                                background: `linear-gradient(180deg, #0f1217 0%, #07090c 100%)`,
                                boxShadow: "inset 0 0 100px rgba(0,0,0,0.8)",
                            }}
                        >
                            <div className="absolute inset-0 z-0 pointer-events-none">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-900/20 rounded-full blur-[120px]" />
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none" />
                            </div>

                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className="flex items-center gap-40">
                                    <div className="flex gap-4">
                                        <GemSlot
                                            gem={gems?.Gems?.[0]}
                                            index={0}
                                            hoverIdx={jewHoverIdx}
                                            hoverData={jewHoverData}
                                            setHoverIdx={setJewHoverIdx}
                                            setHoverData={setJewHoverData}
                                        />
                                        <GemSlot
                                            gem={gems?.Gems?.[1]}
                                            index={1}
                                            hoverIdx={jewHoverIdx}
                                            hoverData={jewHoverData}
                                            setHoverIdx={setJewHoverIdx}
                                            setHoverData={setJewHoverData}
                                        />
                                    </div>
                                    <div className="flex gap-6">
                                        <GemSlot
                                            gem={gems?.Gems?.[2]}
                                            index={2}
                                            hoverIdx={jewHoverIdx}
                                            hoverData={jewHoverData}
                                            setHoverIdx={setJewHoverIdx}
                                            setHoverData={setJewHoverData}
                                        />
                                        <GemSlot
                                            gem={gems?.Gems?.[3]}
                                            index={3}
                                            hoverIdx={jewHoverIdx}
                                            hoverData={jewHoverData}
                                            setHoverIdx={setJewHoverIdx}
                                            setHoverData={setJewHoverData}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-6 -mt-2">
                                    <GemSlot
                                        gem={gems?.Gems?.[4]}
                                        index={4}
                                        hoverIdx={jewHoverIdx}
                                        hoverData={jewHoverData}
                                        setHoverIdx={setJewHoverIdx}
                                        setHoverData={setJewHoverData}
                                    />
                                    <GemSlot
                                        gem={gems?.Gems?.[5]}
                                        index={5}
                                        hoverIdx={jewHoverIdx}
                                        hoverData={jewHoverData}
                                        setHoverIdx={setJewHoverIdx}
                                        setHoverData={setJewHoverData}
                                        isCenter={true}
                                    />
                                    <GemSlot
                                        gem={gems?.Gems?.[6]}
                                        index={6}
                                        hoverIdx={jewHoverIdx}
                                        hoverData={jewHoverData}
                                        setHoverIdx={setJewHoverIdx}
                                        setHoverData={setJewHoverData}
                                    />
                                </div>

                                <div className="flex items-center gap-40 -mt-2">
                                    <div className="flex gap-4">
                                        <GemSlot
                                            gem={gems?.Gems?.[7]}
                                            index={7}
                                            hoverIdx={jewHoverIdx}
                                            hoverData={jewHoverData}
                                            setHoverIdx={setJewHoverIdx}
                                            setHoverData={setJewHoverData}
                                        />
                                        <GemSlot
                                            gem={gems?.Gems?.[8]}
                                            index={8}
                                            hoverIdx={jewHoverIdx}
                                            hoverData={jewHoverData}
                                            setHoverIdx={setJewHoverIdx}
                                            setHoverData={setJewHoverData}
                                        />
                                    </div>
                                    <div className="flex gap-6">
                                        <GemSlot
                                            gem={gems?.Gems?.[9]}
                                            index={9}
                                            hoverIdx={jewHoverIdx}
                                            hoverData={jewHoverData}
                                            setHoverIdx={setJewHoverIdx}
                                            setHoverData={setJewHoverData}
                                        />
                                        <GemSlot
                                            gem={gems?.Gems?.[10]}
                                            index={10}
                                            hoverIdx={jewHoverIdx}
                                            hoverData={jewHoverData}
                                            setHoverIdx={setJewHoverIdx}
                                            setHoverData={setJewHoverData}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

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

                    {/* ===================== 3) 활성 각인 (아크 패시브) - CombatTab 디자인 ===================== */}
                    <section className="bg-[#121213] rounded-xl border border-white/5 p-6 space-y-6 shadow-2xl mt-10">
                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                            <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                            <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">활성 각인</h1>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            {(engravings?.ArkPassiveEffects ?? []).map((eng: ArkPassiveEffect, i: number) => {
                                const n = typeof eng.Level === "number" ? eng.Level : 0;
                                const m = typeof eng.AbilityStoneLevel === "number" ? eng.AbilityStoneLevel : 0;

                                const iconUrl = getEngravingIconUrl(eng.Name);
                                const stoneIcon = eng.AbilityStoneIcon || FALLBACK_ABILITY_STONE_ICON;

                                return (
                                    <div
                                        key={i}
                                        className="relative flex items-center justify-between px-4 py-2 rounded-sm group transition-all duration-200 cursor-default hover:bg-white/[0.02]"
                                        onMouseEnter={() => {
                                            setEngrHoverIdx(i);
                                            setEngrHoverName(eng.Name || null);
                                            setEngrHoverDesc(eng.Description || "");
                                        }}
                                        onMouseLeave={() => {
                                            setEngrHoverIdx(null);
                                            setEngrHoverName(null);
                                            setEngrHoverDesc("");
                                        }}
                                    >
                                        <div className="flex items-center min-w-0">
                                            {/* 각인 원형 아이콘 */}
                                            <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-black/60 mr-4 border border-[#3e444d]">
                                                {iconUrl ? (
                                                    <img
                                                        src={iconUrl}
                                                        alt={eng.Name}
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full" />
                                                )}
                                            </div>

                                            {/* 단계 표시 */}
                                            <div className="flex items-center gap-1.5 mr-5">
                                                <Diamond
                                                    size={14}
                                                    className="text-[#f16022] fill-[#f16022] drop-shadow-[0_0_5px_rgba(241,96,34,0.5)]"
                                                />
                                                <span className="text-[#a8a8a8] text-sm font-medium">x</span>
                                                <span className="text-white text-xl font-bold leading-none tabular-nums">{n}</span>
                                            </div>

                                            {/* 각인명 + 툴팁 앵커 */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="relative min-w-0">
                <span className="text-[#efeff0] font-bold text-[17px] tracking-tight truncate">
                  {eng.Name}
                </span>

                                                    {/* 이름 옆 툴팁 */}
                                                    {engrHoverIdx === i && engrHoverDesc && (
                                                        <div
                                                            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[9999]"
                                                            onMouseEnter={() => setEngrHoverIdx(i)}
                                                            onMouseLeave={() => {
                                                                setEngrHoverIdx(null);
                                                                setEngrHoverName(null);
                                                                setEngrHoverDesc("");
                                                            }}
                                                        >
                                                            <div className="w-[380px] max-w-[60vw] rounded-xl border border-white/10 bg-[#0b0c10]/95 shadow-2xl backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-150">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 bg-black/40 shrink-0">
                                                                        {iconUrl ? <img src={iconUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="text-[13px] font-black text-white mb-1 truncate">{engrHoverName}</div>
                                                                        <div
                                                                            className="text-[12px] leading-relaxed text-zinc-200"
                                                                            dangerouslySetInnerHTML={{ __html: engravingDescToHtml(engrHoverDesc) }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 스톤 레벨 */}
                                                {m > 0 && (
                                                    <div className="flex items-center gap-1.5 ml-2 bg-black/20 px-2 py-0.5 rounded-sm border border-white/5">
                                                        <img src={stoneIcon} alt="Stone" className="w-4 h-5 object-contain brightness-125" />
                                                        <div className="flex items-baseline gap-0.5">
                                                            <span className="text-[#5e666f] text-[11px] font-bold">Lv.</span>
                                                            <span className="text-[#00ccff] text-[17px] font-black">{m}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 우측 hover 장식 */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="w-1 h-6 rounded-full bg-orange-500/0 group-hover:bg-orange-500 shadow-[0_0_10px_rgba(241,96,34,0.8)] transition-all duration-300" />
                                            <ChevronRight
                                                size={18}
                                                className="text-zinc-600 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            {!((engravings?.ArkPassiveEffects ?? []).length) && (
                                <div className="text-sm text-zinc-500 bg-zinc-950/40 border border-white/5 rounded-xl p-4">
                                    활성 각인(아크 패시브) 정보가 없습니다.
                                </div>
                            )}
                        </div>
                    </section>

                </>
            )}

            {tab === "synergy" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="text-xl font-black text-white">시너지 및 버프</div>
                    </div>
                    <SynergyBuffTab />
                </div>
            )}

            {tab === "result" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="text-xl font-black text-white">결과</div>
                    </div>

                    <ResultTab character={simCharacter} arkPassive={simArkPassive} />
                </div>
            )}
        </div>
    );
};
