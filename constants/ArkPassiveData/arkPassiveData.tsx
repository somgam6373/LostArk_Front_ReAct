// 1. 진화 (Evolution) - 전 직업 공통
const EVOLUTION = [
    { id: 1, name: "치명", iconId: 1, max: 30, tier: 1 },
    { id: 2, name: "특화", iconId: 2, max: 30, tier: 1 },
    { id: 3, name: "제압", iconId: 3, max: 30, tier: 1 },
    { id: 4, name: "신속", iconId: 4, max: 30, tier: 1 },
    { id: 5, name: "인내", iconId: 5, max: 30, tier: 1 },
    { id: 6, name: "숙련", iconId: 6, max: 30, tier: 1 },
    { id: 16, name: "끝없는 마나", iconId: 16, max: 2, tier: 2 },
    { id: 12, name: "금단의 주문", iconId: 12, max: 2, tier: 2 },
    { id: 29, name: "예리한 감각", iconId: 29, max: 2, tier: 2 },
    { id: 34, name: "한계 돌파", iconId: 34, max: 3, tier: 2 },
    { id: 22, name: "최적화 훈련", iconId: 22, max: 2, tier: 2 },
    { id: 19, name: "축복의 여신", iconId: 19, max: 3, tier: 2 },
    { id: 14, name: "무한한 마력", iconId: 14, max: 2, tier: 3 },
    { id: 27, name: "혼신의 강타", iconId: 27, max: 2, tier: 3 },
    { id: 32, name: "일격", iconId: 32, max: 2, tier: 3 },
    { id: 35, name: "파괴 전차", iconId: 35, max: 2, tier: 3 },
    { id: 23, name: "타이밍 지배", iconId: 23, max: 2, tier: 3 },
    { id: 33, name: "정열의 춤사위", iconId: 33, max: 2, tier: 3 },
    { id: 40, name: "회심", iconId: 40, max: 1, tier: 4 },
    { id: 41, name: "달인", iconId: 41, max: 1, tier: 4 },
    { id: 44, name: "분쇄", iconId: 44, max: 1, tier: 4 },
    { id: 42, name: "선각자", iconId: 42, max: 1, tier: 4 },
    { id: 43, name: "진군", iconId: 43, max: 1, tier: 4 },
    { id: 45, name: "기원", iconId: 45, max: 1, tier: 4 },
    { id: 20, name: "뭉툭한 가시", iconId: 20, max: 2, tier: 5 },
    { id: 21, name: "음속 돌파", iconId: 21, max: 2, tier: 5 },
    { id: 38, name: "인파이팅", iconId: 38, max: 2, tier: 5 },
    { id: 18, name: "입식 타격가", iconId: 18, max: 2, tier: 5 },
    { id: 24, name: "마나 용광로", iconId: 24, max: 2, tier: 5 },
    { id: 25, name: "안정된 관리자", iconId: 25, max: 2, tier: 5 },
];

// 2. 깨달음 (Enlightenment) - 29개 전 직업 리스트
// 💡 `:` 대신 `=` 를 사용해야 합니다.
const ENLIGHTENMENT_BY_CLASS: Record<string, any[]> = {
    "워로드": [
        // 1티어
        { name: "고독한 기사", iconId: "gl_6", max: 3, tier: 1 },
        { name: "철옹성", iconId: "01_66", max: 3, tier: 1 },

        // 2티어
        { name: "정교함", iconId: "01_2", max: 3, tier: 2 },
        { name: "전투 태세", iconId: "gl_1", max: 3, tier: 2 },

        // 3티어
        { name: "효율 증대", iconId: "01_34", max: 5, tier: 3 },
        { name: "건랜스 수련", iconId: "gl_2", max: 3, tier: 3 },
        { name: "숙련된 전술가", iconId: "gl_3", max: 3, tier: 3 },
        { name: "전술 훈련", iconId: "01_7", max: 5, tier: 3 },

        // 4티어
        { name: "결사대", iconId: "gl_5", max: 5, tier: 4 },
        { name: "선봉장의 함성", iconId: "gl_16", max: 3, tier: 4 },
        { name: "선봉장의 마음가짐", iconId: "gl_7", max: 3, tier: 4 },
        { name: "전술 이동", iconId: "gl_15", max: 5, tier: 4 }
    ],
    "버서커": [
        // 1티어
        { name: "강인한 육체", iconId: "01_64", max: 3, tier: 1 },
        { name: "광기", iconId: "bk_1", max: 3, tier: 1 },

        // 2티어
        { name: "신체 활성", iconId: "01_9", max: 3, tier: 2 },
        { name: "분노 반환", iconId: "01_63", max: 3, tier: 2 },

        // 3티어
        { name: "신체 각성", iconId: "01_34", max: 5, tier: 3 },
        { name: "폭주 강화", iconId: "bk_5", max: 3, tier: 3 },
        { name: "차가운 분노", iconId: "bk_3", max: 3, tier: 3 },
        { name: "분노 자극", iconId: "01_3", max: 5, tier: 3 },

        // 4티어
        { name: "분노 소모", iconId: "bk_7", max: 5, tier: 4 },
        { name: "광전사의 비기", iconId: "bk_2", max: 3, tier: 4 },
        { name: "어둠 강화", iconId: "bk_6", max: 3, tier: 4 },
        { name: "쇄도", iconId: "bk_4", max: 5, tier: 4 }
    ],
    "디스트로이어": [
        // 1티어
        { name: "중력 갑옷", iconId: "dt_1", max: 3, tier: 1 },
        { name: "중력 충격", iconId: "dt_2", max: 1, tier: 1 },

        // 2티어
        { name: "날카로운 해머", iconId: "01_5", max: 3, tier: 2 },
        { name: "중력 충전", iconId: "01_49", max: 3, tier: 2 },

        // 3티어
        { name: "해방 강화", iconId: "01_15", max: 5, tier: 3 },
        { name: "분노의 망치", iconId: "01_1", max: 3, tier: 3 },
        { name: "중력 수련", iconId: "01_8", max: 3, tier: 3 },
        { name: "영역 강화", iconId: "01_7", max: 5, tier: 3 },

        // 4티어
        { name: "중력 변환", iconId: "dt_3", max: 5, tier: 4 },
        { name: "중력 해방", iconId: "dt_4", max: 3, tier: 4 },
        { name: "새로운 코어", iconId: "dt_5", max: 3, tier: 4 },
        { name: "중력 가속", iconId: "dt_6", max: 5, tier: 4 }
    ],
    "홀리나이트": [
        // 1티어
        { name: "신의 기사", iconId: "hk_5", max: 1, tier: 1 },
        { name: "신성 보호", iconId: "hk_1", max: 1, tier: 1 },

        // 2티어
        { name: "빛의 단죄", iconId: "hk_14", max: 3, tier: 2 },
        { name: "축복의 오라", iconId: "hk_2", max: 3, tier: 2 },

        // 3티어
        { name: "징벌 강화", iconId: "01_45", max: 5, tier: 3 },
        { name: "신앙 수련", iconId: "01_18", max: 3, tier: 3 },
        { name: "신의 가호", iconId: "hk_4", max: 3, tier: 3 },
        { name: "빠른 구원", iconId: "01_14", max: 5, tier: 3 },

        // 4티어
        { name: "단죄의 연쇄", iconId: "01_7", max: 5, tier: 4 },
        { name: "심판자", iconId: "hk_3", max: 3, tier: 4 },
        { name: "신성 해방", iconId: "hk_15", max: 3, tier: 4 },
        { name: "빛의 흔적", iconId: "hk_7", max: 5, tier: 4 }
    ],
    "슬레이어": [
        // 1티어
        { name: "지치지 않는 힘", iconId: "01_14", max: 1, tier: 1 },
        { name: "끝나지 않는 분노", iconId: "01_54", max: 1, tier: 1 },

        // 2티어
        { name: "강화된 기술", iconId: "01_3", max: 3, tier: 2 },
        { name: "포식자", iconId: "bkf_2", max: 3, tier: 2 },

        // 3티어
        { name: "갈증해소", iconId: "01_34", max: 5, tier: 3 },
        { name: "처단자", iconId: "bkf_1", max: 3, tier: 3 },
        { name: "격분", iconId: "01_1", max: 3, tier: 3 },
        { name: "전투 본능", iconId: "01_5", max: 5, tier: 3 },

        // 4티어
        { name: "사무치는 공포", iconId: "bkf_3", max: 5, tier: 4 },
        { name: "막을 수 없는 분노", iconId: "bkf_4", max: 3, tier: 4 },
        { name: "깊어지는 분노", iconId: "bkf_5", max: 3, tier: 4 },
        { name: "무모한 공격", iconId: "bkf_6", max: 5, tier: 4 }
    ],
    "발키리": [
        // 1티어
        { name: "빛의 기사", iconId: "hkf_1", max: 3, tier: 1 },
        { name: "해방자", iconId: "hkf_5", max: 1, tier: 1 },

        // 2티어
        { name: "검술 훈련", iconId: "hkf_2", max: 3, tier: 2 },
        { name: "활력", iconId: "hkf_7", max: 3, tier: 2 },

        // 3티어
        { name: "연결되는 빛", iconId: "hkf_9", max: 5, tier: 3 },
        { name: "성검 개방", iconId: "hkf_3", max: 3, tier: 3 },
        { name: "하늘의 뜻", iconId: "hkf_6", max: 3, tier: 3 },
        { name: "빛의 검기", iconId: "hkf_12", max: 5, tier: 3 },

        // 4티어
        { name: "최후의 빛", iconId: "hkf_11", max: 5, tier: 4 },
        { name: "삼위일체", iconId: "hkf_4", max: 3, tier: 4 },
        { name: "해방의 날개", iconId: "hkf_8", max: 3, tier: 4 },
        { name: "해방자의 흔적", iconId: "hkf_10", max: 5, tier: 4 }
    ],
    "인파이터": [
        // 1티어
        { name: "기력 회복", iconId: "if_3", max: 3, tier: 1 },
        { name: "속도 강화", iconId: "01_37", max: 1, tier: 1 },

        // 2티어
        { name: "투지 회복", iconId: "01_54", max: 3, tier: 2 },
        { name: "충격 회복", iconId: "01_53", max: 1, tier: 2 },

        // 3티어
        { name: "날카로운 타격", iconId: "01_1", max: 5, tier: 3 },
        { name: "극의 : 체술", iconId: "if_1", max: 3, tier: 3 },
        { name: "충격 단련", iconId: "if_2", max: 3, tier: 3 },
        { name: "더킹 II", iconId: "01_16", max: 5, tier: 3 },

        // 4티어
        { name: "치명적인 투지", iconId: "01_4", max: 5, tier: 4 },
        { name: "대지 가르기", iconId: "if_5", max: 3, tier: 4 },
        { name: "충격 발산", iconId: "01_18", max: 3, tier: 4 },
        { name: "일방 타격", iconId: "01_19", max: 5, tier: 4 }
    ],
    "배틀마스터": [
        // 1티어
        { name: "강력한 체술", iconId: "01_15", max: 3, tier: 1 },
        { name: "강력한 오의", iconId: "01_16", max: 3, tier: 1 },

        // 2티어
        { name: "원기 회복", iconId: "01_34", max: 3, tier: 2 },
        { name: "구슬 증가", iconId: "bm_2", max: 1, tier: 2 },

        // 3티어
        { name: "치명적인 체술", iconId: "01_1", max: 5, tier: 3 },
        { name: "초심", iconId: "bm_1", max: 3, tier: 3 },
        { name: "오의 강화", iconId: "bm_3", max: 3, tier: 3 },
        { name: "엘리멘탈 연소", iconId: "01_17", max: 5, tier: 3 },

        // 4티어
        { name: "공수래", iconId: "01_4", max: 5, tier: 4 },
        { name: "근원의 엘리멘탈", iconId: "bm_4", max: 3, tier: 4 },
        { name: "순환", iconId: "bm_5", max: 3, tier: 4 },
        { name: "오의 준비", iconId: "bm_6", max: 5, tier: 4 }
    ],
    "기공사": [
        // 1티어
        { name: "세맥타통 I", iconId: "so_4", max: 1, tier: 1 },
        { name: "역천지체", iconId: "so_2", max: 3, tier: 1 },

        // 2티어
        { name: "내공 금제", iconId: "so_3", max: 1, tier: 2 },
        { name: "내공 활성", iconId: "01_52", max: 1, tier: 2 },

        // 3티어
        { name: "자연체", iconId: "01_5", max: 5, tier: 3 },
        { name: "세맥타통 II", iconId: "so_1", max: 3, tier: 3 },
        { name: "금강선공 강화", iconId: "so_5", max: 3, tier: 3 },
        { name: "날카로운 기공", iconId: "01_1", max: 5, tier: 3 },

        // 4티어
        { name: "운기행공", iconId: "01_42", max: 5, tier: 4 },
        { name: "내공 폭발", iconId: "so_7", max: 3, tier: 4 },
        { name: "한계 돌파", iconId: "so_8", max: 3, tier: 4 },
        { name: "반동 제어", iconId: "so_9", max: 5, tier: 4 }
    ],
    "창술사": [
        // 1티어
        { name: "절제", iconId: "01_52", max: 3, tier: 1 },
        { name: "절정 I", iconId: "lm_2", max: 3, tier: 1 },

        // 2티어
        { name: "난무 이동", iconId: "01_10", max: 1, tier: 2 },
        { name: "절정 II", iconId: "lm_3", max: 3, tier: 2 },

        // 3티어
        { name: "치명적인 베기", iconId: "01_1", max: 5, tier: 3 },
        { name: "난무 강화", iconId: "lm_1", max: 3, tier: 3 },
        { name: "절정 III", iconId: "lm_4", max: 3, tier: 3 },
        { name: "강력한 찌르기", iconId: "01_17", max: 5, tier: 3 },

        // 4티어
        { name: "연가표식", iconId: "lm_5", max: 5, tier: 4 },
        { name: "연가비기", iconId: "lm_6", max: 3, tier: 4 },
        { name: "연가심공", iconId: "lm_7", max: 3, tier: 4 },
        { name: "전환난무", iconId: "01_18", max: 5, tier: 4 }
    ],
    "스트라이커": [
        // 1티어
        { name: "오의난무", iconId: "bmm_1", max: 1, tier: 1 },
        { name: "일격필살 I", iconId: "bmm_2", max: 3, tier: 1 },

        // 2티어
        { name: "답보", iconId: "bmm_3", max: 3, tier: 2 },
        { name: "구슬 증가", iconId: "bmm_5", max: 1, tier: 2 },

        // 3티어
        { name: "후방 기습", iconId: "01_16", max: 5, tier: 3 },
        { name: "오의 집중", iconId: "01_15", max: 3, tier: 3 },
        { name: "일격필살 II", iconId: "01_19", max: 3, tier: 3 },
        { name: "치명적인 오의", iconId: "01_2", max: 5, tier: 3 },

        // 4티어
        { name: "체술 강화", iconId: "bmm_6", max: 5, tier: 4 },
        { name: "난무 강화", iconId: "bmm_7", max: 3, tier: 4 },
        { name: "구슬의 축복", iconId: "bmm_8", max: 3, tier: 4 },
        { name: "완전 충전", iconId: "bmm_9", max: 5, tier: 4 }
    ],
    "브레이커": [
        // 1티어
        { name: "권왕파천무", iconId: "ifm_1", max: 1, tier: 1 },
        { name: "수라의 길", iconId: "ifm_4", max: 1, tier: 1 },

        // 2티어
        { name: "단전 호흡", iconId: "ifm_2", max: 3, tier: 2 },
        { name: "치명적인 주먹", iconId: "ifm_5", max: 3, tier: 2 },

        // 3티어
        { name: "권왕심법", iconId: "01_17", max: 5, tier: 3 },
        { name: "권왕십이식 : 낙화 강화", iconId: "ifm_3", max: 3, tier: 3 },
        { name: "수라강체", iconId: "ifm_6", max: 3, tier: 3 },
        { name: "전면전", iconId: "01_45", max: 5, tier: 3 },

        // 4티어
        { name: "호신강기", iconId: "ifm_7", max: 5, tier: 4 },
        { name: "권왕십이식 : 풍랑", iconId: "ifm_8", max: 3, tier: 4 },
        { name: "무아지경", iconId: "ifm_9", max: 3, tier: 4 },
        { name: "호신투기 강화", iconId: "ifm_10", max: 5, tier: 4 }
    ],
    "데빌헌터": [
        // 1티어
        { name: "전술 탄환", iconId: "dh_17", max: 3, tier: 1 },
        { name: "핸드 거너", iconId: "dh_4", max: 3, tier: 1 },

        // 2티어
        { name: "탄약 보충", iconId: "dh_18", max: 2, tier: 2 }, // 12P 소모
        { name: "화려한 발재간", iconId: "01_11", max: 1, tier: 2 }, // 24P 소모

        // 3티어
        { name: "해결사의 움직임", iconId: "dh_20", max: 5, tier: 3 },
        { name: "정밀 사격 훈련", iconId: "dh_19", max: 3, tier: 3 },
        { name: "핸드건 강화", iconId: "dh_3", max: 3, tier: 3 },
        { name: "퀵 드로우", iconId: "01_28", max: 5, tier: 3 },

        // 4티어
        { name: "고폭탄", iconId: "01_68", max: 5, tier: 4 },
        { name: "전략적 군장", iconId: "dh_5", max: 3, tier: 4 },
        { name: "비밀 병기", iconId: "dh_7", max: 3, tier: 4 },
        { name: "빛나는 탄", iconId: "dh_8", max: 5, tier: 4 }
    ],
    "호크아이": [
        // 1티어
        { name: "죽음의 습격", iconId: "he_1", max: 3, tier: 1 },
        { name: "두 번째 동료", iconId: "he_2", max: 3, tier: 1 },

        // 2티어
        { name: "호크 게이지 회수", iconId: "01_49", max: 3, tier: 2 },
        { name: "호크 서포트", iconId: "01_18", max: 3, tier: 2 },

        // 3티어
        { name: "페일 노트", iconId: "01_29", max: 5, tier: 3 },
        { name: "최후의 표적", iconId: "he_3", max: 3, tier: 3 },
        { name: "폭풍의 표적", iconId: "01_25", max: 3, tier: 3 },
        { name: "실버호크 강화", iconId: "01_2", max: 5, tier: 3 },

        // 4티어
        { name: "마나 회수", iconId: "01_35", max: 5, tier: 4 },
        { name: "실버호크 강습", iconId: "he_4", max: 3, tier: 4 },
        { name: "폭풍의 사냥꾼", iconId: "he_5", max: 3, tier: 4 },
        { name: "딥러닝", iconId: "he_6", max: 5, tier: 4 }
    ],
    "블래스터": [
        // 1티어
        { name: "포격 강화", iconId: "bs_1", max: 1, tier: 1 },
        { name: "화력 강화", iconId: "bs_2", max: 1, tier: 1 },

        // 2티어
        { name: "포격 충전", iconId: "01_52", max: 3, tier: 2 },
        { name: "화력 지속", iconId: "01_48", max: 3, tier: 2 },

        // 3티어
        { name: "신속 포격", iconId: "01_6", max: 5, tier: 3 },
        { name: "포격 출력 강화", iconId: "01_3", max: 3, tier: 3 },
        { name: "과열", iconId: "01_15", max: 3, tier: 3 },
        { name: "화력 유지", iconId: "bs_3", max: 5, tier: 3 },

        // 4티어
        { name: "위치 이동 시스템", iconId: "bs_4", max: 5, tier: 4 },
        { name: "A.C.T 호출", iconId: "bs_5", max: 3, tier: 4 },
        { name: "포화 공격", iconId: "bs_7", max: 3, tier: 4 },
        { name: "오버히트", iconId: "bs_6", max: 5, tier: 4 }
    ],
    "스카우터": [
        // 1티어
        { name: "진화의 유산", iconId: "sc_1", max: 3, tier: 1 },
        { name: "아르데타인의 기술", iconId: "sc_2", max: 3, tier: 1 },

        // 2티어
        { name: "오버 싱크", iconId: "01_11", max: 3, tier: 2 },
        { name: "드론 방어 체계", iconId: "01_64", max: 3, tier: 2 },

        // 3티어
        { name: "코어 반응 증폭", iconId: "sc_3", max: 5, tier: 3 },
        { name: "전투 모드", iconId: "01_18", max: 3, tier: 3 },
        { name: "기술 업그레이드", iconId: "01_28", max: 3, tier: 3 },
        { name: "전술 재장전", iconId: "buff_601", max: 5, tier: 3 },

        // 4티어
        { name: "자폭 시퀀스", iconId: "sc_14", max: 5, tier: 4 },
        { name: "EX - 제로 포인트", iconId: "sc_5", max: 3, tier: 4 },
        { name: "코어 인챈트", iconId: "sc_6", max: 3, tier: 4 },
        { name: "최고의 합작", iconId: "sc_7", max: 5, tier: 4 }
    ],
    "건슬링어": [
        // 1티어
        { name: "피스메이커 - 핸드건", iconId: "dhf_1", max: 3, tier: 1 },
        { name: "사냥의 시간", iconId: "dhf_4", max: 3, tier: 1 },

        // 2티어
        { name: "피스메이커 - 샷건", iconId: "dhf_2", max: 3, tier: 2 },
        { name: "라이플 냉각", iconId: "01_11", max: 3, tier: 2 },

        // 3티어
        { name: "시크릿 불릿", iconId: "dhf_5", max: 5, tier: 3 },
        { name: "피스메이커 - 라이플", iconId: "dhf_3", max: 3, tier: 3 },
        { name: "라이플 숙련", iconId: "01_3", max: 3, tier: 3 },
        { name: "급소 전문가", iconId: "dhf_6", max: 5, tier: 3 },

        // 4티어
        { name: "총기 교체 기술", iconId: "dhf_7", max: 5, tier: 4 },
        { name: "평화주의자", iconId: "dhf_8", max: 3, tier: 4 },
        { name: "일발필중", iconId: "dhf_9", max: 3, tier: 4 },
        { name: "저격수의 의지", iconId: "dhf_10", max: 5, tier: 4 }
    ],
    "아르카나": [
        // 1티어
        { name: "황후의 은총", iconId: "ac_1", max: 3, tier: 1 },
        { name: "황제의 칙령", iconId: "ac_2", max: 3, tier: 1 },

        // 2티어
        { name: "황후의 계략", iconId: "ac_5", max: 2, tier: 2 }, // 12P 소모
        { name: "황제의 하사품", iconId: "ac_6", max: 2, tier: 2 }, // 12P 소모

        // 3티어
        { name: "황후의 탐욕", iconId: "01_21", max: 5, tier: 3 },
        { name: "황후의 연회", iconId: "ac_3", max: 3, tier: 3 },
        { name: "황제의 만찬", iconId: "ac_4", max: 3, tier: 3 },
        { name: "황제의 자비", iconId: "01_6", max: 5, tier: 3 },

        // 4티어
        { name: "황후의 기사", iconId: "ac_7", max: 5, tier: 4 },
        { name: "황후의 속삭임", iconId: "01_23", max: 3, tier: 4 },
        { name: "또 다른 황제", iconId: "ac_8", max: 3, tier: 4 },
        { name: "황제의 심판", iconId: "01_18", max: 5, tier: 4 }
    ],
    "서머너": [
        // 1티어
        { name: "넘치는 교감", iconId: "sm_1", max: 3, tier: 1 }, // 8P 소모
        { name: "상급 소환사", iconId: "sm_2", max: 1, tier: 1 }, // 24P 소모

        // 2티어
        { name: "총명함", iconId: "sm_3", max: 3, tier: 2 },
        { name: "정신 집중", iconId: "sm_4", max: 3, tier: 2 },

        // 3티어
        { name: "교감 강화", iconId: "01_6", max: 5, tier: 3 },
        { name: "정령의 교감", iconId: "sm_5", max: 3, tier: 3 },
        { name: "고대의 힘", iconId: "sm_6", max: 3, tier: 3 },
        { name: "고대의 바람", iconId: "01_3", max: 5, tier: 3 },

        // 4티어
        { name: "절대적인 명령", iconId: "01_29", max: 5, tier: 4 },
        { name: "정령 폭주", iconId: "sm_7", max: 3, tier: 4 },
        { name: "고대의 축복", iconId: "sm_8", max: 3, tier: 4 },
        { name: "고대의 속삭임", iconId: "sm_9", max: 5, tier: 4 }
    ],
    "바드": [
        // 1티어
        { name: "완벽한 화음", iconId: "bd_17", max: 3, tier: 1 }, // 8P 소모
        { name: "진실된 용맹", iconId: "bd_2", max: 1, tier: 1 }, // 24P 소모

        // 2티어
        { name: "절실한 구원", iconId: "bd_3", max: 3, tier: 2 },
        { name: "찬가 : 템페스트", iconId: "bd_10", max: 3, tier: 2 },

        // 3티어
        { name: "포용의 세레나데", iconId: "01_33", max: 5, tier: 3 },
        { name: "증폭의 세레나데", iconId: "bd_7", max: 3, tier: 3 },
        { name: "마에스트로", iconId: "bd_6", max: 3, tier: 3 },
        { name: "전투의 찬가", iconId: "bd_8", max: 5, tier: 3 },

        // 4티어
        { name: "낙인의 세레나데", iconId: "bd_9", max: 5, tier: 4 },
        { name: "세레나데 코드", iconId: "bd_18", max: 3, tier: 4 },
        { name: "템페스트 필드", iconId: "bd_19", max: 3, tier: 4 },
        { name: "격노의 악장", iconId: "bd_20", max: 5, tier: 4 }
    ],
    "소서리스": [
        // 1티어
        { name: "점화", iconId: "scs_1", max: 3, tier: 1 },
        { name: "환류", iconId: "scs_2", max: 3, tier: 1 },

        // 2티어
        { name: "점화의 불씨", iconId: "scs_3", max: 3, tier: 2 },
        { name: "환류의 기운", iconId: "scs_4", max: 3, tier: 2 },

        // 3티어
        { name: "화력 충전", iconId: "01_22", max: 5, tier: 3 },
        { name: "발화", iconId: "scs_5", max: 3, tier: 3 },
        { name: "환류 강화", iconId: "01_3", max: 3, tier: 3 },
        { name: "해방 봉인", iconId: "01_41", max: 5, tier: 3 },

        // 4티어
        { name: "점멸 폭발", iconId: "01_42", max: 5, tier: 4 },
        { name: "마나 순환", iconId: "scs_8", max: 3, tier: 4 },
        { name: "마력 충전", iconId: "scs_6", max: 3, tier: 4 },
        { name: "응집되는 마력", iconId: "scs_7", max: 5, tier: 4 }
    ],
    "블레이드": [
        // 1티어
        { name: "버스트 강화", iconId: "bl_1", max: 1, tier: 1 },
        { name: "신속한 일격", iconId: "bl_4", max: 1, tier: 1 },

        // 2티어
        { name: "오브 압축", iconId: "bl_2", max: 3, tier: 2 },
        { name: "잔재된 기운", iconId: "bl_5", max: 3, tier: 2 },

        // 3티어
        { name: "오브 제어", iconId: "01_55", max: 5, tier: 3 },
        { name: "한계 돌파", iconId: "bl_3", max: 3, tier: 3 },
        { name: "확고한 의지", iconId: "01_18", max: 3, tier: 3 },
        { name: "검술 강화", iconId: "01_19", max: 5, tier: 3 },

        // 4티어
        { name: "에너지 강화", iconId: "bl_6", max: 5, tier: 4 },
        { name: "검기 압축", iconId: "bl_7", max: 3, tier: 4 },
        { name: "극한의 몸놀림", iconId: "bl_8", max: 3, tier: 4 },
        { name: "오브 순환", iconId: "01_15", max: 5, tier: 4 }
    ],
    "데모닉": [
        // 1티어
        { name: "멈출 수 없는 충동", iconId: "dm_1", max: 1, tier: 1 }, // 24P 소모
        { name: "완벽한 억제", iconId: "dm_6", max: 3, tier: 1 }, // 8P 소모

        // 2티어
        { name: "본능 강화", iconId: "dm_2", max: 3, tier: 2 },
        { name: "잠식 제어", iconId: "dm_7", max: 3, tier: 2 },

        // 3티어
        { name: "혼돈 단련", iconId: "dm_3", max: 5, tier: 3 },
        { name: "혼돈 강화", iconId: "01_18", max: 3, tier: 3 },
        { name: "무기 단련", iconId: "01_15", max: 3, tier: 3 },
        { name: "잠식 흡수", iconId: "dm_8", max: 5, tier: 3 },

        // 4티어
        { name: "침식", iconId: "dm_4", max: 5, tier: 4 },
        { name: "블러드 피어싱", iconId: "dm_5", max: 3, tier: 4 },
        { name: "스톰 그라인딩", iconId: "dm_9", max: 3, tier: 4 },
        { name: "잠식 강화", iconId: "dm_10", max: 5, tier: 4 }
    ],
    "리퍼": [
        // 1티어
        { name: "달의 소리", iconId: "rp_1", max: 3, tier: 1 },
        { name: "피냄새", iconId: "rp_5", max: 3, tier: 1 },

        // 2티어
        { name: "유령 무희", iconId: "01_37", max: 3, tier: 2 },
        { name: "굶주림", iconId: "01_52", max: 3, tier: 2 },

        // 3티어
        { name: "곡예사", iconId: "rp_2", max: 5, tier: 3 },
        { name: "그림자 밟기", iconId: "01_10", max: 3, tier: 3 },
        { name: "갈증", iconId: "01_16", max: 3, tier: 3 },
        { name: "암살자의 손놀림", iconId: "01_44", max: 5, tier: 3 },

        // 4티어
        { name: "잠행", iconId: "rp_3", max: 5, tier: 4 },
        { name: "급소 확보", iconId: "rp_4", max: 3, tier: 4 },
        { name: "살인귀", iconId: "rp_6", max: 3, tier: 4 },
        { name: "혼돈 강화", iconId: "rp_7", max: 5, tier: 4 }
    ],
    "소울이터": [
        // 1티어
        { name: "영혼 친화력", iconId: "se_1", max: 3, tier: 1 },
        { name: "그믐의 경계", iconId: "se_5", max: 3, tier: 1 },

        // 2티어
        { name: "만월의 집행자", iconId: "se_2", max: 3, tier: 2 },
        { name: "죽음 연마", iconId: "se_6", max: 3, tier: 2 },

        // 3티어

        { name: "영혼 증폭", iconId: "se_3", max: 5, tier: 3 },
        { name: "집행 강화", iconId: "01_11", max: 3, tier: 3 },
        { name: "허물어진 경계", iconId: "01_19", max: 3, tier: 3 },
        { name: "영혼 강화", iconId: "01_18", max: 5, tier: 3 },

        // 4티어
        { name: "영혼 길잡이", iconId: "01_54", max: 5, tier: 4 },
        { name: "영혼 공명", iconId: "se_4", max: 3, tier: 4 },
        { name: "영혼 참수", iconId: "se_7", max: 3, tier: 4 },
        { name: "영혼 제어", iconId: "se_8", max: 5, tier: 4 }
    ],
    "도화가": [
        // 1티어
        { name: "저물어 가는 달", iconId: "yy_7", max: 1, tier: 1 }, // 24P 소모
        { name: "회귀", iconId: "yy_2", max: 1, tier: 1 }, // 24P 소모

        // 2티어
        { name: "만개", iconId: "yy_1", max: 3, tier: 2 },
        { name: "떠오르는 달", iconId: "yy_8", max: 3, tier: 2 },

        // 3티어
        { name: "오누이", iconId: "yy_18", max: 5, tier: 3 },
        { name: "해의 축복", iconId: "yy_3", max: 3, tier: 3 },
        { name: "달의 축복", iconId: "yy_5", max: 3, tier: 3 },
        { name: "달의 그림자", iconId: "01_22", max: 5, tier: 3 },

        // 4티어
        { name: "낙인 강화", iconId: "yy_6", max: 5, tier: 4 },
        { name: "묵법 : 접무", iconId: "yy_16", max: 3, tier: 4 },
        { name: "묵법 : 파죽", iconId: "yy_17", max: 3, tier: 4 },
        { name: "기예", iconId: "01_71", max: 5, tier: 4 }
    ],
    "기상술사": [
        // 1티어
        { name: "질풍노도", iconId: "wa_1", max: 1, tier: 1 }, // 24P 소모
        { name: "이슬비", iconId: "01_56", max: 3, tier: 1 }, // 8P 소모

        // 2티어
        { name: "환기", iconId: "01_54", max: 3, tier: 2 },
        { name: "비의 보호막", iconId: "wa_5", max: 3, tier: 2 },

        // 3티어
        { name: "자연의 흐름", iconId: "01_17", max: 5, tier: 3 },
        { name: "기민함", iconId: "wa_2", max: 3, tier: 3 },
        { name: "맑은 날", iconId: "01_21", max: 3, tier: 3 },
        { name: "단련", iconId: "01_5", max: 5, tier: 3 },

        // 4티어
        { name: "바람의 길", iconId: "wa_3", max: 5, tier: 4 },
        { name: "공간 가르기", iconId: "wa_4", max: 3, tier: 4 },
        { name: "눈부신 나날들", iconId: "wa_6", max: 3, tier: 4 },
        { name: "수증기 충전", iconId: "01_22", max: 5, tier: 4 }
    ],
    "환수사": [
        // 1티어
        { name: "야성", iconId: "dr_1", max: 3, tier: 1 }, // 8P 소모
        { name: "환수 각성", iconId: "dr_skill_01_24", max: 1, tier: 1 }, // 24P 소모

        // 2티어
        { name: "깨어난 잠재력", iconId: "dr_2", max: 3, tier: 2 },
        { name: "활기", iconId: "01_52", max: 3, tier: 2 },

        // 3티어
        { name: "야수의 공명", iconId: "dr_3", max: 5, tier: 3 },
        { name: "야생의 충동", iconId: "dr_4", max: 3, tier: 3 },
        { name: "환수의 정기", iconId: "dr_9", max: 3, tier: 3 },
        { name: "천부적 재능", iconId: "01_18", max: 5, tier: 3 },

        // 4티어
        { name: "기민함", iconId: "dr_7", max: 5, tier: 4 },
        { name: "사냥 본능", iconId: "dr_8", max: 3, tier: 4 },
        { name: "날렵한 걸음걸이", iconId: "dr_5", max: 3, tier: 4 },
        { name: "환수 술사", iconId: "01_55", max: 5, tier: 4 }
    ],
    "가디언나이트": [
        // 1티어
        { name: "업화의 계승자", iconId: "ddk_1", max: 3, tier: 1 }, // 8P 소모
        { name: "드레드 로어", iconId: "ddk_5", max: 1, tier: 1 }, // 24P 소모

        // 2티어
        { name: "깨어나는 힘", iconId: "ddk_2", max: 3, tier: 2 },
        { name: "완전 연소", iconId: "ddk_6", max: 3, tier: 2 },

        // 3티어
        { name: "초비행", iconId: "ddk_9", max: 5, tier: 3 },
        { name: "힘의 제어", iconId: "ddk_3", max: 3, tier: 3 },
        { name: "돌파의 외침", iconId: "ddk_7", max: 3, tier: 3 },
        { name: "날카로운 비늘", iconId: "01_47", max: 5, tier: 3 },

        // 4티어
        { name: "잔불", iconId: "ddk_10", max: 5, tier: 4 },
        { name: "완전 융화", iconId: "ddk_4", max: 3, tier: 4 },
        { name: "한계 초월", iconId: "ddk_8", max: 3, tier: 4 },
        { name: "할버드의 대가", iconId: "ddk_11", max: 5, tier: 4 }
    ],
};

// 3. 도약 (Leap) - 전 직업 공통
const LEAP_T1 = [
    { name: "초월적인 힘", iconId: "02_3", max: 5, tier: 1 },
    { name: "충전된 분노", iconId: "02_1", max: 5, tier: 1 },
    { name: "각성 증폭기", iconId: "01_54", max: 3, tier: 1 },
    { name: "풀려난 힘", iconId: "02_2", max: 5, tier: 1 },
    { name: "잠재력 해방", iconId: "01_10", max: 5, tier: 1 },
    { name: "즉각적인 주문", iconId: "02_5", max: 3, tier: 1 },
];

// 4. 도약 (Leap) - 직업 별 도약
const LEAP_BY_CLASS: Record<string, any[]> = {
    "워로드": [
        ...LEAP_T1,
        { name: "저돌", iconId: "gl_9", max: 3, tier: 2 },
        { name: "선봉의 보호", iconId: "gl_10", max: 3, tier: 2 },
        { name: "거포", iconId: "gl_17", max: 3, tier: 2 },
        { name: "퀵 배럴", iconId: "gl_18", max: 3, tier: 2 }
    ],
    "버서커": [
        ...LEAP_T1,
        { name: "난도질", iconId: "bk_8", max: 3, tier: 2 },
        { name: "분노 순환", iconId: "bk_9", max: 3, tier: 2 },
        { name: "분노 증폭", iconId: "bk_10", max: 3, tier: 2 },
        { name: "참격", iconId: "bk_11", max: 3, tier: 2 }
    ],
    "디스트로이어": [
        ...LEAP_T1,
        { name: "집중 공격", iconId: "dt_7", max: 3, tier: 2 },
        { name: "중력 보존", iconId: "dt_8", max: 3, tier: 2 },
        { name: "중력 축적", iconId: "dt_9", max: 3, tier: 2 },
        { name: "순환력", iconId: "dt_10", max: 3, tier: 2 }
    ],
    "홀리나이트": [
        ...LEAP_T1,
        { name: "즉결 심판", iconId: "hk_8", max: 3, tier: 2 },
        { name: "집행 선고", iconId: "hk_9", max: 3, tier: 2 },
        { name: "성스러운 빛", iconId: "hk_10", max: 3, tier: 2 },
        { name: "정의의 빛", iconId: "hk_11", max: 3, tier: 2 }
    ],
    "슬레이어": [
        ...LEAP_T1,
        { name: "축적된 힘", iconId: "bkf_7", max: 3, tier: 2 },
        { name: "과감한 돌진", iconId: "bkf_8", max: 3, tier: 2 },
        { name: "전력투구", iconId: "bkf_9", max: 3, tier: 2 },
        { name: "숙련된 힘", iconId: "bkf_10", max: 3, tier: 2 }
    ],
    "발키리": [
        ...LEAP_T1,
        { name: "신념의 검", iconId: "hkf_13", max: 3, tier: 2 },
        { name: "창공의 검", iconId: "hkf_14", max: 3, tier: 2 },
        { name: "기적", iconId: "hkf_15", max: 3, tier: 2 },
        { name: "순환", iconId: "hkf_16", max: 3, tier: 2 }
    ],
    "인파이터": [
        ...LEAP_T1,
        { name: "격노의 주먹", iconId: "if_7", max: 3, tier: 2 },
        { name: "최후의 폭발", iconId: "if_8", max: 3, tier: 2 },
        { name: "충격 폭발", iconId: "if_9", max: 3, tier: 2 },
        { name: "간결한 타격", iconId: "if_10", max: 3, tier: 2 }
    ],
    "배틀마스터": [
        ...LEAP_T1,
        { name: "끊임없는 공세", iconId: "bm_7", max: 3, tier: 2 },
        { name: "밀어차기", iconId: "bm_8", max: 3, tier: 2 },
        { name: "집중 발차기", iconId: "bm_9", max: 3, tier: 2 },
        { name: "간소화", iconId: "bm_10", max: 3, tier: 2 }
    ],
    "기공사": [
        ...LEAP_T1,
        { name: "금강", iconId: "so_10", max: 3, tier: 2 },
        { name: "허공답보", iconId: "so_11", max: 3, tier: 2 },
        { name: "최후의 일격", iconId: "so_12", max: 3, tier: 2 },
        { name: "단계 적응", iconId: "so_13", max: 3, tier: 2 }
    ],
    "창술사": [
        ...LEAP_T1,
        { name: "강인한 타격", iconId: "lm_9", max: 3, tier: 2 },
        { name: "최후의 판단", iconId: "lm_10", max: 3, tier: 2 },
        { name: "관통 필살", iconId: "lm_11", max: 3, tier: 2 },
        { name: "내지르기", iconId: "lm_12", max: 3, tier: 2 }
    ],
    "스트라이커": [
        ...LEAP_T1,
        { name: "집중 타격", iconId: "bmm_10", max: 3, tier: 2 },
        { name: "단축타격", iconId: "bmm_11", max: 3, tier: 2 },
        { name: "고속충전", iconId: "bmm_12", max: 3, tier: 2 },
        { name: "효율적인 타격", iconId: "bmm_13", max: 3, tier: 2 }
    ],
    "브레이커": [
        ...LEAP_T1,
        { name: "천왕난무", iconId: "ifm_11", max: 3, tier: 2 },
        { name: "우직한 공격", iconId: "ifm_12", max: 3, tier: 2 },
        { name: "충격 폭발", iconId: "ifm_13", max: 3, tier: 2 },
        { name: "사방 타격", iconId: "ifm_14", max: 3, tier: 2 }
    ],
    "데빌헌터": [
        ...LEAP_T1,
        { name: "허리케인", iconId: "dh_9", max: 3, tier: 2 },
        { name: "퀵 스톰", iconId: "dh_10", max: 3, tier: 2 },
        { name: "풀레인지", iconId: "dh_11", max: 3, tier: 2 },
        { name: "샷건 리로드", iconId: "dh_12", max: 3, tier: 2 },
        { name: "엄호 사격", iconId: "dh_13", max: 3, tier: 2 },
        { name: "증원", iconId: "dh_14", max: 3, tier: 2 }
    ],
    "호크아이": [
        ...LEAP_T1,
        { name: "고속 회전", iconId: "he_7", max: 3, tier: 2 },
        { name: "동료", iconId: "he_8", max: 3, tier: 2 },
        { name: "추가 동작", iconId: "he_9", max: 3, tier: 2 },
        { name: "기동대", iconId: "he_10", max: 3, tier: 2 }
    ],
    "블래스터": [
        ...LEAP_T1,
        { name: "다량 투하", iconId: "bs_8", max: 3, tier: 2 },
        { name: "폭발탄", iconId: "bs_9", max: 3, tier: 2 },
        { name: "미사일 추가", iconId: "bs_10", max: 3, tier: 2 },
        { name: "런처 가속", iconId: "bs_11", max: 3, tier: 2 }
    ],
    "스카우터": [
        ...LEAP_T1,
        { name: "최적화 모드", iconId: "sc_8", max: 3, tier: 2 },
        { name: "포커스 파워", iconId: "sc_15", max: 3, tier: 2 },
        { name: "오토 파일럿", iconId: "sc_10", max: 3, tier: 2 },
        { name: "싱크 콤비네이션", iconId: "sc_11", max: 3, tier: 2 }
    ],
    "건슬링어": [
        ...LEAP_T1,
        { name: "대용량 탄창", iconId: "dhf_11", max: 3, tier: 2 },
        { name: "플래시", iconId: "dhf_12", max: 3, tier: 2 },
        { name: "바람 걸음", iconId: "dhf_13", max: 3, tier: 2 },
        { name: "공중 묘기", iconId: "dhf_14", max: 3, tier: 2 },
        { name: "강화된 사격", iconId: "dhf_15", max: 3, tier: 2 },
        { name: "초감각 사격", iconId: "dhf_16", max: 3, tier: 2 }
    ],
    "아르카나": [
        ...LEAP_T1,
        { name: "숨겨진 패", iconId: "ac_9", max: 3, tier: 2 },
        { name: "폴스 딜", iconId: "ac_10", max: 3, tier: 2 },
        { name: "악마의 눈속임", iconId: "ac_11", max: 3, tier: 2 },
        { name: "쿼즈", iconId: "ac_12", max: 3, tier: 2 }
    ],
    "서머너": [
        ...LEAP_T1,
        { name: "개화", iconId: "sm_10", max: 3, tier: 2 },
        { name: "마리포사의 축복", iconId: "sm_11", max: 3, tier: 2 },
        { name: "길들이기", iconId: "sm_12", max: 3, tier: 2 },
        { name: "이그나 브레스", iconId: "sm_13", max: 3, tier: 2 }
    ],
    "바드": [
        ...LEAP_T1,
        { name: "마르지 않는 영감", iconId: "bd_12", max: 3, tier: 2 },
        { name: "풍요의 랩소디", iconId: "bd_11", max: 3, tier: 2 },
        { name: "앙코르", iconId: "bd_13", max: 3, tier: 2 },
        { name: "이명", iconId: "bd_14", max: 3, tier: 2 }
    ],
    "소서리스": [
        ...LEAP_T1,
        { name: "대폭발", iconId: "scs_9", max: 3, tier: 2 },
        { name: "분출", iconId: "scs_10", max: 3, tier: 2 },
        { name: "꿰뚫는 빙하", iconId: "scs_11", max: 3, tier: 2 },
        { name: "냉기 숙련", iconId: "scs_12", max: 3, tier: 2 }
    ],
    "블레이드": [
        ...LEAP_T1,
        { name: "섬광 베기", iconId: "bl_9", max: 3, tier: 2 },
        { name: "검객의 길", iconId: "bl_10", max: 3, tier: 2 },
        { name: "악몽의 춤사위", iconId: "bl_11", max: 3, tier: 2 },
        { name: "비명의 춤사위", iconId: "bl_12", max: 3, tier: 2 }
    ],
    "데모닉": [
        ...LEAP_T1,
        { name: "악의적인 권한", iconId: "dm_13", max: 3, tier: 2 },
        { name: "황천 주입", iconId: "dm_14", max: 3, tier: 2 },
        { name: "지옥의 광란", iconId: "dm_15", max: 3, tier: 2 },
        { name: "악마의 승천", iconId: "dm_16", max: 3, tier: 2 }
    ],
    "리퍼": [
        ...LEAP_T1,
        { name: "비열한 칼날", iconId: "rp_8", max: 3, tier: 2 },
        { name: "잔혹한 칼날", iconId: "rp_9", max: 3, tier: 2 },
        { name: "암살자의 발자취", iconId: "rp_10", max: 3, tier: 2 },
        { name: "그림자 맹수", iconId: "rp_11", max: 3, tier: 2 }
    ],
    "소울이터": [
        ...LEAP_T1,
        { name: "어둠의 장송곡", iconId: "se_11", max: 3, tier: 2 },
        { name: "영혼 수확자", iconId: "se_12", max: 3, tier: 2 },
        { name: "심판", iconId: "se_13", max: 3, tier: 2 },
        { name: "영혼 갈구", iconId: "se_14", max: 3, tier: 2 }
    ],
    "도화가": [
        ...LEAP_T1,
        { name: "여의주", iconId: "yy_10", max: 3, tier: 2 },
        { name: "승천", iconId: "yy_9", max: 3, tier: 2 },
        { name: "돌진하는 먹", iconId: "yy_11", max: 3, tier: 2 },
        { name: "땅 울리기", iconId: "yy_12", max: 3, tier: 2 }
    ],
    "기상술사": [
        ...LEAP_T1,
        { name: "완벽한 가르기", iconId: "wa_7", max: 3, tier: 2 },
        { name: "단련된 가르기", iconId: "wa_8", max: 3, tier: 2 },
        { name: "온도 상승", iconId: "wa_9", max: 3, tier: 2 },
        { name: "햇살의 포옹", iconId: "wa_10", max: 3, tier: 2 }
    ],
    "환수사": [
        ...LEAP_T1,
        { name: "고대의 힘", iconId: "dr_10", max: 3, tier: 2 },
        { name: "민첩한 몸놀림", iconId: "dr_11", max: 3, tier: 2 },
        { name: "결속 강화", iconId: "dr_12", max: 3, tier: 2 },
        { name: "빨리와 여우곰!", iconId: "dr_13", max: 3, tier: 2 }
],
    "가디언나이트": [
        ...LEAP_T1,
        { name: "일점 돌파", iconId: "ddk_12", max: 3, tier: 2 },
        { name: "파멸의 피", iconId: "ddk_13", max: 3, tier: 2 },
        { name: "궤도 충돌", iconId: "ddk_14", max: 3, tier: 2 },
        { name: "대강하", iconId: "ddk_15", max: 3, tier: 2 }
    ],
};

// 최종 데이터 결합 및 내보내기
export const MASTER_DATA = {
    EVOLUTION,
    ENLIGHTENMENT_BY_CLASS,
    LEAP_BY_CLASS
};