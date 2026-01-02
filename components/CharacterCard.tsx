
import React, { useState } from 'react';
import { CharacterInfo, GearInfo, AccessoryInfo, Engraving, SkillInfo, ArkPassiveEffect, ArkGridEffect } from '../types';
import { 
  Star, Shield, Zap, Gem as GemIcon, 
  ChevronRight, Info, Award, Heart, Share2, 
  Search, ExternalLink, Bookmark, Swords, LayoutGrid, 
  Sparkles, Compass, Hexagon, BarChart,
  Target, Zap as ZapIcon, ShieldAlert, User,
  Users, TrendingUp, Coins, Palette, Activity,
  Crown, Flame, Droplets, MapPin, Eye, History,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub Components ---

const QualityCircle = ({ quality }: { quality: number }) => {
  const getColor = (q: number) => {
    if (q === 100) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    if (q >= 90) return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    if (q >= 70) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    return 'text-green-400 bg-green-400/10 border-green-400/20';
  };
  return (
    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-black ${getColor(quality)}`}>
      {quality}
    </div>
  );
};

const SectionHeader = ({ title, icon: Icon, right }: { title: string, icon?: any, right?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={16} className="text-zinc-500" />}
      <h3 className="text-xs font-black text-zinc-100 uppercase tracking-widest">{title}</h3>
    </div>
    {right}
  </div>
);

// --- Gear Tooltip Component ---

const GearTooltip = ({ item, characterClass }: { item: GearInfo, characterClass: string }) => {
  const qualityColor = item.quality === 100 ? 'bg-orange-500' : item.quality >= 90 ? 'bg-purple-500' : 'bg-blue-500';
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="absolute z-[100] left-full ml-4 top-0 w-[320px] bg-[#111111] border border-zinc-800 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden text-left p-6 pointer-events-none"
    >
      {/* Header */}
      <div className="space-y-1 mb-6">
        <h4 className="text-lg font-black text-zinc-100">+{item.honingLevel} {item.isT4 ? '운명의 업화' : '고결한 의지'} {item.slot}장식</h4>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-orange-400">고대 {item.slot} 방어구</span>
          <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">장착중</span>
        </div>
        <p className="text-[11px] font-bold text-zinc-400">아이템 레벨 1700 (티어 4)</p>
        <div className="pt-2">
          <div className="flex justify-between items-end mb-1">
             <span className="text-[10px] font-black text-zinc-100">품질 {item.quality}</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div className={`h-full ${qualityColor} shadow-[0_0_8px_rgba(249,115,22,0.5)]`} style={{ width: `${item.quality}%` }} />
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="space-y-5 text-[11px]">
        <div className="space-y-1">
          <p className="font-bold text-zinc-200">{characterClass} 전용</p>
          <p className="font-bold text-zinc-400">캐릭터 귀속됨</p>
          <p className="font-bold text-red-400/80">거래 불가</p>
        </div>

        <div className="space-y-1">
          <p className="font-black text-emerald-400">[상급 재련] 20단계</p>
        </div>

        <div className="space-y-1 border-t border-white/5 pt-4">
          <p className="font-black text-zinc-500 mb-1">기본 효과</p>
          <p className="font-bold text-zinc-300">물리 방어력 +7450</p>
          <p className="font-bold text-zinc-300">마법 방어력 +8278</p>
          <p className="font-bold text-zinc-300">민첩 +78219</p>
          <p className="font-bold text-zinc-300">체력 +8771</p>
        </div>

        <div className="space-y-1">
          <p className="font-black text-zinc-500 mb-1">추가 효과</p>
          <p className="font-bold text-zinc-300">생명 활성력 +1400</p>
        </div>

        <div className="space-y-2 border-t border-white/5 pt-4">
          <p className="font-black text-zinc-500">현재 단계 재련 경험치</p>
          <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-600" style={{ width: '0%' }} />
          </div>
          <p className="text-[9px] text-right font-bold text-zinc-500">0 / 51000</p>
        </div>

        <div className="space-y-1 border-t border-white/5 pt-4">
          <p className="font-black text-zinc-500 mb-1">아크 패시브 포인트 효과</p>
          <p className="font-bold text-orange-400">진화 +24</p>
        </div>

        <div className="pt-2 text-[10px] space-y-1">
           <p className="text-red-400/60 font-bold">분해불가, 품질 업그레이드 불가</p>
           <p className="text-cyan-400 font-bold">[제작] 대도시</p>
           <p className="text-zinc-500 font-bold">내구도 64 / 66</p>
        </div>
      </div>
    </motion.div>
  );
};

const GearCard = ({ item, characterClass }: { item: GearInfo, characterClass: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-zinc-900/40 p-3 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all cursor-help">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-12 h-12 rounded-lg ${item.isT4 ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-orange-500/20 border-orange-500/30'} border flex items-center justify-center`}>
               <Shield size={24} className={item.isT4 ? 'text-emerald-400' : 'text-orange-400'} />
            </div>
            <div className="absolute -top-1 -left-1 bg-void border border-white/10 px-1.5 py-0.5 rounded-md text-[8px] font-black text-white">
              +{item.honingLevel}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-200">{item.slot} {item.isT4 ? <span className="text-emerald-400">T4</span> : ''}</p>
            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">품질 {item.quality} | {item.trans}</p>
          </div>
        </div>
        <QualityCircle quality={item.quality} />
      </div>

      <AnimatePresence>
        {isHovered && <GearTooltip item={item} characterClass={characterClass} />}
      </AnimatePresence>
    </div>
  );
};

const CollectionItem = ({ name, percent }: { name: string, percent: number }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-center text-[9px] font-black">
      <span className="text-zinc-500 uppercase">{name}</span>
      <span className="text-zinc-300">{percent}%</span>
    </div>
    <div className="h-1 w-full bg-void rounded-full overflow-hidden border border-white/5">
      <div className="h-full bg-amber-400" style={{ width: `${percent}%` }} />
    </div>
  </div>
);

const ArkNode = ({ name, lv, max, pts, active, type = 'orange' }: { name: string, lv: number, max: number, pts: string, active: boolean, type?: 'orange' | 'blue' }) => {
  const activeClass = type === 'orange' ? 'bg-orange-500 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-cyan-500 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]';
  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      <div className={`relative w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${active ? activeClass : 'bg-zinc-900 border-zinc-800 opacity-30 grayscale'}`}>
         <div className={`w-7 h-7 rounded-full flex items-center justify-center ${active ? 'bg-black/20' : 'bg-transparent'}`}>
           <Sparkles size={14} className={active ? 'text-white' : 'text-zinc-700'} />
         </div>
         <div className="absolute -top-1 px-1 bg-void border border-white/10 rounded text-[7px] font-black text-zinc-500">{pts}</div>
      </div>
      <div className="text-center">
        <p className="text-[8px] font-black text-zinc-500 leading-none">Lv. {lv} / {max}</p>
        <p className={`text-[10px] font-black mt-0.5 tracking-tighter whitespace-nowrap ${active ? 'text-zinc-100' : 'text-zinc-600'}`}>{name}</p>
      </div>
    </div>
  );
};

// --- Main CharacterCard Component ---

export const CharacterCard: React.FC<{ character: CharacterInfo }> = ({ character }) => {
  const [activeTab, setActiveTab] = useState('전투');
  const [arkSubTab, setArkSubTab] = useState<'evolution' | 'enlightenment' | 'leap'>('evolution');

  const tabs = ['전투', '스킬', '아크 패시브', '내실', '아바타', '통계', '캐릭터', '길드'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Profile */}
      <div className="relative bg-zinc-900/20 rounded-[3rem] p-10 border border-white/5 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none scale-150">
           <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Blade" alt="Avatar" className="w-96 h-96 grayscale" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-zinc-800 p-1">
                <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                   <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Blade" className="w-full h-full object-cover" alt="pfp" />
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-100 text-void px-4 py-1 rounded-full text-[10px] font-black shadow-xl">
                 랭킹 <span className="text-indigo-600">Diamond</span>
              </div>
            </div>

            <div className="text-center md:text-left space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="text-[10px] font-black bg-zinc-800 text-zinc-500 px-3 py-1 rounded-md uppercase tracking-widest">{character.server}</span>
                <span className="text-[10px] font-black bg-zinc-800 text-zinc-500 px-3 py-1 rounded-md uppercase tracking-widest">{character.class}</span>
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter">{character.name}</h1>
              <p className="text-zinc-500 font-bold italic">"{character.title}"</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: '아이템', val: character.itemLevel.toFixed(1) },
              { label: '전투력', val: character.combatPower.toFixed(2), color: 'text-red-400' },
              { label: '전투', val: character.battleLevel },
              { label: '원정대', val: character.expeditionLevel },
            ].map((stat, i) => (
              <div key={i} className="text-center md:text-right">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color || 'text-white'} tracking-tighter`}>{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 overflow-x-auto custom-scrollbar bg-zinc-900/30 p-1.5 rounded-2xl border border-white/5">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[11px] font-black transition-all ${activeTab === tab ? 'bg-emerald-500 text-void shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {tab}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex gap-2 pr-2">
           <button className="p-2 text-zinc-600 hover:text-zinc-300"><ExternalLink size={16} /></button>
           <button className="p-2 text-zinc-600 hover:text-zinc-300"><Bookmark size={16} /></button>
           <button className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-[10px] font-black">갱신</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="min-h-[400px]"
        >
          {activeTab === '전투' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-surface rounded-[2rem] border border-white/5 p-6 space-y-8">
                  <SectionHeader title="장비" />
                  <div className="grid grid-cols-2 gap-3">
                    {character.gear.map((item, idx) => (
                      <GearCard key={idx} item={item} characterClass={character.class} />
                    ))}
                  </div>
                  <div className="pt-4 space-y-4">
                     <SectionHeader title="보석" right={<span className="text-[9px] font-black text-zinc-600">평균 6.7</span>} />
                     <div className="grid grid-cols-6 gap-2">
                       {character.gems.map((gem, idx) => (
                         <div key={idx} className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-black text-white border ${gem.type === 'Damage' ? 'bg-red-500/20 border-red-500/30' : 'bg-blue-500/20 border-blue-500/30'}`}>
                           {gem.level}
                         </div>
                       ))}
                     </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-surface rounded-[2rem] border border-white/5 p-6 space-y-8">
                  <SectionHeader title="특성" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 text-center">
                      <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">특화</p>
                      <p className="text-2xl font-black text-zinc-100">{character.innerStats.specialization}</p>
                    </div>
                    <div className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 text-center">
                      <p className="text-[9px] font-black text-orange-400 uppercase mb-1">치명</p>
                      <p className="text-2xl font-black text-zinc-100">{character.innerStats.crit}</p>
                    </div>
                  </div>
                  <div className="pt-6">
                    <SectionHeader title="각인" />
                    <div className="space-y-3">
                      {character.engravings.map((eng, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-zinc-200">{eng.name}</span>
                          <span className="text-[10px] font-black text-zinc-400">Lv.{eng.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-surface rounded-[2rem] border border-white/5 p-6">
                   <SectionHeader title="랭킹 & 내실" />
                   <div className="space-y-4">
                     <div className="p-3 bg-zinc-900/40 rounded-xl border border-white/5 flex justify-between">
                       <span className="text-xs font-black text-zinc-500 uppercase">전체 랭킹</span>
                       <span className="text-xs font-black text-zinc-100"># {character.ranking?.overall.toLocaleString()}</span>
                     </div>
                     <div className="grid grid-cols-1 gap-3 pt-2">
                        {character.collections.slice(0, 4).map((c, i) => <CollectionItem key={i} name={c.name} percent={c.percent} />)}
                     </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === '스킬' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {character.skills.map((skill, i) => (
                <div key={i} className="bg-surface p-6 rounded-[2rem] border border-white/5 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-900 rounded-xl border border-white/10 flex items-center justify-center relative">
                        <Swords size={24} className="text-zinc-600" />
                        <div className="absolute -bottom-1 -right-1 bg-void px-2 py-0.5 rounded text-[8px] font-black border border-white/10">Lv.{skill.level}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-zinc-100">{skill.name}</h4>
                        <p className="text-[10px] font-black text-emerald-500 uppercase">{skill.rune || '룬 없음'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-zinc-600 uppercase">피해량</p>
                       <p className="text-lg font-black text-zinc-100">{skill.damageContribution}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {skill.tripods.map((tp, ti) => (
                      <div key={ti} className={`p-2 rounded-lg border text-center ${skill.activeTripodIndices.includes(ti) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-zinc-900/50 border-white/5 text-zinc-600 opacity-50'}`}>
                         <p className="text-[9px] font-black uppercase truncate">{tp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === '아크 패시브' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-9 bg-surface rounded-[2.5rem] border border-white/5 p-10 space-y-10">
                <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-white/5 w-fit">
                   {['evolution', 'enlightenment', 'leap'].map(sub => (
                     <button
                       key={sub}
                       onClick={() => setArkSubTab(sub as any)}
                       className={`px-8 py-2 rounded-lg text-xs font-black tracking-widest transition-all ${arkSubTab === sub ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                     >
                       {sub === 'evolution' ? '진화' : sub === 'enlightenment' ? '깨달음' : '도약'}
                     </button>
                   ))}
                </div>
                <div className="flex gap-10">
                  <div className="flex flex-col items-center gap-14 py-2 relative">
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-zinc-800 z-0"></div>
                    {[1, 2, 3, 4].map(t => (
                      <div key={t} className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-600 font-black text-xs z-10 relative">{t}</div>
                    ))}
                  </div>
                  <div className="flex-1 space-y-14 pt-0.5">
                    {arkSubTab === 'evolution' && (
                      <>
                        <div className="grid grid-cols-6 gap-4">
                          <ArkNode name="치명" lv={10} max={30} pts="1P" active={true} />
                          <ArkNode name="특화" lv={30} max={30} pts="1P" active={true} />
                          <ArkNode name="제압" lv={0} max={30} pts="1P" active={false} />
                          <ArkNode name="신속" lv={0} max={30} pts="1P" active={false} />
                          <ArkNode name="인내" lv={0} max={30} pts="1P" active={false} />
                          <ArkNode name="숙련" lv={0} max={30} pts="1P" active={false} />
                        </div>
                        <div className="grid grid-cols-6 gap-4">
                          <ArkNode name="끝없는 마나" lv={0} max={2} pts="10P" active={false} />
                          <ArkNode name="금단의 주문" lv={0} max={2} pts="10P" active={false} />
                          <ArkNode name="예리한 감각" lv={0} max={2} pts="10P" active={false} />
                          <ArkNode name="한계 돌파" lv={3} max={3} pts="10P" active={true} />
                          <ArkNode name="최적화 훈련" lv={0} max={2} pts="10P" active={false} />
                          <ArkNode name="축복의 여신" lv={0} max={3} pts="10P" active={false} />
                        </div>
                        <div className="grid grid-cols-6 gap-4">
                          <ArkNode name="무한한 마력" lv={0} max={2} pts="10P" active={false} />
                          <ArkNode name="혼신의 강타" lv={0} max={2} pts="10P" active={false} />
                          <ArkNode name="일격" lv={2} max={2} pts="10P" active={true} type="blue" />
                          <ArkNode name="파괴 전차" lv={0} max={2} pts="10P" active={false} />
                          <ArkNode name="타이밍 지배" lv={0} max={2} pts="10P" active={false} />
                          <ArkNode name="정열의 종사위" lv={0} max={2} pts="10P" active={false} />
                        </div>
                        <div className="grid grid-cols-6 gap-4">
                          <ArkNode name="뭉툭한 가시" lv={0} max={2} pts="15P" active={false} />
                          <ArkNode name="음속 돌파" lv={0} max={2} pts="15P" active={false} />
                          <ArkNode name="인파이팅" lv={0} max={2} pts="15P" active={false} />
                          <ArkNode name="입식 타격가" lv={2} max={2} pts="15P" active={true} />
                          <ArkNode name="마나 용광로" lv={0} max={2} pts="15P" active={false} />
                          <ArkNode name="안정된 관리자" lv={0} max={2} pts="15P" active={false} />
                        </div>
                      </>
                    )}
                    {arkSubTab === 'enlightenment' && (
                      <>
                        <div className="grid grid-cols-6 gap-4">
                          <div className="col-start-3"><ArkNode name="버스트 강화" lv={1} max={1} pts="24P" active={true} /></div>
                          <div className="col-start-4 opacity-50"><ArkNode name="신속한 일격" lv={0} max={1} pts="24P" active={false} /></div>
                        </div>
                        <div className="grid grid-cols-6 gap-4">
                          <div className="col-start-3"><ArkNode name="오브 압축" lv={3} max={3} pts="8P" active={true} /></div>
                          <div className="col-start-4 opacity-50"><ArkNode name="잠재된 기운" lv={0} max={3} pts="8P" active={false} /></div>
                        </div>
                        <div className="grid grid-cols-6 gap-4">
                          <div className="col-start-2 opacity-50"><ArkNode name="오브 제어" lv={0} max={5} pts="2P" active={false} /></div>
                          <div className="col-start-3 opacity-50"><ArkNode name="한계돌파" lv={0} max={1} pts="24P" active={false} /></div>
                          <div className="col-start-4 opacity-50"><ArkNode name="확고한 의지" lv={0} max={3} pts="8P" active={false} /></div>
                          <div className="col-start-5 opacity-50"><ArkNode name="검술 강화" lv={0} max={5} pts="2P" active={false} /></div>
                        </div>
                        <div className="grid grid-cols-6 gap-4">
                          <div className="col-start-2"><ArkNode name="에너지 강화" lv={2} max={5} pts="2P" active={true} type="blue" /></div>
                          <div className="col-start-3"><ArkNode name="검기 압축" lv={3} max={3} pts="8P" active={true} type="blue" /></div>
                          <div className="col-start-4 opacity-50"><ArkNode name="극한의 몸놀림" lv={0} max={3} pts="8P" active={false} /></div>
                          <div className="col-start-5 opacity-50"><ArkNode name="오브 순환" lv={0} max={5} pts="2P" active={false} /></div>
                        </div>
                      </>
                    )}
                    {arkSubTab === 'leap' && (
                      <>
                        <div className="grid grid-cols-6 gap-4">
                          <ArkNode name="초월적인 힘" lv={4} max={5} pts="4P" active={true} />
                          <ArkNode name="충전된 분노" lv={0} max={5} pts="4P" active={false} />
                          <ArkNode name="각성 증폭기" lv={0} max={3} pts="2P" active={false} />
                          <ArkNode name="풀려난 힘" lv={5} max={5} pts="4P" active={true} />
                          <ArkNode name="잠재력 해방" lv={0} max={5} pts="4P" active={false} />
                          <ArkNode name="즉각적인 주문" lv={2} max={3} pts="2P" active={true} type="blue" />
                        </div>
                        <div className="grid grid-cols-6 gap-4">
                          <ArkNode name="섬광 베기" lv={0} max={1} pts="10P" active={false} />
                          <ArkNode name="검객의 길" lv={0} max={1} pts="10P" active={false} />
                          <ArkNode name="악몽의 춤사위" lv={3} max={1} pts="10P" active={true} />
                          <ArkNode name="비명의 춤사위" lv={0} max={1} pts="10P" active={false} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3 space-y-6">
                 <div className="bg-surface rounded-[2rem] border border-white/5 p-6 space-y-6">
                    <SectionHeader title="포인트" />
                    <div className="space-y-6">
                      <CollectionItem name="진화" percent={77} />
                      <CollectionItem name="깨달음" percent={84} />
                      <CollectionItem name="도약" percent={70} />
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === '내실' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-surface rounded-[2rem] border border-white/5 p-6 space-y-6">
                  <SectionHeader title="성향" icon={Heart} />
                  <div className="space-y-4">
                    {['지성', '담력', '매력', '친절'].map((s, i) => (
                      <div key={i} className="flex justify-between items-center text-xs font-black">
                        <span className="text-zinc-500 uppercase">{s}</span>
                        <span className="text-zinc-100">{300 + i * 25}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-surface rounded-[2rem] border border-white/5 p-6 space-y-6">
                  <SectionHeader title="특수 장비" icon={Settings} />
                  <div className="space-y-3">
                    <div className="p-3 bg-zinc-900/40 rounded-xl border border-white/5 text-[10px] font-black text-zinc-400">빛나는 영웅의 나침반</div>
                    <div className="p-3 bg-zinc-900/40 rounded-xl border border-white/5 text-[10px] font-black text-zinc-400">명예로운 전설의 부적</div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8 bg-surface rounded-[2.5rem] border border-white/5 p-8">
                <SectionHeader title="전체 수집품 현황" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {character.collections.map((c, i) => (
                    <div key={i} className="bg-zinc-950 p-5 rounded-3xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black">
                        <span className="text-zinc-500 uppercase">{c.name}</span>
                        <span className="text-zinc-100">{c.percent}%</span>
                      </div>
                      <div className="h-1 bg-void rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${c.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === '아바타' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <div className="lg:col-span-6 bg-surface rounded-[2.5rem] border border-white/5 p-8 flex items-center justify-center">
                 <div className="w-full aspect-[3/4] bg-zinc-950 rounded-3xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                    <Palette size={64} className="text-zinc-800 transition-transform group-hover:scale-110" />
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-4">Character Rendering</p>
                    <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-60" />
                 </div>
               </div>
               <div className="lg:col-span-6 space-y-6">
                 <div className="bg-surface rounded-[2rem] border border-white/5 p-6">
                   <SectionHeader title="아바타 목록" />
                   <div className="space-y-3">
                     {['무기', '머리', '상의', '하의', '얼굴1', '얼굴2'].map(slot => (
                       <div key={slot} className="flex justify-between items-center p-4 bg-zinc-900/40 rounded-xl border border-white/5">
                         <span className="text-[11px] font-black text-zinc-500 uppercase">{slot}</span>
                         <span className="text-[11px] font-black text-indigo-400">전설의 고결한 아바타</span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === '통계' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface rounded-[2.5rem] border border-white/5 p-8 space-y-8">
                <SectionHeader title="아이템 레벨 기록" icon={TrendingUp} />
                <div className="h-48 flex items-end gap-1 px-2 border-b border-white/5 pb-2">
                   {Array.from({length: 12}).map((_, i) => (
                     <div key={i} className="flex-1 bg-emerald-500/20 border-t border-emerald-500/40 rounded-t-sm" style={{ height: `${30 + i * 5}%` }} />
                   ))}
                </div>
                <p className="text-[10px] font-black text-zinc-600 text-center uppercase tracking-widest">최근 12주간 레벨 변동 추이</p>
              </div>
              <div className="bg-surface rounded-[2.5rem] border border-white/5 p-8 space-y-8">
                <SectionHeader title="전투력 기록" icon={Activity} />
                <div className="h-48 flex items-end gap-1 px-2 border-b border-white/5 pb-2">
                   {Array.from({length: 12}).map((_, i) => (
                     <div key={i} className="flex-1 bg-red-500/20 border-t border-red-500/40 rounded-t-sm" style={{ height: `${40 + i * 4}%` }} />
                   ))}
                </div>
                <p className="text-[10px] font-black text-zinc-600 text-center uppercase tracking-widest">최근 12주간 전투력 변동 추이</p>
              </div>
            </div>
          )}

          {activeTab === '캐릭터' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
               <div className="lg:col-span-4 bg-surface rounded-[2rem] border border-white/5 p-6 space-y-8">
                 <SectionHeader title="주간 골드 현황" icon={Coins} />
                 <div className="p-8 bg-zinc-950 rounded-3xl border border-white/5 text-center">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">예상 획득 수익</p>
                    <p className="text-4xl font-black text-yellow-400 tracking-tighter">84,500 <span className="text-lg text-zinc-500 ml-1">G</span></p>
                 </div>
                 <div className="space-y-3">
                   {['카멘 (하드)', '에키드나 (하드)', '베히모스'].map(r => (
                     <div key={r} className="flex justify-between items-center text-[11px] font-black">
                        <span className="text-zinc-300">{r}</span>
                        <span className="text-zinc-600">완료</span>
                     </div>
                   ))}
                 </div>
               </div>
               <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-surface rounded-[2rem] border border-white/5 p-6">
                    <SectionHeader title="니나브" icon={Heart} />
                    <div className="h-32 bg-zinc-950 rounded-2xl flex items-center justify-center text-[10px] font-black text-zinc-700">관계 정보 없음</div>
                 </div>
                 <div className="bg-surface rounded-[2rem] border border-white/5 p-6">
                    <SectionHeader title="카제로스" icon={ShieldAlert} />
                    <div className="h-32 bg-zinc-950 rounded-2xl flex items-center justify-center text-[10px] font-black text-zinc-700">관계 정보 없음</div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === '길드' && (
            <div className="space-y-6">
               <div className="bg-surface rounded-[2.5rem] border border-white/5 p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 bg-indigo-500/10 rounded-full border border-indigo-500/20 flex items-center justify-center">
                    <Crown size={48} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                     <h3 className="text-3xl font-black text-zinc-100 tracking-tighter">{character.guildName || '슈퍼스티어링정우'}</h3>
                     <p className="text-sm font-bold text-zinc-500 mt-1 uppercase tracking-widest">Guild Master: 정우 | Level 25 | Member 50/50</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-6 py-3 bg-zinc-900 border border-white/5 text-xs font-black rounded-xl hover:bg-zinc-800 transition-all">길드 통계</button>
                    <button className="px-6 py-3 bg-white text-void text-xs font-black rounded-xl hover:bg-zinc-200 transition-all">가입 신청</button>
                  </div>
               </div>
               <div className="bg-surface rounded-[2.5rem] border border-white/5 p-8">
                 <SectionHeader title="길드원 목록" />
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({length: 10}).map((_, i) => (
                      <div key={i} className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5 text-center group hover:border-white/20 transition-all cursor-pointer">
                         <div className="w-10 h-10 bg-zinc-800 rounded-full mx-auto mb-2" />
                         <p className="text-[11px] font-black text-zinc-100 truncate">길드원_{i+1}</p>
                         <p className="text-[9px] font-black text-zinc-600">Lv.1620.0</p>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
