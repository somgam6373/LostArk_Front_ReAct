import React, { useEffect, useMemo, useState } from 'react';
import { CharacterInfo } from '../../types.ts';
import {
    BarChart3, Zap, Shield, Sword, Activity,
    Heart, Sparkles, Star, Gem,
    RefreshCw, User, Shirt, ChevronDown, Swords, Wand2 , Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ---------------------- utils ----------------------

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const toIntSafe = (v: any, fallback: number) => {
    const n = typeof v === 'number' ? v : parseInt(String(v), 10);
    return Number.isFinite(n) ? n : fallback;
};

const toFloatSafe = (v: any, fallback: number) => {
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : fallback;
};

const deepClone = <T,>(obj: T): T => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sc = (globalThis as any).structuredClone;
    if (typeof sc === 'function') return sc(obj);
    return JSON.parse(JSON.stringify(obj));
};

const gemOptions = [
    ...Array.from({ length: 10 }, (_, i) => ({ key: `hong_${i + 1}`, label: `${i + 1}레벨 홍염` })),
    ...Array.from({ length: 10 }, (_, i) => ({ key: `jak_${i + 1}`, label: `${i + 1}레벨 작열` })),
    ...Array.from({ length: 10 }, (_, i) => ({ key: `mel_${i + 1}`, label: `${i + 1}레벨 멸화` })),
    ...Array.from({ length: 10 }, (_, i) => ({ key: `gap_${i + 1}`, label: `${i + 1}레벨 겁화` })),
];


// ---------------------- Internal Helper Components ----------------------

const EditableField = ({
                           label,
                           value,
                           onChange,
                           type = "number",
                           suffix = "",
                           min,
                           max,
                           step,
                       }: any) => (
    <div className="flex justify-between items-center border-b border-zinc-900/50 pb-3 group">
        <span className="text-[13px] text-zinc-500 font-bold uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
            <input
                type={type}
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange(e.target.value)}
                className="bg-transparent text-right text-lg font-black text-zinc-100 outline-none w-24 focus:text-indigo-400 transition-colors"
            />
            {suffix && <span className="text-[11px] font-bold text-zinc-600">{suffix}</span>}
        </div>
    </div>
);

const SectionCard = ({ title, icon: Icon, children, accent = "text-indigo-400" }: any) => (
    <div className="bg-surface/50 p-6 rounded-[2rem] border border-zinc-900/50 relative group shadow-lg">
        <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg bg-zinc-900 border border-zinc-800 ${accent}`}>
                <Icon size={18} />
            </div>
            <h4 className="text-[15px] font-black text-zinc-100 uppercase tracking-widest">{title}</h4>
        </div>
        <div className="space-y-4">{children}</div>
    </div>
);

const SectionHeader = ({
                           title,
                           icon: Icon,
                           right,
                           accentColor = "text-zinc-500",
                       }: { title: string; icon?: any; right?: React.ReactNode; accentColor?: string }) => (
    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2.5">
            {Icon && <Icon size={16} className={accentColor} />}
            <h3 className="text-[12px] font-black text-zinc-400 uppercase tracking-widest">{title}</h3>
        </div>
        {right}
    </div>
);

// ---------------------- Gem helpers ----------------------

type GemType = '멸화' | '홍염' | '작열' | '겁화';

const gemStyle = (t: GemType) => {
    switch (t) {
        case '멸화':
            return 'bg-red-500/10 border-red-500/20 text-red-200';
        case '홍염':
            return 'bg-blue-500/10 border-blue-500/20 text-blue-200';
        case '작열':
            return 'bg-amber-500/10 border-amber-500/20 text-amber-200';
        case '겁화':
            return 'bg-purple-500/10 border-purple-500/20 text-purple-200';
        default:
            return 'bg-zinc-900 border-zinc-800 text-white';
    }
};

const updateGem = (index: number, key: string) => {
    setChar((prev: any) => {
        const next = [...prev.gems];
        next[index] = { ...next[index], key };
        return { ...prev, gems: next };
    });
};


const normalizeGemsTo11 = (gems: any[] | undefined) => {
    const safe = Array.isArray(gems) ? gems.slice(0, 11) : [];
    while (safe.length < 11) safe.push({ type: '홍염', level: 1 });
    return safe.map((g) => ({
        type: (g?.type ?? '홍염') as GemType,
        level: clamp(toIntSafe(g?.level, 1), 1, 10),
    }));
};

type GemOptionValue = `${GemType}-${number}`;

const GEM_DROPDOWN_OPTIONS: { label: string; value: GemOptionValue; type: GemType; level: number }[] = [
    ...Array.from({ length: 10 }, (_, i) => ({ type: '홍염' as const, level: i + 1 })),
    ...Array.from({ length: 10 }, (_, i) => ({ type: '작열' as const, level: i + 1 })),
    ...Array.from({ length: 10 }, (_, i) => ({ type: '멸화' as const, level: i + 1 })),
    ...Array.from({ length: 10 }, (_, i) => ({ type: '겁화' as const, level: i + 1 })),
].map((x) => ({
    ...x,
    label: `${x.level}레벨 ${x.type}`,
    value: `${x.type}-${x.level}` as GemOptionValue,
}));

const toGemOptionValue = (g: { type: GemType; level: number }): GemOptionValue =>
    `${g.type}-${clamp(g.level, 1, 10)}` as GemOptionValue;

const parseGemOptionValue = (v: string): { type: GemType; level: number } | null => {
    const [typeRaw, levelRaw] = v.split('-');
    const type = typeRaw as GemType;
    const level = toIntSafe(levelRaw, 1);
    if (!['홍염', '작열', '멸화', '겁화'].includes(type)) return null;
    return { type, level: clamp(level, 1, 10) };
};

// ---------------------- Gear helpers ----------------------

const GEAR_SLOTS = ['머리', '어깨', '상의', '하의', '장갑', '무기'] as const;

const normalizeGear = (gear: any[] | undefined) => {
    const bySlot = new Map<string, any>();
    (Array.isArray(gear) ? gear : []).forEach((g) => {
        if (g?.slot) bySlot.set(String(g.slot), g);
    });

    return GEAR_SLOTS.map((slot) => {
        const src = bySlot.get(slot) ?? { slot };
        return {
            slot,
            quality: clamp(toIntSafe(src.quality, 0), 0, 100),
            normalRefine: clamp(toIntSafe(src.normalRefine ?? src.normal ?? src.refine, 1), 1, 25),
            advancedRefine: clamp(toIntSafe(src.advancedRefine ?? src.advanced ?? src.transLevel, 0), 0, 40),
            trans: src.trans ?? '',
        };
    });
};

// ---------------------- Main Simulator Component ----------------------

export const Simulator: React.FC<{ character: CharacterInfo }> = ({ character: initialCharacter }) => {
    const [subTab, setSubTab] = useState<'info' | 'synergy' | 'results'>('info');

    const initialNormalizedChar = useMemo(() => {
        const c: any = deepClone(initialCharacter);
        c.gems = normalizeGemsTo11(c.gems);
        c.gear = normalizeGear(c.gear);
        return c as CharacterInfo;
    }, [initialCharacter]);

    const [char, setChar] = useState<CharacterInfo>(initialNormalizedChar);
    const [selectedSkillIndex, setSelectedSkillIndex] = useState(0);
    const [selectedGemIndex, setSelectedGemIndex] = useState<number>(0);

    useEffect(() => {
        setChar(initialNormalizedChar);
        setSelectedSkillIndex(0);
        setSelectedGemIndex(0);
    }, [initialNormalizedChar]);

    const updateChar = (path: string, value: any) => {
        setChar((prev) => {
            const next: any = deepClone(prev);
            const keys = path.split('.');
            let current: any = next;
            for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
            current[keys[keys.length - 1]] = value;
            return next;
        });
    };

    const updateGear = (slot: string, patch: Partial<any>) => {
        setChar((prev) => {
            const next: any = deepClone(prev);
            next.gear = (next.gear ?? []).map((g: any) => (g.slot === slot ? { ...g, ...patch } : g));
            return next;
        });
    };

    const updateGem = (index: number, patch: Partial<any>) => {
        setChar((prev) => {
            const next: any = deepClone(prev);
            const gems = normalizeGemsTo11(next.gems);
            gems[index] = { ...gems[index], ...patch };
            next.gems = gems;
            return next;
        });
    };

    const selectedSkill = (char as any).skills?.[selectedSkillIndex] ?? { name: '', level: 0, damageContribution: 0 };

    return (
        <div className="space-y-8">
            {/* Simulation Top Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
                    {['데미지 비교', 'DPS 비교', '버프 비교'].map((tab, idx) => (
                        <button
                            key={tab}
                            className={`px-6 py-2.5 rounded-lg text-[13px] font-black tracking-widest transition-all ${
                                idx === 0 ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <button className="h-12 px-8 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-500 transition-all shadow-lg flex items-center gap-2">
                    <RefreshCw size={18} /> 시뮬레이션 실행
                </button>
            </div>

            {/* Sub-Tabs Nav */}
            <div className="flex gap-10 border-b border-zinc-900 px-4">
                {[
                    { id: 'info', label: '캐릭터 정보 세팅', icon: User },
                    { id: 'synergy', label: '시너지/버프 설정', icon: Zap },
                    { id: 'results', label: '데미지 분석 결과', icon: BarChart3 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setSubTab(tab.id as any)}
                        className={`flex items-center gap-2.5 pb-5 text-[15px] font-black transition-all relative ${
                            subTab === tab.id ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        {subTab === tab.id && (
                            <motion.div layoutId="simNav" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-indigo-500" />
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={subTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="pt-6 pb-20"
                >
                    {subTab === 'info' && (
                        <div className="space-y-8">

                            {/* 1행: 캐릭터 내실/펫 (FULL) */}
                            <SectionCard title="캐릭터 내실 / 펫" icon={Heart} accent="text-red-400">
                                {/* 기존 내실/펫 + 기본스탯 내용 */}
                                <div className="space-y-3">
                                    <EditableField
                                        label="아이템 레벨"
                                        value={char.itemLevel}
                                        onChange={(v: any) => updateChar('itemLevel', clamp(parseFloat(v), 0, 1750))}
                                    />
                                    <EditableField
                                        label="전투 레벨"
                                        value={char.battleLevel}
                                        onChange={(v: any) => updateChar('battleLevel', clamp(parseInt(v), 10, 70))}
                                    />
                                    <EditableField
                                        label="원정대 레벨"
                                        value={char.expeditionLevel}
                                        onChange={(v: any) => updateChar('expeditionLevel', clamp(parseInt(v), 1, 400))}
                                    />

                                    <div className="pt-6">
                                        <SectionHeader title="기본 스탯" icon={Activity} />
                                        <EditableField label="치명" value={char.innerStats.crit} onChange={(v: any) => updateChar('innerStats.crit', parseInt(v))} />
                                        <EditableField label="특화" value={char.innerStats.specialization} onChange={(v: any) => updateChar('innerStats.specialization', parseInt(v))} />
                                        <EditableField label="신속" value={char.innerStats.swiftness} onChange={(v: any) => updateChar('innerStats.swiftness', parseInt(v))} />
                                    </div>
                                </div>
                            </SectionCard>

                            {/* 2행: 장비 (FULL) */}
                            <SectionCard title="장비 (Gear)" icon={Shield} accent="text-orange-400">
                                {/* ✅ 너가 지금까지 확정한 장비 카드(침범 방지 버전) */}
                                <div className="space-y-3">
                                    {(char as any).gear?.map((item: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/50 w-full overflow-hidden"
                                        >
                                            <div className="flex items-center gap-6 w-full min-w-0">
                                                {/* LEFT */}
                                                <div className="flex items-center gap-4 shrink-0">
                                                    <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center text-[12px] font-black text-white border border-zinc-700">
                                                        {item.normalRefine}
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <span className="text-[15px] font-bold text-zinc-300">{item.slot}</span>

                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-black text-zinc-600 uppercase">일반</span>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                max={25}
                                                                value={item.normalRefine}
                                                                onChange={(e) =>
                                                                    updateGear(item.slot, {
                                                                        normalRefine: clamp(toIntSafe(e.target.value, item.normalRefine), 1, 25),
                                                                    })
                                                                }
                                                                className="bg-transparent text-zinc-200 font-black text-[12px] outline-none w-12 text-center border border-zinc-800 rounded-md py-1"
                                                            />

                                                            <span className="text-[10px] font-black text-zinc-600 uppercase ml-2">상급</span>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={40}
                                                                value={item.advancedRefine}
                                                                onChange={(e) =>
                                                                    updateGear(item.slot, {
                                                                        advancedRefine: clamp(toIntSafe(e.target.value, item.advancedRefine), 0, 40),
                                                                    })
                                                                }
                                                                className="bg-transparent text-zinc-200 font-black text-[12px] outline-none w-12 text-center border border-zinc-800 rounded-md py-1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* RIGHT */}
                                                <div className="flex-1 min-w-0 flex items-center justify-end gap-4">
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={100}
                                                            value={item.quality}
                                                            onChange={(e) =>
                                                                updateGear(item.slot, {
                                                                    quality: clamp(toIntSafe(e.target.value, item.quality), 0, 100),
                                                                })
                                                            }
                                                            className="bg-transparent text-right text-lg font-black text-orange-400 outline-none w-16"
                                                        />
                                                        <span className="text-[10px] font-bold text-zinc-600 uppercase">품질</span>
                                                    </div>

                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        value={item.quality}
                                                        onChange={(e) =>
                                                            updateGear(item.slot, {
                                                                quality: clamp(toIntSafe(e.target.value, item.quality), 0, 100),
                                                            })
                                                        }
                                                        className="flex-1 min-w-0 w-full max-w-[240px] xl:max-w-[300px] accent-indigo-500 opacity-70 hover:opacity-100 transition-opacity"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            {/* 3행: 진화 / 깨달음 / 도약 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <SectionCard title="진화 (Evolution)" icon={Sparkles} accent="text-amber-400">
                                    {/* 기존 진화 UI */}
                                    <div className="grid grid-cols-5 gap-3">
                                        {Array.from({ length: 20 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${
                                                    i < 5 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-zinc-900 border-zinc-800 opacity-30'
                                                }`}
                                            >
                                                <Star size={16} className={i < 5 ? 'text-amber-400' : 'text-zinc-700'} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-zinc-900/50">
                                        <EditableField
                                            label="진화 잔여 포인트"
                                            value={char.arkPassivePoints.evolution}
                                            onChange={(v: any) => updateChar('arkPassivePoints.evolution', parseInt(v))}
                                        />
                                    </div>
                                </SectionCard>

                                <SectionCard title="깨달음 (Enlightenment)" icon={Wand2} accent="text-sky-400">
                                    <div className="text-sm text-zinc-500 font-bold">준비중</div>
                                </SectionCard>

                                <SectionCard title="도약 (Leap)" icon={Flame} accent="text-rose-400">
                                    <div className="text-sm text-zinc-500 font-bold">준비중</div>
                                </SectionCard>
                            </div>

                            {/* 4행: 보석 (FULL) */}
                            <SectionCard title="보석 (Gems)" icon={Gem} accent="text-emerald-400">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {(char as any).gems?.map((g: any, i: number) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/50 rounded-xl px-4 py-3"
                                        >
        <span className="text-[13px] font-black text-zinc-300">
          슬롯 {i + 1}
        </span>

                                            <select
                                                value={g.key}
                                                onChange={(e) => updateGem(i, e.target.value)}
                                                className="bg-zinc-950/40 border border-zinc-800 text-zinc-200 font-bold text-[12px] rounded-lg px-3 py-2 outline-none focus:border-indigo-500/40 w-44 sm:w-52"
                                            >
                                                <option value="">선택 없음</option>
                                                {gemOptions.map((opt) => (
                                                    <option key={opt.key} value={opt.key}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>


                            {/* 5행: 각인 (FULL) */}
                            <SectionCard title="각인 (Engravings)" icon={Sparkles} accent="text-indigo-400">
                                <div className="space-y-2.5">
                                    {(char as any).engravings?.map((eng: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between border-b border-zinc-900/50 pb-2.5">
                                            <span className="text-[15px] font-bold text-zinc-300">{eng.name}</span>
                                            <span className="text-[13px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-md border border-indigo-400/20">
              Lv. {eng.level}
            </span>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                        </div>
                    )}


                    {/* Results View: 원본 유지 */}
                    {subTab === 'results' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-surface rounded-[2.5rem] border border-zinc-900 p-10 min-h-[700px]">
                            <div className="lg:col-span-5 space-y-8 border-r border-zinc-900/50 pr-10">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black text-zinc-100 italic">SKILLS</h3>
                                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase">
                                        Sort <ChevronDown size={14} />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {(char as any).skills?.map((skill: any, i: number) => (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedSkillIndex(i)}
                                            className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                                                selectedSkillIndex === i ? 'bg-zinc-800 border-indigo-500/30' : 'bg-zinc-950/20 border-zinc-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                                                    <Sword size={20} className={selectedSkillIndex === i ? 'text-indigo-400' : 'text-zinc-700'} />
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-bold text-zinc-100">{skill.name}</p>
                                                    <div className="h-1.5 w-24 bg-zinc-900 rounded-full mt-1.5 overflow-hidden">
                                                        <div className="h-full bg-indigo-500" style={{ width: `${skill.damageContribution}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-lg font-black text-white italic">{(skill.damageContribution * 0.25).toFixed(1)}억</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-7 flex flex-col items-center justify-center text-center space-y-10">
                                <div className="space-y-4">
                                    <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                                        <Zap size={36} />
                                    </div>
                                    <h3 className="text-4xl font-black text-zinc-100 italic">{selectedSkill.name}</h3>
                                    <div className="pt-4">
                                        <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1">Expected Damage</p>
                                        <p className="text-7xl font-black text-white italic tracking-tighter">
                                            {(selectedSkill.damageContribution * 0.25).toFixed(2)}
                                            <span className="text-2xl text-zinc-700 ml-2">억</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 w-full max-w-lg bg-zinc-950/40 p-8 rounded-[2rem] border border-zinc-900/50">
                                    <div className="space-y-2">
                                        <p className="text-blue-400 text-xs font-black uppercase">CASE 1 (Crit)</p>
                                        <p className="text-3xl font-black text-white">9.6억</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-pink-400 text-xs font-black uppercase">CASE 2 (Normal)</p>
                                        <p className="text-3xl font-black text-white">2.8억</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
