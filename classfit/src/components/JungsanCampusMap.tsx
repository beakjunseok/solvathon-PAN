import React, { useState } from 'react';
import { JungsanLogo } from './JungsanLogo';
import {
  MapPin,
  Navigation,
  Clock,
  Building,
  ArrowRight,
  X,
  Info,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

export interface CampusFloor {
  floorId: string;
  floorNum: number;
  label: string;
  subLabel: string;
  rooms: string[];
  features: string[];
  elevatorAccessible: boolean;
}

export const JUNGSAN_CAMPUS_FLOORS: CampusFloor[] = [
  {
    floorId: '6F',
    floorNum: 6,
    label: '6층',
    subLabel: '예체능 & 대형홀',
    rooms: ['미술실', '음악실', 'HALL', '멀티미디어실'],
    features: ['5층에서 중앙계단으로 이동 (엘리베이터 미운행)', '공개수업 시 학부모님 쉼터 (멀티미디어실)'],
    elevatorAccessible: false,
  },
  {
    floorId: '5F',
    floorNum: 5,
    label: '5층',
    subLabel: '과학탐구실 & 특별교실',
    rooms: [
      '화학실',
      '물리실',
      '생명과학실',
      '지구과학실',
      '과학자료실',
      '방송실',
      '진로진학부/정책기획부',
      '설렘ON실',
      '디자인클래스 501호',
      '디자인클래스 502호',
      '디자인클래스 503호',
    ],
    features: ['1층~5층 엘리베이터 이용 가능', '중앙 여교사화장실 & 남학생화장실'],
    elevatorAccessible: true,
  },
  {
    floorId: '4F',
    floorNum: 4,
    label: '4층',
    subLabel: '3학년 홈베이스 (3-1 ~ 3-12)',
    rooms: [
      '3학년 교실 (3-1 ~ 3-12)',
      '3학년 교무실',
      '컴퓨터실',
      'ICT 기획부',
      '교과학습실 401호',
      '디자인클래스 401호',
      '시청각실',
    ],
    features: ['3학년 선택과목(E, F, G, H블록) 교실 집중 배치', '1층~5층 엘리베이터 운행'],
    elevatorAccessible: true,
  },
  {
    floorId: '3F',
    floorNum: 3,
    label: '3층',
    subLabel: '2학년 홈베이스 (2-1 ~ 2-12)',
    rooms: [
      '2학년 교실 (2-1 ~ 2-12)',
      '2학년 교무실',
      '디자인클래스 301호',
      '디자인클래스 302호',
      '디자인클래스 303호',
      '디자인클래스 304호',
      '디자인클래스 305호',
      '디자인클래스 306호',
      '디자인클래스 307호',
      '꿈담학습카페',
    ],
    features: ['2학년 선택과목(A, B, C, D블록) 교실 배치', '서편 꿈담학습카페'],
    elevatorAccessible: true,
  },
  {
    floorId: '2F',
    floorNum: 2,
    label: '2층',
    subLabel: '1학년 홈베이스 (1-1 ~ 1-11)',
    rooms: [
      '1학년 교실 (1-1 ~ 1-11)',
      '1학년 교무실',
      '그룹활동실',
      '디자인클래스 201호',
      '디자인클래스 202호',
      '디자인클래스 203호',
      '디자인클래스 204호',
      'Wee클래스 (상담실)',
      '꿈담학습카페',
    ],
    features: ['1학년 공통과목 및 A~D블록 수업', '학생 공감 Wee클래스 상담실'],
    elevatorAccessible: true,
  },
  {
    floorId: '1F',
    floorNum: 1,
    label: '1층',
    subLabel: '본관 행정·교무 & 도서관',
    rooms: [
      '교무실',
      '행정실',
      '교장실',
      '회의실',
      '이사장실',
      '법인사무실',
      '보건실',
      '문서고',
      '교사연구실',
      '매점',
      '꿈마루도서관',
    ],
    features: ['여자화장실 (1층 동편 및 서편)', '보건실 & 꿈마루도서관 & 매점'],
    elevatorAccessible: true,
  },
  {
    floorId: 'B1F',
    floorNum: 0,
    label: 'B1층',
    subLabel: '지하 복합문화·체육시설',
    rooms: ['꿈누리 카페', '골프연습장', '기계실'],
    features: ['학생 휴게 및 동아리 공간', '골프 체육 수업장'],
    elevatorAccessible: false,
  },
];

interface CampusRoomInfo {
  floor: string;
  floorNum: number;
  roomName: string;
  subjects: string[];
  routeTip: string;
}

export const JUNGSAN_ROOMS: Record<string, CampusRoomInfo> = {
  '5층 물리실': {
    floor: '5F',
    floorNum: 5,
    roomName: '물리실',
    subjects: ['물리Ⅱ', '고급물리학', '과학탐구실험'],
    routeTip: '3학년 교실(4층)에서 중앙계단 또는 엘리베이터로 5층 이동 후 화학실 옆 복도 (도보 약 1분 30초)',
  },
  '5층 화학실': {
    floor: '5F',
    floorNum: 5,
    roomName: '화학실',
    subjects: ['화학Ⅱ', '화학Ⅰ', '화학실험'],
    routeTip: '엘리베이터 또는 중앙계단으로 5층 도착 후 서편 복도 진입 (도보 약 1분 30초)',
  },
  '5층 생명과학실': {
    floor: '5F',
    floorNum: 5,
    roomName: '생명과학실',
    subjects: ['생명과학Ⅱ', '생명과학Ⅰ', '생명과학실험'],
    routeTip: '5층 동편 과학자료실 및 진로진학부 맞은편 (도보 약 1분 30초)',
  },
  '5층 지구과학실': {
    floor: '5F',
    floorNum: 5,
    roomName: '지구과학실',
    subjects: ['지구과학Ⅱ', '지구과학Ⅰ', '천문학탐구'],
    routeTip: '5층 동편 끝 생명과학실 옆 위치 (도보 약 1분 30초)',
  },
  '4층 컴퓨터실': {
    floor: '4F',
    floorNum: 4,
    roomName: '컴퓨터실',
    subjects: ['정보', '인공지능기초', '프로그래밍'],
    routeTip: '4층 3학년 교무실 및 ICT기획부 옆 (도보 약 1분)',
  },
  '4층 교과학습실 401호': {
    floor: '4F',
    floorNum: 4,
    roomName: '교과학습실 401호',
    subjects: ['세계사', '경제', '한국지리', '윤리와 사상'],
    routeTip: '4층 중앙 복도 3-4반과 3-5반 사이 (도보 약 1분)',
  },
  '4층 디자인클래스 401호': {
    floor: '4F',
    floorNum: 4,
    roomName: '디자인클래스 401호',
    subjects: ['심화영어', '영어회화', '사회·문화'],
    routeTip: '4층 3학년 교무실 맞은편 특별교실 (도보 약 1분)',
  },
  '3층 디자인클래스 301호': {
    floor: '3F',
    floorNum: 3,
    roomName: '디자인클래스 301호',
    subjects: ['일본어Ⅰ', '일본어Ⅱ', '중국어Ⅰ'],
    routeTip: '3층 동편 2-1반 복도 끝 디자인클래스 전용실 (도보 약 1분 30초)',
  },
  '3층 디자인클래스 302호': {
    floor: '3F',
    floorNum: 3,
    roomName: '디자인클래스 302호',
    subjects: ['정치와 법', '세계지리'],
    routeTip: '3층 동편 2-2반 맞은편 교실 (도보 약 1분 30초)',
  },
  '6층 미술실': {
    floor: '6F',
    floorNum: 6,
    roomName: '미술실',
    subjects: ['미술', '미술창작', '디자인'],
    routeTip: '5층까지 엘리베이터/계단 이용 후 중앙계단으로 6층 이동 서편 위치 (도보 약 2분)',
  },
  '6층 음악실': {
    floor: '6F',
    floorNum: 6,
    roomName: '음악실',
    subjects: ['음악', '음악연주'],
    routeTip: '5층에서 6층 중앙계단으로 이동, HALL 맞은편 (도보 약 2분)',
  },
  '1층 꿈마루도서관': {
    floor: '1F',
    floorNum: 1,
    roomName: '꿈마루도서관',
    subjects: ['독서와 토론', '자율연구'],
    routeTip: '1층 서편 매점 옆 연결통로 위치 (도보 약 1분)',
  },
};

interface CampusMapModalProps {
  initialRoom?: string;
  onClose: () => void;
}

export const CampusMapModal: React.FC<CampusMapModalProps> = ({ initialRoom, onClose }) => {
  const [activeTab, setActiveTab] = useState<'interactive' | 'photo' | 'timetable'>('interactive');
  const [selectedFloor, setSelectedFloor] = useState<string>('5F');
  const [selectedRoomKey, setSelectedRoomKey] = useState<string>(
    initialRoom && JUNGSAN_ROOMS[initialRoom]
      ? initialRoom
      : '5층 물리실'
  );

  const currentInfo = JUNGSAN_ROOMS[selectedRoomKey] || JUNGSAN_ROOMS['5층 물리실'];
  const floorData = JUNGSAN_CAMPUS_FLOORS.find((f) => f.floorId === selectedFloor) || JUNGSAN_CAMPUS_FLOORS[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <JungsanLogo size={36} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  중산고등학교 건물 배치도 및 시간표
                </h2>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  실제 안내도 반영
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                B1F부터 6F까지 전 층 교실 위치, 쉬는 시간 이동 동선 및 학교 정규 시간표
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('interactive')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'interactive'
                  ? 'bg-white text-indigo-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>층별 동선 지도</span>
            </button>
            <button
              onClick={() => setActiveTab('photo')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'photo'
                  ? 'bg-white text-indigo-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>실물 안내도 사진</span>
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'timetable'
                  ? 'bg-white text-indigo-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>학교 시간표</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-300/50 rounded-lg transition-colors ml-1"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Interactive Floor by Floor Map */}
        {activeTab === 'interactive' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 text-sm">
            {/* Left 4 Cols: Vertical Floor Navigator */}
            <div className="lg:col-span-4 space-y-2">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                층 선택 (지하 1층 ~ 지상 6층)
              </span>
              <div className="space-y-1.5">
                {JUNGSAN_CAMPUS_FLOORS.map((fl) => (
                  <button
                    key={fl.floorId}
                    onClick={() => {
                      setSelectedFloor(fl.floorId);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      selectedFloor === fl.floorId
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                          selectedFloor === fl.floorId ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {fl.floorId}
                      </span>
                      <div>
                        <div className="font-bold text-xs">{fl.label}</div>
                        <div
                          className={`text-[11px] truncate max-w-[140px] ${
                            selectedFloor === fl.floorId ? 'text-indigo-100' : 'text-slate-400'
                          }`}
                        >
                          {fl.subLabel}
                        </div>
                      </div>
                    </div>
                    {fl.elevatorAccessible ? (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          selectedFloor === fl.floorId ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        EV 이용
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          selectedFloor === fl.floorId ? 'bg-indigo-500 text-white' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        계단 이용
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Transit & Elevator Rule Notice Box */}
              <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>중산고 이동 수칙 안내</span>
                </div>
                <p className="text-[11px] text-amber-900/90 leading-relaxed">
                  • <strong>1층~5층:</strong> 엘리베이터 이용 가능 (각 층 연결)<br />
                  • <strong>5층~6층:</strong> 미술·음악·멀티미디어실은 5층에서 중앙계단으로 이동<br />
                  • <strong>여자화장실:</strong> 1층 동편, 1층 서편, 5층 중앙 여교사화장실
                </p>
              </div>
            </div>

            {/* Right 8 Cols: Floor Details & Room Route */}
            <div className="lg:col-span-8 space-y-4">
              {/* Selected Floor Banner */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
                    <Building className="w-4 h-4" />
                    <span>중산고등학교 {floorData.label} 시설 안내</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{floorData.subLabel}</h3>
                </div>
                <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 font-mono">
                  {floorData.rooms.length}개 시설 등록
                </span>
              </div>

              {/* Rooms Grid for this floor */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <span className="block text-xs font-bold text-slate-700 mb-2.5">
                  {floorData.label} 전체 교실 및 시설 목록
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {floorData.rooms.map((room) => {
                    const isSelected = selectedRoomKey.includes(room) || room.includes(currentInfo.roomName);
                    return (
                      <button
                        key={room}
                        onClick={() => {
                          const fullKey = Object.keys(JUNGSAN_ROOMS).find((k) => k.includes(room));
                          if (fullKey) setSelectedRoomKey(fullKey);
                        }}
                        className={`p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-800 hover:border-indigo-300'
                        }`}
                      >
                        <span className="truncate">{room}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Room Route Guide */}
              <div className="p-4 bg-indigo-50/90 rounded-2xl border border-indigo-200 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-indigo-950 text-sm">
                    <Navigation className="w-4 h-4 text-indigo-600" />
                    <span>선택 교실: {selectedRoomKey}</span>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                    쉬는 시간 이동 추천: 10분 이내
                  </span>
                </div>

                <p className="text-slate-700 text-xs leading-relaxed font-medium">
                  {currentInfo.routeTip}
                </p>

                <div className="pt-2 border-t border-indigo-200/80 flex items-center justify-between text-[11px] text-slate-600">
                  <span>진행 과목: {currentInfo.subjects.join(', ')}</span>
                  <span className="font-semibold text-emerald-700">지각 방지 알림 연동 완료</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Real Floor Plan Photographs */}
        {activeTab === 'photo' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs text-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Photo 1: Full Floor Layout */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-indigo-600" />
                    중산고 Information 전 층(B1F~6F) 안내도
                  </span>
                  <span className="text-[10px] text-slate-400">교내 실제 부착 사진</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-black flex items-center justify-center max-h-[460px]">
                  <img
                    src="/assets/aistudio/20261024_155035_9d36a47f.jpg"
                    alt="중산고등학교 전체 층 안내도"
                    className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  6층(미술·음악·멀티미디어), 5층(과학탐구실군), 4층(3학년), 3층(2학년), 2층(1학년), 1층(교무·행정·도서관), B1층(카페·골프)
                </p>
              </div>

              {/* Photo 2: Elevator & Restroom Operation */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-emerald-600" />
                    공개수업의 날 및 동선 운영 안내
                  </span>
                  <span className="text-[10px] text-slate-400">엘리베이터 및 화장실</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-black flex items-center justify-center max-h-[460px]">
                  <img
                    src="/assets/aistudio/20261024_155032_5b574dc0.jpg"
                    alt="공개수업의 날 및 동선 운영 안내"
                    className="w-full h-auto object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  1층~5층 엘리베이터 이용 가능, 5층~6층은 중앙계단 이용 필수. 여자화장실(1층 동/서편, 5층 중앙).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Official Timetable Photo & Table */}
        {activeTab === 'timetable' && (
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 text-sm">
            {/* Left 6 Cols: Photo */}
            <div className="md:col-span-6 space-y-2">
              <span className="block text-xs font-bold text-slate-700">
                중산고등학교 정규 학교시간표 원본 사진
              </span>
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black flex items-center justify-center shadow-sm">
                <img
                  src="/assets/aistudio/20261024_155039_735c5dfe.jpg"
                  alt="중산고등학교 학교시간표 원본 사진"
                  className="w-full h-auto object-contain max-h-[480px]"
                />
              </div>
            </div>

            {/* Right 6 Cols: Interactive Digital Timetable Card */}
            <div className="md:col-span-6 space-y-3">
              <div className="p-4 bg-emerald-950 text-white rounded-2xl border border-emerald-800 shadow-md">
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold mb-1">
                  <Clock className="w-4 h-4" />
                  <span>중산고등학교 공식 일과 시간표</span>
                </div>
                <h3 className="text-lg font-bold text-white">50분 수업 · 10분 쉬는시간</h3>
                <p className="text-xs text-emerald-200/80 mt-1">
                  점심시간은 4교시 직후 12:10부터 13:20까지 70분간 진행됩니다.
                </p>
              </div>

              {/* Table of periods */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-center text-xs divide-y divide-slate-100">
                  <thead className="bg-slate-50 text-slate-700 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">구분</th>
                      <th className="py-2.5 px-3">시간</th>
                      <th className="py-2.5 px-3">비고</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-700">
                    <tr className="bg-amber-50/50 font-bold text-amber-900">
                      <td className="py-2 px-3">아침조회</td>
                      <td className="py-2 px-3">08:00 ~ 08:10</td>
                      <td className="py-2 px-3 text-[11px] font-normal">담임선생님 조회</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-indigo-700">1교시</td>
                      <td className="py-2 px-3">08:20 ~ 09:10</td>
                      <td className="py-2 px-3 text-[11px] text-slate-400">50분 수업</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-indigo-700">2교시</td>
                      <td className="py-2 px-3">09:20 ~ 10:10</td>
                      <td className="py-2 px-3 text-[11px] text-slate-400">50분 수업</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-indigo-700">3교시</td>
                      <td className="py-2 px-3">10:20 ~ 11:10</td>
                      <td className="py-2 px-3 text-[11px] text-slate-400">50분 수업</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-indigo-700">4교시</td>
                      <td className="py-2 px-3">11:20 ~ 12:10</td>
                      <td className="py-2 px-3 text-[11px] text-slate-400">50분 수업</td>
                    </tr>
                    <tr className="bg-emerald-50/70 font-bold text-emerald-900">
                      <td className="py-2 px-3">점심시간</td>
                      <td className="py-2 px-3">12:10 ~ 13:20</td>
                      <td className="py-2 px-3 text-[11px] font-normal">70분 (급식 & 휴식)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-indigo-700">5교시</td>
                      <td className="py-2 px-3">13:20 ~ 14:10</td>
                      <td className="py-2 px-3 text-[11px] text-slate-400">50분 수업</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-indigo-700">6교시</td>
                      <td className="py-2 px-3">14:20 ~ 15:10</td>
                      <td className="py-2 px-3 text-[11px] text-slate-400">50분 수업</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-bold text-indigo-700">7교시</td>
                      <td className="py-2 px-3">15:20 ~ 16:10</td>
                      <td className="py-2 px-3 text-[11px] text-slate-400">50분 수업</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            중산고등학교 고교학점제 선택과목 이동 동선 및 학교 일과 완벽 동기화
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
