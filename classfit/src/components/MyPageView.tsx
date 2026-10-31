import React, { useState } from 'react';
import { MatchedAssessment, StudentProfile, WeeklyBlockSlot, Assessment } from '../types';
import { formatDDay, getDetailedTimeRemaining } from '../utils/scheduleMatcher';
import { JungsanLogo } from './JungsanLogo';
import { StudentIdCardModal } from './RiroschoolModals';
import { CircularDDayProgress } from './CircularDDayProgress';
import {
  ArrowLeft,
  User,
  CreditCard,
  Calendar,
  BookOpen,
  MapPin,
  CheckCircle2,
  Clock,
  Backpack,
  Flame,
  Award,
  SlidersHorizontal,
  ChevronRight,
  Shield,
  RefreshCw,
  LogOut,
  Bell,
  Smartphone,
  ExternalLink,
  Sparkles,
  Layers,
  FileText,
} from 'lucide-react';

interface MyPageViewProps {
  student: StudentProfile;
  allStudents: StudentProfile[];
  onSelectStudent: (studentId: string) => void;
  matchedAssessments: MatchedAssessment[];
  allAssessments: Assessment[];
  weeklySchedule: WeeklyBlockSlot[];
  onOpenScheduleEditor: () => void;
  onOpenComciganModal?: () => void;
  onOpenCampusMap: (room?: string) => void;
  onOpenMorningRoutine: () => void;
  onOpenLockScreen?: () => void;
  onOpenDetailModal: (asmt: MatchedAssessment) => void;
  onToggleComplete: (id: string) => void;
  onToggleSupply: (id: string, item: string) => void;
  onBackToHome: () => void;
  onOpenLoginPortal: () => void;
}

export const MyPageView: React.FC<MyPageViewProps> = ({
  student,
  allStudents,
  onSelectStudent,
  matchedAssessments,
  allAssessments,
  weeklySchedule,
  onOpenScheduleEditor,
  onOpenComciganModal,
  onOpenCampusMap,
  onOpenMorningRoutine,
  onOpenLockScreen,
  onOpenDetailModal,
  onToggleComplete,
  onToggleSupply,
  onBackToHome,
  onOpenLoginPortal,
}) => {
  const [isStudentIdOpen, setIsStudentIdOpen] = useState(false);
  const [assessmentFilter, setAssessmentFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Metrics
  const totalCount = matchedAssessments.length;
  const completedCount = matchedAssessments.filter((a) => a.isCompleted).length;
  const pendingCount = totalCount - completedCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const urgentCount = matchedAssessments.filter(
    (a) => !a.isCompleted && a.daysRemaining >= 0 && a.daysRemaining <= 2
  ).length;

  // Total supplies count
  const allSupplies = matchedAssessments.flatMap((a) => a.supplies);
  const checkedSuppliesCount = matchedAssessments.reduce((acc, a) => {
    const checked = student.checkedSupplies[a.id] || [];
    return acc + checked.length;
  }, 0);
  const suppliesRate =
    allSupplies.length > 0 ? Math.round((checkedSuppliesCount / allSupplies.length) * 100) : 100;

  // Filtered assessments list
  const displayAssessments = matchedAssessments.filter((a) => {
    if (assessmentFilter === 'completed') return a.isCompleted;
    if (assessmentFilter === 'pending') return !a.isCompleted;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 space-y-6 animate-fade-in select-none">
      {/* 1. TOP BREADCRUMB & BACK ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs text-xs font-bold"
            title="스쿨 홈으로 돌아가기"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            <span>스쿨 홈</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                중산고 리로서쿨
              </span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-bold text-slate-700">마이페이지</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              내 정보 & 수행평가 대시보드
            </h1>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStudentIdOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>모바일 학생증 (QR)</span>
          </button>

          <button
            onClick={onOpenScheduleEditor}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>시간표·블록 수정</span>
          </button>
        </div>
      </div>

      {/* 2. STUDENT MAIN PROFILE CARD */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-7 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Avatar & Bio */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-lg ring-4 ring-white/10"
                style={{ backgroundColor: student.avatarColor || '#3b82f6' }}
              >
                {student.name.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full ring-2 ring-slate-900 text-[10px] text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {student.name}
                </h2>
                <span className="text-xs font-bold text-sky-300 bg-sky-950/70 border border-sky-500/40 px-2.5 py-0.5 rounded-full">
                  재학생
                </span>
                <span className="text-xs font-semibold text-slate-300 bg-white/10 px-2 py-0.5 rounded-md">
                  학번: 2026{student.grade}{String(student.classNum).padStart(2, '0')}{String(student.studentNum).padStart(2, '0')}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
                <span className="font-bold text-amber-300">중산고등학교</span>
                <span className="text-slate-500">·</span>
                <span>{student.grade}학년 {student.classNum}반 {student.studentNum}번</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">
                  {student.grade === 3 ? '고3 E~H블록 선택과정' : '고1·2 A~D블록 선택과정'}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>학생 안전 계정 인증 완료 (선생님 모드 전환 제한 적용)</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <button
              onClick={() => setIsStudentIdOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-sky-300" />
              <span>모바일 학생증</span>
            </button>

            <button
              onClick={onOpenMorningRoutine}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Backpack className="w-4 h-4" />
              <span>등교 전 30초 점검</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. 4 KEY STATS METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Overall Progress Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">수행평가 달성률</span>
            <span className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
              {completionRate}%
            </span>
            <span className="text-xs font-bold text-slate-400">
              ({completedCount} / {totalCount} 완료)
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Urgent Deadlines */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">48시간 내 마감 임박</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4 text-amber-600" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono tabular-nums">
              {urgentCount}
            </span>
            <span className="text-xs font-bold text-amber-700">건 긴급</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {urgentCount > 0 ? 'D-Day 및 D-1~2 일정 확인 필요' : '현재 임박한 과제가 없습니다'}
          </p>
        </div>

        {/* Metric 3: Supplies Packing Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">준비물 챙김 달성률</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Backpack className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
              {suppliesRate}%
            </span>
            <span className="text-xs font-bold text-slate-400">
              ({checkedSuppliesCount} / {allSupplies.length}개)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${suppliesRate}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Enrolled Courses */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">수강 블록 과목</span>
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
              {student.courses.length}
            </span>
            <span className="text-xs font-bold text-slate-400">개 블록</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {student.courses.map((c) => c.subject).join(', ')}
          </p>
        </div>
      </div>

      {/* 4. MY ENROLLED BLOCK COURSES & CLASSROOMS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-600" />
              <span>{student.name} 학생의 수강 블록 과목 및 이동교실</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              고교학점제 선택과목 블록에 맞춰 선생님이 공지한 수행평가와 이동교실이 자동 매칭됩니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenComciganModal && (
              <button
                onClick={onOpenComciganModal}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                title="실제 시간표 보기"
              >
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>시간표 보기</span>
              </button>
            )}

            <button
              onClick={onOpenScheduleEditor}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>과목·교실 변경</span>
            </button>
          </div>
        </div>

        {/* Grid of Courses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {student.courses.map((course) => {
            // Count assessments for this course
            const courseAssessments = matchedAssessments.filter(
              (a) => a.subject === course.subject || a.block === course.block
            );
            const courseUrgent = courseAssessments.filter(
              (a) => !a.isCompleted && a.daysRemaining >= 0 && a.daysRemaining <= 2
            );

            return (
              <div
                key={course.block}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-sky-300 hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 font-mono font-black text-sm flex items-center justify-center">
                    {course.block}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {course.block}블록 선택
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    {course.subject}
                  </h4>
                  {course.teacherName && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      담당: {course.teacherName} 선생님
                    </p>
                  )}
                </div>

                {/* Classroom location */}
                <button
                  type="button"
                  onClick={() => onOpenCampusMap(course.room)}
                  className="w-full py-2 px-2.5 rounded-xl bg-white border border-slate-200 hover:border-rose-300 text-left transition-colors flex items-center justify-between text-xs group"
                  title="캠퍼스 맵에서 위치 확인"
                >
                  <span className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
                    <span>이동교실:</span>
                  </span>
                  <strong className="text-slate-900 font-bold group-hover:text-rose-600 transition-colors">
                    {course.room}
                  </strong>
                </button>

                {/* Assessment count for this block */}
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/70">
                  <span>등록된 수행평가</span>
                  <span className="font-bold text-slate-800">
                    {courseAssessments.length}건
                    {courseUrgent.length > 0 && (
                      <span className="text-rose-600 ml-1 font-extrabold">
                        ({courseUrgent.length}건 임박)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. MY ASSESSMENTS LIST & PROGRESS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-600" />
              <span>나의 수행평가 참여 내역 및 완료 체크</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              완료한 과제를 체크하면 실시간으로 진행률이 업데이트됩니다.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setAssessmentFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                assessmentFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 ({totalCount})
            </button>
            <button
              onClick={() => setAssessmentFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                assessmentFilter === 'pending'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              진행 중 ({pendingCount})
            </button>
            <button
              onClick={() => setAssessmentFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                assessmentFilter === 'completed'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              완료됨 ({completedCount})
            </button>
          </div>
        </div>

        {/* Assessment rows */}
        {displayAssessments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">해당 상태의 수행평가가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayAssessments.map((asmt) => {
              const dDay = formatDDay(asmt.daysRemaining);
              const timeInfo = getDetailedTimeRemaining(asmt.date, asmt.calculatedPeriod);
              const checkedList = student.checkedSupplies[asmt.id] || [];

              return (
                <div
                  key={asmt.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    asmt.isCompleted
                      ? 'bg-slate-50/70 border-slate-200 opacity-80'
                      : timeInfo.isToday
                      ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/20'
                      : asmt.daysRemaining <= 2
                      ? 'bg-rose-50/30 border-rose-200'
                      : 'bg-white border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                        [{asmt.subject}] {asmt.block}블록
                      </span>

                      <span
                        className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-md ${
                          asmt.isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : timeInfo.isToday
                            ? 'bg-rose-600 text-white animate-pulse'
                            : asmt.daysRemaining <= 2
                            ? 'bg-rose-100 text-rose-800 font-bold'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {asmt.isCompleted ? '평가 완료' : dDay.text}
                      </span>

                      <span className="text-xs font-medium text-slate-500">
                        {asmt.date} ({asmt.dayOfWeekStr}) {asmt.calculatedPeriod}교시
                      </span>
                    </div>

                    <h4
                      onClick={() => onOpenDetailModal(asmt)}
                      className="text-base font-extrabold text-slate-900 hover:text-sky-600 cursor-pointer transition-colors"
                    >
                      {asmt.title}
                    </h4>

                    {/* Room & Supplies summary */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onOpenCampusMap(asmt.studentRoom)}
                        className="flex items-center gap-1 text-slate-600 hover:text-rose-600 font-medium cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>{asmt.studentRoom}</span>
                      </button>

                      {asmt.supplies.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Backpack className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            준비물: {asmt.supplies.length}개 ({checkedList.length}개 완료)
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenDetailModal(asmt)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <span>루브릭</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => onToggleComplete(asmt.id)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                        asmt.isCompleted
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{asmt.isCompleted ? '완료 취소' : '평가 완료'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. SWITCH STUDENT PROFILE (TEST ACCOUNTS) & SYSTEM TOOLS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              학생 프로필 전환 (고교학점제 블록별 시뮬레이션)
            </h3>
          </div>
          <span className="text-xs text-slate-400">현재 로그인: {student.name}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {allStudents.map((st) => (
            <button
              key={st.id}
              onClick={() => onSelectStudent(st.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                student.id === st.id
                  ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-300/40 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl text-white font-extrabold text-sm flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: st.avatarColor }}
                >
                  {st.name.charAt(0)}
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{st.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {st.grade}학년 {st.classNum}반 · {st.courses.length}개 과목
                  </div>
                </div>
              </div>

              {student.id === st.id && (
                <span className="text-[10px] font-black bg-sky-600 text-white px-2 py-0.5 rounded-full">
                  현재
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 text-xs text-slate-500">
          <span>다른 학년/교원 계정으로 전환하거나 새 학생을 등록할 수 있습니다.</span>
          <button
            onClick={onOpenLoginPortal}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>계정 전환 / 로그인 포털</span>
          </button>
        </div>
      </div>

      {/* 7. STUDENT ID CARD MODAL */}
      {isStudentIdOpen && (
        <StudentIdCardModal
          student={student}
          onClose={() => setIsStudentIdOpen(false)}
        />
      )}
    </div>
  );
};
