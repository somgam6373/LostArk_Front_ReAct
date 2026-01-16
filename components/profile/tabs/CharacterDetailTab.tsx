import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Server, ChevronRight, Trophy, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CLASS_ICON_MAP, DEFAULT_ICON } from '@/constants/classIcons';

interface CharacterData {
    ServerName: string;
    CharacterName: string;
    CharacterLevel: number;
    CharacterClassName: string;
    ItemAvgLevel: string;
}

interface CharacterDetailTabProps {
    character?: {
        CharacterName?: string;
        [key: string]: any;
    };
}

// 아이템 레벨별 등급 색상 로직
const getGradeStyles = (levelStr: string, isCurrent: boolean) => {
    const level = parseFloat(levelStr.replace(/,/g, ''));

// 1. 고대 (1680 이상) - 가장 선명하고 화려한 스타일
    if (level >= 1680) return {
        bg: 'from-[#3d3325] to-[#1a1a1c]',
        border: 'border-[#e9d2a6]/100',
        text: 'text-[#e9d2a6]',
        glow: isCurrent ? 'shadow-[0_0_20px_rgba(233,210,166,0.4)]' : 'shadow-[#e9d2a6]/10'
    };

    // 2. 상위 유물 (1600 이상) - 약간의 투명도가 들어간 테두리
    if (level >= 1600) return {
        bg: 'from-[#2a1a12] to-[#111111]',
        border: 'border-[#e9d2a6]/80',
        text: 'text-[#e9d2a6]/90',
        glow: isCurrent ? 'shadow-[0_0_20px_rgba(254,150,0,0.2)]' : ''
    };

    // 3. 유물 (1580 이상)
    if (level >= 1580) return {
        bg: 'from-[#2a1a12] to-[#111111]',
        border: 'border-[#e9d2a6]/60',
        text: 'text-[#e9d2a6]/80',
        glow: isCurrent ? 'shadow-[0_0_20px_rgba(206,67,0,0.2)]' : ''
    };

    // 4. 전설 (1490 이상)
    if (level >= 1490) return {
        bg: 'from-[#41321a] to-[#111111]',
        border: 'border-[#e9d2a6]/40',
        text: 'text-[#e9d2a6]/70',
        glow: isCurrent ? 'shadow-[0_0_20px_rgba(255,234,26,0.15)]' : ''
    };

    // 5. 희귀/영웅 (1415 이상)
    if (level >= 1415) return {
        bg: 'from-[#1a2a3e] to-[#111]',
        border: 'border-[#e9d2a6]/20',
        text: 'text-[#e9d2a6]/60',
        glow: isCurrent ? 'shadow-[0_0_20px_rgba(0,176,255,0.15)]' : ''
    };

    // 6. 기본 (그 외)
    return {
        bg: 'from-[#222] to-[#111]',
        border: 'border-[#e9d2a6]/10',
        text: 'text-[#e9d2a6]/40',
        glow: ''
    };
};

export const CharacterDetailTab = ({ character }: CharacterDetailTabProps) => {
    const navigate = useNavigate();
    const [data, setData] = useState<CharacterData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. 데이터 호출 (Siblings)
    useEffect(() => {
        const fetchSiblings = async () => {
            if (!character?.CharacterName) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await fetch(`/siblings?name=${encodeURIComponent(character.CharacterName)}`);
                if (!response.ok) throw new Error(`에러: ${response.status}`);
                const json = await response.json();
                setData(json || []);
            } catch (err: any) {
                setError("원정대 데이터를 불러오는 중 에러가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchSiblings();
    }, [character?.CharacterName]);

    // 2. 서버별 그룹화 로직 (이 부분이 에러의 원인이었습니다)
    const groupedByServer = useMemo(() => {
        if (!data || data.length === 0) return {};

        const groups = data.reduce((acc: Record<string, CharacterData[]>, char: CharacterData) => {
            const server = char.ServerName || "기타";
            if (!acc[server]) acc[server] = [];
            acc[server].push(char);
            return acc;
        }, {});

        // 레벨 내림차순 정렬
        Object.keys(groups).forEach(server => {
            groups[server].sort((a, b) => {
                const levelA = parseFloat(a.ItemAvgLevel.replace(/,/g, ''));
                const levelB = parseFloat(b.ItemAvgLevel.replace(/,/g, ''));
                return levelB - levelA;
            });
        });
        return groups;
    }, [data]);

    if (loading) return (
        <div className="w-full py-40 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-purple-500 w-8 h-8 mb-4" />
            <p className="text-zinc-500 text-xs tracking-widest uppercase">Syncing Expedition</p>
        </div>
    );

    if (error) return (
        <div className="w-full py-20 text-center text-zinc-500">{error}</div>
    );

    return (
        <div className="w-full bg-[#050505] p-4 sm:p-6 space-y-10">
            {Object.entries(groupedByServer).map(([serverName, characters]) => (
                <div key={serverName} className="space-y-6">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-white tracking-tighter uppercase">{serverName}</h3>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-pink-500/30 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {characters.map((item) => {
                                const isCurrent = item.CharacterName === character?.CharacterName;
                                const grade = getGradeStyles(item.ItemAvgLevel, isCurrent);

                                return (
                                    <motion.div
                                        key={item.CharacterName}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={() => !isCurrent && navigate(`/profilePage?name=${encodeURIComponent(item.CharacterName)}`)}
                                        className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300
                                            ${isCurrent
                                            ? `bg-white/[0.05] ${grade.border} ${grade.glow} ring-1 ring-white/10`
                                            : 'bg-white/[0.02] border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/20 cursor-pointer'}`}
                                    >
                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="flex items-center gap-3">
                                                <div className="shrink-0">
                                                    <img
                                                        src={CLASS_ICON_MAP[item.CharacterClassName] || DEFAULT_ICON}
                                                        alt=""
                                                        className={`w-11 h-11 rounded-full border p-0.5 bg-black/40
                                                            ${isCurrent ? grade.border : 'border-white/10'}`}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 leading-tight">
                                                        <h4 className={`text-[15px] font-black truncate ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                                                            {item.CharacterName}
                                                        </h4>
                                                        {isCurrent && <Sparkles size={12} className="text-purple-400 shrink-0" />}
                                                    </div>
                                                    <p className="text-[11px] font-bold text-zinc-500 mt-0.5">
                                                        {item.CharacterClassName} <span className="text-zinc-800 px-1">|</span> Lv.{item.CharacterLevel}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${grade.bg} ${grade.text}`}>
                                                        <Trophy size={14} fill="currentColor" fillOpacity={0.2} />
                                                    </div>
                                                    <span className={`text-lg font-black tracking-tighter ${grade.text}`}>
                                                        {item.ItemAvgLevel}
                                                    </span>
                                                </div>
                                                {!isCurrent && (
                                                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            ))}
        </div>
    );
};