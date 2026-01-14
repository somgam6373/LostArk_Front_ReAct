import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CharacterCard } from '../components/profile/CharacterCard';
import { Loader2, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
    const [searchParams] = useSearchParams();
    const characterName = searchParams.get('name') ?? '';

    const [character, setCharacter] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCharacterData = useCallback(async () => {
        if (!characterName) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/stat?name=${encodeURIComponent(characterName)}`);
            if (!response.ok) throw new Error('캐릭터 정보를 불러올 수 없습니다.');

            const data = await response.json();
            setCharacter(data);
        } catch (err: any) {
            setError(err?.message ?? '캐릭터 정보를 불러올 수 없습니다.');
            setCharacter(null);
        } finally {
            setLoading(false);
        }
    }, [characterName]);

    // ✅ 기존 업데이트 버튼 함수명 유지
    const handleUpdateClick = useCallback(() => {
        fetchCharacterData();
    }, [fetchCharacterData]);

    useEffect(() => {
        if (!characterName) {
            setLoading(false);
            setCharacter(null);
            setError('캐릭터 이름이 없습니다.');
            return;
        }
        fetchCharacterData();
    }, [characterName, fetchCharacterData]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <p className="text-zinc-500 font-bold tracking-widest uppercase animate-pulse">Synchronizing Data...</p>
            </div>
        );
    }

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
            <CharacterCard
                character={character}
                characterName={characterName}
                onUpdate={handleUpdateClick}
            />
        </div>
    );
};

export default ProfilePage;
