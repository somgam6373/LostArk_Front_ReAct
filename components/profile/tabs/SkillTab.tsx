import React, { useEffect, useState } from 'react';
import { Loader2, Clock, Sword, Timer, ShieldAlert } from 'lucide-react';
import { SkillTooltip } from '@/components/profile/Tooltip/SkillTooltip';
import JewelryTooltip from '@/components/profile/Tooltip/JewelryTooltip';

/* ================= 스타일 및 유틸 ================= */
const gradeStyles: any = {
    '일반': { bg: 'from-zinc-800 to-zinc-950', border: 'border-white/10' },
    '고급': { bg: 'from-[#1a2e1a] to-[#0a0f0a]', border: 'border-[#48c948]/30' },
    '희귀': { bg: 'from-[#1a2a3e] to-[#0a0d12]', border: 'border-[#00b0fa]/30' },
    '영웅': { bg: 'from-[#2e1a3e] to-[#120a1a]', border: 'border-[#ce43fb]/30' },
    '전설': { bg: 'from-[#41321a] to-[#1a120a]', border: 'border-[#f99200]/40' },
    '유물': { bg: 'from-[#351a0a] to-[#0a0a0a]', border: 'border-[#fa5d00]/50' },
    '고대': { bg: 'from-[#3d3325] to-[#0f0f10]', border: 'border-[#e9d2a6]/40' },
    '에스더': { bg: 'from-[#0d2e2e] to-[#050505]', border: 'border-[#2edbd3]/60' }
};

const cleanHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<br[^>]*>/gi, "\n").replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
};

const getSkillStats = (skills: any[]) => {
    const stats = { counter: 0, stagger: 0, destruction: 0 };
    skills.forEach(skill => {
        const tooltipStr = skill.Tooltip || "";
        if (tooltipStr.includes("카운터 : 가능") || tooltipStr.includes("카운터 가능")) stats.counter++;
        if (tooltipStr.includes("무력화 :")) stats.stagger++;
        if (tooltipStr.includes("부위 파괴 : 레벨")) stats.destruction++;
    });
    return stats;
};

/* ================= 컴포넌트 ================= */

const SkillStatsBar = ({ skills }: { skills: any[] }) => {
    const { counter, stagger, destruction } = getSkillStats(skills);
    return (
        <div className="flex items-center justify-center mb-4 px-4">
            <div className="flex items-center gap-4 px-5 py-2 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
                {[
                    { label: '카운터', val: counter },
                    { label: '무력화', val: stagger },
                    { label: '부위 파괴', val: destruction }
                ].map((item, idx) => (
                    <div key={idx} className="flex items-baseline gap-2 pr-4 border-r border-white/5 last:border-0 last:pr-0">
                        <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">{item.label}</span>
                        <span className="text-base font-black tracking-tighter text-zinc-200">{item.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ✅ GemItem: 호버 상태를 부모에게 보고하도록 수정
const GemItem = ({ gem, onHoverChange }: { gem: any, onHoverChange: (isHover: boolean) => void }) => {
    const [isHover, setIsHover] = useState(false);

    return (
        <div
            className="relative flex flex-col items-end gap-0.5"
            onMouseEnter={() => {
                setIsHover(true);
                onHoverChange(true);
            }}
            onMouseLeave={() => {
                setIsHover(false);
                onHoverChange(false);
            }}
        >
            <div className="relative group/gem cursor-help">
                <img
                    src={gem.Icon}
                    className="w-7 h-7 object-contain drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]"
                    alt="gem"
                />
                <div className="absolute -top-1 -right-1 bg-zinc-900 text-[8px] px-0.5 rounded border border-zinc-700 font-bold text-white">
                    {gem.Level}
                </div>
            </div>

            <div className="flex flex-col items-end leading-none">
                {gem.Description.map((desc: string, dIdx: number) => {
                    const isDmg = desc.includes("피해");
                    return (
                        <span key={dIdx} className={`text-[9px] font-black tracking-tighter ${isDmg ? 'text-orange-400' : 'text-cyan-400'}`}>
                            {desc.match(/(\d+\.?\d*%)/)?.[0] || desc}
                        </span>
                    );
                })}
            </div>

            {isHover && gem.originalData && (
                <div className="absolute right-full top-0 z-[999] pr-4 pointer-events-none">
                    <div className="animate-in fade-in zoom-in-95 duration-150">
                        <JewelryTooltip gemData={gem.originalData} />
                    </div>
                </div>
            )}
        </div>
    );
};

const SkillCard = ({ skill, matchedGems }: { skill: any, matchedGems: any[] }) => {
    const [isGemHovering, setIsGemHovering] = useState(false); // 보석 호버 상태 관리

    const sTooltip = JSON.parse(skill.Tooltip || "{}");
    let cooldown = "", description = "";

    Object.entries(sTooltip).forEach(([_, el]: [any, any]) => {
        const val = el.value;
        if (!val) return;
        if (el.type === "CommonSkillTitle") cooldown = cleanHtml(val.leftText);
        if (typeof val === 'string' && val.includes("피해를") && !description) description = cleanHtml(val.split('<BR>')[0]);
    });

    const selectedTripods = skill.Tripods?.filter((t: any) => t.IsSelected) || [];
    const rStyle = gradeStyles[skill.Rune?.Grade] || gradeStyles['일반'];

    return (
        <div className="group relative px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 w-full z-10 hover:z-[50] hover:bg-white/[0.04] border border-transparent hover:border-white/5">
            {/* 1. 스킬 기본 정보 */}
            <div className="flex items-center gap-2.5 w-[180px] shrink-0">
                <div className="relative shrink-0">
                    <img src={skill.Icon} className="w-10 h-10 rounded-lg border border-zinc-700" alt="" />
                    <div className="absolute -bottom-1 -right-1 bg-black/80 px-1 py-0 rounded text-[9px] font-black border border-white/20 text-zinc-100 leading-none">
                        {skill.Level}
                    </div>
                </div>
                <div className="min-w-0">
                    <h4 className="text-[13px] font-bold truncate text-zinc-100">{skill.Name}</h4>
                    {cooldown && (
                        <div className="flex items-center gap-1 text-zinc-500">
                            <Clock size={10} />
                            <span className="text-[10px] font-medium tracking-tighter truncate">{cooldown.replace("재사용 대기시간 ","")}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. 트라이포드 & 룬 */}
            <div className="flex-1 flex items-center justify-start gap-1 min-w-0 px-2 border-l border-white/5">
                <div className="flex gap-1 shrink-0">
                    {selectedTripods.map((tp: any, i: number) => (
                        <div key={i} className="w-7 h-7 rounded-md bg-purple-500/10 border border-purple-500/20 p-0.5">
                            <img src={tp.Icon} className="w-full h-full object-contain" alt="" title={tp.Name} />
                        </div>
                    ))}
                </div>
                <div className="ml-2 pl-2 border-l border-white/5 shrink-0">
                    {skill.Rune ? (
                        <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${rStyle.bg} border ${rStyle.border} p-0.5 shadow-sm`}>
                            <img src={skill.Rune.Icon} className="w-full h-full object-contain" alt="" />
                        </div>
                    ) : (
                        <div className="w-7 h-7 rounded-md border border-dashed border-white/5 opacity-20" />
                    )}
                </div>
            </div>

            {/* 3. 장착 보석 정보 */}
            <div className="w-[180px] shrink-0 flex justify-end gap-1.5 items-center">
                {matchedGems && matchedGems.length > 0 ? (
                    matchedGems.map((gem, i) => (
                        <GemItem
                            key={i}
                            gem={gem}
                            onHoverChange={(hover) => setIsGemHovering(hover)}
                        />
                    ))
                ) : (
                    <span className="text-[10px] text-zinc-800 font-bold pr-2">NO GEMS</span>
                )}
            </div>

            {/* ✅ 보석을 호버 중이지 않을 때만 스킬 툴팁을 렌더링 */}
            {!isGemHovering && (
                <SkillTooltip description={description} selectedTripods={selectedTripods} rune={skill.Rune} />
            )}
        </div>
    );
};

export const SkillTab = ({ character }: { character: any }) => {
    const [skills, setSkills] = useState<any[]>([]);
    const [gems, setGems] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!character?.CharacterName) return;
        setLoading(true);

        Promise.all([
            fetch(`/combat-skills?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/gems?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json())
        ])
            .then(([skillJson, gemJson]) => {
                setSkills(skillJson.filter((s: any) => s.SkillType !== 100 && s.Level > 1).sort((a: any, b: any) => b.Level - a.Level));
                setGems(gemJson);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [character?.CharacterName]);

    if (loading) return (
        <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-purple-500 w-8 h-8 mb-4" />
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading Profile...</span>
        </div>
    );

    return (
        <section className="mt-4 pb-10">
            <div className="bg-[#0c0c0d] rounded-2xl border border-white/5 p-4 shadow-xl overflow-visible">
                {skills.length > 0 && <SkillStatsBar skills={skills} />}

                <div className="flex flex-col gap-1 overflow-visible">
                    {skills.length > 0 ? (
                        skills.map((s, i) => {
                            const matchedGems = gems?.Effects?.Skills?.filter((gs: any) => gs.Name === s.Name) || [];
                            const enhancedGems = matchedGems.map((mg: any) => {
                                const originalGem = gems.Gems.find((g: any) => g.Slot === mg.GemSlot);
                                return {
                                    ...mg,
                                    Icon: originalGem?.Icon,
                                    Level: originalGem?.Level,
                                    originalData: originalGem
                                };
                            });

                            return <SkillCard key={i} skill={s} matchedGems={enhancedGems} />;
                        })
                    ) : (
                        <div className="py-20 flex flex-col items-center gap-4 text-zinc-700">
                            <ShieldAlert size={40} strokeWidth={1} />
                            <p className="font-bold text-xs">데이터가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};