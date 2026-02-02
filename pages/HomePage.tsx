import React, { useState, useEffect, useRef } from "react";
import {
    Search,
    Clock,
    X,
    BarChart as BarChartIcon,
    RotateCcw,
    History,
    Book,
    Box
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts'

interface MarketItem {
    Id: number;
    Name: string;
    Grade: string;
    Icon: string;
    CurrentMinPrice: number;
    RecentPrice: number;
    YDayAvgPrice: number;
    BundleCount: number;
}

const HomePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const historyRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [history, setHistory] = useState<string[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [marketData, setMarketData] = useState<MarketItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [realTimeHistory, setRealTimeHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'material' | 'engraving'>('material');
    const [listSearchTerm, setListSearchTerm] = useState("");

    const fetchAndSaveData = async () => {
        setIsRefreshing(true);
        try {
            const requests = [
                axios.get("/markets", { params: { name: "융화 재료", category: 50010 } }),
                axios.get("/markets", { params: { name: "각인서", category: 40000, grade: "유물" } }),
            ];
            const responses = await Promise.all(requests);
            const combined: MarketItem[] = responses.flatMap(res => {
                const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
                if (Array.isArray(data)) return data.flatMap(page => page.Items || []);
                return data.Items || [];
            });

            const uniqueItems = Array.from(new Map(combined.map(item => [item.Id, item])).values());
            setMarketData(uniqueItems);
            if (uniqueItems.length > 0 && !selectedItem) setSelectedItem(uniqueItems[0]);
        } catch (error) {
            console.error("데이터 로드 실패:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 600);
        }
    };

    const updateLocalStorage = (item: MarketItem) => {
        const storageKey = `realtime_price_${item.Id}`;
        const savedData = localStorage.getItem(storageKey);
        let historyArr = savedData ? JSON.parse(savedData) : [];
        const newPoint = {
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            price: item.CurrentMinPrice,
            timestamp: Date.now()
        };
        if (historyArr.length === 0 || historyArr[historyArr.length - 1].time !== newPoint.time) {
            historyArr.push(newPoint);
        } else {
            historyArr[historyArr.length - 1] = newPoint;
        }
        const updatedHistory = historyArr.slice(-60);
        localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
        setRealTimeHistory(updatedHistory);
    };

    useEffect(() => {
        fetchAndSaveData();
        const interval = setInterval(fetchAndSaveData, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedItem) {
            updateLocalStorage(selectedItem);
            const savedData = localStorage.getItem(`realtime_price_${selectedItem.Id}`);
            setRealTimeHistory(savedData ? JSON.parse(savedData) : []);
        }
    }, [selectedItem?.Id]);

    const handleSearch = (e: React.FormEvent | string) => {
        if (typeof e !== 'string') e.preventDefault();
        const q = typeof e === 'string' ? e : searchQuery.trim();
        if (!q) return;
        const updated = [q, ...history.filter(item => item !== q)].slice(0, 5);
        setHistory(updated);
        localStorage.setItem('searchHistory', JSON.stringify(updated));
        navigate(`/profilePage?name=${encodeURIComponent(q)}`);
        setIsHistoryOpen(false);
    };

    const deleteHistory = (e: React.MouseEvent, term: string) => {
        e.stopPropagation();
        const updated = history.filter(item => item !== term);
        setHistory(updated);
        localStorage.setItem('searchHistory', JSON.stringify(updated));
    };

    const filteredData = marketData.filter(item => {
        const matchesTab = activeTab === 'material' ? item.Name.includes("융화 재료") : item.Name.includes("각인서");
        const matchesSearch = item.Name.toLowerCase().includes(listSearchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    }).sort((a, b) => b.CurrentMinPrice - a.CurrentMinPrice);

    const priceDiff = selectedItem ? selectedItem.CurrentMinPrice - selectedItem.YDayAvgPrice : 0;
    const priceDiffPercent = selectedItem && selectedItem.YDayAvgPrice > 0
        ? ((priceDiff / selectedItem.YDayAvgPrice) * 100).toFixed(1)
        : "0.0";

    const isUp = priceDiff > 0;
    const isDown = priceDiff < 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center min-h-screen pt-6 lg:pt-10 mx-auto max-w-7xl px-4 lg:px-6 pb-20"
        >

            {/* 로고 영역 */}
            <div className="text-center mb-6 lg:mb-12">
                <h1 className="text-[42px] lg:text-[80px] font-black tracking-tighter text-white mb-1 lg:mb-2 leading-none">LOAPANG</h1>
                <p className="text-zinc-500 lg:text-zinc-400 text-[12px] lg:text-lg font-medium tracking-tight">로스트아크 실시간 시세 및 전적 검색</p>
            </div>

            {/* 메인 검색창 */}
            <div className="w-full max-w-2xl relative group mb-8 lg:mb-16" ref={historyRef}>
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-900 rounded-[1.5rem] lg:rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                <form onSubmit={handleSearch} className="relative z-20">
                    <input
                        type="text"
                        inputMode="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsHistoryOpen(true)}
                        placeholder="캐릭터명을 입력하세요"
                        className="w-full h-14 lg:h-20 px-6 lg:px-10 rounded-2xl lg:rounded-[1.5rem] bg-zinc-900/90 border-2 border-white/10 focus:border-indigo-500 outline-none text-lg lg:text-2xl font-bold text-white shadow-2xl transition-all"
                    />
                    <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 lg:w-14 lg:h-14 bg-white text-black rounded-xl lg:rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
                        <Search strokeWidth={3} className="w-5 h-5 lg:w-7 lg:h-7" />
                    </button>
                </form>

                {/* 검색 기록 드롭다운 */}
                <AnimatePresence>
                    {isHistoryOpen && history.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-[110%] left-0 right-0 z-50 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 lg:py-2">
                            {history.map((term, index) => (
                                <div key={index} onClick={() => handleSearch(term)} className="flex items-center justify-between px-5 py-3 lg:px-6 lg:py-3 hover:bg-white/5 cursor-pointer transition-colors">
                                    <div className="flex items-center gap-3 text-zinc-300">
                                        <Clock size={14} className="text-zinc-600" />
                                        <span className="text-sm lg:text-base font-medium">{term}</span>
                                    </div>
                                    <button onClick={(e) => deleteHistory(e, term)} className="p-2 text-zinc-600 hover:text-red-500"><X size={16} /></button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 메인 콘텐츠 그리드 */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch max-w-[1000px]">

                {/* 좌측: 아이템 목록 (모바일 높이 h-[400px]로 조정) */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[2rem] lg:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl backdrop-blur-sm h-[400px] lg:h-[500px]">
                    <div className="flex border-b border-white/5 bg-white/5 p-2 gap-1.5 lg:gap-2 shrink-0">
                        <button onClick={() => { setActiveTab('material'); setListSearchTerm(""); }} className={`flex-1 flex items-center justify-center gap-1.5 lg:gap-2 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl transition-all font-bold text-[13px] lg:text-base ${activeTab === 'material' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:bg-white/5'}`}>
                            <Box size={14} /> 융화 재료
                        </button>
                        <button onClick={() => { setActiveTab('engraving'); setListSearchTerm(""); }} className={`flex-1 flex items-center justify-center gap-1.5 lg:gap-2 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl transition-all font-bold text-[13px] lg:text-base ${activeTab === 'engraving' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:bg-white/5'}`}>
                            <Book size={14} /> 각인서
                        </button>
                        <button onClick={fetchAndSaveData} className={`px-3 lg:px-4 ${isRefreshing ? 'animate-spin' : ''} text-zinc-500`}><RotateCcw size={16} /></button>
                    </div>

                    <div className="px-4 py-3 bg-white/[0.02] border-b border-white/5 shrink-0">
                        <div className="relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input type="text" value={listSearchTerm} onChange={(e) => setListSearchTerm(e.target.value)} placeholder="검색..." className="w-full bg-zinc-800/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <div key={item.Id} onClick={() => { setSelectedItem(item); if(window.innerWidth < 1024) scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className={`flex items-center justify-between px-5 py-3 lg:px-6 lg:py-4 cursor-pointer transition-all ${selectedItem?.Id === item.Id ? 'bg-indigo-500/10 border-l-4 border-indigo-500' : 'hover:bg-white/[0.02] border-l-4 border-transparent'}`}>
                                    <div className="flex items-center gap-3 lg:gap-4">
                                        <img src={item.Icon} className="w-9 h-9 lg:w-12 lg:h-12 bg-zinc-800 rounded-xl p-1" alt="" />
                                        <div className="min-w-0">
                                            <p className={`font-bold text-[13px] lg:text-sm truncate ${item.Grade === '전설' ? 'text-orange-400' : 'text-zinc-200'}`}>
                                                {item.Name.replace(" 각인서", "").replace("유물 ", "").replace(" 융화 재료", "")}
                                            </p>
                                            <p className="text-[9px] text-zinc-500 font-bold uppercase">{item.Grade}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm lg:text-lg font-black text-amber-400">{item.CurrentMinPrice.toLocaleString()}G</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center text-zinc-600 font-bold text-sm">데이터가 없습니다.</div>
                        )}
                    </div>
                </div>

                {/* 우측: 시세 상세 섹션 */}
                <div ref={scrollRef} className="scroll-mt-20 bg-zinc-900/50 border border-white/5 rounded-[2rem] lg:rounded-[2.5rem] flex flex-col p-6 lg:p-10 shadow-2xl backdrop-blur-sm min-h-[400px] lg:h-[500px]">
                    {selectedItem ? (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6 gap-2">
                                <div className="min-w-0">
                                    <h2 className="text-lg lg:text-2xl font-black text-white tracking-tighter truncate">{selectedItem.Name}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                        <span className="text-indigo-500 text-[9px] lg:text-[10px] font-black uppercase">Live Price</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-zinc-500 text-[9px] lg:text-[10px] font-bold mb-0.5 lg:mb-1">현재 최저가</p>
                                    <div className="flex flex-col items-end gap-1">
                                        <p className="text-xl lg:text-3xl font-black text-amber-400 leading-none">
                                            {selectedItem.CurrentMinPrice.toLocaleString()}G
                                        </p>
                                        {selectedItem.YDayAvgPrice > 0 && (
                                            <div className={`text-[10px] lg:text-[11px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                                                isUp ? 'bg-rose-500/10 text-rose-500' :
                                                    isDown ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-zinc-500/10 text-zinc-500'
                                            }`}>
                                                <span>{isUp ? '▲' : isDown ? '▼' : ''}</span>
                                                <span>{Math.abs(Number(priceDiffPercent))}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 bg-black/20 rounded-2xl lg:rounded-[2rem] p-3 lg:p-6 border border-white/5 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            { name: '전날 평균', price: selectedItem.YDayAvgPrice },
                                            { name: '최근 거래', price: selectedItem.RecentPrice },
                                            { name: '현재 최저', price: selectedItem.CurrentMinPrice }
                                        ]}
                                        margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
                                        barCategoryGap="25%"
                                    >
                                        <CartesianGrid vertical={false} stroke="#ffffff08" strokeDasharray="0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }}
                                            interval={0}
                                        />
                                        <YAxis hide domain={[(dataMin: number) => dataMin * 0.95, (dataMax: number) => dataMax * 1.05]} />
                                        <Tooltip
                                            cursor={{ fill: 'white', opacity: 0.05 }}
                                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                                            itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
                                            formatter={(value: number) => [`${value.toLocaleString()} G`, '가격']}
                                        />
                                        <Bar dataKey="price" radius={[8, 8, 0, 0]}>
                                            <Cell fill="#3f3f46" />
                                            <Cell fill="#818cf8" />
                                            <Cell fill="#fbbf24" />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-5 lg:mt-6 grid grid-cols-3 gap-2 lg:gap-4 border-t border-white/5 pt-5 lg:pt-6">
                                <div className="text-center">
                                    <p className="text-[9px] lg:text-[10px] text-zinc-500 font-bold mb-0.5 uppercase tracking-tighter">전날 평균</p>
                                    <p className="text-[12px] lg:text-sm font-bold text-zinc-300">{selectedItem.YDayAvgPrice.toLocaleString()}G</p>
                                </div>
                                <div className="text-center border-x border-white/5">
                                    <p className="text-[9px] lg:text-[10px] text-zinc-500 font-bold mb-0.5 uppercase tracking-tighter">최근 거래</p>
                                    <p className="text-[12px] lg:text-sm font-bold text-indigo-400">{selectedItem.RecentPrice.toLocaleString()}G</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] lg:text-[10px] text-zinc-500 font-bold mb-0.5 uppercase tracking-tighter">현재 최저</p>
                                    <p className="text-[12px] lg:text-sm font-bold text-amber-400">{selectedItem.CurrentMinPrice.toLocaleString()}G</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-zinc-600 font-bold border-2 border-dashed border-white/5 rounded-[2rem]">
                            아이템을 선택하세요.
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default HomePage;