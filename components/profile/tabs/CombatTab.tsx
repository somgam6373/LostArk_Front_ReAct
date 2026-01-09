import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export const CombatTab = ({ character }: { character: any }) => {
    const [equipments, setEquipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEquipment = async () => {
            if (!character?.CharacterName) return;
            try {
                const response = await fetch(`http://localhost:8080/equipment?name=${encodeURIComponent(character.CharacterName)}`);
                const data = await response.json();
                setEquipments(data);
            } catch (error) {
                console.error("장비 호출 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEquipment();
    }, [character?.CharacterName]);

    const getItemsByType = (types: string[]) => equipments.filter(item => types.includes(item.Type));

    // ✅ 요청하신 품질 색상 체계 적용
    const getQualityColor = (q: number) => {
        if (q === 100) return 'text-[#FF8000] border-[#FF8000]/50'; // 100 주황
        if (q >= 90) return 'text-[#CE43FB] border-[#CE43FB]/50';  // 90-99 보라
        if (q >= 70) return 'text-[#00B0FA] border-[#00B0FA]/50';  // 70-89 파랑
        if (q >= 31) return 'text-[#00D100] border-[#00D100]/50';  // 31-69 초록
        if (q >= 1) return 'text-[#FF4040] border-[#FF4040]/50';   // 1-30 빨강
        return 'text-zinc-600 border-zinc-800';                    // 0 없음
    };

    if (loading) return (
        <div className="py-20 text-center bg-[#121212]">
            <Loader2 className="animate-spin mx-auto text-indigo-500" />
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 bg-[#121212] text-zinc-300 min-h-screen">

            {/* ⬅️ 왼쪽 영역: 장비 */}
            <div className="space-y-12">
                <section>
                    <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-3">
                        <h2 className="text-xl font-black text-white tracking-tight italic">EQUIPMENT</h2>
                    </div>
                    <div className="space-y-4">
                        {getItemsByType(["무기", "투구", "상의", "하의", "장갑", "어깨"]).map((item, i) => {
                            const tooltip = JSON.parse(item.Tooltip);
                            const quality = tooltip.Element_001?.value?.qualityValue ?? 0;
                            const upgrade = item.Name.split(' ')[0];

                            return (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="relative">
                                        <img src={item.Icon} className="w-12 h-12 rounded-lg border border-white/5" alt="" />
                                    </div>
                                    <div className="flex flex-1 items-center gap-4">
                                        <span className="text-zinc-500 text-[11px] w-20 font-bold uppercase tracking-tighter">고대 갱신필요</span>
                                        <span className="font-black text-zinc-100 italic text-lg">{upgrade}</span>
                                        <div className="flex-1 h-[1px] bg-zinc-800/30"></div>
                                        <span className={`border px-2 py-0.5 rounded text-[11px] font-black min-w-[35px] text-center transition-colors ${getQualityColor(quality)}`}>
                      {quality === 0 ? '-' : quality}
                    </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* ➡️ 오른쪽 영역: 악세 */}
            <div className="space-y-12">
                <section>
                    <div className="flex justify-between items-end mb-6 border-b border-zinc-800 pb-3">
                        <h2 className="text-xl font-black text-white tracking-tight italic">ACCESSORY</h2>
                        <span className="text-indigo-400 text-[10px] font-bold tracking-tighter bg-indigo-500/10 px-2 py-1 rounded">ARK PASSIVE ON</span>
                    </div>
                    <div className="space-y-6">
                        {getItemsByType(["목걸이", "귀걸이", "반지"]).map((item, i) => {
                            const tooltip = JSON.parse(item.Tooltip);
                            const quality = tooltip.Element_001?.value?.qualityValue ?? 0;

                            return (
                                <div key={i} className="flex items-start gap-5 group">
                                    <div className="relative flex-shrink-0">
                                        <img src={item.Icon} className="w-12 h-12 rounded-lg bg-zinc-900 border border-white/5" alt="" />
                                        <div className={`absolute -bottom-2 left-0 right-0 text-center text-[10px] bg-[#121212] border font-black rounded-md shadow-2xl ${getQualityColor(quality)}`}>
                                            {quality === 0 ? '-' : quality}
                                        </div>
                                    </div>
                                    <div className="flex-1 border-b border-zinc-800/30 pb-4 group-last:border-0">
                                        <div className="text-sm font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">{item.Name}</div>
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-[10px] text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded uppercase font-bold">깨달음 +12</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

        </div>
    );
};