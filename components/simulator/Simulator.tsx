import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, Search, ShieldAlert } from "lucide-react";
import { SynergyBuffTab } from "./SynergyBuffTab";
import { ResultTab } from "./Result";
import EquipmentTooltip from "@/components/profile/Tooltip/EquipmentTooltip.tsx";
import AccessoryTooltip from "@/components/profile/Tooltip/AccessoryTooltip.tsx";
import ArkCoreTooltip from "@/components/profile/Tooltip/ArkCoreTooltip.tsx";
import JewelryTooltip from "@/components/profile/Tooltip/JewelryTooltip.tsx";
import engravingIconMap from "./engravingsIdTable.json"; // 경로는 너 프로젝트에 맞게 조정
import { CharacterInfo } from "../../types.ts";

/** ✅ 아크 패시브 각인(우측 “활성 각인 (아크 패시브)”에 쓰는 데이터) */
type ArkPassiveEffect = {
    Name: string;
    Description?: string;
    Icon?: string;
    Level?: number; // 각인서 활성 단계(0~4)
    AbilityStoneLevel?: number; // 스톤 추가 활성(0~4)
    AbilityStoneIcon?: string;
};

const FALLBACK_ABILITY_STONE_ICON =
    "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_7_206.png";

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
    if (typeof text === "object" && typeof text.Text === "string")
        return cleanText(text.Text);
    return "";
};

const normalizeEngravingName = (name: string) => {
    return (name || "")
        .replace(/\[[^\]]*]/g, "") // [강화] 제거
        .replace(/\([^)]*\)/g, "") // (중력 해방) 제거
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
    if (!gem)
        return <div className={`${sizeClasses} rounded-full bg-white/5 opacity-10`} />;

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
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                            size={18}
                        />
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

export const Simulator: React.FC<{ character?: CharacterInfo | null }> = ({
                                                                              character: propCharacter,
                                                                          }) => {
    const location = useLocation();

    /** ✅ 우선순위: props > location.state.character > null */
    const initialCharacter = useMemo(() => {
        const stateChar = (location.state as any)?.character ?? null;
        return (propCharacter ?? stateChar) as CharacterInfo | null;
    }, [location.state, propCharacter]);

    const [character, setCharacter] = useState<CharacterInfo | null>(initialCharacter);

    // ✅ 네비 탭
    const [tab, setTab] = useState<SimTab>("info");

    // 검색/로딩
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    // 상세 데이터들
    const [loading, setLoading] = useState(false);
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [arkGrid, setArkGrid] = useState<ArkCoreData | null>(null);
    const [gems, setGems] = useState<any>(null);
    const [engravings, setEngravings] = useState<any>(null);
    const [arkPassive, setArkPassive] = useState<any>(null);

    // Hover states (툴팁)
    const [weaponHover, setWeaponHover] = useState<any>(null);
    const [accHoverIdx, setAccHoverIdx] = useState<number | null>(null);
    const [accHoverData, setAccHoverData] = useState<any>(null);
    const [arkCoreHoverIdx, setArkCoreHoverIdx] = useState<number | null>(null);
    const [arkCoreHoverData, setArkCoreHoverData] = useState<any>(null);
    const [jewHoverIdx, setJewHoverIdx] = useState<number | null>(null);
    const [jewHoverData, setJewHoverData] = useState<any>(null);

    useEffect(() => {
        setCharacter(initialCharacter);
    }, [initialCharacter]);

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
            setTab("info"); // 검색 성공하면 기본 탭으로
        } catch (e: any) {
            setSearchError(e?.message ?? "검색 실패");
        } finally {
            setSearching(false);
        }
    };

    /** ✅ 상세 데이터 로딩 (무기/악세/아크그리드/젬효과/보석/아크패시브) */
    useEffect(() => {
        if (!character?.CharacterName) return;

        setLoading(true);
        Promise.all([
            fetch(`/equipment?name=${encodeURIComponent(character.CharacterName)}`).then((r) =>
                r.json()
            ),
            fetch(`/arkgrid?name=${encodeURIComponent(character.CharacterName)}`).then((r) =>
                r.json()
            ),
            fetch(`/gems?name=${encodeURIComponent(character.CharacterName)}`).then((r) =>
                r.json()
            ),
            fetch(`/engravings?name=${encodeURIComponent(character.CharacterName)}`).then((r) =>
                r.json()
            ),
            fetch(`/arkpassive?name=${encodeURIComponent(character.CharacterName)}`).then((r) =>
                r.json()
            ),
        ])
            .then(([eqData, arkData, gemData, engData, passiveData]) => {
                setEquipments(Array.isArray(eqData) ? eqData : []);
                setArkGrid(arkData ?? null);
                setGems(gemData ?? null);
                setEngravings(engData ?? null);
                setArkPassive(passiveData ?? null);
            })
            .catch((err) => {
                console.error("데이터 로딩 실패:", err);
                setEquipments([]);
                setArkGrid(null);
                setGems(null);
                setEngravings(null);
                setArkPassive(null);
            })
            .finally(() => setLoading(false));
    }, [character?.CharacterName]);

    const getItemsByType = (types: string[]) =>
        equipments.filter((i) => types.includes(i.Type));

    /** ✅ 무기 1개 */
    const weaponItem = useMemo(() => {
        const w = getItemsByType(["무기"])[0];
        return w ?? null;
    }, [equipments]);

    /** ✅ 악세사리 정렬: 목걸이 -> 귀걸이1/2 -> 반지1/2 -> 팔찌 */
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
    if (!character?.CharacterName) {
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
        if (!character?.CharacterName) return;

        window.location.href = `/profilePage?name=${encodeURIComponent(
            character.CharacterName
        )}`;
    };


    return (
        <div className="text-zinc-200 space-y-8">
            {/* ===================== ✅ 네비게이션 바(요청한 위치) ===================== */}
            <div className="mb-8">
                <div className="w-full flex items-center justify-between bg-zinc-950/60 border border-white/5 rounded-2xl px-4 py-3">
                    {/* 좌측 탭 */}
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

                    {/* 우측은 비워둠(나중에 버튼 추가 가능) */}
                    {/* 우측 버튼 */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={goToProfilePage}
                            className="
            px-4 py-2 rounded-xl
            bg-white/90 text-black
            font-black text-sm
            hover:bg-white transition
            shadow
        "
                        >
                            캐릭터 정보 페이지로 전환
                        </button>
                    </div>
                </div>
            </div>

            {/* ===================== ✅ 탭별 컨텐츠 ===================== */}
            {tab === "info" && (
                <>
                    {/* ===================== 1) 상단 2열: 좌(무기+악세) / 우(아크그리드+젬효과) ===================== */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        {/* 좌측: 무기 + 악세사리 (한 구역) */}
                        <section className="lg:col-span-6 bg-zinc-950 p-6 rounded-3xl border border-white/5 h-full">
                            <div className="flex items-end justify-between border-b border-white/10 pb-2 mb-4">
                                <h2 className="text-lg font-bold text-white/90 tracking-tight">무기 / 악세사리</h2>
                                <span className="text-[10px] font-black text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  아크 패시브 ON
                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {/* 무기 */}
                                {weaponItem &&
                                    (() => {
                                        let tooltip: any = null;
                                        try {
                                            tooltip = JSON.parse(weaponItem.Tooltip);
                                        } catch {}
                                        const quality = tooltip?.Element_001?.value?.qualityValue ?? 0;

                                        const reinforceLevel = weaponItem.Name.match(/\+(\d+)/)?.[0] || "";
                                        const itemName = cleanText(weaponItem.Name).replace(/\+\d+\s/, "");

                                        let advancedReinforce = "0";
                                        const advMatch = cleanText(tooltip?.Element_005?.value || "").match(
                                            /\[상급\s*재련\]\s*(\d+)단계/
                                        );
                                        if (advMatch) advancedReinforce = advMatch[1];

                                        return (
                                            <div
                                                key={weaponItem.Name}
                                                className="relative group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors h-[72px] cursor-help"
                                                onMouseEnter={() => setWeaponHover(tooltip)}
                                                onMouseLeave={() => setWeaponHover(null)}
                                            >
                                                <div className="relative shrink-0">
                                                    <div className="p-0.5 rounded-lg bg-gradient-to-br from-[#3d3325] to-[#1a1a1c] border border-[#e9d2a6]/30 shadow-lg">
                                                        <img
                                                            src={weaponItem.Icon}
                                                            className="w-12 h-12 rounded-md object-cover bg-black/20"
                                                            alt={itemName}
                                                        />
                                                    </div>
                                                    <div
                                                        className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(
                                                            quality
                                                        )} bg-zinc-900 text-[#e9d2a6]`}
                                                    >
                                                        {quality}
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white/90 font-bold text-[14px] truncate mb-0.5">
                                                        {itemName}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white/50 text-[12px]">재련 {reinforceLevel}</span>
                                                        {advancedReinforce !== "0" && (
                                                            <span className="text-sky-400 text-[12px] font-bold">
                                상재 +{advancedReinforce}
                              </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {weaponHover && (
                                                    <div className="absolute left-full top-0 -ml-2 pl-4 z-[9999] h-full flex items-start">
                                                        <EquipmentTooltip data={weaponHover} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                {/* 악세사리: 목걸이 -> 귀걸이1 -> 귀걸이2 -> 반지1 -> 반지2 -> 팔찌 */}
                                {accessories.map((item, i) => {
                                    let tooltip: any = null;
                                    try {
                                        tooltip = JSON.parse(item.Tooltip);
                                    } catch {}
                                    const quality = tooltip?.Element_001?.value?.qualityValue ?? 0;

                                    const passive =
                                        cleanText(tooltip?.Element_007?.value?.Element_001 || "").match(/\d+/)?.[0] ||
                                        "0";
                                    const tierStr = tooltip?.Element_001?.value?.leftStr2 || "";
                                    const tier = tierStr.replace(/[^0-9]/g, "").slice(-1) || "4";

                                    return (
                                        <div
                                            key={`${item.Type}-${i}-${item.Name}`}
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
                                            <div className="relative shrink-0">
                                                <div className="p-0.5 rounded-lg bg-gradient-to-br from-[#3d3325] to-[#1a1a1c] border border-[#e9d2a6]/30">
                                                    <img src={item.Icon} className="w-12 h-12 rounded-md object-cover" alt="" />
                                                </div>
                                                <div
                                                    className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(
                                                        quality
                                                    )} bg-zinc-900 text-[#e9d2a6]`}
                                                >
                                                    {quality}
                                                </div>
                                            </div>

                                            <div className="flex-[2] min-w-0">
                                                <h3 className="text-white/90 font-bold text-[14px] truncate mb-0.5">
                                                    {item.Name || "아이템"}
                                                </h3>
                                                <div className="flex gap-4 text-[11px]">
                                                    <span className="text-orange-400 font-bold">깨달음 +{passive}</span>
                                                    <span className="text-white/40 font-medium">{tier}티어</span>
                                                </div>
                                            </div>

                                            {accHoverIdx === i && accHoverData && (
                                                <div className="absolute left-full top-0 -ml-2 pl-4 z-[9999] h-full flex items-start">
                                                    <AccessoryTooltip data={accHoverData} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* 우측: 같은 높이 구역 안에서 "아크그리드 / 젬효과" 병렬 */}
                        <section className="lg:col-span-6 bg-[#121213] p-6 rounded-3xl border border-white/5 h-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch h-full">
                                {/* 아크 그리드 */}
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                                        <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                                        <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                            아크 그리드
                                        </h1>
                                    </div>

                                    <div className="grid grid-cols-3 gap-y-12 gap-x-4">
                                        {arkGrid?.Slots?.map((slot, i) => {
                                            const nameParts = slot.Name.split(/\s*:\s*/);
                                            const category = nameParts[0];
                                            const subName = nameParts[1];

                                            return (
                                                <div
                                                    key={i}
                                                    className="relative group flex flex-col items-center cursor-help"
                                                    onMouseEnter={() => {
                                                        setArkCoreHoverIdx(i);
                                                        const parsed =
                                                            typeof slot.Tooltip === "string"
                                                                ? JSON.parse(slot.Tooltip)
                                                                : slot.Tooltip;
                                                        setArkCoreHoverData({ core: parsed, gems: slot.Gems });
                                                    }}
                                                    onMouseLeave={() => {
                                                        setArkCoreHoverIdx(null);
                                                        setArkCoreHoverData(null);
                                                    }}
                                                >
                                                    <div className="relative w-16 h-16 mb-4 shrink-0">
                                                        <div className="w-full h-full bg-[#0c0c0d] rounded-2xl p-1.5 border border-zinc-800 group-hover:border-purple-900/50 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,1)] flex items-center justify-center">
                                                            <img
                                                                src={slot.Icon}
                                                                className="w-full h-full object-contain filter drop-shadow-md"
                                                                alt=""
                                                            />
                                                        </div>

                                                        {slot.Gems?.length > 0 && (
                                                            <div className="absolute -right-1 -bottom-1 w-5 h-5 bg-[#7b2cff] rounded-full border-[3px] border-[#0c0c0d] flex items-center justify-center shadow-[0_0_8px_rgba(123,44,255,0.4)]">
                                                                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_#fff]"></div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="w-full text-center flex flex-col items-center">
                            <span className="text-[12px] font-bold text-sky-400/90 leading-tight">
                              {category}
                            </span>
                                                        <span className="text-[12px] font-extrabold text-zinc-100 mt-0.5 leading-tight">
                              {subName}
                            </span>
                                                        <span className="text-[14px] font-black text-[#f18c2d] mt-2 tracking-tighter">
                              {slot.Point}p
                            </span>
                                                    </div>

                                                    {arkCoreHoverIdx === i && arkCoreHoverData && (
                                                        <div
                                                            className="absolute left-full top-0 -ml-2 pl-4 z-[9999] h-full flex items-start pointer-events-auto animate-in fade-in slide-in-from-left-2 duration-200"
                                                            onMouseEnter={() => setArkCoreHoverIdx(i)}
                                                            onMouseLeave={() => {
                                                                setArkCoreHoverIdx(null);
                                                                setArkCoreHoverData(null);
                                                            }}
                                                        >
                                                            <ArkCoreTooltip data={arkCoreHoverData.core} Gems={arkCoreHoverData.gems} />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* 젬 효과 */}
                                <div className="flex flex-col h-full md:border-l md:border-zinc-800/30 md:pl-8">
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-6">
                                        <div className="w-1.5 h-5 bg-purple-500 rounded-full"></div>
                                        <h1 className="text-lg font-extrabold text-white tracking-tight uppercase">
                                            젬 효과
                                        </h1>
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
                                        {!arkGrid?.Effects?.length && (
                                            <div className="text-sm text-zinc-500">젬 효과 정보가 없습니다.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ===================== 2) 보석 (위 덩어리 밑) ===================== */}
                    <section className="mt-10 w-full flex flex-col items-center">
                        <div className="w-full max-w-5xl flex items-center justify-between border-b border-zinc-800 pb-2 mb-8">
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

                    {/* ===================== 3) 활성 각인 (아크 패시브) (보석 밑) ===================== */}
                    <section className="mt-10 space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-white">
                            <h2 className="text-xl font-bold">활성 각인 (아크 패시브)</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {(engravings?.ArkPassiveEffects ?? []).map((eng: ArkPassiveEffect, i: number) => {
                                const n = typeof eng.Level === "number" ? eng.Level : 0;
                                const m = typeof eng.AbilityStoneLevel === "number" ? eng.AbilityStoneLevel : 0;

                                const iconUrl = getEngravingIconUrl(eng.Name);
                                const stoneIcon = eng.AbilityStoneIcon || FALLBACK_ABILITY_STONE_ICON;

                                return (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between bg-[#181818] px-3 py-2 rounded border border-white/5"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-7 h-7 shrink-0 rounded overflow-hidden bg-black/30 border border-white/10">
                                                {iconUrl ? (
                                                    <img src={iconUrl} alt={eng.Name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full" />
                                                )}
                                            </div>

                                            <span className="text-[12px] font-black text-white/90 shrink-0">{n}단계</span>
                                            <span className="text-zinc-100 font-semibold truncate">{eng.Name}</span>

                                            {m > 0 && (
                                                <span className="inline-flex items-center gap-1 shrink-0">
                          <img src={stoneIcon} alt="Ability Stone" className="w-4 h-4" />
                          <span className="text-[12px] font-black text-sky-400">Lv.{m}</span>
                        </span>
                                            )}
                                        </div>

                                        <div className="shrink-0" />
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
                    {/* 필요하면 제목 유지 */}
                    <div className="flex items-center justify-between">
                        <div className="text-xl font-black text-white">결과</div>
                    </div>

                    {/* ✅ ResultTab 실제 렌더 */}
                    <ResultTab />
                </div>
            )}
        </div>
    );
};
