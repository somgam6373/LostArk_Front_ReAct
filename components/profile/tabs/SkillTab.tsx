import React, { useEffect, useState, useMemo } from 'react';
import { Loader2, Clock, Sword, ShieldAlert, Sparkles, Copy, Check } from 'lucide-react';
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

const ALLOW_LEVEL_1_TRANS = ['블래스터', '데모닉', '스카우터'];

const TRANSFORMATION_KEYWORDS: Record<string, string> = {
    '블래스터': '[포격 모드]',
    '데모닉': '[악마 스킬]',
    '스카우터': '[싱크 스킬]',
    '환수사': '[둔갑 스킬]',
    '가디언나이트': '[화신 스킬]'
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
    );
};

const GemItem = ({ gem, onHoverChange }: { gem: any, onHoverChange: (isHover: boolean) => void }) => {
    const [isHover, setIsHover] = useState(false);
    return (
        <div className="relative flex flex-col items-end gap-0.5"
             onMouseEnter={() => { setIsHover(true); onHoverChange(true); }}
             onMouseLeave={() => { setIsHover(false); onHoverChange(false); }}>
            <div className="relative group/gem cursor-help">
                <img src={gem.Icon} className="w-7 h-7 object-contain drop-shadow-[0_0_3px_rgba(0,0,0,0.5)]" alt="gem" />
                <div className="absolute -top-1 -right-1 bg-zinc-900 text-[8px] px-0.5 rounded border border-zinc-700 font-bold text-white">{gem.Level}</div>
            </div>
            <div className="flex flex-col items-end leading-none">
                {gem.Description.map((desc: string, dIdx: number) => (
                    <span key={dIdx} className={`text-[9px] font-black tracking-tighter ${desc.includes("피해") ? 'text-orange-400' : 'text-cyan-400'}`}>
                        {desc.match(/(\d+\.?\d*%)/)?.[0] || desc}
                    </span>
                ))}
            </div>
            {isHover && gem.originalData && (
                <div className="absolute right-full top-0 z-[999] pr-4 pointer-events-none">
                    <div className="animate-in fade-in zoom-in-95 duration-150"><JewelryTooltip gemData={gem.originalData} /></div>
                </div>
            )}
        </div>
    );
};

const SkillCard = ({ skill, matchedGems, isTrans }: { skill: any, matchedGems: any[], isTrans?: boolean }) => {
    const [isGemHovering, setIsGemHovering] = useState(false);
    const { cooldown, description } = useMemo(() => {
        try {
            const sTooltip = JSON.parse(skill.Tooltip || "{}");
            let cd = "", desc = "";
            Object.values(sTooltip).forEach((el: any) => {
                if (el.type === "CommonSkillTitle") cd = cleanHtml(el.value.leftText);
                if (typeof el.value === 'string' && el.value.includes("피해를") && !desc) desc = cleanHtml(el.value.split('<BR>')[0]);
            });
            return { cooldown: cd, description: desc };
        } catch { return { cooldown: "", description: "" }; }
    }, [skill.Tooltip]);

    const selectedTripods = skill.Tripods?.filter((t: any) => t.IsSelected) || [];
    const rStyle = gradeStyles[skill.Rune?.Grade] || gradeStyles['일반'];

    return (
        <div className={`group relative px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 w-full z-10 hover:z-[50] border border-transparent hover:border-white/10 ${isTrans ? 'bg-purple-500/[0.03] hover:bg-purple-500/[0.08]' : 'hover:bg-white/[0.04]'}`}>
            <div className="flex items-center gap-2.5 w-[180px] shrink-0">
                <div className="relative shrink-0">
                    <img src={skill.Icon} className={`w-10 h-10 rounded-lg border ${isTrans ? 'border-purple-500/40' : 'border-zinc-700'}`} alt="" />
                    <div className="absolute -bottom-1 -right-1 bg-black/80 px-1 py-0 rounded text-[9px] font-black border border-white/20 text-zinc-100 leading-none">{skill.Level}</div>
                </div>
                <div className="min-w-0">
                    <h4 className={`text-[13px] font-bold truncate ${isTrans ? 'text-purple-200' : 'text-zinc-100'}`}>{skill.Name}</h4>
                    {cooldown && (
                        <div className="flex items-center gap-1 text-zinc-500">
                            <Clock size={10} />
                            <span className="text-[10px] font-medium tracking-tighter truncate">{cooldown.replace("재사용 대기시간 ","")}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 flex items-center justify-start gap-1 min-w-0 px-2 border-l border-white/5">
                <div className="flex gap-1 shrink-0">
                    {selectedTripods.map((tp: any, i: number) => (
                        <div key={i} className="w-7 h-7 rounded-md bg-purple-500/10 border border-purple-500/20 p-0.5">
                            <img src={tp.Icon} className="w-full h-full object-contain" alt="" title={tp.Name} />
                        </div>
                    ))}
                </div>
                {skill.Rune && (
                    <div className="ml-2 pl-2 border-l border-white/5 shrink-0">
                        <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${rStyle.bg} border ${rStyle.border} p-0.5 shadow-sm`}>
                            <img src={skill.Rune.Icon} className="w-full h-full object-contain" alt="" />
                        </div>
                    </div>
                )}
            </div>

            <div className="w-[180px] shrink-0 flex justify-end gap-1.5 items-center">
                {matchedGems.map((gem, i) => <GemItem key={i} gem={gem} onHoverChange={setIsGemHovering} />)}
            </div>
            {!isGemHovering && <SkillTooltip description={description} selectedTripods={selectedTripods} rune={skill.Rune} />}
        </div>
    );
};

export const SkillTab = ({ character }: { character: any }) => {
    const [normalSkills, setNormalSkills] = useState<any[]>([]);
    const [transSkills, setTransSkills] = useState<any[]>([]);
    const [gems, setGems] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [isCopying, setIsCopying] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (!character?.CharacterName) return;
        setLoading(true);

        Promise.all([
            fetch(`/combat-skills?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/gems?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json())
        ])
            .then(([skillJson, gemJson]) => {
                const className = character.CharacterClassName;
                const keyword = TRANSFORMATION_KEYWORDS[className];
                const allowLvl1 = ALLOW_LEVEL_1_TRANS.includes(className);

                const filteredBySystem = skillJson.filter((s: any) => {
                    const isAwakening = s.SkillType === 100;
                    const isHyperAwakening = s.SkillType === 1;
                    return !isAwakening && !isHyperAwakening;
                });

                const trans = filteredBySystem.filter((s: any) => {
                    const hasKeyword = keyword && s.Tooltip?.includes(keyword);
                    if (!hasKeyword) return false;
                    return allowLvl1 ? true : s.Level > 1;
                });

                const normal = filteredBySystem.filter((s: any) => {
                    const isLvlValid = s.Level > 1;
                    const isAlreadyTrans = trans.some((ts: any) => ts.Name === s.Name);
                    return isLvlValid && !isAlreadyTrans;
                });

                setNormalSkills(normal.sort((a: any, b: any) => b.Level - a.Level));
                setTransSkills(trans);
                setGems(gemJson);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [character?.CharacterName, character?.CharacterClassName]);

    // ✅ 백엔드 Mono<String> 응답에 맞춘 복사 로직
    const handleCopyCode = async () => {
        if (isCopying || !character?.CharacterName) return;

        setIsCopying(true);
        try {
            const res = await fetch(
                `/skillcode?name=${encodeURIComponent(character.CharacterName)}&_t=${Date.now()}`,
                { cache: 'no-store' }
            );

            if (!res.ok) throw new Error('API request failed');

            // 🟢 중요: 백엔드가 Mono<String>을 반환하므로 res.text()로 직접 받습니다.
            const skillCode = await res.text();

            if (skillCode) {
                // 클립보드 복사 (안전한 컨텍스트 우선)
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(skillCode.trim());
                } else {
                    // Fallback
                    const textArea = document.createElement("textarea");
                    textArea.value = skillCode.trim();
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                }

                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            }
        } catch (err) {
            console.error("복사 실패:", err);
            alert("스킬 코드를 가져오는 데 실패했습니다.");
        } finally {
            setIsCopying(false);
        }
    };

    if (loading) return (
        <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-purple-500 w-8 h-8 mb-4" />
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading Profile...</span>
        </div>
    );

    const renderSkillList = (skillList: any[], isTrans = false) => (
        skillList.map((s, i) => {
            const matchedGems = gems?.Effects?.Skills?.filter((gs: any) => gs.Name === s.Name) || [];
            const enhancedGems = matchedGems.map((mg: any) => {
                const originalGem = gems.Gems.find((g: any) => g.Slot === mg.GemSlot);
                return { ...mg, Icon: originalGem?.Icon, Level: originalGem?.Level, originalData: originalGem };
            });
            return <SkillCard key={i} skill={s} matchedGems={enhancedGems} isTrans={isTrans} />;
        })
    );

    const transTitle = TRANSFORMATION_KEYWORDS[character.CharacterClassName] || "Identity Skills";

    return (
        <section className="mt-4 pb-10">
            <div className="bg-[#0c0c0d] rounded-2xl border border-white/5 p-4 shadow-xl overflow-visible">

                <div className="flex flex-col md:flex-row items-center justify-between mb-6 px-1 gap-4">
                    {(normalSkills.length > 0 || transSkills.length > 0) ? (
                        <SkillStatsBar skills={[...normalSkills, ...transSkills]} />
                    ) : <div />}

                    <button
                        onClick={handleCopyCode}
                        disabled={isCopying}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 group h-10
                            ${copySuccess
                            ? 'border-green-500/40 bg-green-500/10 text-green-400'
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'}`}
                    >
                        {isCopying ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : copySuccess ? (
                            <Check size={14} />
                        ) : (
                            <Copy size={14} className="group-hover:rotate-12 transition-transform" />
                        )}
                        <span className="text-[11px] font-black uppercase tracking-wider">
                            {copySuccess ? 'Copied!' : 'Copy Skill Code'}
                        </span>
                    </button>
                </div>

                <div className="flex flex-col gap-8 overflow-visible">
                    {normalSkills.length > 0 && (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <Sword size={14} className="text-zinc-600" />
                                <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Combat Skills</span>
                            </div>
                            {renderSkillList(normalSkills)}
                        </div>
                    )}

                    {transSkills.length > 0 && (
                        <div className="flex flex-col gap-1 p-3.5 rounded-2xl bg-purple-500/[0.03] border border-purple-500/10 shadow-[inset_0_0_20px_rgba(168,85,247,0.02)]">
                            <div className="flex items-center gap-2 mb-2.5 px-1">
                                <Sparkles size={14} className="text-purple-400" />
                                <span className="text-[11px] font-black text-purple-400 uppercase tracking-[0.15em]">{transTitle}</span>
                            </div>
                            {renderSkillList(transSkills, true)}
                        </div>
                    )}

                    {normalSkills.length === 0 && transSkills.length === 0 && (
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