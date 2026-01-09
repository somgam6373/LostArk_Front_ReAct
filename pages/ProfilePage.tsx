import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // URL 파라미터 읽기용
import { CharacterCard } from '../components/profile/CharacterCard';
import { Info, Loader2, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
    const [searchParams] = useSearchParams();
    const characterName = searchParams.get('name');

    const [character, setCharacter] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!characterName) return;

        const fetchCharacterData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 백엔드 API 호출 (이전에 확인한 /stat 엔드포인트)
                const response = await fetch(`http://localhost:8080/stat?name=${encodeURIComponent(characterName)}`);

                if (!response.ok) {
                    throw new Error('캐릭터 정보를 불러올 수 없습니다.');
                }

                const data = await response.json();

                // ✅ 백엔드 데이터(대문자)를 컴포넌트용 구조로 변환 (CharacterCard 내부 로직에 맞춤)
                // 만약 CharacterCard 내부에서 이미 대문자 필드를 처리한다면 이 과정은 생략 가능합니다.
                setCharacter(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCharacterData();
    }, [characterName]);

    // 로딩 상태 UI
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <p className="text-zinc-500 font-bold tracking-widest uppercase animate-pulse">Synchronizing Data...</p>
            </div>
        );
    }

    // 에러 상태 UI
    if (error || !character) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500 gap-4">
                <AlertCircle size={48} className="text-red-500/50" />
                <p className="font-bold">{error || '캐릭터를 찾을 수 없습니다.'}</p>
                <button
                    onClick={() => window.history.back()}
                    className="mt-2 text-sm text-indigo-400 hover:underline"
                >
                    돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between px-4">
                <div>
                    <h2 className="text-2xl font-black tracking-tight dark:text-white uppercase">CHARACTER PROFILE</h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1 italic">
                        {character.CharacterName} 의 실시간 데이터
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5">
                    <Info size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                        레벨: {character.ItemAvgLevel}
                    </span>
                </div>
            </div>

            {/* 실제 받아온 데이터를 CharacterCard에 전달 */}
            <CharacterCard character={character} />

            {/* 여기에 나중에 원정대 캐릭터 목록(Siblings) 컴포넌트를 추가하면 좋습니다 */}
        </div>
    );
};

export default ProfilePage;