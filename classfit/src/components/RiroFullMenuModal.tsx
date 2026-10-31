import React, { useState } from 'react';
import { StudentProfile } from '../types';
import {
  Settings,
  X,
  Home,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  User,
  Flame,
  MapPin,
  Backpack,
  Bell,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  CreditCard,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface RiroFullMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  urgentCount?: number;
  onOpenCampusMap?: (room?: string) => void;
  onOpenMorningRoutine?: () => void;
  onOpenLockScreen?: () => void;
  onOpenScheduleEditor?: () => void;
  onOpenStudentId?: () => void;
  onOpenMyPage?: () => void;
  onSelectTab?: (tab: 'home' | 'schedule' | 'matrix' | 'mypage') => void;
}

export const RiroFullMenuModal: React.FC<RiroFullMenuModalProps> = ({
  isOpen,
  onClose,
  student,
  urgentCount = 0,
  onOpenCampusMap,
  onOpenMorningRoutine,
  onOpenLockScreen,
  onOpenScheduleEditor,
  onOpenStudentId,
  onOpenMyPage,
  onSelectTab,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [refreshToast, setRefreshToast] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setRefreshToast(true);
    setTimeout(() => setRefreshToast(false), 2000);
  };

  const handleGoToMyPage = () => {
    if (onOpenMyPage) {
      onOpenMyPage();
    } else if (onSelectTab) {
      onSelectTab('mypage');
    }
    onClose();
  };

  // 수행평가 중심 실제 기능 메뉴 (사진에 있던 불필요한 목차들은 모두 삭제 완료)
  const assessmentMenuItems = [
    {
      title: '나의 수행평가 전체 보기',
      desc: '과목별 평가기준(루브릭) 및 마감일 목록',
      icon: FileText,
      badge: null,
      action: () => {
        if (onSelectTab) onSelectTab('home');
        onClose();
      },
    },
    {
      title: 'D-Day 마감 임박 수행평가',
      desc: '48시간 이내 마감 긴급 과제 카운트다운',
      icon: Flame,
      badge: urgentCount > 0 ? `${urgentCount}건 임박` : null,
      badgeColor: 'bg-rose-600 text-white',
      action: () => {
        if (onSelectTab) onSelectTab('home');
        onClose();
      },
    },
    {
      title: '수행평가 준비물 체크리스트',
      desc: '과목별 챙겨야 할 지참물 실시간 점검',
      icon: Backpack,
      badge: null,
      action: () => {
        if (onOpenMorningRoutine) onOpenMorningRoutine();
        onClose();
      },
    },
    {
      title: '중산고 6층 교내 캠퍼스 맵',
      desc: '내 블록 선택과목별 이동교실 위치 안내',
      icon: MapPin,
      badge: null,
      action: () => {
        if (onOpenCampusMap) onOpenCampusMap();
        onClose();
      },
    },
    {
      title: '등교 전 30초 패킹 루틴',
      desc: '집 출발 전 가방 속 지참물 빠른 최종 확인',
      icon: Clock,
      badge: '추천',
      badgeColor: 'bg-amber-400 text-slate-950',
      action: () => {
        if (onOpenMorningRoutine) onOpenMorningRoutine();
        onClose();
      },
    },
    {
      title: '스마트폰 상단 알림창',
      desc: '잠금화면 및 상단 스와이프 알림 시뮬레이터',
      icon: Bell,
      badge: 'NEW',
      badgeColor: 'bg-indigo-600 text-white',
      action: () => {
        if (onOpenLockScreen) onOpenLockScreen();
        onClose();
      },
    },
    {
      title: '내 블록 시간표 관리',
      desc: 'A~D / E~H 선택과목 및 이동교실 설정',
      icon: SlidersHorizontal,
      badge: null,
      action: () => {
        if (onOpenScheduleEditor) onOpenScheduleEditor();
        onClose();
      },
    },
    {
      title: '주간 요일별 블록 매트릭스',
      desc: '전체 시간표와 수행평가 주간 배치표',
      icon: Calendar,
      badge: null,
      action: () => {
        if (onSelectTab) onSelectTab('matrix');
        onClose();
      },
    },
    {
      title: '모바일 학생증 (QR)',
      desc: '도서관·식당 이용 및 학생 신분증',
      icon: CreditCard,
      badge: null,
      action: () => {
        if (onOpenStudentId) onOpenStudentId();
        else handleGoToMyPage();
      },
    },
    {
      title: '마이페이지',
      desc: '내 학적 정보, 과제 완료율 및 수행 달성 통계',
      icon: User,
      badge: 'MY',
      badgeColor: 'bg-sky-600 text-white',
      action: handleGoToMyPage,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none">
      {/* Full screen modal container mimicking mobile app drawer */}
      <div className="relative w-full max-w-md mx-auto h-full bg-white flex flex-col shadow-2xl overflow-hidden">
        {/* =========================================================================
            1. TOP HEADER: [ ⚙️ ]  전체 메뉴  [ ✕ ]
           ========================================================================= */}
        <div className="h-14 border-b border-slate-200 px-4 flex items-center justify-between bg-white shrink-0">
          <button
            onClick={() => {
              if (onOpenScheduleEditor) onOpenScheduleEditor();
              onClose();
            }}
            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="설정 및 시간표 수정"
          >
            <Settings className="w-5 h-5 stroke-[2]" />
          </button>

          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            전체 메뉴
          </h2>

          <button
            onClick={onClose}
            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* =========================================================================
            2. SCROLLABLE CONTENT BODY
           ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* User Profile Card */}
          <div
            onClick={handleGoToMyPage}
            className="rounded-2xl border border-slate-200 bg-white p-3.5 flex items-center justify-between shadow-2xs hover:border-sky-300 hover:bg-sky-50/20 cursor-pointer transition-all"
            title="클릭 시 마이페이지로 이동합니다"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl text-white font-extrabold text-sm flex items-center justify-center shadow-xs"
                style={{ backgroundColor: student.avatarColor || '#3b82f6' }}
              >
                {student.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-base">
                    {student.name}
                  </span>
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                    재학생
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  중산고 ({student.grade}학년 {student.classNum}반)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-sky-600 font-bold">
              <span>마이페이지</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Dual Action Buttons: [ 마이페이지 ] [ 수행 알림 1 ] (리로포털 삭제 완료) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleGoToMyPage}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 bg-white text-slate-800 font-bold text-xs sm:text-sm transition-all text-center shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <User className="w-4 h-4 text-sky-600" />
              <span>마이페이지</span>
            </button>

            <button
              onClick={() => {
                if (onOpenLockScreen) onOpenLockScreen();
                onClose();
              }}
              className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 bg-white text-slate-800 font-bold text-xs sm:text-sm transition-all text-center shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-4 h-4 text-amber-500" />
              <span>수행 알림</span>
              <span className="w-4 h-4 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                1
              </span>
            </button>
          </div>

          {/* Quick Assessment Shortcuts Banner */}
          <div className="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-amber-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                맞춤형 수행평가 빠른 실행
              </span>
              {urgentCount > 0 && (
                <span className="text-[10px] font-black bg-rose-600 px-1.5 py-0.2 rounded-full">
                  {urgentCount}건 임박
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                onClick={() => {
                  if (onOpenCampusMap) onOpenCampusMap();
                  onClose();
                }}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-center flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-semibold text-slate-200">캠퍼스 맵</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenMorningRoutine) onOpenMorningRoutine();
                  onClose();
                }}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-center flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
              >
                <Backpack className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-semibold text-slate-200">등교 준비물</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenLockScreen) onOpenLockScreen();
                  onClose();
                }}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-center flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-sky-300" />
                <span className="font-semibold text-slate-200">상단 알림창</span>
              </button>
            </div>
          </div>

          {/* 수행평가 전용 기능 메뉴 목록 (사진의 목차는 다 삭제되고 실제 기능만 정돈됨) */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-slate-400 px-2 py-1 flex items-center justify-between">
              <span>수행평가 & 학업 편의 메뉴</span>
              <span className="text-[10px] text-sky-600 font-semibold">100% 맞춤 연동</span>
            </div>

            {assessmentMenuItems.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-sky-50 text-slate-600 group-hover:text-sky-600 flex items-center justify-center transition-colors">
                      <IconComp className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-sky-700 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            3. BOTTOM APP NAVIGATION BAR (5개 버튼: 리로포털 삭제 완료)
               [스쿨 홈]  [이전]  [다음]  [새로고침]  [마이페이지]
           ========================================================================= */}
        <div className="h-16 border-t border-slate-200 bg-white grid grid-cols-5 items-center px-1 text-center shrink-0">
          {/* 1. 스쿨 홈 */}
          <button
            onClick={() => {
              if (onSelectTab) onSelectTab('home');
              onClose();
            }}
            className="flex flex-col items-center justify-center gap-0.5 py-1 text-slate-800 hover:text-sky-600 transition-colors cursor-pointer"
          >
            <Home className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-bold">스쿨 홈</span>
          </button>

          {/* 2. 이전 */}
          <button
            onClick={onClose}
            className="flex flex-col items-center justify-center gap-0.5 py-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium">이전</span>
          </button>

          {/* 3. 다음 */}
          <button
            onClick={onClose}
            className="flex flex-col items-center justify-center gap-0.5 py-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium">다음</span>
          </button>

          {/* 4. 새로고침 */}
          <button
            onClick={handleRefresh}
            className="flex flex-col items-center justify-center gap-0.5 py-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCw className="w-5 h-5 stroke-[2]" />
            <span className="text-[10px] font-medium">새로고침</span>
          </button>

          {/* 5. 마이페이지 (클릭 시 마이페이지로 즉시 이동) */}
          <button
            onClick={handleGoToMyPage}
            className="flex flex-col items-center justify-center gap-0.5 py-1 text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
          >
            <User className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold">마이페이지</span>
          </button>
        </div>

        {/* Soft Toast for Refresh */}
        {refreshToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-50 animate-bounce">
            동기화 완료되었습니다
          </div>
        )}
      </div>
    </div>
  );
};
