
import React, { useState, useEffect } from 'react';
import { CharacterInfo, GemInfo, SkillInfo, GearInfo, Engraving } from '../types';
import { 
  Plus, Minus, Calculator, BarChart3, Zap, Shield, 
  Target, Sword, Activity, LayoutGrid, Info, 
  ChevronDown, Layers, Search, Heart, Sparkles,
  Trophy, Wand2, Star, Flame, Wind, Crosshair,
  FastForward, Swords, ShieldAlert,
  User, CreditCard, Shirt, Palette, Gem, RefreshCw,
  ExternalLink, MousePointer2, Settings, X, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Internal Helper Components ---

// Fix: Changed 'class' to 'className'
const EditableField = ({ label, value, onChange, type = "number", suffix = "" }: any) => (
  <div className="flex justify-between items-center border-b border-zinc-900/50 pb-2 group">
    <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-1">
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-right text-xs font-black text-zinc-100 outline-none w-20 focus:text-indigo-400 transition-colors"
      />
      {suffix && <span className="text-[9px] font-bold text-zinc-600">{suffix}</span>}
    </div>
  </div>
);

// Fix: Changed 'class' to 'className'
const SectionCard = ({ title, icon: Icon, children, accent = "text-indigo-400" }: any) => (
  <div className="bg-surface/50 p-5 rounded-[2rem] border border-zinc-900/50 relative group">
    <div className="flex items-center gap-3 mb-5">
      <div className={`p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 ${accent}`}>
        <Icon size={14} />
      </div>
      <h4 className="text-[10px] font-black text-zinc-100 uppercase tracking-widest">{title}</h4>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

// Fix: Added missing SectionHeader helper component
const SectionHeader = ({ title, icon: Icon, right, accentColor = "text-zinc-500" }: { title: string, icon?: any, right?: React.ReactNode, accentColor?: string }) => (
  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={16} className={accentColor} />}
      <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest">{title}</h3>
    </div>
    {right}
  </div>
);

// --- Main Simulator Component ---

export const Simulator: React.FC<{ character: CharacterInfo }> = ({ character: initialCharacter }) => {
  const [subTab, setSubTab] = useState<'info' | 'synergy' | 'results'>('info');
  const [char, setChar] = useState<CharacterInfo>(initialCharacter);
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(0);
  const [editingNode, setEditingNode] = useState<{tab: string, index: number} | null>(null);

  // Synergy & Result state (keep existing logic)
  const [direction, setDirection] = useState<'back' | 'front' | 'none' | 'default'>('default');
  const [activeSynergies, setActiveSynergies] = useState<string[]>(['블레이드', '기상술사']);

  const updateChar = (path: string, value: any) => {
    // Simple state updater (In a real app, use a deep merge utility)
    const newChar = { ...char };
    const keys = path.split('.');
    let current: any = newChar;
    for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]];
    current[keys[keys.length - 1]] = value;
    setChar(newChar);
  };

  const selectedSkill = char.skills[selectedSkillIndex];

  return (
    // Fix: Changed all 'class' to 'className'
    <div className="space-y-6">
      {/* Simulation Top Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          {['데미지 비교', 'DPS 비교', '버프 비교'].map((tab, idx) => (
            <button key={tab} className={`px-4 py-2 rounded-lg text-xs font-black tracking-widest transition-all ${idx === 0 ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-600 hover:text-zinc-400'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="h-10 px-6 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-500 transition-all shadow-lg flex items-center gap-2">
            <RefreshCw size={14} /> 시뮬레이션 실행
          </button>
        </div>
      </div>

      {/* Sub-Tabs Nav */}
      <div className="flex gap-10 border-b border-zinc-900 px-4">
        {[
          { id: 'info', label: '캐릭터 정보 세팅', icon: User },
          { id: 'synergy', label: '시너지/버프 설정', icon: Zap },
          { id: 'results', label: '데미지 분석 결과', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id} onClick={() => setSubTab(tab.id as any)}
            className={`flex items-center gap-2 pb-5 text-xs font-black transition-all relative ${subTab === tab.id ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <tab.icon size={14} />
            {tab.label}
            {subTab === tab.id && <motion.div layoutId="simNav" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={subTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-8 pb-32">
          
          {subTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              
              {/* Column 1: Core & Passives */}
              <div className="space-y-6">
                <SectionCard title="캐릭터 내실 / 펫" icon={Heart} accent="text-red-400">
                  <div className="grid grid-cols-1 gap-2">
                    <EditableField label="아이템 레벨" value={char.itemLevel} onChange={(v: any) => updateChar('itemLevel', parseFloat(v))} />
                    <EditableField label="전투 레벨" value={char.battleLevel} onChange={(v: any) => updateChar('battleLevel', parseInt(v))} />
                    <EditableField label="원정대 레벨" value={char.expeditionLevel} onChange={(v: any) => updateChar('expeditionLevel', parseInt(v))} />
                    <div className="pt-4 space-y-2">
                       <SectionHeader title="기본 스탯" icon={Activity} accentColor="text-zinc-500" />
                       <EditableField label="치명" value={char.innerStats.crit} onChange={(v: any) => updateChar('innerStats.crit', parseInt(v))} />
                       <EditableField label="특화" value={char.innerStats.specialization} onChange={(v: any) => updateChar('innerStats.specialization', parseInt(v))} />
                       <EditableField label="신속" value={char.innerStats.swiftness} onChange={(v: any) => updateChar('innerStats.swiftness', parseInt(v))} />
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="진화 (Evolution)" icon={Sparkles} accent="text-amber-400">
                  <div className="grid grid-cols-5 gap-3">
                    {Array.from({length: 20}).map((_, i) => (
                      <div 
                        key={i} 
                        onClick={() => setEditingNode({tab: '진화', index: i})}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${i < 5 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-zinc-900 border-zinc-800 opacity-40'}`}
                      >
                        <Star size={14} className={i < 5 ? 'text-amber-400' : 'text-zinc-700'} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-900/50">
                     <EditableField label="진화 잔여 포인트" value={char.arkPassivePoints.evolution} onChange={(v: any) => updateChar('arkPassivePoints.evolution', parseInt(v))} />
                  </div>
                </SectionCard>

                <SectionCard title="깨달음 (Enlightenment)" icon={Wand2} accent="text-cyan-400">
                  <div className="grid grid-cols-5 gap-3 justify-items-center">
                    <div className="col-start-3"><div className="w-10 h-10 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center"><Flame size={14} className="text-cyan-400"/></div></div>
                    <div className="col-start-3 row-start-2"><div className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center opacity-40"><Shield size={14} className="text-zinc-700"/></div></div>
                  </div>
                </SectionCard>

                <SectionCard title="도약 (Leap)" icon={Zap} accent="text-lime-400">
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({length: 6}).map((_, i) => (
                      <div key={i} className={`w-9 h-9 rounded-full border-2 flex items-center justify-center cursor-pointer ${i === 0 || i === 3 ? 'bg-lime-500/10 border-lime-500/30' : 'bg-zinc-900 border-zinc-800 opacity-40'}`}>
                         <Zap size={14} className={i === 0 || i === 3 ? 'text-lime-400' : 'text-zinc-700'} />
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="카르마 (Karma)" icon={Trophy} accent="text-indigo-400">
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black">
                         <span className="text-zinc-500 uppercase">연마 단계</span>
                         <span className="text-zinc-100">3단계 12레벨</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500 w-[60%]" />
                      </div>
                   </div>
                </SectionCard>
              </div>

              {/* Column 2: Gear & Engravings */}
              <div className="space-y-6">
                <SectionCard title="장비 (Gear)" icon={Shield} accent="text-orange-400">
                  <div className="space-y-3">
                    {char.gear.map((item, idx) => (
                      <div key={idx} className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <input 
                             type="number" 
                             value={item.honingLevel} 
                             onChange={(e) => {
                               const newGear = [...char.gear];
                               newGear[idx].honingLevel = parseInt(e.target.value);
                               updateChar('gear', newGear);
                             }}
                             className="w-8 bg-zinc-800 text-center rounded text-[10px] font-black text-white p-1"
                           />
                           <span className="text-[10px] font-black text-zinc-300">{item.slot}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <input 
                             type="number" 
                             value={item.quality} 
                             onChange={(e) => {
                               const newGear = [...char.gear];
                               newGear[idx].quality = parseInt(e.target.value);
                               updateChar('gear', newGear);
                             }}
                             className="w-10 bg-transparent text-right text-[10px] font-black text-orange-400 outline-none"
                           />
                           <span className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter">{item.trans}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="각인 (Engravings)" icon={Sparkles} accent="text-indigo-400">
                  <div className="space-y-3">
                    {char.engravings.map((eng, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-zinc-900/50 pb-2">
                        <span className="text-[10px] font-black text-zinc-300">{eng.name}</span>
                        <div className="flex items-center gap-2">
                           <input 
                             type="number" 
                             value={eng.level} 
                             onChange={(e) => {
                               const newEng = [...char.engravings];
                               newEng[idx].level = parseInt(e.target.value);
                               updateChar('engravings', newEng);
                             }}
                             className="w-10 bg-zinc-800 text-center rounded text-[10px] font-black text-zinc-100 p-0.5"
                           />
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>

              {/* Column 3: Accs, Gems, Skills, Avatar */}
              <div className="space-y-6">
                <SectionCard title="악세사리 (Accessories)" icon={Wand2} accent="text-purple-400">
                  <div className="space-y-3">
                    {char.accessories.map((acc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-zinc-900/30 rounded-lg border border-zinc-800">
                         <span className="text-[10px] font-black text-zinc-400">{acc.slot}</span>
                         <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-zinc-600">{acc.stats}</span>
                            <input 
                              type="number" 
                              value={acc.quality} 
                              onChange={(e) => {
                                const newAcc = [...char.accessories];
                                newAcc[idx].quality = parseInt(e.target.value);
                                updateChar('accessories', newAcc);
                              }}
                              className="w-8 text-right bg-transparent text-[10px] font-black text-purple-400 outline-none"
                            />
                         </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="보석 (Gems)" icon={Gem} accent="text-emerald-400">
                  <div className="grid grid-cols-4 gap-2">
                    {char.gems.map((gem, idx) => (
                      <div key={idx} className="relative">
                         <input 
                           type="number" 
                           value={gem.level} 
                           onChange={(e) => {
                             const newGems = [...char.gems];
                             newGems[idx].level = parseInt(e.target.value);
                             updateChar('gems', newGems);
                           }}
                           className={`w-full aspect-square rounded-lg text-center text-xs font-black text-white border outline-none focus:border-white/40 ${gem.type === 'Damage' ? 'bg-red-500/20 border-red-500/30' : 'bg-blue-500/20 border-blue-500/30'}`}
                         />
                         <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-zinc-400 shadow-sm" />
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="스킬 (Skills)" icon={Swords} accent="text-zinc-100">
                   <div className="space-y-2">
                      {char.skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors" onClick={() => setSelectedSkillIndex(idx)}>
                           <span className={`text-[10px] font-black ${selectedSkillIndex === idx ? 'text-indigo-400' : 'text-zinc-400'}`}>{skill.name}</span>
                           <span className="text-[9px] font-bold text-zinc-600">Lv.{skill.level}</span>
                        </div>
                      ))}
                   </div>
                </SectionCard>

                <SectionCard title="아바타 (Avatars)" icon={Shirt} accent="text-pink-400">
                   <div className="grid grid-cols-1 gap-2">
                      <EditableField label="무기 아바타" value={1.5} onChange={() => {}} suffix="%" />
                      <EditableField label="상의/하의 합산" value={2.0} onChange={() => {}} suffix="%" />
                   </div>
                </SectionCard>
              </div>
            </div>
          )}

          {/* Ark Passive Node Edit Modal */}
          <AnimatePresence>
            {editingNode && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                 <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }} 
                   onClick={() => setEditingNode(null)}
                   className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                 />
                 <motion.div 
                   initial={{ scale: 0.9, opacity: 0 }} 
                   animate={{ scale: 1, opacity: 1 }} 
                   exit={{ scale: 0.9, opacity: 0 }}
                   className="relative w-full max-w-xs bg-surface border border-zinc-800 rounded-3xl p-8 shadow-2xl"
                 >
                    <div className="flex flex-col items-center gap-6">
                       <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center">
                          <Flame size={40} className="text-amber-400" />
                       </div>
                       <div className="text-center space-y-2">
                          <h4 className="text-xl font-black text-zinc-100 tracking-tight">버스트 강화</h4>
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Lv. 1 / 1 (24P)</p>
                       </div>
                       <div className="flex items-center gap-4 w-full">
                          <button className="flex-1 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                             <Minus size={20} />
                          </button>
                          <div className="text-2xl font-black text-zinc-100 px-4">1</div>
                          <button className="flex-1 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                             <Plus size={20} />
                          </button>
                       </div>
                       <button 
                         onClick={() => setEditingNode(null)}
                         className="w-full h-12 bg-white text-void rounded-xl font-black text-sm hover:bg-zinc-200 transition-all"
                       >
                         적용하기
                       </button>
                    </div>
                 </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Results Detail Section (Keep existing code from previous implementation) */}
          {subTab === 'results' && (
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-surface rounded-[3rem] border border-zinc-900 shadow-xl p-12 overflow-hidden min-h-[800px]">
<div className="lg:col-span-5 space-y-10 border-r border-zinc-900 pr-12">
<div className="flex justify-between items-center px-2">
<h3 className="text-3xl font-black text-zinc-100 tracking-tight">스킬</h3>
<div className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-zinc-400">
정렬-스킬데미지 <ChevronDown size={12} />
</div>
</div>
<div className="space-y-3">
{char.skills.map((skill, i) => (
<motion.div 
key={i}
whileHover={{ x: 5 }}
onClick={() => setSelectedSkillIndex(i)}
className={`relative flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${selectedSkillIndex === i ? 'bg-zinc-800/50 border-indigo-500/50 shadow-lg' : 'bg-zinc-950/30 border-zinc-900 hover:border-zinc-800'}`}
>
<div className="flex items-center gap-4 flex-1">
<div className="w-12 h-12 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 relative group">
<div className="w-full h-full bg-gradient-to-br from-indigo-900/40 to-black flex items-center justify-center">
<Sword size={20} className="text-zinc-600 group-hover:text-indigo-400" />
</div>
{selectedSkillIndex === i && <div className="absolute inset-y-0 left-0 w-1 bg-indigo-500 rounded-full" />}
</div>
<div className="space-y-1 flex-1 min-w-0">
<div className="flex items-center gap-2">
<span className="text-xs font-black text-zinc-100 truncate">{skill.name}</span>
<span className="text-[9px] font-bold text-zinc-600 whitespace-nowrap">295.75초</span>
</div>
<div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden mt-2 border border-zinc-800">
<motion.div 
initial={{ width: 0 }} 
animate={{ width: `${skill.damageContribution}%` }} 
className={`h-full rounded-full ${selectedSkillIndex === i ? 'bg-indigo-500' : 'bg-zinc-700'}`} 
/>
</div>
</div>
</div>
<div className="text-right ml-4">
<p className="text-xs font-black text-zinc-300">{(skill.damageContribution * 0.25).toFixed(2)}억</p>
</div>
</motion.div>
))}
</div>
</div>
<div className="lg:col-span-7 space-y-12">
<div className="text-center space-y-6">
<div className="flex flex-col items-center gap-4">
<div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-black rounded-3xl border-2 border-zinc-800 flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
<Zap size={32} />
</div>
<h3 className="text-4xl font-black text-zinc-100 tracking-tight">{selectedSkill.name}</h3>
</div>
<div className="space-y-1">
<p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">기대 피해량</p>
<p className="text-3xl font-black text-zinc-100 tracking-tighter">
{(selectedSkill.damageContribution * 0.25 * 100000000).toLocaleString()} <span className="text-base text-zinc-600 font-bold ml-1">DMG</span>
</p>
</div>
</div>
<div className="space-y-4">
<p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center">적용 버프</p>
<div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
{['아드레날린 6', '정열의 춤 II', '전투 축복 III', '악추피 6.5', '딜카드 15%', '만찬공이속 5', '입식 타격 6', '약점 노출:블레이드', '다크 오더', '블레이드 아츠', '버스트 강화 60', '백어택', '검기 압축 2', '에너지 강화'].map((tag, idx) => (
<span key={idx} className={`px-2.5 py-1 rounded-md text-[9px] font-black border transition-colors ${idx < 4 ? 'bg-red-400/5 text-red-400/80 border-red-400/20' : 'bg-blue-400/5 text-blue-400/80 border-blue-400/20'}`}>
{tag}
</span>
))}
</div>
</div>
<div className="flex flex-col md:flex-row items-center justify-center gap-12 bg-zinc-950/40 p-10 rounded-[2.5rem] border border-zinc-900 shadow-inner">
<div className="relative w-32 h-32">
<svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
<circle cx="18" cy="18" r="15.915" fill="none" stroke="#18181b" strokeWidth="3" />
<motion.circle 
cx="18" cy="18" r="15.915" 
fill="none" 
stroke="#10b981" 
strokeWidth="3" 
strokeDasharray="80 20" 
strokeDashoffset="0" 
initial={{ strokeDasharray: "0 100" }}
animate={{ strokeDasharray: "80 20" }}
transition={{ duration: 1, ease: "easeOut" }}
/>
</svg>
<div className="absolute inset-0 flex items-center justify-center flex-col">
<span className="text-xs font-black text-zinc-100">80%</span>
<span className="text-[8px] font-bold text-zinc-600">Avg. Hit</span>
</div>
</div>
<div className="space-y-4 flex-1">
<div className="flex justify-between items-end border-b border-zinc-900 pb-2">
<div className="flex items-center gap-2">
<div className="w-2 h-2 bg-emerald-500 rounded-full" />
<span className="text-[10px] font-black text-zinc-500 uppercase">1타 기대 피해량</span>
</div>
<span className="text-sm font-black text-zinc-100">7억 6217만</span>
</div>
<button className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-black text-zinc-500 rounded-xl transition-colors border border-zinc-800">
모션 계산 상세보기
</button>
</div>
</div>
<div className="space-y-8">
<div className="flex items-center gap-2 mb-6">
<div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
<p className="text-xs font-black text-zinc-100">치명타 / 케이스별 데미지 분기</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
{[
{ id: 'CASE1', prob: '65.7%', label: '치명타 O', dmg: '9억 5927만', color: 'text-blue-400', barColor: 'bg-blue-400/40' },
{ id: 'CASE2', prob: '24.3%', label: '치명타 X', dmg: '2억 8034만', color: 'text-pink-400', barColor: 'bg-pink-400/40' },
{ id: 'CASE3', prob: '7.3%', label: '치명타 O (패널티)', dmg: '7억 6742만', color: 'text-emerald-400', barColor: 'bg-emerald-400/40' },
{ id: 'CASE4', prob: '2.7%', label: '치명타 X (패널티)', dmg: '2억 2427만', color: 'text-amber-400', barColor: 'bg-amber-400/40' },
].map(c => (
<div key={c.id} className="space-y-3 group">
<div className="flex justify-between items-start">
<div className="space-y-1">
<span className={`text-[10px] font-black uppercase tracking-widest ${c.color}`}>{c.id}</span>
<p className="text-sm font-black text-zinc-200">{c.dmg}</p>
</div>
<div className="text-right">
<p className="text-[9px] font-bold text-zinc-500">발동 확률 {c.prob}</p>
<p className="text-[9px] font-bold text-zinc-600 mt-0.5">{c.label}</p>
</div>
</div>
<div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900 shadow-inner">
<motion.div 
initial={{ width: 0 }} 
animate={{ width: c.prob }} 
className={`h-full ${c.barColor} group-hover:opacity-100 opacity-60 transition-opacity`} 
/>
</div>
</div>
))}
</div>
</div>
<div className="pt-8 border-t border-zinc-900">
<div className="space-y-4">
{[
{ label: 'CASE1 (66%)', dmg: '9억 5927만 7319', barColor: 'bg-blue-400/60', width: '95%' },
{ label: 'CASE2 (24%)', dmg: '2억 8034만 5517', barColor: 'bg-pink-400/60', width: '30%' },
{ label: 'CASE3 (7%)', dmg: '7억 6742만 1855', barColor: 'bg-emerald-400/60', width: '75%' },
{ label: 'CASE4 (3%)', dmg: '2억 2427만 6414', barColor: 'bg-amber-400/60', width: '25%' },
].map((item, i) => (
<div key={i} className="flex items-center gap-4 group">
<span className="w-20 text-[9px] font-black text-zinc-500 whitespace-nowrap">{item.label}</span>
<div className="flex-1 flex items-center gap-4">
<div className="h-3 flex-1 bg-zinc-950 rounded-sm overflow-hidden relative border border-zinc-900">
<motion.div 
initial={{ width: 0 }} 
animate={{ width: item.width }} 
className={`absolute inset-y-0 left-0 ${item.barColor} group-hover:opacity-100 transition-opacity`} 
/>
</div>
<span className="text-[10px] font-bold text-zinc-300 w-32 text-right">{item.dmg}</span>
</div>
</div>
))}
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
