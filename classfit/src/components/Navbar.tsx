import React from 'react';
import { AppRole, Assessment, AuthUser, MatchedAssessment, StudentProfile } from '../types';
import { getDetailedTimeRemaining } from '../utils/scheduleMatcher';
import { JungsanLogo } from './JungsanLogo';
import {
  Calendar,
  BookOpen,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Trophy,
  ArrowRightLeft,
  Clock,
  MapPin,
  ChevronRight,
  Flame,
  Bell,
  Lock,
  LogOut,
  ShieldCheck,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  currentRole: AppRole;
  authUser: AuthUser;
  onSelectRole: (role: AppRole) => void;
  activeStudent: StudentProfile;
  students: StudentProfile[];
  onSelectStudent: (studentId: string) => void;
  onResetData: () => void;
  activeTab: 'home' | 'schedule' | 'matrix' | 'mypage';
  onSelectTab: (tab: 'home' | 'schedule' | 'matrix' | 'mypage') => void;
  onOpenMyPage?: () => void;
  onOpenLoginPortal: () => void;
  onAttemptTeacherAccess?: () => void;
  closestStudentAssessment?: MatchedAssessment | null;
  closestTeacherAssessment?: (Assessment & { period: number; dayStr: string; daysRemaining: number }) | null;
  onOpenClosestDetail?: (asmt: any) => void;
  onOpenLockScreen?: () => void;
  onOpenFullMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  authUser,
  onSelectRole,
  activeStudent,
  students,
  onSelectStudent,
  onResetData,
  activeTab,
  onSelectTab,
  onOpenMyPage,
  onOpenLoginPortal,
  onAttemptTeacherAccess,
  closestStudentAssessment,
  closestTeacherAssessment,
  onOpenClosestDetail,
  onOpenLockScreen,
  onOpenFullMenu,
}) => {
  const isStudentAccount = authUser.role === 'student';
  const isTeacherAccount = authUser.role === 'teacher';
  const isStudent = currentRole === 'student';
  const isTeacher = currentRole === 'teacher';

  const studentTimeInfo = closestStudentAssessment
    ? getDetailedTimeRemaining(closestStudentAssessment.date, closestStudentAssessment.calculatedPeriod)
    : null;

  const teacherTimeInfo = closestTeacherAssessment
    ? getDetailedTimeRemaining(closestTeacherAssessment.date, closestTeacherAssessment.period)
    : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* 1. TOP BAR: Closest Assessment & Remaining Time Ticker */}
      {isStudent && closestStudentAssessment && studentTimeInfo && (
        <aside
          aria-label="가장 가까운 수행평가 알림"
          onClick={() => onOpenClosestDetail && onOpenClosestDetail(closestStudentAssessment)}
          className="bg-slate-950 text-white border-b border-amber-400/40 px-2.5 sm:px-4 md:px-6 py-1.5 sm:py-2 cursor-pointer hover:bg-slate-900 transition-colors group relative"
          title="클릭 시 해당 수행평가의 루브릭과 세부 내용을 바로 확인합니다"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 text-xs">
            {/* Left Section: Subject & D-day */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              {/* Desktop tag */}
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase shrink-0 shadow-xs">
                <Flame className="w-3 h-3 fill-slate-950 text-amber-500 animate-pulse" />
                가장 가까운 수행평가
              </span>

              {/* Mobile tag */}
              <span className="md:hidden inline-flex items-center p-1 rounded-md bg-amber-400 text-slate-950 shrink-0">
                <Flame className="w-3 h-3 fill-slate-950 text-amber-600" />
              </span>

              <span className="font-extrabold text-amber-300 shrink-0 text-xs sm:text-xs">
                [{closestStudentAssessment.subject}]
              </span>

              {/* Remaining time pill */}
              <span
                className={`font-mono font-black px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] shrink-0 tabular-nums flex items-center gap-1 ${
                  studentTimeInfo.isToday
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                }`}
              >
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>{studentTimeInfo.humanBadge}</span>
                <span className="hidden sm:inline">· {studentTimeInfo.detailedText}</span>
              </span>

              {/* Assessment Title - Truncated on small screens */}
              <span className="font-medium text-slate-300 truncate hidden lg:inline text-xs">
                {closestStudentAssessment.title}
              </span>
            </div>

            {/* Right Section: Room & Notification Button & Detail Arrow */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 text-slate-300">
              {/* Period & Room (hidden on mobile, shown on tablet/desktop) */}
              <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300 font-mono tabular-nums">
                <strong className="text-amber-200">{closestStudentAssessment.calculatedPeriod}교시</strong>
                <span className="text-slate-500">·</span>
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="text-white truncate max-w-[90px]">{closestStudentAssessment.studentRoom}</span>
              </span>

              {onOpenLockScreen && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLockScreen();
                  }}
                  className="px-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] sm:text-[11px] rounded-md transition-colors flex items-center gap-1 shadow-2xs shrink-0 whitespace-nowrap"
                  title="스마트폰 & iPad 지원 상단 스와이프 알림창 및 시스템 알림 열기"
                >
                  <Bell className="w-3 h-3 shrink-0" />
                  <span className="hidden xs:inline">상단 알림창</span>
                  <span className="xs:hidden">알림창</span>
                </button>
              )}

              <span className="text-[10px] sm:text-[11px] font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center shrink-0">
                <span className="hidden sm:inline">상세</span> <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* 1. TOP BAR for Teacher: School's next upcoming assessment */}
      {isTeacher && closestTeacherAssessment && teacherTimeInfo && (
        <aside
          aria-label="학교 다음 수행평가 일정 알림"
          onClick={() => onOpenClosestDetail && onOpenClosestDetail(closestTeacherAssessment)}
          className="bg-slate-900 text-white border-b border-amber-500/40 px-2.5 sm:px-4 md:px-6 py-1.5 sm:py-2 cursor-pointer hover:bg-slate-800 transition-colors group"
          title="클릭 시 해당 공지 수정/관리 화면으로 이동합니다"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase shrink-0">
                <Clock className="w-3 h-3 fill-slate-950" />
                학교 다음 수행평가
              </span>
              <span className="sm:hidden inline-flex items-center p-1 rounded-md bg-amber-400 text-slate-950 shrink-0">
                <Clock className="w-3 h-3 fill-slate-950" />
              </span>

              <span className="font-extrabold text-amber-400 shrink-0 text-xs">
                [{closestTeacherAssessment.subject}]
              </span>

              <span className="font-mono font-bold text-amber-300 text-[10px] sm:text-xs shrink-0 tabular-nums">
                {teacherTimeInfo.humanBadge} <span className="hidden sm:inline">· {teacherTimeInfo.detailedText}</span>
              </span>

              <span className="font-semibold text-slate-300 truncate hidden md:inline text-xs">
                {closestTeacherAssessment.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0 text-slate-300">
              <span className="hidden md:inline text-[11px] text-slate-300">
                {closestTeacherAssessment.targetGrade}학년 대상 · {closestTeacherAssessment.period}교시
              </span>

              <span className="text-[10px] sm:text-[11px] font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center shrink-0">
                <span className="hidden sm:inline">공지 확인</span> <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Logo & School Title & Hamburger Menu ("작대기 세 개" - Image 1 exact match) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hamburger Button (작대기 세 개 - 클릭 시 2번째 사진 '전체 메뉴' 화면 오픈) */}
            <button
              type="button"
              onClick={onOpenFullMenu}
              className="p-2 -ml-2 rounded-xl text-slate-800 hover:text-slate-950 hover:bg-slate-100 transition-colors shrink-0 flex items-center justify-center cursor-pointer group"
              title="전체 메뉴 열기 (2번째 사진 화면)"
              aria-label="전체 메뉴 열기"
            >
              <Menu className="w-6 h-6 stroke-[2.4] group-hover:scale-105 transition-transform" />
            </button>

            <button
              onClick={() => {
                if (isStudent) {
                  onSelectTab('home');
                } else if (isTeacher) {
                  onSelectRole('teacher');
                } else {
                  onSelectRole('student');
                  onSelectTab('home');
                }
              }}
              className="flex items-center gap-2.5 text-left group"
            >
              <JungsanLogo size={36} />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors whitespace-nowrap">
                    수행알리미
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                      isTeacherAccount
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-sky-100 text-sky-900'
                    }`}
                  >
                    {isTeacherAccount ? (
                      <>
                        <BookOpen className="w-3 h-3 text-amber-700" />
                        <span>선생님(교원) 전용</span>
                      </>
                    ) : (
                      <>
                        <GraduationCap className="w-3 h-3 text-indigo-700" />
                        <span>학생 계정</span>
                      </>
                    )}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  {isTeacherAccount
                    ? '수행평가 1회 공지 ➔ 학생별 시간표 자동 연동'
                    : `${activeStudent.grade === 3 ? '3학년 E~H블록' : '1·2학년 A~D블록'} 내 시간표 맞춤 알림`}
                </span>
              </div>
            </button>
          </div>

          {/* Strict Role-Based Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 text-xs font-semibold">
            {isStudent && (
              <>
                <button
                  onClick={() => onSelectTab('home')}
                  className={`py-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'home'
                      ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  내 맞춤 수행평가
                </button>
                <button
                  onClick={() => onSelectTab('matrix')}
                  className={`py-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'matrix'
                      ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  내 블록 시간표
                </button>
                <button
                  onClick={() => onSelectTab('mypage')}
                  className={`py-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'mypage'
                      ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                  마이페이지
                </button>
              </>
            )}

            {isTeacher && (
              <>
                <button
                  onClick={() => {
                    onSelectRole('teacher');
                  }}
                  className={`py-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    currentRole === 'teacher'
                      ? 'text-amber-700 font-bold border-b-2 border-amber-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  수행평가 공지 관리
                </button>
                <button
                  onClick={() => {
                    onSelectRole('student');
                    onSelectTab('matrix');
                  }}
                  className="py-1 text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  학교 블록 고정표
                </button>
              </>
            )}

            {/* Presentation shortcuts for judges */}
            {(currentRole === 'dual_compare' || currentRole === 'solverthon') && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectRole('dual_compare')}
                  className={`py-1 transition-colors whitespace-nowrap flex items-center gap-1 ${
                    currentRole === 'dual_compare'
                      ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  시연 듀얼 비교
                </button>
                <button
                  onClick={() => onSelectRole('solverthon')}
                  className={`py-1 transition-colors whitespace-nowrap flex items-center gap-1 ${
                    currentRole === 'solverthon'
                      ? 'text-indigo-600 font-bold border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  솔버톤 발표 덱
                </button>
              </div>
            )}
          </nav>

          {/* Right Area: Student Switcher (only in student mode) & Role Switch Button */}
          <div className="flex items-center gap-2 shrink-0">
            {isStudent && (
              <div className="hidden lg:flex items-center gap-1 bg-slate-100 rounded-lg p-1 text-xs">
                <span className="text-[11px] text-slate-400 px-1 font-medium">학생:</span>
                {students.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => onSelectStudent(st.id)}
                    className={`px-2 py-0.5 rounded-md font-medium transition-all whitespace-nowrap ${
                      activeStudent.id === st.id
                        ? 'bg-white text-indigo-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st.name} ({st.grade}학년)
                  </button>
                ))}
              </div>
            )}

            {/* Current Role Identity & Switch Button */}
            <div className="flex items-center gap-1.5">
              {/* Notification Modal Trigger */}
              {onOpenLockScreen && (
                <>
                  {/* Mobile-only Bell icon matching Image 1 */}
                  <button
                    onClick={onOpenLockScreen}
                    className="sm:hidden relative p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="알림창 열기"
                    aria-label="알림"
                  >
                    <Bell className="w-5 h-5 stroke-[2.2]" />
                    <span className="absolute top-1 right-0.5 bg-rose-600 text-white font-extrabold text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                      67
                    </span>
                  </button>

                  <button
                    onClick={onOpenLockScreen}
                    className="hidden sm:flex px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors items-center gap-1"
                    title="휴대폰·패드 상단 알림창 & 시스템 알림 열기"
                  >
                    <span>📱</span>
                    <span>상단 알림창</span>
                  </button>
                </>
              )}

              {/* Strict Role Control */}
              {isStudentAccount ? (
                /* Student Account: CANNOT switch to teacher mode */
                <div className="flex items-center gap-1.5">
                  <div
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200/80 rounded-xl text-indigo-950 text-xs font-semibold"
                    title={`현재 ${activeStudent.name} 학생 계정으로 로그인되어 있습니다.`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-bold">{activeStudent.name} 학생</span>
                    <span className="text-[10px] bg-indigo-200/70 text-indigo-900 px-1.5 py-0.2 rounded font-bold">학생</span>
                  </div>

                  {/* Locked Teacher Mode Indicator (clicking warns student that teacher mode is blocked) */}
                  <button
                    type="button"
                    onClick={onAttemptTeacherAccess}
                    className="hidden sm:flex px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 font-bold text-xs rounded-xl border border-dashed border-slate-300 transition-colors items-center gap-1.5 group shrink-0"
                    title="학생 계정 로그인 상태에서는 선생님 모드 전환이 제한됩니다. (클릭 시 권한 안내)"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
                    <span className="hidden xl:inline group-hover:text-rose-700">교원 모드 잠김</span>
                    <span className="xl:hidden">교원 잠김</span>
                  </button>

                  {/* Switch Account */}
                  <button
                    onClick={onOpenLoginPortal}
                    className="hidden sm:flex px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors items-center gap-1.5 shrink-0"
                    title="계정 변경 / 교사 로그인 포털 열기"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                    <span>계정 전환</span>
                  </button>
                </div>
              ) : (
                /* Teacher Account: Teacher authenticated */
                <div className="flex items-center gap-1.5">
                  <div
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-950 rounded-xl text-xs font-semibold"
                    title={`현재 ${authUser.name} 교사 계정으로 로그인되어 있습니다.`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-bold">{authUser.name}</span>
                    <span className="text-[10px] bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded font-bold">교직원</span>
                  </div>

                  {currentRole === 'teacher' ? (
                    <button
                      onClick={() => {
                        onSelectRole('student');
                        onSelectTab('home');
                      }}
                      className="hidden sm:flex px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs rounded-xl border border-indigo-200 transition-colors items-center gap-1.5 shadow-2xs shrink-0"
                      title="학생 맞춤 모드로 미리보기"
                    >
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>학생 화면 미리보기</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectRole('teacher')}
                      className="hidden sm:flex px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition-colors items-center gap-1.5 shadow-2xs shrink-0"
                      title="선생님 모드로 복귀"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      <span>선생님 관리로 복귀</span>
                    </button>
                  )}

                  {/* Teacher Logout */}
                  <button
                    onClick={onOpenLoginPortal}
                    className="hidden sm:flex px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors items-center gap-1.5 shrink-0"
                    title="교직원 로그아웃 / 계정 전환"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    <span>로그아웃</span>
                  </button>
                </div>
              )}

              <button
                onClick={onResetData}
                title="샘플 데이터 초기화"
                className="hidden sm:flex p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Secondary Bar */}
        <div className="md:hidden flex items-center py-2 border-t border-slate-100 overflow-x-auto scrollbar-none text-xs font-medium gap-2 w-full max-w-full">
          {isStudentAccount ? (
            <>
              <button
                onClick={() => onSelectTab('home')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
                  activeTab === 'home'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600'
                }`}
              >
                내 맞춤 수행평가
              </button>
              <button
                onClick={() => onSelectTab('matrix')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
                  activeTab === 'matrix'
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600'
                }`}
              >
                내 블록 시간표
              </button>
              {onOpenLockScreen && (
                <button
                  onClick={onOpenLockScreen}
                  className="px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0 bg-slate-100 text-slate-700 font-semibold flex items-center gap-1"
                >
                  <span>📱</span>
                  <span>상단 알림창</span>
                </button>
              )}
              <button
                type="button"
                onClick={onAttemptTeacherAccess || onOpenLoginPortal}
                className="px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0 text-slate-500 bg-slate-100 border border-slate-200 font-medium flex items-center gap-1"
                title="학생 계정 로그인 상태에서는 선생님 모드 전환이 제한됩니다"
              >
                <Lock className="w-3 h-3 text-slate-400" />
                <span>교원 모드 잠김</span>
              </button>
              <button
                onClick={onOpenLoginPortal}
                className="px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0 text-indigo-700 bg-indigo-50 font-semibold flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>계정 전환</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSelectRole('teacher')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
                  currentRole === 'teacher'
                    ? 'bg-amber-50 text-amber-800 font-bold'
                    : 'text-slate-600'
                }`}
              >
                수행평가 공지 관리
              </button>
              <button
                onClick={() => {
                  onSelectRole('student');
                  onSelectTab('matrix');
                }}
                className="px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 text-slate-600"
              >
                학교 블록 고정표
              </button>
              {currentRole === 'teacher' ? (
                <button
                  onClick={() => {
                    onSelectRole('student');
                    onSelectTab('home');
                  }}
                  className="px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 text-indigo-700 bg-indigo-50 font-semibold"
                >
                  학생 화면 미리보기
                </button>
              ) : (
                <button
                  onClick={() => onSelectRole('teacher')}
                  className="px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 text-amber-800 bg-amber-50 font-semibold"
                >
                  선생님 관리로 복귀
                </button>
              )}
              <button
                onClick={onOpenLoginPortal}
                className="px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0 text-slate-600 bg-slate-100 font-semibold flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>로그아웃</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
