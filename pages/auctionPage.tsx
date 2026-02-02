import React, { useMemo, useState } from "react";
import { Gavel, Copy, CheckCircle2 } from "lucide-react";

const GoldCalculator = () => { // 컴포넌트명을 역할에 맞게 변경 (RaidPage 내에서 호출되므로)
    const [priceInput, setPriceInput] = useState<string>("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const price = useMemo(() => {
        const n = Number(priceInput);
        return Number.isFinite(n) ? Math.max(0, n) : 0;
    }, [priceInput]);

    const formatGold = (n: number) =>
        `${Math.max(0, Math.floor(n)).toLocaleString("ko-KR")} G`;

    const plainInt = (n: number) => String(Math.max(0, Math.floor(n)));

    // ✅ 계산 로직
    const { bid4, bid8, bid16 } = useMemo(() => {
        const net = price * 0.95;
        const calc = (k: number) => net * ((k - 1) / k);
        return { bid4: calc(4), bid8: calc(8), bid16: calc(16) };
    }, [price]);

    const { sellBid4, sellBid8, sellBid16, targetProfit } = useMemo(() => {
        const net = price * 0.95;
        const target = Math.min(price * 0.10, 3000);
        const calc = (k: number) => {
            const base = net - target;
            return base <= 0 ? 0 : base * ((k - 1) / k);
        };
        return {
            sellBid4: calc(4),
            sellBid8: calc(8),
            sellBid16: calc(16),
            targetProfit: target,
        };
    }, [price]);

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1000);
        } catch (err) { console.error(err); }
    };

    const BidButton = ({ label, value, id, colorClass }: any) => (
        <button
            type="button"
            onClick={() => copyToClipboard(plainInt(value), id)}
            className={`group relative text-left p-3 md:p-4 bg-zinc-900/80 rounded-2xl border border-white/5 hover:border-${colorClass}-500/50 active:scale-95 transition-all duration-200`}
        >
            <div className="flex justify-between items-start mb-1">
                <p className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase">{label}</p>
                {copiedId === id ? (
                    <CheckCircle2 size={12} className="text-emerald-500" />
                ) : (
                    <Copy size={10} className="text-zinc-700 group-hover:text-zinc-400" />
                )}
            </div>
            <p className={`text-sm md:text-lg font-black mt-1 break-all ${copiedId === id ? 'text-white' : `text-${colorClass}-400`}`}>
                {formatGold(value)}
            </p>
        </button>
    );

    return (
        // RaidPage 내부 탭으로 들어갈 것이므로 min-h-screen과 배경색 제거
        <div className="w-full max-w-xl mx-auto py-2 md:py-6">

            {/* 타이틀 섹션: 모바일에서 크기 축소 */}
            <div className="text-center mb-6 md:mb-8 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-1">
                    <Gavel size={12} className="text-indigo-500" />
                    <span className="text-[10px] md:text-[12px] font-black text-indigo-500 uppercase tracking-tighter">Auction System</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">경매 계산기</h1>
                <p className="text-xs md:text-sm text-zinc-500 font-medium">레이드 전리품 분배를 위한 최적의 입찰가 가이드</p>
            </div>

            {/* 메인 계산기 박스: 모바일 패딩 조정 */}
            <div className="bg-zinc-900/30 backdrop-blur-xl p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl">
                <div className="space-y-6 md:space-y-8">

                    {/* Input Section */}
                    <div className="bg-zinc-900/80 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 shadow-inner">
                        <p className="text-[10px] md:text-[11px] font-black text-indigo-500/90 uppercase mb-2 tracking-widest">
                            현재 아이템 시세
                        </p>
                        <div className="relative">
                            <input
                                type="number"
                                inputMode="numeric" // 모바일 숫자 키패드 호출
                                className="bg-transparent w-full text-3xl md:text-4xl font-black text-white outline-none placeholder:text-zinc-800"
                                placeholder="0"
                                value={priceInput}
                                onChange={(e) => setPriceInput(e.target.value)}
                            />
                            <span className="absolute right-0 bottom-1 md:bottom-2 text-sm md:text-xl font-bold text-zinc-600">Gold</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <p className="text-[10px] md:text-xs text-zinc-500 font-semibold flex justify-between">
                                <span>수수료 5% 제외 (실수령액)</span>
                                <span className="text-zinc-300">{(price * 0.95).toLocaleString()} G</span>
                            </p>
                        </div>
                    </div>

                    {/* 본인 사용 섹션 */}
                    <section className="space-y-3">
                        <p className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] pl-1">
                            본인 사용 (손익분기점)
                        </p>
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                            <BidButton label="4인" value={bid4} id="b4" colorClass="emerald" />
                            <BidButton label="8인" value={bid8} id="b8" colorClass="sky" />
                            <BidButton label="16인" value={bid16} id="b16" colorClass="purple" />
                        </div>
                    </section>

                    {/* 판매 목적 섹션 */}
                    <section className="space-y-3">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-0 pl-1">
                            <p className="text-[10px] md:text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                                판매 목적 (수익 확보)
                            </p>
                            <span className="w-fit text-[9px] md:text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full font-bold">
                                목표이익: {formatGold(targetProfit)}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                            <BidButton label="4인" value={sellBid4} id="sb4" colorClass="emerald" />
                            <BidButton label="8인" value={sellBid8} id="sb8" colorClass="sky" />
                            <BidButton label="16인" value={sellBid16} id="sb16" colorClass="purple" />
                        </div>
                    </section>
                </div>

                <p className="text-center mt-8 md:mt-10 text-[9px] md:text-[10px] text-zinc-700 font-medium">
                    금액을 클릭하면 자동으로 클립보드에 복사됩니다.
                </p>
            </div>
        </div>
    );
};

export default GoldCalculator;