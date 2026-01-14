import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, Search } from "lucide-react";

// 너 프로젝트 경로에 맞게 조정
import { Simulator } from "@/components/simulator/Simulator";
import { SimulatorCharacterHeader } from "@/components/simulator/SimulatorCharacterHeader";

// ---------------------- types (최소) ----------------------
type CharacterLike = any;

// ---------------------- component ----------------------
export const SimulatorPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // ✅ URL 파라미터: /simulatorPage?name=캐릭명
    const nameParam = (searchParams.get("name") ?? "").trim();

    // ✅ UI용 입력값
    const [input, setInput] = useState<string>(nameParam);

    // ✅ 로드된 캐릭터(성공하면 여기 들어감)
    const [character, setCharacter] = useState<CharacterLike | null>(null);

    // ✅ 로딩 / 에러
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ “정보 없음” 화면이 로딩 중에 깜빡이는 문제 방지용:
    // - nameParam이 있는데 fetch 중이면 "정보 없음"을 보여주지 않음
    const shouldShowEmpty = useMemo(() => {
        if (loading) return false;
        if (!nameParam) return true; // name 자체가 없으면 검색창 있는 empty 페이지
        // nameParam은 있는데, 로딩 끝났고 character도 없으면 진짜 empty(실패)
        return !character;
    }, [loading, nameParam, character]);

    // ✅ URL이 바뀌면 입력창도 동기화
    useEffect(() => {
        setInput(nameParam);
    }, [nameParam]);

    // ✅ nameParam이 있으면 /stat 로 캐릭터 불러오기
    useEffect(() => {
        let alive = true;

        const fetchCharacter = async () => {
            if (!nameParam) {
                setError(null);
                // name이 없을 때는 기존 캐릭터를 굳이 날려도 되고 유지해도 되는데
                // "상단 네비로 들어왔을 때" 빈 화면이 맞으니 null로 정리
                setCharacter(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`/stat?name=${encodeURIComponent(nameParam)}`);
                if (!res.ok) throw new Error("캐릭터 정보를 불러올 수 없습니다.");

                const data = await res.json();

                if (!alive) return;

                // ✅ 여기서 data 구조는 ProfilePage에서 그대로 쓰던 걸 그대로 받는다고 가정
                setCharacter(data);

                // ✅ 최근 성공 캐릭명 저장 (선택)
                sessionStorage.setItem("last_sim_name", nameParam);
            } catch (e: any) {
                if (!alive) return;
                setCharacter(null);
                setError(e?.message ?? "캐릭터 정보를 불러올 수 없습니다.");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        };

        fetchCharacter();
        return () => {
            alive = false;
        };
    }, [nameParam]);

    // ✅ 검색 실행: URL을 바꾸면 위 useEffect가 자동으로 로드함
    const submitSearch = () => {
        const n = input.trim();
        if (!n) return;

        // URL로 이동 -> SimulatorPage가 param 보고 fetch
        navigate(`/simulatorPage?name=${encodeURIComponent(n)}`);
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter") submitSearch();
    };

    // ---------------------- Render ----------------------

    // ✅ 로딩 화면(깜빡임 방지: nameParam이 있을 때만 로딩)
    if (loading && nameParam) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[420px] gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={44} />
                <p className="text-zinc-500 font-bold tracking-widest uppercase animate-pulse">
                    Synchronizing Data...
                </p>
            </div>
        );
    }

    // ✅ “캐릭터 정보가 없습니다” + 검색창 화면 (진짜 빈 상태일 때만)
    if (shouldShowEmpty) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[520px] gap-5">
                <div className="text-zinc-400 font-black text-xl">캐릭터 정보가 없습니다.</div>

                <div className="w-full max-w-xl flex items-center gap-2 bg-zinc-950/40 border border-white/10 rounded-2xl px-4 py-3">
                    <Search size={18} className="text-zinc-500" />
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="캐릭터 이름을 입력하세요"
                        className="flex-1 bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 font-bold"
                    />
                    <button
                        onClick={submitSearch}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-500 transition-colors"
                    >
                        검색
                    </button>
                </div>

                {error && <div className="text-red-400/80 text-sm font-bold">{error}</div>}
            </div>
        );
    }

    // ✅ 정상 화면: 헤더 + 시뮬레이터 본문
    return (
        <div className="space-y-10">
            {/* ✅ 여기서 “시뮬레이터용 헤더(사진/치특신)”를 띄움 */}
            <SimulatorCharacterHeader character={character} />

            {/* ✅ 여기부터 시뮬레이터 레이아웃/탭/내용 */}
            <Simulator character={character} />
        </div>
    );
};
