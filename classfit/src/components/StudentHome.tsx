import React, { useState, useMemo } from 'react';
import { Assessment, MatchedAssessment, StudentProfile, WeeklyBlockSlot } from '../types';
import { formatDDay, getDetailedTimeRemaining, getClosestStudentAssessment } from '../utils/scheduleMatcher';
import { JungsanLogo } from './JungsanLogo';
import { StudentIdCardModal } from './RiroschoolModals';
import { CircularDDayProgress } from './CircularDDayProgress';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Backpack,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Bell,
  User,
  CreditCard,
  FileText,
  Bookmark,
  Award,
  Layers,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Phone,
  Compass,
  ArrowRight,
  SlidersHorizontal,
  Check,
  BookOpen,
  MessageSquare,
  BarChart2,
  FolderOpen,
  Utensils,
  Flame,
  CheckSquare,
  Filter,
  Menu,
} from 'lucide-react';

interface StudentHomeProps {
  student: StudentProfile;
  matchedAssessments: MatchedAssessment[];
  allAssessments: Assessment[];
  weeklySchedule: WeeklyBlockSlot[];
  onOpenScheduleEditor: () => void;
  onOpenDetailModal: (assessment: MatchedAssessment) => void;
  onOpenCampusMap: (roomKey?: string) => void;
  onOpenMorningRoutine: () => void;
  onOpenComciganModal?: () => void;
  onOpenLockScreen?: () => void;
  onOpenFullMenu?: () => void;
  onOpenMyPage?: () => void;
  onToggleSupply: (assessmentId: string, item: string) => void;
  onToggleComplete: (assessmentId: string) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  student,
  matchedAssessments,
  allAssessments,
  weeklySchedule,
  onOpenScheduleEditor,
  onOpenDetailModal,
  onOpenCampusMap,
  onOpenMorningRoutine,
  onOpenComciganModal,
  onOpenLockScreen,
  onOpenFullMenu,
  onOpenMyPage,
  onToggleSupply,
  onToggleComplete,
}) => {
  // Search & Filter state (focused 100% on assessments)
  const [searchCategory, setSearchCategory] = useState<'과제명' | '과목명' | '담당교사' | '준비물'>('과제명');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailFilter, setDetailFilter] = useState<'all' | 'urgent' | 'supplies' | 'completed'>('all');

  // Modals state
  const [isStudentIdOpen, setIsStudentIdOpen] = useState(false);

  // Urgent assessments (D-0, D-1, D-2)
  const urgentWithin48h = useMemo(() => {
    return matchedAssessments.filter(
      (a) => !a.isCompleted && a.daysRemaining >= 0 && a.daysRemaining <= 2
    );
  }, [matchedAssessments]);

  // Single closest upcoming assessment and its detailed countdown
  const closestAssessment = useMemo(() => {
    return getClosestStudentAssessment(matchedAssessments);
  }, [matchedAssessments]);

  const closestTimeInfo = useMemo(() => {
    if (!closestAssessment) return null;
    return getDetailedTimeRemaining(closestAssessment.date, closestAssessment.calculatedPeriod);
  }, [closestAssessment]);

  // Assessments requiring supplies
  const assessmentsWithSupplies = useMemo(() => {
    return matchedAssessments.filter((a) => !a.isCompleted && a.supplies.length > 0);
  }, [matchedAssessments]);

  // Assessment completion statistics
  const totalCount = matchedAssessments.length;
  const completedCount = matchedAssessments.filter((a) => a.isCompleted).length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Total supplies count
  const allSuppliesCount = useMemo(() => {
    return matchedAssessments.reduce((sum, a) => sum + a.supplies.length, 0);
  }, [matchedAssessments]);

  // Filtered assessments based on search query and tab filter
  const filteredAssessments = useMemo(() => {
    let result = matchedAssessments;

    // Apply Tab Filter
    if (detailFilter === 'urgent') {
      result = result.filter((a) => a.daysRemaining >= 0 && a.daysRemaining <= 2 && !a.isCompleted);
    } else if (detailFilter === 'supplies') {
      result = result.filter((a) => a.supplies.length > 0 && !a.isCompleted);
    } else if (detailFilter === 'completed') {
      result = result.filter((a) => a.isCompleted);
    }

    // Apply Search Query
    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase().trim();
    return result.filter((a) => {
      if (searchCategory === '과제명') return a.title.toLowerCase().includes(q);
      if (searchCategory === '과목명') return a.subject.toLowerCase().includes(q);
      if (searchCategory === '담당교사') return a.teacherName.toLowerCase().includes(q);
      if (searchCategory === '준비물') return a.supplies.some((s) => s.toLowerCase().includes(q));
      return a.title.toLowerCase().includes(q) || a.subject.toLowerCase().includes(q);
    });
  }, [matchedAssessments, detailFilter, searchQuery, searchCategory]);

  return (
    <div className="bg-[#f0f2f5] min-h-screen text-slate-800 font-sans flex flex-col w-full overflow-x-hidden">
      {/* Main Responsive Content Area (Full width, no left sidebar) */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 lg:p-6 pb-24 space-y-4 min-w-0">
          {/* Top Utility Row */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 pb-1 gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0 truncate">
              <span className="font-extrabold text-slate-800 whitespace-nowrap">중산고등학교 수행알리미</span>
              <span className="text-slate-300 hidden md:inline">|</span>
              <span className="text-slate-500 hidden md:inline truncate">
                고교학점제 선택과목({student.grade === 3 ? 'E~H' : 'A~D'}) 연동 포털
              </span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-4 text-slate-500 font-medium shrink-0">
              <button
                onClick={onOpenLockScreen}
                className="hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>알림</span>
                <span className="bg-rose-600 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                  66
                </span>
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={() => {
                  if (onOpenMyPage) onOpenMyPage();
                  else if (onOpenScheduleEditor) onOpenScheduleEditor();
                }}
                className="hover:text-sky-600 font-bold transition-colors cursor-pointer"
              >
                마이페이지
              </button>
              <span className="text-slate-300 hidden sm:inline">|</span>
              <button
                onClick={() => setIsStudentIdOpen(true)}
                className="hover:text-slate-800 transition-colors hidden sm:inline cursor-pointer"
              >
                모바일 학생증
              </button>
              {onOpenFullMenu && (
                <>
                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <button
                    onClick={onOpenFullMenu}
                    className="hover:text-slate-800 transition-colors hidden sm:inline font-bold text-sky-700 cursor-pointer"
                  >
                    전체메뉴
                  </button>
                </>
              )}
            </div>
          </div>

          {/* =========================================================================
              3. HERO BANNER: Using Image 2 (/assets/aistudio/image_2858cb79.png)
                 with Slogan: "더 큰 세계로 향한 발걸음의 시작"
             ========================================================================= */}
          <div className="relative w-full h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-md group border border-slate-200/80 bg-slate-900">
            {/* The second photo of Jungsan High School building at night */}
            <img
              src="assets/aistudio/image_2858cb79.png"
              alt="중산고등학교 전경"
              className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 ease-out"
            />

            {/* Subtle Gradient Shade for Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-slate-950/40" />

            {/* Slogan Text: Exact reproduction of Image 1 text */}
            <div className="absolute top-6 sm:top-8 left-6 sm:left-10 z-10 space-y-1 sm:space-y-2">
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                더 큰 세계로 향한 발걸음의 시작
              </h1>
              <p className="text-xs sm:text-sm text-slate-200/90 font-medium drop-shadow-sm flex items-center gap-2">
                <span>중산고등학교</span>
                <span className="text-white/60">·</span>
                <span>고교학점제 선택과목 맞춤 수행평가 알리미</span>
              </p>
            </div>

            {/* Quick status badge on bottom right of the hero banner */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-10 flex items-center gap-2">
              <button
                onClick={() => onOpenCampusMap && onOpenCampusMap()}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 shadow-lg"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>캠퍼스 야경 맵 보기</span>
              </button>
              {onOpenLockScreen && (
                <button
                  onClick={onOpenLockScreen}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg"
                >
                  <Bell className="w-3.5 h-3.5 text-white" />
                  <span>알림 센터 열기</span>
                </button>
              )}
            </div>
          </div>

          {/* =========================================================================
              4. SEARCH BAR & QUICK TABS (Matching Image 1 below banner)
             ========================================================================= */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
            {/* Search Input Box */}
            <div className="flex items-center gap-1 flex-1">
              {/* Dropdown: [과제명 ▾] */}
              <div className="relative shrink-0">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value as any)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 pr-7 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="과제명">과제명</option>
                  <option value="과목명">과목명</option>
                  <option value="담당교사">담당교사</option>
                  <option value="준비물">준비물</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Text Input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="검색어를 입력하세요."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Blue Magnifying Glass Search Button */}
              <button
                type="button"
                className="w-9 h-9 rounded-xl bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs transition-colors"
                title="검색"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Right Action Tabs (Focused on Assessments & Full Menu) */}
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setDetailFilter('all')}
                className={`flex-1 sm:flex-none justify-center px-3 py-2 rounded-xl border font-bold text-xs transition-colors flex items-center gap-1.5 ${
                  detailFilter === 'all'
                    ? 'border-sky-500 bg-sky-50 text-sky-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>수행평가 ({totalCount})</span>
              </button>

              {onOpenFullMenu && (
                <button
                  onClick={onOpenFullMenu}
                  className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center gap-1.5"
                  title="전체 메뉴 열기 (2번째 사진 화면)"
                >
                  <Menu className="w-3.5 h-3.5 text-slate-700 stroke-[2.4]" />
                  <span>전체 메뉴</span>
                </button>
              )}
            </div>
          </div>

          {/* =========================================================================
              5. PROMINENT D-DAY COUNTDOWN SECTION WITH CIRCULAR PROGRESS RING
             ========================================================================= */}
          {closestAssessment && closestTimeInfo ? (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-xl p-4 sm:p-5">
              {/* Subtle ambient glow effect */}
              <div
                className={`absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
                  closestTimeInfo.isToday
                    ? 'bg-rose-500/15'
                    : closestAssessment.daysRemaining <= 2
                    ? 'bg-amber-500/15'
                    : 'bg-sky-500/10'
                }`}
              />

              <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-5">
                {/* Visual D-Day Circular Progress Gauge */}
                <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 bg-slate-900/60 p-3 sm:p-3.5 rounded-2xl border border-slate-800/80">
                  <CircularDDayProgress
                    daysRemaining={closestAssessment.daysRemaining}
                    hoursRemaining={closestTimeInfo.hours}
                    minutesRemaining={closestTimeInfo.minutes}
                    isToday={closestTimeInfo.isToday}
                    size={96}
                    strokeWidth={8}
                    showSubText={true}
                  />

                  {/* Quick percentage & time metrics summary */}
                  <div className="text-center sm:text-left space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400">
                      평가 기준 마감 진척도
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-200">
                      남은 여유: <span className={closestTimeInfo.isToday ? 'text-rose-400 font-extrabold' : 'text-amber-300'}>{closestTimeInfo.detailedText}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                      <Clock className="w-3 h-3 text-sky-400 shrink-0" />
                      <span>{closestAssessment.date} ({closestAssessment.calculatedPeriod}교시)</span>
                    </div>
                  </div>
                </div>

                {/* Middle Info: Subject, Title, Room, Supplies */}
                <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black text-[11px] tracking-tight uppercase shadow-xs">
                      <Flame className="w-3.5 h-3.5 fill-slate-950 stroke-amber-400" />
                      수행평가 마감 카운트다운
                    </span>

                    <span
                      className={`font-mono font-black px-2.5 py-0.5 rounded-md text-[11px] shadow-xs ${
                        closestTimeInfo.isToday
                          ? 'bg-rose-500 text-white animate-pulse'
                          : closestAssessment.daysRemaining <= 2
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                      }`}
                    >
                      {closestTimeInfo.humanBadge}
                    </span>

                    {urgentWithin48h.length > 1 && (
                      <span className="text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md">
                        + 그 외 임박 {urgentWithin48h.length - 1}건
                      </span>
                    )}
                  </div>

                  {/* Title and Subject */}
                  <div>
                    <h3
                      onClick={() => onOpenDetailModal(closestAssessment)}
                      className="text-base sm:text-lg font-black text-white hover:text-amber-300 cursor-pointer transition-colors inline-flex items-baseline gap-1.5 flex-wrap"
                      title={closestAssessment.title}
                    >
                      <span className="text-amber-300">[{closestAssessment.subject}]</span>
                      <span>{closestAssessment.title}</span>
                    </h3>
                  </div>

                  {/* Room, Bell Time & Supplies */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3.5 gap-y-1.5 text-xs text-slate-300">
                    <span className="flex items-center gap-1 font-semibold text-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{closestAssessment.calculatedPeriod}교시 ({closestTimeInfo.periodTime})</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => onOpenCampusMap(closestAssessment.studentRoom)}
                      className="flex items-center gap-1 text-slate-200 hover:text-amber-300 transition-colors font-medium cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>이동교실:</span>
                      <strong className="text-white underline decoration-dotted underline-offset-2">
                        {closestAssessment.studentRoom}
                      </strong>
                    </button>

                    {closestAssessment.supplies.length > 0 && (
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <span className="text-amber-300 font-bold">준비물:</span>
                        <span className="text-slate-200 truncate max-w-xs">
                          {closestAssessment.supplies.join(', ')}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex sm:flex-col lg:flex-row items-center gap-2 shrink-0 w-full sm:w-auto justify-center">
                  <button
                    onClick={() => onOpenDetailModal(closestAssessment)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>루브릭·상세</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={onOpenMorningRoutine}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/20 flex items-center justify-center gap-1.5"
                  >
                    <Backpack className="w-3.5 h-3.5 text-amber-300" />
                    <span>등교 점검</span>
                  </button>

                  <button
                    onClick={() => onToggleComplete(closestAssessment.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-400 transition-all border border-slate-700 shrink-0"
                    title="수행평가 완료 처리"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-4 border border-emerald-500/30 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                <div>
                  <div className="text-xs font-bold text-emerald-300">
                    모든 수행평가 완료됨 (100%)
                  </div>
                  <div className="text-[11px] text-slate-300">
                    현재 예정된 임박 수행평가가 없습니다. 편안한 학교생활을 응원합니다!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              6. PERFORMANCE ASSESSMENT CORE HUB (수행평가 전용 종합 포털)
             ========================================================================= */}
          <div className="space-y-6">
            {/* 4 KPI Summary Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Metric 1: 전체 예정 평가 */}
              <div
                onClick={() => setDetailFilter('all')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  detailFilter === 'all'
                    ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-400/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-sky-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">전체 등록 과제</span>
                  <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                    {totalCount}
                  </span>
                  <span className="text-xs font-bold text-slate-500">과목</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  선택과목 시간표 자동 연동
                </div>
              </div>

              {/* Metric 2: 마감 임박 */}
              <div
                onClick={() => setDetailFilter('urgent')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  detailFilter === 'urgent'
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700">48시간 내 임박</span>
                  <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Flame className="w-4 h-4 text-amber-600" />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-amber-600 font-mono tabular-nums">
                    {urgentWithin48h.length}
                  </span>
                  <span className="text-xs font-bold text-amber-700">건 긴급</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  {urgentWithin48h.length > 0 ? 'D-Day 및 D-1~2 일정' : '현재 임박 과제 없음'}
                </div>
              </div>

              {/* Metric 3: 필수 준비물 */}
              <div
                onClick={() => setDetailFilter('supplies')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  detailFilter === 'supplies'
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">챙길 준비물</span>
                  <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Backpack className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                    {allSuppliesCount}
                  </span>
                  <span className="text-xs font-bold text-slate-500">개 품목</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  {assessmentsWithSupplies.length}개 과제 지참물 필요
                </div>
              </div>

              {/* Metric 4: 평가 완료율 */}
              <div
                onClick={() => setDetailFilter('completed')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  detailFilter === 'completed'
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">나의 완료율</span>
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-emerald-600 font-mono tabular-nums">
                    {completionRate}%
                  </span>
                  <span className="text-xs font-bold text-slate-500">({completedCount}/{totalCount})</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  체크 시 실시간 반영
                </div>
              </div>
            </div>

            {/* Assessment Filter Tabs & View Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  보기 필터:
                </span>
                <button
                  onClick={() => setDetailFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    detailFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  전체 ({totalCount})
                </button>
                <button
                  onClick={() => setDetailFilter('urgent')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    detailFilter === 'urgent'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Flame className="w-3 h-3 text-amber-700" />
                  <span>마감 임박 ({urgentWithin48h.length})</span>
                </button>
                <button
                  onClick={() => setDetailFilter('supplies')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    detailFilter === 'supplies'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Backpack className="w-3 h-3 text-amber-700" />
                  <span>준비물 필요 ({assessmentsWithSupplies.length})</span>
                </button>
                <button
                  onClick={() => setDetailFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    detailFilter === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>완료됨 ({completedCount})</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap text-xs text-slate-500">
                <button
                  onClick={onOpenMorningRoutine}
                  className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold border border-amber-200 transition-colors flex items-center gap-1"
                >
                  <Backpack className="w-3.5 h-3.5 text-amber-600" />
                  <span>등교 가방 루틴 점검</span>
                </button>
                <button
                  onClick={() => onOpenCampusMap && onOpenCampusMap()}
                  className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-xl bg-sky-50 text-sky-900 hover:bg-sky-100 font-bold border border-sky-200 transition-colors flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>캠퍼스 이동 동선</span>
                </button>
              </div>
            </div>

            {/* Performance Assessment Cards List */}
            {filteredAssessments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-slate-400" />
                </div>
                <div className="text-base font-bold text-slate-800">
                  해당 조건에 일치하는 수행평가가 없습니다
                </div>
                <div className="text-xs text-slate-500 max-w-md mx-auto">
                  필터를 변경하거나 검색어를 지우면 등록된 모든 과목별 수행평가를 확인할 수 있습니다.
                </div>
                <button
                  onClick={() => {
                    setDetailFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  전체 목록 보기
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredAssessments.map((asmt) => {
                  const dDay = formatDDay(asmt.daysRemaining);
                  const timeInfo = getDetailedTimeRemaining(asmt.date, asmt.calculatedPeriod);

                  return (
                    <div
                      key={asmt.id}
                      onClick={() => onOpenDetailModal(asmt)}
                      className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-md hover:border-sky-300 group space-y-2.5 ${
                        asmt.isCompleted
                          ? 'bg-slate-50/90 border-slate-200 opacity-75'
                          : timeInfo.isToday
                          ? 'bg-white border-rose-200 ring-1 ring-rose-400/30'
                          : 'bg-white border-slate-200/90'
                      }`}
                      title="클릭하여 수행평가 상세 정보 및 지참 준비물 체크리스트 보기"
                    >
                      {/* Top Badges Row matching Screenshot_20261031-083444_Chrome */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Pink/Coral D-Day Badge */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold tracking-tight shadow-2xs ${
                              timeInfo.isToday
                                ? 'bg-[#ff5a79] text-white animate-pulse'
                                : asmt.daysRemaining <= 2
                                ? 'bg-[#ff6b8b] text-white'
                                : 'bg-slate-800 text-white'
                            }`}
                          >
                            {dDay.text} ({dDay.label})
                          </span>

                          {/* Block Badge */}
                          <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#eef2ff] text-[#4f46e5] border border-indigo-100/70">
                            {asmt.block === 'COMMON' ? '공통' : `${asmt.block}블록`}
                          </span>

                          {/* Type Badge */}
                          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                            {asmt.type}
                          </span>
                        </div>

                        {/* Teacher Info & Completed status */}
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 shrink-0">
                          <span>
                            담당: <strong className="text-slate-700 font-semibold">{asmt.teacherName} 선생님</strong>
                          </span>
                          {asmt.isCompleted && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              완료
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title and Subject Row */}
                      <div className="pt-0.5">
                        <h3 className="text-[15px] sm:text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                          <span className="text-[#0284c7] font-black mr-1.5">[{asmt.subject}]</span>
                          <span>{asmt.title}</span>
                        </h3>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Weekly Assessment Schedule Timetable Matrix (주간 요일별 수행평가 타임라인) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    {student.name} 학생의 이번 주 요일별 수행평가 배치 현황
                  </h3>
                </div>
                <button
                  onClick={onOpenScheduleEditor}
                  className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
                >
                  시간표 수정 <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="py-2 px-3">과목 / 블록</th>
                      <th className="py-2 px-3">수행평가 과제명</th>
                      <th className="py-2 px-3">일자 및 요일</th>
                      <th className="py-2 px-3">실시 교시</th>
                      <th className="py-2 px-3">내 이동교실</th>
                      <th className="py-2 px-3">지참물</th>
                      <th className="py-2 px-3 text-right">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {matchedAssessments.map((a) => (
                      <tr
                        key={a.id}
                        onClick={() => onOpenDetailModal(a)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          [{a.subject}] <span className="text-slate-400 text-[11px]">({a.block})</span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-sky-700 max-w-xs truncate">
                          {a.title}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {a.date} ({a.dayOfWeekStr})
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-900">
                          {a.calculatedPeriod}교시
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-rose-600 font-medium">
                          {a.studentRoom}
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-slate-500">
                          {a.supplies.length > 0 ? a.supplies.join(', ') : '없음'}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                              a.isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : a.daysRemaining <= 2
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {a.isCompleted ? '완료' : formatDDay(a.daysRemaining).text}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* =========================================================================
              8. BOTTOM FOOTER (Matching Jungsan High School Info)
             ========================================================================= */}
          <footer className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <JungsanLogo size={24} />
              <span className="font-extrabold text-slate-800">중산고등학교</span>
              <span className="text-slate-400">|</span>
              <span>(06343) 서울특별시 강남구 광평로34길 37</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <span>교무실: 02-3411-0021</span>
              <span>·</span>
              <span>2026 중산 솔버톤 맞춤 수행평가 알리미</span>
              <span>·</span>
              <span>ICT기획부</span>
            </div>
          </footer>
        </div>

      {/* =========================================================================
          9. FLOATING ACTION BUTTON: [ 📅 시간표 ] (Exact match to Image 1 bottom-right)
         ========================================================================= */}
      <button
        onClick={() => {
          if (onOpenComciganModal) {
            onOpenComciganModal();
          } else if (onOpenScheduleEditor) {
            onOpenScheduleEditor();
          }
        }}
        className="fixed bottom-20 right-4 sm:right-6 z-30 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 hover:scale-105 active:scale-95 group border-2 border-white/60 cursor-pointer"
        title="시간표 열기 (고교학점제 블록 시간표)"
      >
        <Calendar className="w-5 h-5 group-hover:rotate-6 transition-transform" />
        <span className="text-[10px] sm:text-[11px] font-black tracking-tight leading-none">시간표</span>
      </button>

      {/* =========================================================================
          10. INTERACTIVE MODALS (모바일 학생증)
         ========================================================================= */}
      {isStudentIdOpen && <StudentIdCardModal student={student} onClose={() => setIsStudentIdOpen(false)} />}
    </div>
  );
};
