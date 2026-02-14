import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, Search } from "lucide-react";

import { Simulator } from "@/components/simulator/Simulator";
import { SimulatorCharacterHeader } from "@/components/simulator/SimulatorCharacterHeader";
import { SimulatorNav, SimTab } from "@/components/simulator/SimulatorNav";

type CharacterLike = any;

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL ?? "http://localhost:8080";


// --- [데이터 상수 정의] ---
const BASIC_WEAPON_ATTACK: Record<number, number> = {
    10: 111701, 11: 117112, 12: 122623, 13: 127934, 14: 133345,
    15: 138756, 16: 139730, 17: 140703, 18: 141678, 19: 142652, 20: 143626
};

const getAdditionalDamage = (quality: number): number => {
    if (quality >= 100) return 30.00;
    if (quality >= 95) return 28.05;
    if (quality >= 90) return 26.20;
    if (quality >= 85) return 24.45;
    if (quality >= 80) return 22.80;
    if (quality >= 75) return 21.25;
    if (quality >= 70) return 19.85;
    if (quality >= 65) return 18.45;
    if (quality >= 60) return 17.20;
    if (quality >= 55) return 16.05;
    if (quality >= 50) return 15.00;
    if (quality >= 45) return 14.05;
    if (quality >= 40) return 13.20;
    if (quality >= 35) return 12.45;
    if (quality >= 30) return 11.80;
    if (quality >= 25) return 11.25;
    if (quality >= 20) return 10.80;
    if (quality >= 15) return 10.45;
    if (quality >= 10) return 10.20;
    if (quality >= 5) return 10.05;
    return 10.00;
};


export const SimulatorPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [tab, setTab] = useState<SimTab>("info");
    const nameParam = (searchParams.get("name") ?? "").trim();
    const [input, setInput] = useState<string>(nameParam);
    const [character, setCharacter] = useState<CharacterLike | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    //장비 Post 요청
    const [equipmentStates, setEquipmentStates] = useState<Record<string, any>>({});
    //악세사리 Post 요청
    const [accessoryStates, setAccessoryStates] = useState<Record<string, any>>({});

    // 장비 업데이트 핸들러
    const handleEquipmentUpdate = useCallback((partName: string, data: any) => {
        setEquipmentStates(prev => {
            // 현재 값과 새로운 값이 완전히 같으면 상태를 업데이트하지 않음 (무한 루프 방지)
            if (JSON.stringify(prev[partName]) === JSON.stringify(data)) {
                return prev;
            }
            return {
                ...prev,
                [partName]: data
            };
        });
    }, []); // 의존성 배열을 비워둡니다.

    // 악세사리 업데이트 핸들러
    const handleAccessoryUpdate = useCallback((partName: string, data: any) => {
        setAccessoryStates(prev => ({
            ...prev,
            [partName]: {
                ...(prev[partName] || {}),
                ...data
            }
        }));
    }, []);


    // ✅ [추가] 백엔드 콘솔 확인용 Bulk 요청 로직
    const sendBulkRequest = useCallback(async () => {
        if (!nameParam) return;

        try {
            // 1. 먼저 /do를 호출하여 스킬/트라이포드 정보를 가져옴
            const doRes = await fetch(`${BACKEND_API_URL}/do?characterName=${encodeURIComponent(nameParam)}`);
            if (!doRes.ok) return;
            const skills: any[] = await doRes.json();

            // 2. SynergyRequest 구조로 매핑 (skillName, tripodName)
            const requests = skills.flatMap((s: any) =>
                (s.selectedTripods ?? []).map((t: any) => ({
                    skillName: s.name,
                    tripodName: t.name
                }))
            );

            // 3. /bulk로 POST 요청 (백엔드 콘솔 출력 목적)
            if (requests.length > 0) {
                await fetch(`${BACKEND_API_URL}/bulk`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requests)
                });
                // 응답은 처리하지 않음 (백엔드 콘솔 확인용)
            }
        } catch (e) {
            console.error("Bulk request failed", e);
        }
    }, [nameParam]);

    // ✅ [수정] 탭 변경 핸들러
    const handleTabChange = (nextTab: SimTab) => {
        setTab(nextTab);
        if (nextTab === "result") {
            sendBulkRequest();
        }
    };

// --- [계산 로직: 무기 공격력 및 기본 공격력] ---
// SimulatorPage.tsx 내부

    const getCalculatedWeaponInfo = (currentEquipment: Record<string, any>) => {
        // 💡 중요: 인자로 받은 currentEquipment 사용
        const weapon = currentEquipment["무기"];
        if (!weapon || !character) return null;

        // 1. 숫자 형변환 강제 및 기본값 설정
        const n = Number(weapon.advancedReinforce) || 0;
        const level = Number(weapon.level) || 0;
        const quality = Number(weapon.quality) || 0;

        // 2. 상급 재련 추가 무공
        let advAttack = 0;
        if (n <= 20) advAttack = 480 * n;
        else if (n <= 40) advAttack = 9680 + (720 * (n - 20));

        // 3. 무기 공격력 합계
        const weaponAttack = (BASIC_WEAPON_ATTACK[level] || 0) + advAttack;

        // 4. 추가 피해 (품질)
        const additionalDamage = getAdditionalDamage(quality);

        // 5. 기본 공격력 계산 (스탯 콤마 제거 로직 추가)
        const statValue = character.Stats?.find((s: any) => ["힘", "민첩", "지능"].includes(s.Type))?.Value || "0";
        const mainStat = Number(statValue.toString().replace(/,/g, ""));

        let bonusMultiplier = 1.0;
        if (n >= 40) bonusMultiplier = 1.03;
        else if (n >= 30) bonusMultiplier = 1.02;

        const baseAttack = Math.round(Math.sqrt((mainStat * weaponAttack) / 6) * bonusMultiplier);

        return { weaponAttack, additionalDamage, baseAttack };
    };

    const handleRunSimulation = async () => {
        setTab("result");
        if (!nameParam) return;

        const weaponInfo = getCalculatedWeaponInfo(equipmentStates);

        // 콘솔에서 수정된 값이 반영되었는지 확인해보세요
        console.log("전송될 무기 정보:", weaponInfo);
        try {
            // 장비 정보와 악세사리 정보를 각각의 엔드포인트로 전송
            await Promise.all([
                fetch(`/simulatorEquipments`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        calculatedWeapon: weaponInfo // 최신 계산 결과
                    }),
                }),
                fetch(`/simulatorAccessories`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        characterName: nameParam,
                        accessories: accessoryStates
                    }),
                })
            ]);
            console.log("시뮬레이션 요청 완료");
            console.log(accessoryStates);
            console.log(weaponInfo);
        } catch (e) {
            console.error("Simulation request failed", e);
        }
    };

    const shouldShowEmpty = useMemo(() => {
        if (loading) return false;
        if (!nameParam) return true;
        return !character;
    }, [loading, nameParam, character]);

    useEffect(() => {
        setInput(nameParam);
    }, [nameParam]);

    useEffect(() => {
        let alive = true;
        const fetchCharacter = async () => {
            if (!nameParam) {
                setCharacter(null);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/stat?name=${encodeURIComponent(nameParam)}`);
                if (!res.ok) throw new Error("캐릭터 정보를 불러올 수 없습니다.");
                const data = await res.json();
                if (alive) {
                    setCharacter(data);
                    sessionStorage.setItem("last_sim_name", nameParam);
                }
            } catch (e: any) {
                if (alive) {
                    setCharacter(null);
                    setError(e?.message ?? "검색 실패");
                }
            } finally {
                if (alive) setLoading(false);
            }
        };
        fetchCharacter();
        return () => { alive = false; };
    }, [nameParam]);

    const submitSearch = () => {
        const n = input.trim();
        if (!n) return;
        navigate(`/simulatorPage?name=${encodeURIComponent(n)}`);
    };

    const goToProfilePage = () => {
        if (!character?.CharacterName) return;
        window.location.href = `/profilePage?name=${encodeURIComponent(character.CharacterName)}`;
    };

    if (loading && nameParam) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[420px] gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={44} />
                <p className="text-zinc-500 font-bold tracking-widest uppercase animate-pulse">Synchronizing Data...</p>
            </div>
        );
    }

    if (shouldShowEmpty) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[520px] gap-5">
                <div className="text-zinc-400 font-black text-xl">캐릭터 정보가 없습니다.</div>
                <div className="w-full max-w-xl flex items-center gap-2 bg-zinc-950/40 border border-white/10 rounded-2xl px-4 py-3">
                    <Search size={18} className="text-zinc-500" />
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                        placeholder="캐릭터 이름을 입력하세요"
                        className="flex-1 bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 font-bold"
                    />
                    <button onClick={submitSearch} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-500 transition-colors">검색</button>
                </div>
                {error && <div className="text-red-400/80 text-sm font-bold">{error}</div>}
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-[1600px] mx-auto px-4 lg:px-0">
            <aside className="w-full lg:w-[420px] shrink-0 lg:sticky lg:top-24 h-fit space-y-4">
                <div className="bg-zinc-900/60 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                    <SimulatorCharacterHeader character={character} />
                </div>

                <div className="bg-zinc-900/40 rounded-3xl border border-white/5 p-3 backdrop-blur-md shadow-lg">
                    <SimulatorNav
                        currentTab={tab}
                        onTabChange={handleTabChange} // 수정된 핸들러 연결
                        onGoToProfile={goToProfilePage}
                        onRunSimulation={handleRunSimulation} // 수정된 핸들러 연결
                    />
                </div>

                <div className="p-5 bg-zinc-900/20 rounded-2xl border border-white/5 text-[11px] text-zinc-500 leading-relaxed">
                    <p>※ 현재 데이터는 로스트아크 API를 기반으로 동기화되었습니다.</p>
                    <p>※ 시뮬레이션 결과는 실제 수치와 약간의 오차가 발생할 수 있습니다.</p>
                </div>
            </aside>

            <main className="flex-1 min-w-0">
                <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800/30 p-1 min-h-[600px]">
                    <Simulator
                        character={character}
                        activeTab={tab}
                        onEquipmentUpdate={handleEquipmentUpdate}
                        onAccessoryUpdate={handleAccessoryUpdate} // ✅ 핸들러 연결
                        accessoryStates={accessoryStates} // ✅ 현재 상태 전달
                    />
                </div>
            </main>
        </div>
    );
};

export default SimulatorPage;