import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

type SkillRow = {
    id: string;
    name: string;
    icon: string;
    cooldownSec: number;
    expectedDamage: number;
    expectedDps: number;

    // ✅ 공식 Tooltip 원문(JSON 문자열)
    skillTooltip?: string;

    tags?: Array<{
        name: string;
        icon?: string;
        tooltip?: string;
    }>;

    runeTag?: {
        name: string;
        icon?: string;
        tooltip?: string;
    } | null;
};

type BackendSkill = {
    name: string;
    level: number;
    type?: string;
    icon: string;
    tooltip?: string;

    rune?: {
        name: string;
        grade?: string;
        icon?: string;
        tooltip?: string;
    } | null;

    selectedTripods?: Array<{
        tier: number;
        slot: number;
        name: string;
        icon?: string;
        tooltip?: string;
    }>;
};

function formatKoreanNumber(n: number) {
    if (n >= 100000000) return `${(n / 100000000).toFixed(2)}억`;
    if (n >= 10000) return `${(n / 10000).toFixed(0)}만`;
    return `${Math.floor(n)}`;
}

function cx(...a: Array<string | false | null | undefined>) {
    return a.filter(Boolean).join(" ");
}

const BACKEND_API_URL =
    import.meta.env.VITE_BACKEND_API_URL ?? "http://localhost:8080";

/** =========================
 *  Rune color extract (기존 유지)
 * ========================= */
function isLikelyJsonTooltip(s: string) {
    const t = s.trim();
    return t.startsWith("{") && t.endsWith("}");
}

function extractRuneBgColor(raw?: string): string | null {
    if (!raw) return null;
    const s = raw.trim();
    if (!isLikelyJsonTooltip(s)) return null;

    try {
        const obj = JSON.parse(s) as Record<string, any>;
        const leftStr0 =
            typeof obj?.Element_001?.value?.leftStr0 === "string"
                ? (obj.Element_001.value.leftStr0 as string)
                : "";

        if (!leftStr0) return null;

        const m =
            leftStr0.match(/color=['"](#?[0-9a-fA-F]{6})['"]/i) ||
            leftStr0.match(/COLOR=['"](#?[0-9a-fA-F]{6})['"]/i);

        if (!m?.[1]) return null;
        const hex = m[1].startsWith("#") ? m[1] : `#${m[1]}`;
        return hex;
    } catch {
        return null;
    }
}

function hexToRgba(hex: string, alpha: number) {
    const h = hex.replace("#", "");
    if (h.length !== 6) return null;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** =========================
 *  Tooltip 정규화/파싱
 * ========================= */

/** HTML 태그 제거(필요한 텍스트만) */
function stripHtmlToText(html: string): string {
    return (
        html
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n")
            .replace(/<\/div>/gi, "\n")
            .replace(/<\/li>/gi, "\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/\r/g, "")
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
            .join("\n")
    );
}

type ParsedSkillTooltip = {
    name?: string;
    cooldownSec?: number;
    levelText?: string;

    // 긴 설명 텍스트(핵심)
    mainTextLines: string[];

    // 아래 특성들 (있으면)
    destroyLevel?: string; // 부위 파괴: 레벨 1
    stagger?: string; // 무력화: 하
    attackType?: string; // 공격 타입: 백 어택
    superArmor?: string; // 슈퍼아머: 경직 면역

    // 트포(공식 툴팁 안) - 이름/설명
    tripods: Array<{ name: string; descLines: string[] }>;

    // 부가 파트박스(룬/보석 등)
    parts: Array<{ title: string; bodyLines: string[] }>;
};

function parseCooldownSec(leftText?: string): number | undefined {
    if (!leftText) return undefined;
    const t = stripHtmlToText(leftText);
    const m = t.match(/재사용\s*대기시간\s*([0-9]+(?:\.[0-9]+)?)\s*초/);
    if (!m) return undefined;
    const v = Number(m[1]);
    return Number.isFinite(v) ? v : undefined;
}

function parseSkillTooltip(raw?: string): ParsedSkillTooltip | null {
    if (!raw) return null;
    const s = raw.trim();
    if (!s) return null;

    // JSON 툴팁 아닌 경우(혹시 HTML로 올 때)도 최소 파싱
    if (!isLikelyJsonTooltip(s)) {
        const text = stripHtmlToText(s);
        return {
            mainTextLines: text ? text.split("\n") : [],
            tripods: [],
            parts: [],
        };
    }

    try {
        const obj = JSON.parse(s) as any;

        const name =
            typeof obj?.Element_000?.value === "string" ? obj.Element_000.value : "";

        const leftText =
            typeof obj?.Element_001?.value?.leftText === "string"
                ? obj.Element_001.value.leftText
                : "";

        const cooldownSec = parseCooldownSec(leftText);

        const levelText =
            typeof obj?.Element_003?.value === "string" ? obj.Element_003.value : "";

        const mainDescHtml =
            typeof obj?.Element_005?.value === "string" ? obj.Element_005.value : "";

        const mainText = stripHtmlToText(mainDescHtml);
        const mainLines = mainText ? mainText.split("\n") : [];

        // mainLines에서 특성 줄(부파/무력/공격타입/슈아) 분리
        let destroyLevel: string | undefined;
        let stagger: string | undefined;
        let attackType: string | undefined;
        let superArmor: string | undefined;

        const keptMain: string[] = [];
        for (const line of mainLines) {
            if (line.includes("부위 파괴")) destroyLevel = line;
            else if (line.includes("무력화")) stagger = line;
            else if (line.includes("공격 타입")) attackType = line;
            else if (line.includes("슈퍼아머")) superArmor = line;
            else keptMain.push(line);
        }

        // 트포
        const tripods: ParsedSkillTooltip["tripods"] = [];
        const tripodCustom = obj?.Element_006?.value;
        if (tripodCustom && typeof tripodCustom === "object") {
            const keys = Object.keys(tripodCustom)
                .filter((k) => k.startsWith("Element_"))
                .sort((a, b) => {
                    const na = parseInt(a.split("_")[1] ?? "0", 10);
                    const nb = parseInt(b.split("_")[1] ?? "0", 10);
                    return na - nb;
                });

            for (const k of keys) {
                const it = tripodCustom[k];
                const tNameHtml = typeof it?.name === "string" ? it.name : "";
                const tDescHtml = typeof it?.desc === "string" ? it.desc : "";
                const tName = stripHtmlToText(tNameHtml);
                const tDesc = stripHtmlToText(tDescHtml);
                if (!tName && !tDesc) continue;
                tripods.push({
                    name: tName || "트라이포드",
                    descLines: tDesc ? tDesc.split("\n") : [],
                });
            }
        }

        // 파트박스(룬/보석 등)
        const parts: ParsedSkillTooltip["parts"] = [];
        for (const k of Object.keys(obj)) {
            const v = obj?.[k];
            if (v?.type !== "ItemPartBox") continue;
            const titleHtml = typeof v?.value?.Element_000 === "string" ? v.value.Element_000 : "";
            const bodyHtml = typeof v?.value?.Element_001 === "string" ? v.value.Element_001 : "";
            const title = stripHtmlToText(titleHtml);
            const body = stripHtmlToText(bodyHtml);
            if (!title && !body) continue;
            parts.push({ title: title || "정보", bodyLines: body ? body.split("\n") : [] });
        }

        return {
            name: name || undefined,
            cooldownSec,
            levelText: levelText ? stripHtmlToText(levelText) : undefined,
            mainTextLines: keptMain,
            destroyLevel,
            stagger,
            attackType,
            superArmor,
            tripods,
            parts,
        };
    } catch {
        return null;
    }
}

/** ✅ 스킬 툴팁 UI (사진 같은 구성 + 글자 크기 우리 기준) */
const SkillTooltipCard: React.FC<{
    raw?: string;
}> = ({ raw }) => {
    const parsed = useMemo(() => parseSkillTooltip(raw), [raw]);

    if (!parsed) return <div className="text-zinc-500 text-sm">툴팁 없음</div>;

    const cooldown = parsed.cooldownSec;

    return (
        <div className="w-[520px] max-w-[85vw]">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div className="text-[12px] font-black text-zinc-200">
                    {parsed.name ?? "스킬"}
                </div>
                {typeof cooldown === "number" && (
                    <div className="text-[11px] font-black text-zinc-500">
                        재사용 대기시간 {cooldown}초
                    </div>
                )}
            </div>

            {parsed.levelText && (
                <div className="mt-1 text-[11px] font-black text-zinc-500">
                    {parsed.levelText}
                </div>
            )}

            {/* 본문 설명 */}
            <div className="mt-3 space-y-2">
                {(parsed.mainTextLines ?? []).slice(0, 8).map((line, i) => (
                    <div key={i} className="text-[12px] leading-[1.65] text-zinc-100">
                        {line}
                    </div>
                ))}
            </div>

            {/* 하이라이트(부파/무력/공격타입/슈아) */}
            <div className="mt-4 space-y-1.5">
                {parsed.destroyLevel && (
                    <div className="text-[12px] font-black text-amber-300">{parsed.destroyLevel}</div>
                )}
                {parsed.stagger && (
                    <div className="text-[12px] font-black text-amber-300">{parsed.stagger}</div>
                )}
                {parsed.attackType && (
                    <div className="text-[12px] font-black text-amber-300">{parsed.attackType}</div>
                )}
                {parsed.superArmor && (
                    <div className="text-[12px] font-black text-amber-300">{parsed.superArmor}</div>
                )}
            </div>

            {/* 트라이포드(공식 툴팁 기준) */}
            {parsed.tripods.length > 0 && (
                <div className="mt-5">
                    <div className="text-[11px] font-black text-zinc-400 mb-2">
                        트라이포드
                    </div>
                    <div className="space-y-3">
                        {parsed.tripods.map((t, idx) => (
                            <div
                                key={`${t.name}-${idx}`}
                                className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                            >
                                <div className="text-[12px] font-black text-zinc-100">{t.name}</div>
                                {t.descLines?.length ? (
                                    <div className="mt-2 space-y-1">
                                        {t.descLines.slice(0, 4).map((l, i) => (
                                            <div key={i} className="text-[12px] leading-[1.65] text-zinc-200">
                                                {l}
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 파트박스(룬/보석 등) */}
            {parsed.parts.length > 0 && (
                <div className="mt-5 space-y-3">
                    {parsed.parts.slice(0, 3).map((p, idx) => (
                        <div
                            key={`${p.title}-${idx}`}
                            className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
                        >
                            <div className="text-[11px] font-black text-zinc-400">{p.title}</div>
                            <div className="mt-2 space-y-1">
                                {p.bodyLines.slice(0, 3).map((l, i) => (
                                    <div key={i} className="text-[12px] leading-[1.6] text-zinc-200">
                                        {l}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/** ✅ 스킬 아이콘 Hover Tooltip(우리 카드 UI) */
const SkillIconTooltip: React.FC<{
    raw?: string;
    children: React.ReactNode;
}> = ({ raw, children }) => {
    if (!raw) return <>{children}</>;

    return (
        <span className="relative inline-flex group">
      {children}

            {/* ✅ “아이콘 ↔ 툴팁” 사이 hover 끊김 방지 브릿지 */}
            <span
                className={cx(
                    "absolute right-0 top-full",
                    // mt-3 만큼 아래로 내리니까 그 사이를 브릿지로 채움
                    "h-6 w-60", // ✅ 충분히 크게(가로/세로는 취향)
                    "pointer-events-auto"
                )}
                style={{ marginTop: "0px" }}
            />

            {/* ✅ 툴팁 본체 */}
            <span
                className={cx(
                    "absolute z-[9999]",
                    "right-0 top-full mt-3",
                    "rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur",
                    "shadow-2xl p-4",
                    "max-w-[90vw] max-h-[70vh] overflow-y-auto tooltip-scroll",

                    // ✅ 기본 숨김
                    "opacity-0 invisible",
                    // ✅ group hover면 표시
                    "group-hover:opacity-100 group-hover:visible",
                    // ✅ 툴팁에 마우스 올려도 유지
                    "hover:opacity-100 hover:visible",
                    "transition-opacity duration-150"
                )}
            >
        <SkillTooltipCard raw={raw} />
      </span>
    </span>
    );
};



/** ✅ 트포 Hover Tooltip (기존 유지: 트포만) */
const HoverTooltip: React.FC<{
    content?: string;
    children: React.ReactNode;
    widthPx?: number;
}> = ({ content, children, widthPx = 520 }) => {
    const html = useMemo(() => (content ?? "").trim(), [content]);
    if (!html) return <>{children}</>;

    return (
        <span className="relative inline-flex group">
      {children}
            <span
                className={cx(
                    "pointer-events-none absolute z-[9999] hidden group-hover:block",
                    "left-1/2 -translate-x-1/2 top-full mt-2",
                    "rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur",
                    "shadow-2xl p-3"
                )}
                style={{ width: `${widthPx}px`, maxWidth: "85vw" }}
            >
        <span
            className="block text-[12px] leading-5 text-zinc-200"
            dangerouslySetInnerHTML={{ __html: html }}
        />
      </span>
    </span>
    );
};

function mapBackendToSkillRow(s: BackendSkill): SkillRow {
    const tripods =
        s.selectedTripods?.map((t) => ({
            name: t.name,
            icon: t.icon,
            tooltip: t.tooltip,
        })) ?? [];

    const runeTag = s.rune
        ? {
            name: `${s.rune.grade ? `${s.rune.grade} ` : ""}${s.rune.name}`.trim(),
            icon: s.rune.icon,
            tooltip: s.rune.tooltip,
        }
        : null;

    return {
        id: s.name,
        name: s.name,
        icon: s.icon,
        cooldownSec: 0,
        expectedDamage: 0,
        expectedDps: 0,
        skillTooltip: s.tooltip, // ✅ 스킬 Tooltip 원문
        tags: tripods,
        runeTag,
    };
}

export const ResultTab: React.FC<{
    character?: any | null;
    arkPassive?: any | null;
}> = ({ character, arkPassive }) => {
    const characterName: string = character?.CharacterName ?? "";

    const [skills, setSkills] = useState<SkillRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [selectedId, setSelectedId] = useState<string>("");

    useEffect(() => {
        if (!characterName) {
            setSkills([]);
            setSelectedId("");
            setErrorMsg(null);
            return;
        }

        const run = async () => {
            try {
                setLoading(true);
                setErrorMsg(null);

                const url = `${BACKEND_API_URL}/do?characterName=${encodeURIComponent(
                    characterName
                )}`;
                const res = await fetch(url, { method: "GET" });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data: BackendSkill[] = await res.json();
                const mapped = Array.isArray(data) ? data.map(mapBackendToSkillRow) : [];

                setSkills(mapped);
                setSelectedId(mapped[0]?.id ?? "");
            } catch (e: any) {
                setErrorMsg(e?.message ?? "스킬 조회 실패");
                setSkills([]);
                setSelectedId("");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [characterName]);

    const selectedSkill = useMemo(
        () => skills.find((s) => s.id === selectedId) ?? skills[0],
        [skills, selectedId]
    );

    const totalExpectedDamage = useMemo(
        () => skills.reduce((acc, s) => acc + (s.expectedDamage ?? 0), 0),
        [skills]
    );

    const avgDps = useMemo(() => {
        const sum = skills.reduce((acc, s) => acc + (s.expectedDps ?? 0), 0);
        return skills.length ? sum / skills.length : 0;
    }, [skills]);

    const maxDamage = useMemo(
        () => Math.max(1, ...skills.map((s) => s.expectedDamage ?? 0)),
        [skills]
    );

    const appliedArkPassiveCount = useMemo(() => {
        const arr = arkPassive?.Effects;
        return Array.isArray(arr) ? arr.length : 0;
    }, [arkPassive]);

    const runeColorHex = useMemo(() => {
        return extractRuneBgColor(selectedSkill?.runeTag?.tooltip) || null;
    }, [selectedSkill?.runeTag?.tooltip]);

    const runePillStyle = useMemo(() => {
        if (!runeColorHex) return undefined;
        const bg = hexToRgba(runeColorHex, 0.18);
        const border = hexToRgba(runeColorHex, 0.42);
        const glow = hexToRgba(runeColorHex, 0.25);
        return {
            backgroundColor: bg ?? undefined,
            borderColor: border ?? undefined,
            boxShadow: glow ? `0 0 0 1px ${border}, 0 0 24px ${glow}` : undefined,
        } as React.CSSProperties;
    }, [runeColorHex]);

    return (
        <div className="max-w-[1800px] mx-auto px-6 py-6 text-zinc-200 space-y-8">
            <section className="bg-zinc-950/40 border border-white/5 rounded-3xl p-7">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                        <div className="text-2xl font-black text-white tracking-tight">결과</div>
                        <div className="mt-2 text-sm text-zinc-400">
                            모든 스킬을 계산한 평균적인 기대 딜 값을 표시합니다. (현재 딜/쿨 계산은 임시)
                        </div>

                        {characterName && (
                            <div className="mt-2 text-[12px] font-black text-zinc-500">
                                대상: <span className="text-zinc-200">{characterName}</span> / 시뮬 적용 아크패시브{" "}
                                {appliedArkPassiveCount}개
                            </div>
                        )}

                        {loading && (
                            <div className="mt-2 text-[12px] font-black text-zinc-500">
                                스킬 불러오는 중…
                            </div>
                        )}
                        {errorMsg && (
                            <div className="mt-2 text-[12px] font-black text-red-300">
                                에러: {errorMsg}
                            </div>
                        )}
                        {!characterName && (
                            <div className="mt-2 text-[12px] font-black text-zinc-500">
                                캐릭터를 검색해 주세요.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <section className="lg:col-span-5 bg-[#121213] border border-white/5 rounded-3xl p-6">
                    <div className="flex items-end justify-between border-b border-white/10 pb-3 mb-4">
                        <h2 className="text-lg font-extrabold text-white tracking-tight">스킬</h2>
                        <div className="text-[12px] font-black text-zinc-500">정렬: 스킬데미지(임시)</div>
                    </div>

                    {!skills.length && characterName && !loading ? (
                        <div className="text-sm text-zinc-500">표시할 스킬이 없습니다.</div>
                    ) : (
                        <div className="space-y-2">
                            {skills
                                .slice()
                                .sort((a, b) => (b.expectedDamage ?? 0) - (a.expectedDamage ?? 0))
                                .map((s) => {
                                    const active = s.id === selectedId;
                                    const ratio = Math.max(0.06, Math.min(1, (s.expectedDamage ?? 0) / maxDamage));

                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedId(s.id)}
                                            className={cx(
                                                "w-full text-left group rounded-2xl border transition p-3",
                                                active
                                                    ? "bg-emerald-500/10 border-emerald-500/20"
                                                    : "bg-zinc-950/30 border-white/10 hover:bg-white/[0.04]"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-black/20 shrink-0">
                                                    <img src={s.icon} alt={s.name} className="w-full h-full object-cover" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-black text-[14px] text-white/90 truncate">
                                                            {s.name}
                                                        </div>
                                                        <span className="text-[11px] text-zinc-500 font-bold shrink-0">
                                                            {s.cooldownSec.toFixed(2)}s
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-emerald-400/70"
                                                            style={{ width: `${ratio * 100}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <div className="text-[14px] font-black text-white">
                                                        {formatKoreanNumber(s.expectedDamage)}
                                                    </div>
                                                    <div className="text-[11px] font-bold text-zinc-500">
                                                        DPS {formatKoreanNumber(s.expectedDps)}
                                                    </div>
                                                </div>

                                                <ChevronRight
                                                    className={cx(
                                                        "w-4 h-4 shrink-0 transition",
                                                        active ? "text-emerald-300" : "text-zinc-600 group-hover:text-zinc-400"
                                                    )}
                                                />
                                            </div>
                                        </button>
                                    );
                                })}
                        </div>
                    )}
                </section>

                <section className="lg:col-span-7 bg-zinc-950 border border-white/5 rounded-3xl p-6">
                    {!selectedSkill ? (
                        <div className="text-zinc-500 text-sm">스킬을 선택해 주세요.</div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                {/* ✅ 우측 큰 아이콘 Hover 시 "정규화/파싱된" 툴팁 */}
                                <SkillIconTooltip raw={selectedSkill.skillTooltip}>
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-black/20 shrink-0">
                                        <img
                                            src={selectedSkill.icon}
                                            alt={selectedSkill.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </SkillIconTooltip>

                                <div className="flex-1 min-w-0">
                                    <div className="text-xl font-black text-white truncate">
                                        {selectedSkill.name}
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-3">
                                        <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10">
                                            <div className="text-[11px] font-black text-zinc-500">기대 피해량</div>
                                            <div className="text-[16px] font-black text-white mt-0.5">
                                                {formatKoreanNumber(selectedSkill.expectedDamage)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 활성 트라이포드 (기존 호버툴팁 유지) */}
                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                                <div className="text-[12px] font-black text-zinc-400 mb-3">
                                    활성 트라이포드{" "}
                                    <span className="text-zinc-600 font-bold">(호버 시 툴팁)</span>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {(selectedSkill.tags ?? []).length ? (
                                        selectedSkill.tags!.map((t) => (
                                            <HoverTooltip key={t.name} content={t.tooltip} widthPx={520}>
                                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition">
                                                    {t.icon && (
                                                        <img
                                                            src={t.icon}
                                                            alt={t.name}
                                                            className="w-6 h-6 rounded-md bg-black/20"
                                                        />
                                                    )}
                                                    <span className="text-[12px] font-black text-zinc-100">{t.name}</span>
                                                </div>
                                            </HoverTooltip>
                                        ))
                                    ) : (
                                        <div className="text-sm text-zinc-500">활성화된 트라이포드가 없습니다.</div>
                                    )}
                                </div>
                            </div>

                            {/* 룬 pill */}
                            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                                <div className="text-[12px] font-black text-zinc-400 mb-3">룬</div>

                                {selectedSkill.runeTag ? (
                                    <div
                                        className={cx("inline-flex items-center gap-2 px-3 py-2 rounded-full border")}
                                        style={(() => {
                                            const runeColorHex = extractRuneBgColor(selectedSkill.runeTag?.tooltip) || null;
                                            if (!runeColorHex) return undefined;
                                            const bg = hexToRgba(runeColorHex, 0.18);
                                            const border = hexToRgba(runeColorHex, 0.42);
                                            const glow = hexToRgba(runeColorHex, 0.25);
                                            return {
                                                backgroundColor: bg ?? undefined,
                                                borderColor: border ?? undefined,
                                                boxShadow: glow ? `0 0 0 1px ${border}, 0 0 24px ${glow}` : undefined,
                                            } as React.CSSProperties;
                                        })()}
                                    >
                                        {selectedSkill.runeTag.icon && (
                                            <img
                                                src={selectedSkill.runeTag.icon}
                                                alt={selectedSkill.runeTag.name}
                                                className="w-5 h-5 rounded-sm"
                                            />
                                        )}
                                        <span className="text-[12px] font-black text-zinc-100">
                      {selectedSkill.runeTag.name}
                    </span>
                                    </div>
                                ) : (
                                    <div className="text-sm text-zinc-500">장착된 룬이 없습니다.</div>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <button className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-200 font-black text-sm hover:bg-white/[0.06] transition">
                                    모션 계산 상세보기
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
