import React from 'react';
import { MatchedAssessment, Assessment, WeeklyBlockSlot } from '../types';
import { getDetailedTimeRemaining, getClosestStudentAssessment, getClosestTeacherAssessment } from '../utils/scheduleMatcher';
import { Clock, MapPin, AlertTriangle, Sparkles, CheckCircle2, ChevronRight, Backpack } from 'lucide-react';
import { CircularDDayProgress } from './CircularDDayProgress';

interface ClosestAssessmentBannerProps {
  role: 'student' | 'teacher';
  matchedAssessments?: MatchedAssessment[];
  allAssessments?: Assessment[];
  weeklySchedule?: WeeklyBlockSlot[];
  onOpenDetailModal?: (asmt: any) => void;
  onOpenMorningRoutine?: () => void;
  onOpenCampusMap?: (room?: string) => void;
}

export const ClosestAssessmentBanner: React.FC<ClosestAssessmentBannerProps> = ({
  role,
  matchedAssessments = [],
  allAssessments = [],
  weeklySchedule = [],
  onOpenDetailModal,
  onOpenMorningRoutine,
  onOpenCampusMap,
}) => {
  if (role === 'student') {
    const closest = getClosestStudentAssessment(matchedAssessments);
    if (!closest) {
      return (
        <div className="bg-emerald-950/90 text-white rounded-2xl border border-emerald-500/30 p-3.5 px-4 shadow-md flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-emerald-200">
              현재 예정된 임박 수행평가가 모두 완료되었습니다! 여유로운 하루 보내세요.
            </span>
          </div>
        </div>
      );
    }

    const timeInfo = getDetailedTimeRemaining(closest.date, closest.calculatedPeriod);

    return (
      <aside
        aria-label="가장 가까운 수행평가 알림"
        className={`rounded-2xl border p-4 shadow-lg transition-all relative overflow-hidden ${
          timeInfo.isToday
            ? 'bg-linear-to-r from-amber-950 via-slate-950 to-indigo-950 text-white border-amber-400/80 ring-2 ring-amber-400/20'
            : timeInfo.isUrgent
            ? 'bg-linear-to-r from-indigo-950 via-slate-950 to-slate-900 text-white border-indigo-400/70'
            : 'bg-slate-900 text-white border-slate-700'
        }`}
      >
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <CircularDDayProgress
              daysRemaining={closest.daysRemaining}
              hoursRemaining={timeInfo.hours}
              minutesRemaining={timeInfo.minutes}
              isToday={timeInfo.isToday}
              size={82}
              strokeWidth={7}
            />

            {/* Left info */}
            <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase shadow-xs animate-pulse">
                <Clock className="w-3.5 h-3.5 fill-slate-950 stroke-amber-400" />
                가장 가까운 수행평가
              </span>

              <span
                className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                  timeInfo.isToday
                    ? 'bg-rose-500 text-white font-extrabold'
                    : 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/30'
                }`}
              >
                {timeInfo.humanBadge}
              </span>

              <span className="text-amber-300 font-bold text-xs">
                {timeInfo.detailedText}
              </span>

              <span className="text-slate-400 text-[11px]">· {closest.date}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2.5">
              <span className="text-amber-300 font-black text-sm sm:text-base">
                [{closest.subject}]
              </span>
              <h2
                onClick={() => onOpenDetailModal && onOpenDetailModal(closest)}
                className="text-sm sm:text-base font-bold text-white hover:text-amber-300 cursor-pointer transition-colors line-clamp-1"
                title={closest.title}
              >
                {closest.title}
              </h2>
            </div>

            {/* Room, period and bell time */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-0.5">
              <span className="flex items-center gap-1 font-semibold text-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{closest.calculatedPeriod}교시 ({timeInfo.periodTime})</span>
              </span>

              <button
                type="button"
                onClick={() => onOpenCampusMap && onOpenCampusMap(closest.studentRoom)}
                className="flex items-center gap-1 text-slate-200 hover:text-amber-300 transition-colors text-left font-medium"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>내 이동교실:</span>
                <strong className="text-white underline decoration-dotted underline-offset-2">
                  {closest.studentRoom}
                </strong>
              </button>

              {closest.supplies.length > 0 && (
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <span className="text-amber-300 font-bold">준비물:</span>
                  <span className="text-slate-200 truncate max-w-xs">{closest.supplies.join(', ')}</span>
                </span>
              )}
            </div>
          </div>
          </div>

          {/* Right action button */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            {onOpenMorningRoutine && closest.supplies.length > 0 && (
              <button
                type="button"
                onClick={onOpenMorningRoutine}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Backpack className="w-3.5 h-3.5" />
                준비물 챙기기
              </button>
            )}

            {onOpenDetailModal && (
              <button
                type="button"
                onClick={() => onOpenDetailModal(closest)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1"
              >
                <span>루브릭·상세</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // Teacher role
  const closestTeacher = getClosestTeacherAssessment(allAssessments, weeklySchedule);
  if (!closestTeacher) {
    return null;
  }

  const timeInfoTeacher = getDetailedTimeRemaining(closestTeacher.date, closestTeacher.period);

  return (
    <aside
      aria-label="선생님용 다음 임박 평가 안내"
      className="rounded-2xl bg-slate-900 border border-amber-400/60 p-4 text-white shadow-md space-y-2 relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              학교 다음 수행평가 일정
            </span>
            <span className="font-mono font-bold text-amber-300 text-xs">
              {timeInfoTeacher.humanBadge} · {timeInfoTeacher.detailedText}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-amber-400 font-bold text-sm">
              [{closestTeacher.subject}]
            </span>
            <h2 className="text-sm font-bold text-white line-clamp-1">
              {closestTeacher.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span>
              대상: <strong>{closestTeacher.targetGrade}학년</strong> ({closestTeacher.block === 'COMMON' ? '공통' : `${closestTeacher.block}블록`})
            </span>
            <span>·</span>
            <span>
              일자: <strong>{closestTeacher.date} ({closestTeacher.dayStr}) {closestTeacher.period}교시</strong>
            </span>
            <span>·</span>
            <span>담당: {closestTeacher.teacherName}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
