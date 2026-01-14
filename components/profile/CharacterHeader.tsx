import React, { useMemo } from 'react';
import { Shield, Swords, Zap, Target, Flame, Trophy, GripVertical } from 'lucide-react';

export const CharacterHeader = ({ character }: { character: any }) => {
    const stats = character.Stats || [];
    const getStat = (type: string) => stats.find((s: any) => s.Type === type)?.Value || "-";

    const lightColors = useMemo(
        () => [
            'rgba(168, 85, 247, 0.25)',
            'rgba(232, 103, 50, 0.3)',
            'rgba(255, 77, 0, 0.3)',
            'rgba(255, 215, 0, 0.25)',
            'rgba(30, 58, 138, 0.35)',
            'rgba(255, 255, 255, 0.15)',
        ],
        []
    );

    const randomColor = useMemo(() => {
        return lightColors[Math.floor(Math.random() * lightColors.length)];
    }, [lightColors]);

    return (
        <div className="relative w-full max-w-8xl mx-auto min-h-[350px] bg-[#15181d] text-white p-8 overflow-hidden rounded-xl border border-white/5">
            {/* 캐릭터 이미지 */}
            <div className="absolute right-[-4%] top-[-18%] w-[600px] h-[130%] z-0">
                <div className="relative w-full h-full">
                    <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#15181d] to-transparent z-10" />
                    <img
                        src={character.CharacterImage}
                        alt={character.CharacterName}
                        className="w-full h-[600px] object-cover object-top opacity-90"
                    />
                </div>
            </div>

            {/* 콘텐츠 */}
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[290px]">
                {/* 상단 */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
            <span className="bg-purple-500/10 text-purple-500 border border-purple-500/20 px-3 py-1 rounded text-xs font-bold uppercase">
              {character.ServerName}
            </span>
                        <span className="bg-zinc-800/80 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold text-zinc-300 border border-white/5">
              {character.CharacterClassName}
            </span>
                    </div>
                </div>

                {/* 중앙 */}
                <div className="mt-4">
                    <div className="flex items-center gap-2 mb-1">
                        <GripVertical size={16} className="text-zinc-600" />
                        <p className="text-sm text-zinc-500 italic font-medium">{character.Title || "원정대의 희망"}</p>
                    </div>

                    <h1 className="text-6xl font-black tracking-tighter mb-4">{character.CharacterName}</h1>

                    <div className="flex items-center gap-8 mt-2">
                        <div className="flex flex-col gap-1 border-r border-white/10 pr-6">
                            <div className="flex items-center gap-2">
                                <Trophy size={14} className="text-amber-500" />
                                <span className="text-sm font-bold">Lv.{character.CharacterLevel}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <SlimStat icon={<Target size={14} className="text-orange-400" />} label="치명" value={getStat("치명")} />
                            <SlimStat icon={<Flame size={14} className="text-rose-400" />} label="특화" value={getStat("특화")} />
                            <SlimStat icon={<Zap size={14} className="text-cyan-400" />} label="신속" value={getStat("신속")} />
                        </div>
                    </div>
                </div>

                {/* 하단 */}
                <div className="flex justify-between items-end mt-auto pt-6">
                    <div className="flex gap-12">
                        <SimpleStat label="아이템 레벨" value={character.ItemAvgLevel} icon={<Shield size={18} />} />
                        <SimpleStat label="전투력" value={character.CombatPower} color="text-rose-500" icon={<Swords size={18} />} />
                        <SimpleStat label="원정대 레벨" value={`Lv.${character.ExpeditionLevel}`} icon={<Zap size={18} />} />
                    </div>
                </div>
            </div>

            {/* 랜덤 광원 */}
            <div
                className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 pointer-events-none"
                style={{
                    width: '96rem',
                    height: '48rem',
                    mixBlendMode: 'screen',
                    transition: 'all 1s ease-out',
                    maskImage: 'radial-gradient(50% 50%, black 20%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(50% 50%, black 20%, transparent 100%)',
                    filter: 'blur(15rem)',
                    backgroundColor: randomColor,
                }}
            />
        </div>
    );
};

const SlimStat = ({ icon, label, value }: any) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
            {icon}
            <span className="text-[11px] text-zinc-500 font-bold">{label}</span>
        </div>
        <span className="text-base font-black">{value}</span>
    </div>
);

const SimpleStat = ({ label, value, icon, color = "text-white" }: any) => (
    <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-zinc-500">
            {icon}
            <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
        </div>
        <span className={`text-4xl font-[1000] tracking-tighter ${color} leading-none`}>{value}</span>
    </div>
);
