import React, { useMemo } from "react";

type Props = {
    character: any;
};

export const SimulatorCharacterHeader: React.FC<Props> = ({ character }) => {
    if (!character) return null;

    // ✅ ProfilePage 데이터(대문자) + 혹시 소문자도 들어올 수 있으니 양쪽 대응
    const stats = useMemo(() => character?.Stats ?? character?.stats ?? [], [character]);

    const getStat = (type: string) => {
        const v = stats.find((s: any) => s?.Type === type || s?.type === type)?.Value
            ?? stats.find((s: any) => s?.Type === type || s?.type === type)?.value
            ?? "0";
        return String(v);
    };

    // ✅ (프로필 헤더와 동일) 랜덤 광원
    const lightColors = useMemo(
        () => [
            "rgba(168, 85, 247, 0.25)",
            "rgba(232, 103, 50, 0.3)",
            "rgba(255, 77, 0, 0.3)",
            "rgba(255, 215, 0, 0.25)",
            "rgba(30, 58, 138, 0.35)",
            "rgba(255, 255, 255, 0.15)",
        ],
        []
    );

    const randomColor = useMemo(() => {
        return lightColors[Math.floor(Math.random() * lightColors.length)];
    }, [lightColors]);

    return (
        // ✅ 여기 “부모 컨테이너”가 프로필 CharacterHeader와 동일해야 이미지가 자연스럽게 나옴
        <div className="relative w-full max-w-8xl mx-auto min-h-[350px] bg-[#15181d] text-white p-8 overflow-hidden rounded-xl border border-white/5">

            {/* ✅ 캐릭터 이미지 (프로필과 완전 동일) */}
            <div className="absolute right-[-4%] top-[-18%] w-[600px] h-[130%] z-0">
                <div className="relative w-full h-full">
                    <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#15181d] to-transparent z-10" />
                    <img
                        src={character.CharacterImage}
                        alt={character.CharacterName}
                        className="w-full h-[600px] object-cover object-top opacity-90"
                    />
                </div>
            </div>

            {/* ✅ 콘텐츠 영역 */}
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[290px]">
                {/* 상단: 클래스만 */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
            <span className="bg-zinc-800/80 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold text-zinc-300 border border-white/5">
              {character.CharacterClassName}
            </span>
                    </div>
                </div>

                {/* 중앙: 이름 + (작은 치특신 라인 제거됨) */}
                <div className="mt-8">
                    <h1 className="text-6xl font-black tracking-tighter mb-8">
                        {character.CharacterName}
                    </h1>
                </div>

                {/* 하단: 큰 치특신만 (아이템레벨/전투력/원정대레벨 자리로 이동) */}
                <div className="flex justify-between items-end mt-auto pt-6">
                    <div className="flex gap-12">
                        <BigStat label="치명" value={getStat("치명")} />
                        <BigStat label="특화" value={getStat("특화")} />
                        <BigStat label="신속" value={getStat("신속")} />
                    </div>
                </div>
            </div>

            {/* ✅ 광원 효과 (프로필과 동일) */}
            <div
                className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 pointer-events-none"
                style={{
                    width: "96rem",
                    height: "48rem",
                    mixBlendMode: "screen",
                    transition: "all 1s ease-out",
                    maskImage: "radial-gradient(50% 50%, black 20%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(50% 50%, black 20%, transparent 100%)",
                    filter: "blur(15rem)",
                    backgroundColor: randomColor,
                }}
            />
        </div>
    );
};

const BigStat = ({ label, value }: { label: string; value: any }) => (
    <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-zinc-500">
            <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
        </div>
        {/* ✅ “아이템레벨/전투력/원정대레벨”이랑 같은 급(큰 숫자) */}
        <span className="text-4xl font-[1000] tracking-tighter leading-none">
      {value}
    </span>
    </div>
);
