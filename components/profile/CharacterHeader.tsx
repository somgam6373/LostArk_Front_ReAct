import React, { useMemo } from 'react';
import { Shield, Swords, Zap, Target, Flame, Trophy, GripVertical, Users } from 'lucide-react';

// 1. 하위 컴포넌트: SlimStat (치명, 특화, 신속)
const SlimStat = ({ icon, label, value }: any) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-xs text-zinc-500 font-bold tracking-tight">{label}</span>
        </div>
        <span className="text-xl font-black">{value}</span>
    </div>
);

// 2. 하위 컴포넌트: SimpleStat (아이템 레벨, 전투력 등)
const SimpleStat = ({ label, value, icon, color = "text-white" }: any) => (
    <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-zinc-500">
            {icon}
            <span className="text-xs font-black tracking-[0.2em] uppercase">{label}</span>
        </div>
        <span className={`text-5xl font-[1000] tracking-tighter ${color} leading-none`}>{value}</span>
    </div>
);

// 칭호 파싱 함수
const parseTitle = (titleStr: string) => {
    if (!titleStr) return { iconName: null, text: "원정대의 희망" };
    const imgMatch = titleStr.match(/src='([^']+)'/);
    const iconName = imgMatch ? imgMatch[1] : null;
    const pureText = titleStr.replace(/<[^>]*>?/gm, '').replace(/<\/?[^>]+(>|$)/g, "").trim();
    return { iconName, text: pureText };
};

// 3. 메인 컴포넌트
export const CharacterHeader = ({ character }: { character: any }) => {
    const { iconName, text } = useMemo(() => parseTitle(character.Title), [character.Title]);
    const stats = character.Stats || [];
    const getStat = (type: string) => stats.find((s: any) => s.Type === type)?.Value || "-";

    const lightColors = useMemo(
        () => [
            'rgba(168, 85, 247, 0.45)', 'rgba(232, 103, 50, 0.45)',
            'rgba(30, 58, 138, 0.6)', 'rgba(16, 185, 129, 0.4)',
            'rgba(244, 63, 94, 0.45)', 'rgba(6, 182, 212, 0.45)',
        ],
        []
    );

    const randomColor = useMemo(() => lightColors[Math.floor(Math.random() * lightColors.length)], [lightColors]);

    return (
        <div className="relative w-full max-w-8xl mx-auto min-h-[400px] bg-[#0c0e12] text-white p-10 overflow-hidden rounded-2xl border border-white/5 group shadow-2xl">

            {/* 배경 눈 내리는 효과 */}
            <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden opacity-50">
                <div className="absolute inset-[-100px] animate-snow-fast brightness-[200%]"
                     style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')", backgroundSize: '800px' }} />
            </div>

            {/* 캐릭터 이미지 */}
            <div className="absolute right-[-2%] top-[-10%] w-[650px] h-[120%] z-0 animate-soft-float">
                <div className="relative w-full h-full">
                    <div className="absolute inset-y-0 left-0 w-60 bg-gradient-to-r from-[#0c0e12] via-[#0c0e12]/80 to-transparent z-10" />
                    <img src={character.CharacterImage} alt={character.CharacterName} className="w-full h-full object-cover object-top opacity-90 contrast-[1.1]" />
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[320px]">
                {/* 상단 서버 및 길드 정보 라인 */}
                <div className="flex items-center gap-3">
                    <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                        {character.ServerName}
                    </span>
                    <span className="bg-white/5 px-3 py-1 rounded-md text-xs font-bold text-zinc-400 border border-white/10">
                        {character.CharacterClassName}
                    </span>

                    {/* [추가] 길드 정보 뱃지 */}
                    {character.GuildName && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-md">
                            <Users size={12} />
                            <span className="text-xs font-bold">
                                {character.GuildName} <span className="opacity-60 ml-1 text-[10px]">{character.GuildMemberGrade}</span>
                            </span>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    {/* 칭호 영역: 박스 제거 및 아이콘 정렬 */}
                    <div className="flex items-center gap-2 mb-3 min-h-[44px]">
                        <GripVertical size={18} className={`${iconName ? 'text-pink-500/50' : 'text-zinc-600'}`} />

                        {iconName && (
                            <img
                                src={`https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/emoticon/${iconName}.png`}
                                alt="title-icon"
                                className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,20,147,0.4)]"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                        )}

                        <span className={`text-lg font-bold tracking-widest leading-none ${iconName ? 'text-pink-300' : 'text-zinc-500'}`}>
                            {text}
                        </span>
                    </div>

                    <h1 className="text-7xl font-black tracking-tighter mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        {character.CharacterName}
                    </h1>

                    <div className="flex items-center gap-10">
                        <div className="flex flex-col gap-1 border-r border-white/10 pr-10 font-black italic">
                            <div className="flex items-center gap-2 text-amber-500">
                                <Trophy size={18} />
                                <span className="text-2xl text-white">Lv.{character.CharacterLevel}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <SlimStat icon={<Target size={16} className="text-orange-400" />} label="치명" value={getStat("치명")} />
                            <SlimStat icon={<Flame size={16} className="text-rose-400" />} label="특화" value={getStat("특화")} />
                            <SlimStat icon={<Zap size={16} className="text-cyan-400" />} label="신속" value={getStat("신속")} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-auto pt-8">
                    <div className="flex gap-14">
                        <SimpleStat label="아이템 레벨" value={character.ItemAvgLevel} icon={<Shield size={22} />} />
                        <SimpleStat label="전투력" value={character.CombatPower} color="text-rose-500" icon={<Swords size={22} />} />
                        <SimpleStat label="원정대" value={`Lv.${character.ExpeditionLevel}`} icon={<Zap size={22} />} />
                    </div>
                </div>
            </div>

            {/* 하단 글로우 광원 */}
            <div className="absolute -bottom-1/4 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-light-pulse"
                 style={{ width: '150%', height: '120%', background: `radial-gradient(circle at center, ${randomColor} 0%, transparent 40%)`, mixBlendMode: 'screen', filter: 'blur(120px)' }} />

            <style>{`
                @keyframes snow-vertical { 0% { background-position: 0px 0px; } 100% { background-position: 50px 1000px; } }
                .animate-snow-fast { animation: snow-vertical 16s linear infinite; }
                @keyframes light-pulse { 0%, 100% { opacity: 0.5; transform: translate(-50%, 0) scale(1); } 50% { opacity: 0.8; transform: translate(-50%, -5%) scale(1.1); } }
                .animate-light-pulse { animation: light-pulse 10s ease-in-out infinite; }
                @keyframes soft-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .animate-soft-float { animation: soft-float 8s ease-in-out infinite; }
            `}</style>
        </div>
    );
};