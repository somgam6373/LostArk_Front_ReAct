import React from 'react';
import { CharacterInfo } from '../../types.ts';

export const CharacterHeader = ({ character }: { character: any }) => {
    const data = {
        name: character.CharacterName,
        server: character.ServerName,
        class: character.CharacterClassName,
        title: character.Title || "칭호 없음",
        itemLevel: character.ItemAvgLevel, // "1,706.66"
        combatPower: character.CombatPower, // "2,168.44"
        battleLevel: character.CharacterLevel,
        expeditionLevel: character.ExpeditionLevel,
        image: character.CharacterImage
    };

    return (
        <div className="relative bg-zinc-900/40 rounded-[2.5rem] p-8 border border-white/5 overflow-hidden shadow-2xl">
            {/* 배경에 캐릭터 이미지를 크게 흐리게 깔아서 분위기 조성 (선택사항) */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                <img src={data.image} className="w-full h-full object-cover object-top scale-150 blur-xl" alt="" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* 실제 캐릭터 이미지 출력 */}
                    <div className="w-36 h-36 rounded-3xl border-2 border-white/10 p-1 bg-zinc-950 overflow-hidden shadow-inner">
                        <img
                            src={data.image}
                            className="w-full h-full object-cover object-top scale-[1.4] translate-y-4"
                            alt={data.name}
                        />
                    </div>

                    <div className="text-center md:text-left space-y-3">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="text-[10px] font-black bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full uppercase tracking-tighter italic border border-white/5">
                                @{data.server}
                            </span>
                            <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30 uppercase tracking-tighter italic">
                                {data.class}
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter italic leading-none">
                            {data.name}
                        </h1>
                        <p className="text-zinc-500 text-sm font-bold tracking-tight">
                            <span className="text-indigo-500/50 mr-1">#</span>{data.title}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-black/20 p-6 rounded-[2rem] border border-white/5">
                    {[
                        { label: '아이템 레벨', val: data.itemLevel, color: 'text-yellow-400' },
                        { label: '전투력', val: data.combatPower, color: 'text-red-400' },
                        { label: '전투 Lv', val: data.battleLevel },
                        { label: '원정대 Lv', val: data.expeditionLevel },
                    ].map((stat, i) => (
                        <div key={i} className="text-center md:text-right px-2">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1.5">{stat.label}</p>
                            <p className={`text-2xl font-black tracking-tighter ${stat.color || 'text-zinc-200'}`}>
                                {stat.val}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};