import { Assessment, StudentProfile, WeeklyBlockSlot } from '../types';

// 3학년 주간 블록 고정 교시표 (E, F, G, H 블록)
export const DEFAULT_WEEKLY_SCHEDULE: WeeklyBlockSlot[] = [
  // 월요일
  { day: 'MON', period: 1, block: 'COMMON', label: '공통 독서' },
  { day: 'MON', period: 2, block: 'E', label: 'E블록 선택' },
  { day: 'MON', period: 3, block: 'COMMON', label: '공통 수학' },
  { day: 'MON', period: 4, block: 'COMMON', label: '공통 영어' },
  { day: 'MON', period: 5, block: 'G', label: 'G블록 선택' },
  { day: 'MON', period: 6, block: 'COMMON', label: '진로 활동' },
  { day: 'MON', period: 7, block: 'COMMON', label: '학급 자치' },

  // 화요일
  { day: 'TUE', period: 1, block: 'COMMON', label: '공통 체육' },
  { day: 'TUE', period: 2, block: 'COMMON', label: '공통 독서' },
  { day: 'TUE', period: 3, block: 'F', label: 'F블록 선택' },
  { day: 'TUE', period: 4, block: 'COMMON', label: '공통 수학' },
  { day: 'TUE', period: 5, block: 'COMMON', label: '공통 영어' },
  { day: 'TUE', period: 6, block: 'H', label: 'H블록 선택' },
  { day: 'TUE', period: 7, block: 'COMMON', label: '자율 학습' },

  // 수요일
  { day: 'WED', period: 1, block: 'E', label: 'E블록 선택' },
  { day: 'WED', period: 2, block: 'COMMON', label: '공통 수학' },
  { day: 'WED', period: 3, block: 'COMMON', label: '공통 독서' },
  { day: 'WED', period: 4, block: 'G', label: 'G블록 선택' },
  { day: 'WED', period: 5, block: 'COMMON', label: '창체 동아리' },
  { day: 'WED', period: 6, block: 'COMMON', label: '창체 동아리' },
  { day: 'WED', period: 7, block: 'COMMON', label: '동아리 평가' },

  // 목요일
  { day: 'THU', period: 1, block: 'COMMON', label: '공통 영어' },
  { day: 'THU', period: 2, block: 'F', label: 'F블록 선택' },
  { day: 'THU', period: 3, block: 'COMMON', label: '공통 체육' },
  { day: 'THU', period: 4, block: 'COMMON', label: '공통 수학' },
  { day: 'THU', period: 5, block: 'H', label: 'H블록 선택' },
  { day: 'THU', period: 6, block: 'G', label: 'G블록 선택' },
  { day: 'THU', period: 7, block: 'COMMON', label: '상담/자율' },

  // 금요일
  { day: 'FRI', period: 1, block: 'COMMON', label: '공통 독서' },
  { day: 'FRI', period: 2, block: 'COMMON', label: '공통 영어' },
  { day: 'FRI', period: 3, block: 'E', label: 'E블록 선택' },
  { day: 'FRI', period: 4, block: 'COMMON', label: '공통 수학' },
  { day: 'FRI', period: 5, block: 'COMMON', label: '진로 특강' },
  { day: 'FRI', period: 6, block: 'F', label: 'F블록 선택' },
  { day: 'FRI', period: 7, block: 'H', label: 'H블록 선택' },
];

// 1·2학년 주간 블록 고정 교시표 (A, B, C, D 블록)
export const GRADE_1_2_WEEKLY_SCHEDULE: WeeklyBlockSlot[] = [
  // 월요일
  { day: 'MON', period: 1, block: 'COMMON', label: '공통 국어' },
  { day: 'MON', period: 2, block: 'A', label: 'A블록 선택' },
  { day: 'MON', period: 3, block: 'COMMON', label: '공통 수학' },
  { day: 'MON', period: 4, block: 'COMMON', label: '공통 영어' },
  { day: 'MON', period: 5, block: 'C', label: 'C블록 선택' },
  { day: 'MON', period: 6, block: 'COMMON', label: '진로 활동' },
  { day: 'MON', period: 7, block: 'COMMON', label: '학급 자치' },

  // 화요일
  { day: 'TUE', period: 1, block: 'COMMON', label: '공통 체육' },
  { day: 'TUE', period: 2, block: 'COMMON', label: '공통 한국사' },
  { day: 'TUE', period: 3, block: 'B', label: 'B블록 선택' },
  { day: 'TUE', period: 4, block: 'COMMON', label: '공통 수학' },
  { day: 'TUE', period: 5, block: 'COMMON', label: '공통 영어' },
  { day: 'TUE', period: 6, block: 'D', label: 'D블록 선택' },
  { day: 'TUE', period: 7, block: 'COMMON', label: '자율 학습' },

  // 수요일
  { day: 'WED', period: 1, block: 'A', label: 'A블록 선택' },
  { day: 'WED', period: 2, block: 'COMMON', label: '공통 수학' },
  { day: 'WED', period: 3, block: 'COMMON', label: '공통 국어' },
  { day: 'WED', period: 4, block: 'C', label: 'C블록 선택' },
  { day: 'WED', period: 5, block: 'COMMON', label: '창체 동아리' },
  { day: 'WED', period: 6, block: 'COMMON', label: '창체 동아리' },
  { day: 'WED', period: 7, block: 'COMMON', label: '동아리 평가' },

  // 목요일
  { day: 'THU', period: 1, block: 'COMMON', label: '공통 영어' },
  { day: 'THU', period: 2, block: 'B', label: 'B블록 선택' },
  { day: 'THU', period: 3, block: 'COMMON', label: '공통 체육' },
  { day: 'THU', period: 4, block: 'COMMON', label: '공통 수학' },
  { day: 'THU', period: 5, block: 'D', label: 'D블록 선택' },
  { day: 'THU', period: 6, block: 'C', label: 'C블록 선택' },
  { day: 'THU', period: 7, block: 'COMMON', label: '상담/자율' },

  // 금요일
  { day: 'FRI', period: 1, block: 'COMMON', label: '공통 국어' },
  { day: 'FRI', period: 2, block: 'COMMON', label: '공통 영어' },
  { day: 'FRI', period: 3, block: 'A', label: 'A블록 선택' },
  { day: 'FRI', period: 4, block: 'COMMON', label: '공통 수학' },
  { day: 'FRI', period: 5, block: 'COMMON', label: '진로 특강' },
  { day: 'FRI', period: 6, block: 'B', label: 'B블록 선택' },
  { day: 'FRI', period: 7, block: 'D', label: 'D블록 선택' },
];

export function getWeeklyScheduleForGrade(grade: number): WeeklyBlockSlot[] {
  if (grade === 3) {
    return DEFAULT_WEEKLY_SCHEDULE;
  }
  return GRADE_1_2_WEEKLY_SCHEDULE;
}

// 학생 프로필: 3학년은 E~H 블록, 1·2학년은 A~D 블록
export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'student-demo-haneul',
    name: '강하늘',
    grade: 3,
    classNum: 2,
    studentNum: 15,
    avatarColor: 'indigo',
    courses: [
      {
        block: 'E',
        subject: '물리Ⅱ',
        room: '5층 물리실',
        teacherName: '박물리 선생님',
      },
      {
        block: 'F',
        subject: '화학Ⅱ',
        room: '5층 화학실',
        teacherName: '이화학 선생님',
      },
      {
        block: 'G',
        subject: '세계사',
        room: '4층 교과학습실 401호',
        teacherName: '정역사 선생님',
      },
      {
        block: 'H',
        subject: '심화영어',
        room: '4층 디자인클래스 401호',
        teacherName: '한영어 선생님',
      },
    ],
    checkedSupplies: {
      'asmt-phy-today': ['공학용 계산기', '실험 가운'],
    },
    completedAssessments: [],
  },
  {
    id: 'student-kim-minjun',
    name: '김민준',
    grade: 3,
    classNum: 2,
    studentNum: 14,
    avatarColor: 'indigo',
    courses: [
      {
        block: 'E',
        subject: '물리Ⅱ',
        room: '5층 물리실',
        teacherName: '박물리 선생님',
      },
      {
        block: 'F',
        subject: '화학Ⅱ',
        room: '5층 화학실',
        teacherName: '이화학 선생님',
      },
      {
        block: 'G',
        subject: '세계사',
        room: '4층 교과학습실 401호',
        teacherName: '정역사 선생님',
      },
      {
        block: 'H',
        subject: '심화영어',
        room: '4층 디자인클래스 401호',
        teacherName: '한영어 선생님',
      },
    ],
    checkedSupplies: {
      'asmt-phy-today': ['필기도구'],
    },
    completedAssessments: [],
  },
  {
    id: 'student-lee-seoyeon',
    name: '이서연',
    grade: 3,
    classNum: 2,
    studentNum: 21,
    avatarColor: 'rose',
    courses: [
      {
        block: 'E',
        subject: '생명과학Ⅱ',
        room: '5층 생명과학실',
        teacherName: '최생명 선생님',
      },
      {
        block: 'F',
        subject: '지구과학Ⅱ',
        room: '5층 지구과학실',
        teacherName: '강지구 선생님',
      },
      {
        block: 'G',
        subject: '경제',
        room: '4층 교과학습실 401호',
        teacherName: '오경제 선생님',
      },
      {
        block: 'H',
        subject: '일본어Ⅱ',
        room: '3층 디자인클래스 301호',
        teacherName: '윤일어 선생님',
      },
    ],
    checkedSupplies: {},
    completedAssessments: [],
  },
  {
    id: 'student-park-jihoon',
    name: '박지훈',
    grade: 2,
    classNum: 3,
    studentNum: 9,
    avatarColor: 'emerald',
    courses: [
      {
        block: 'A',
        subject: '화학Ⅰ',
        room: '5층 화학실',
        teacherName: '이화학 선생님',
      },
      {
        block: 'B',
        subject: '생명과학Ⅰ',
        room: '5층 생명과학실',
        teacherName: '최생명 선생님',
      },
      {
        block: 'C',
        subject: '정치와 법',
        room: '3층 디자인클래스 302호',
        teacherName: '정사회 선생님',
      },
      {
        block: 'D',
        subject: '일본어Ⅰ',
        room: '3층 디자인클래스 301호',
        teacherName: '윤일어 선생님',
      },
    ],
    checkedSupplies: {},
    completedAssessments: [],
  },
];

// 선생님이 올린 전체 수행평가 목록 (3학년 E~H 블록, 2학년 A~D 블록)
export const INITIAL_ASSESSMENTS: Assessment[] = [
  // --- 3학년 수행평가 (E, F, G, H 블록) ---
  {
    id: 'asmt-phy-today',
    subject: '물리Ⅱ',
    block: 'E',
    targetGrade: 3,
    title: '전자기 유도 현상 탐구 및 패러데이 법칙 실험 평가',
    type: '실험/탐구',
    date: '2026-10-23', // 금요일 -> 금 3교시 (E블록)
    periodOverride: 3,
    supplies: ['공학용 계산기', '실험 가운', '30cm 자', '컴퓨터용 사인펜'],
    description:
      '코일의 감은 수와 자석의 속도에 따른 유도기전력의 크기 변화를 MBL 센서로 측정하고, 렌츠의 법칙과 패러데이 법칙의 비례관계를 오차 분석 보고서로 당일 제출합니다.',
    criteria: [
      '센서 보정 및 실험 데이터 유효성 (30점)',
      '패러데이 유도 법칙 수식 도출 및 계산 정확도 (40점)',
      '실험 오차 발생 원인 분석의 타당성 (30점)',
    ],
    teacherName: '박물리 선생님',
    createdAt: '2026-10-18T09:00:00Z',
  },
  {
    id: 'asmt-bio-today',
    subject: '생명과학Ⅱ',
    block: 'E',
    targetGrade: 3,
    title: '세포 호흡 및 발효 과정의 산소 소비율 분석 구술 평가',
    type: '구술/발표',
    date: '2026-10-23', // 금요일 -> 금 3교시 (E블록)
    periodOverride: 3,
    supplies: ['개인 발표 카드', '실험 데이터 시트', '필기도구'],
    description:
      '미토콘드리아 내 TCA 회로와 전자전달계에서의 ATP 합성 메커니즘을 3분간 모델을 활용해 구술 설명하고 즉석 질문에 답변합니다.',
    criteria: [
      'TCA 회로의 기질 수준 인산화와 산화적 인산화 명확한 구분 (40점)',
      '호흡 저해제 처리 시 ATP 합성 저해 원인 논리적 설명 (30점)',
      '발표 전달력 및 질의응답 대응력 (30점)',
    ],
    teacherName: '최생명 선생님',
    createdAt: '2026-10-18T10:30:00Z',
  },
  {
    id: 'asmt-phy-upcoming',
    subject: '물리Ⅱ',
    block: 'E',
    targetGrade: 3,
    title: '전자기 유도 심화 탐구 보고서 최종 제출 및 서술형 논술',
    type: '논술/서술',
    date: '2026-10-26', // 월요일 -> 월 2교시 (E블록)
    supplies: ['공학용 계산기', '검은색 볼펜', '수정테이프', '사전 배부된 학습지'],
    description:
      '상호 유도와 자체 유도 현상을 일상생활 속 무선충전기 및 금속탐지기에 적용한 원리를 서술하고 유도계수 계산 문제를 풀이합니다.',
    criteria: [
      '전자기학 개념의 수학적 모델링 완성도 (40점)',
      '실생활 기술 적용 사례 분석의 논리성 (40점)',
      '학술적 문장 구성 및 표기 규칙 준수 (20점)',
    ],
    teacherName: '박물리 선생님',
    createdAt: '2026-10-20T11:00:00Z',
  },
  {
    id: 'asmt-chem-upcoming',
    subject: '화학Ⅱ',
    block: 'F',
    targetGrade: 3,
    title: '반응 엔탈피 측정 및 헤스의 법칙(Hess\'s Law) 검증 실험',
    type: '실험/탐구',
    date: '2026-10-27', // 화요일 -> 화 3교시 (F블록)
    supplies: ['실험 가운', '보안경', '실험용 장갑', '공학용 계산기'],
    description:
      '산-염기 중화 반응의 단계별 엔탈피 변화량을 간이 열량계로 측정하여 상태함수의 경로 독립성을 수치로 증명합니다.',
    criteria: [
      '열량계 비열 오차 보정 계산의 정확성 (35점)',
      '헤스의 법칙 총괄 열량 보존 확인 (35점)',
      '실험실 안전 수칙 및 폐액 처리 준수 (30점)',
    ],
    teacherName: '이화학 선생님',
    createdAt: '2026-10-20T14:00:00Z',
  },
  {
    id: 'asmt-earth-upcoming',
    subject: '지구과학Ⅱ',
    block: 'F',
    targetGrade: 3,
    title: '지형류와 에크만 수송 해류 분석 및 지균풍 모형 해석',
    type: '논술/서술',
    date: '2026-10-27', // 화요일 -> 화 3교시 (F블록)
    supplies: ['지구과학 탐구 부도', '각도기', '30cm 자', '볼펜'],
    description:
      '북태평양 아열대 순환에서의 수압경도력과 전향력의 평형 관계를 도식화하고, 에크만 펌핑에 의한 침강 현상을 해석합니다.',
    criteria: [
      '지형류 유속 공식의 벡터 도해 및 계산 (40점)',
      '해양-대기 상호작용 메커니즘의 인과성 (40점)',
      '단위 환산 및 도해 표기 완성도 (20점)',
    ],
    teacherName: '강지구 선생님',
    createdAt: '2026-10-21T09:30:00Z',
  },
  {
    id: 'asmt-econ-upcoming',
    subject: '경제',
    block: 'G',
    targetGrade: 3,
    title: '외부효과와 공공재 시장 실패 사례 연구 및 정부 개입 정책 제안',
    type: '프로젝트',
    date: '2026-10-28', // 수요일 -> 수 4교시 (G블록)
    supplies: ['태블릿 PC (또는 인쇄된 보고서 3부)', '슬라이드 발표 자료'],
    description:
      '탄소배출권 거래제도 또는 플랫폼 독점 시장의 부작용을 미시경제학적 잉여 분석 그래프를 활용하여 5분 팀별 발표를 진행합니다.',
    criteria: [
      '사회적 후생 손실(Deadweight Loss) 도해 분석의 엄밀성 (40점)',
      '피구세 vs 직접 규제 비교 분석의 깊이 (35점)',
      '발표 시간(5분 ±30초) 준수 및 질의 대응 (25점)',
    ],
    teacherName: '오경제 선생님',
    createdAt: '2026-10-21T16:00:00Z',
  },
  {
    id: 'asmt-history-upcoming',
    subject: '세계사',
    block: 'G',
    targetGrade: 3,
    title: '제2차 세계대전 전후 냉전 체제 형성과 제3세계 비동맹 운동 사료 분석',
    type: '논술/서술',
    date: '2026-10-28', // 수요일 -> 수 4교시 (G블록)
    supplies: ['사료 분석지철', '형광펜 3색', '흑색 필기도구'],
    description:
      '트루먼 독트린, 마셜 플랜, 반둥 회의 공동선언문 사료를 직접 비교 분석하여 양극 체제 속 탈식민화의 역사적 의의를 800자 이내로 서술합니다.',
    criteria: [
      '1차 사료 핵심 구절 인용 및 맥락 해석 (40점)',
      '냉전과 탈식민화의 복합적 상호작용 서술 (40점)',
      '분량 및 맞춤법 규정 준수 (20점)',
    ],
    teacherName: '정역사 선생님',
    createdAt: '2026-10-22T10:00:00Z',
  },
  {
    id: 'asmt-eng-upcoming',
    subject: '심화영어',
    block: 'H',
    targetGrade: 3,
    title: '학술 에세이 Critical Reading & Argumentative Summary',
    type: '포트폴리오',
    date: '2026-10-29', // 목요일 -> 목 5교시 (H블록)
    supplies: ['영영사전 (전자사전 가능)', '에세이 초안지', '루브릭 양식'],
    description:
      'MIT Technology Review 기명 칼럼을 읽고 저자의 핵심 논거에 반박 또는 보완하는 300단어 분량의 논증적 요약문을 작성하여 제출합니다.',
    criteria: [
      'Thesis Statement의 명확성과 일관성 (35점)',
      '고급 학술 어휘 및 복문 구문의 적절성 (35점)',
      '인용 규칙 및 문법적 완성도 (30점)',
    ],
    teacherName: '한영어 선생님',
    createdAt: '2026-10-22T13:30:00Z',
  },
  {
    id: 'asmt-jap-upcoming',
    subject: '일본어Ⅱ',
    block: 'H',
    targetGrade: 3,
    title: '일본의 전통 문화와 현대 대중문화의 융합 현상 인터뷰 롤플레잉',
    type: '구술/발표',
    date: '2026-10-29', // 목요일 -> 목 5교시 (H블록)
    supplies: ['대본 큐카드', '시각 자료 1장 (A4)'],
    description:
      '교토의 마치야 리노베이션 또는 지역 축제 마케팅을 주제로 리포터와 전문가의 인터뷰 상황극을 2인 1조로 자연스러운 경어로 시연합니다.',
    criteria: [
      '상황에 맞는 정중어(데스·마스) 및 겸양 표현 활용 (40점)',
      '발음 억양의 자연스러움 및 유창성 (35점)',
      '대화 상호작용 및 아이컨택 (25점)',
    ],
    teacherName: '윤일어 선생님',
    createdAt: '2026-10-22T15:00:00Z',
  },

  // --- 2학년 수행평가 (A, B 블록) ---
  {
    id: 'asmt-chem1-upcoming',
    subject: '화학Ⅰ',
    block: 'A',
    targetGrade: 2,
    title: '화학 반응에서의 열 출입 측정 및 반응열 계산 실험',
    type: '실험/탐구',
    date: '2026-10-26', // 월요일 -> 월 2교시 (A블록)
    supplies: ['실험 가운', '보안경', '공학용 계산기'],
    description:
      '염화나트륨 및 수산화나트륨의 용해열을 간이 열량계로 측정하고 발열 반응과 흡열 반응의 열화학 반응식을 작성합니다.',
    criteria: [
      '용해열 측정 정밀도 (40점)',
      '열용량 계산 정확도 (35점)',
      '실험실 정리 (25점)',
    ],
    teacherName: '이화학 선생님',
    createdAt: '2026-10-21T11:00:00Z',
  },
  {
    id: 'asmt-bio1-upcoming',
    subject: '생명과학Ⅰ',
    block: 'B',
    targetGrade: 2,
    title: '양파 뿌리 끝 세포 분열 관찰 및 체세포 분열 단계별 스케치',
    type: '실험/탐구',
    date: '2026-10-27', // 화요일 -> 화 3교시 (B블록)
    supplies: ['현미경 관찰 보고서 양식', '연필', '지우개'],
    description:
      '광학현미경으로 간기, 전기, 중기, 후기, 말기 분열 상을 찾아 표본 관찰 보고서를 작성합니다.',
    criteria: [
      '각 분열 단계별 식별 정확도 (45점)',
      '현미경 조작 및 배율 표기 (30점)',
      '관찰 스케치 충실도 (25점)',
    ],
    teacherName: '최생명 선생님',
    createdAt: '2026-10-21T14:30:00Z',
  },
];

// 자주 쓰이는 선택과목 추천 목록
export const POPULAR_ELECTIVE_SUBJECTS = {
  과학: ['물리Ⅱ', '화학Ⅱ', '생명과학Ⅱ', '지구과학Ⅱ', '물리Ⅰ', '화학Ⅰ', '생명과학Ⅰ', '지구과학Ⅰ', '과학탐구실험', '고급물리학'],
  사회: ['경제', '세계사', '정치와 법', '사회·문화', '윤리와 사상', '한국지리', '세계지리'],
  외국어: ['심화영어', '심화영어독해', '일본어Ⅰ', '일본어Ⅱ', '중국어Ⅰ', '중국어Ⅱ', '프랑스어Ⅰ'],
  수학정보기술: ['미적분', '기하', '인공지능수학', '수학Ⅰ', '수학Ⅱ', '확률과 통계', '정보', '프로그래밍'],
};
