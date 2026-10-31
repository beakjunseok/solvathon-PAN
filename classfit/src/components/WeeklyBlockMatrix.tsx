import React, { useState } from 'react';
import { Assessment, DayOfWeek, StudentProfile, WeeklyBlockSlot } from '../types';
import { DAY_KOREAN } from '../utils/scheduleMatcher';
import { getBlockAt } from '../data/blockLayouts';
import { toCompactDate } from '../utils/textbookList';
import { useNeisTimetable } from '../utils/useNeisTimetable';
import { ChevronLeft, ChevronRight, Clock, MapPin, SlidersHorizontal, Sparkles } from 'lucide-react';

interface WeeklyBlockMatrixProps {
  schedule: WeeklyBlockSlot[];
  activeStudent: StudentProfile;
  students: StudentProfile[];
  assessments: Assessment[];
  onSelectStudent: (studentId: string) => void;
  onOpenDetailModal: (asmt: any) => void;
  onOpenScheduleEditor?: () => void;
}

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const NO_CLASS_PATTERN = /휴업|방학|재량|개교|고사|시험/;

const BLOCK_STYLES: Record<string, string> = {
  A: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  B: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  C: 'bg-amber-50 border-amber-200 text-amber-900',
  D: 'bg-purple-50 border-purple-200 text-purple-900',
  E: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  F: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  G: 'bg-amber-50 border-amber-200 text-amber-900',
  H: 'bg-purple-50 border-purple-200 text-purple-900',
};

export const WeeklyBlockMatrix: React.FC<WeeklyBlockMatrixProps> = ({
  activeStudent,
  students,
  onSelectStudent,
  onOpenScheduleEditor,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const { grade, classNum } = activeStudent;
  const { rows, days, isLimited, isLoading, error, isProjected } = useNeisTimetable(grade, classNum, weekOffset);
  const blockLabel = grade === 3 ? 'E, F, G, H' : 'A, B, C, D';

  const getSubject = (dayIndex: number, period: number) => {
    const date = toCompactDate(days[dayIndex]);
    return rows.find((row) => row.date === date && row.period === period)?.subject || '';
  };

  const renderCell = (day: DayOfWeek, dayIndex: number, period: number) => {
    const subject = getSubject(dayIndex, period);
    const block = getBlockAt(grade, day, period);

    if (block && subject && !NO_CLASS_PATTERN.test(subject)) {
      const course = activeStudent.courses.find((c) => c.block === block);
      return (
        <div className={`p-2 rounded-xl border text-left min-h-[64px] ${BLOCK_STYLES[block] || ''}`}>
          <div className="text-[10px] font-bold">{block}블록</div>
          {course?.subject ? (
            <div className="mt-1">
              <div className="font-bold text-xs text-slate-900 truncate">{course.subject}</div>
              {course.room && (
                <div className="text-[10px] text-slate-600 truncate mt-0.5 flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  {course.room}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenScheduleEditor}
              className="mt-1 text-xs font-semibold text-indigo-700 underline"
            >
              과목 고르기
            </button>
          )}
        </div>
      );
    }

    if (subject) {
      return (
        <div className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-left min-h-[64px] flex items-center">
          <span className="text-xs font-medium text-slate-700 break-keep">{subject}</span>
        </div>
      );
    }

    return <span className="text-slate-300">-</span>;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Clock className="w-4 h-4" />
            <span>NEIS 시간표 + 내 선택과목</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {grade}학년 {classNum}반 주간 시간표
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {grade === 1
              ? 'NEIS 학급 시간표를 표시합니다.'
              : `공통 과목은 NEIS 시간표로 표시하고, ${blockLabel} 블록에는 내가 고른 과목을 표시합니다.`}
          </p>
        </div>

        {onOpenScheduleEditor && grade !== 1 && (
          <button
            onClick={onOpenScheduleEditor}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <SlidersHorizontal className="w-4 h-4" />
            내 선택과목 고르기
          </button>
        )}
      </div>

      <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="text-indigo-900 font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          {activeStudent.name} ({grade}-{classNum})
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {students.map((st) => (
            <button
              key={st.id}
              onClick={() => onSelectStudent(st.id)}
              className={`px-2 py-0.5 rounded transition-all ${
                activeStudent.id === st.id
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st.name}
            </button>
          ))}
        </div>
      </div>

      {isLimited && (
        <p className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
          NEIS 키가 설정되지 않아 일부 수업만 표시됩니다.
        </p>
      )}
      {error && <p className="text-xs font-semibold text-rose-700">{error}</p>}
      {isProjected && (
        <p className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">이 주는 NEIS에 없어 현재 시간표를 반복해 표시합니다. 방학과 공휴일은 반영되지 않습니다.</p>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-200 text-xs">
          <button
            title="이전 주"
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold tabular-nums">
            {days[0].getMonth() + 1}/{days[0].getDate()} ~ {days[4].getMonth() + 1}/{days[4].getDate()}
            {isLoading && ' 불러오는 중'}
          </span>
          <button
            title="다음 주"
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                <th className="py-3 px-3 w-16 border-r border-slate-200">교시</th>
                {DAYS.map((day, index) => (
                  <th key={day} className="py-3 px-3 border-r last:border-r-0 border-slate-200">
                    {DAY_KOREAN[day]} ({days[index].getMonth() + 1}/{days[index].getDate()})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {PERIODS.map((period) => (
                <tr key={period}>
                  <td className="py-3 px-2 font-bold text-slate-600 bg-slate-50/60 border-r border-slate-200 tabular-nums">
                    {period}교시
                  </td>
                  {DAYS.map((day, index) => (
                    <td key={day} className="py-2.5 px-2 border-r last:border-r-0 border-slate-100 align-top">
                      {renderCell(day, index, period)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
