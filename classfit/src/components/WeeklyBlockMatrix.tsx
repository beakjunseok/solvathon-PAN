import React, { useState } from 'react';
import { Assessment, DayOfWeek, StudentProfile, WeeklyBlockSlot } from '../types';
import { DAY_KOREAN } from '../utils/scheduleMatcher';
import { Calendar, Clock, MapPin, Sparkles, AlertCircle } from 'lucide-react';

interface WeeklyBlockMatrixProps {
  schedule: WeeklyBlockSlot[];
  activeStudent: StudentProfile;
  students: StudentProfile[];
  assessments: Assessment[];
  onSelectStudent: (studentId: string) => void;
  onOpenDetailModal: (asmt: any) => void;
  onOpenComciganModal?: () => void;
}

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];

export const WeeklyBlockMatrix: React.FC<WeeklyBlockMatrixProps> = ({
  schedule,
  activeStudent,
  students,
  assessments,
  onSelectStudent,
  onOpenDetailModal,
  onOpenComciganModal,
}) => {
  const [viewMode, setViewMode] = useState<'student' | 'raw'>('student');

  // Helper to find slot
  const getSlot = (day: DayOfWeek, period: number) => {
    return schedule.find((s) => s.day === day && s.period === period);
  };

  // Find course for a block in active student
  const getStudentCourseForBlock = (block: string) => {
    return activeStudent.courses.find((c) => c.block === block);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <Clock className="w-4 h-4" />
            <span>고교학점제 주간 블록({activeStudent.grade === 3 ? 'E~H' : 'A~D'}) 교시 배치표</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {activeStudent.grade}학년 주간 시간표 & 선택과목 매핑
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            선택과목제에서는 요일·교시별로 지정된 블록({activeStudent.grade === 3 ? 'E, F, G, H' : 'A, B, C, D'}) 시간에 따라 학생마다 이동하는 교실과 수업이 달라집니다.
          </p>
        </div>

        {/* View mode toggle & Comcigan sync */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenComciganModal && (
            <button
              onClick={onOpenComciganModal}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span>⚡</span>
              컴시간알리미에서 시간표 가져오기
            </button>
          )}

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium">
            <button
              onClick={() => setViewMode('student')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'student'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              내 맞춤 과목 반영
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'raw'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              기본 블록표({activeStudent.grade === 3 ? 'E~H' : 'A~D'})
            </button>
          </div>
        </div>
      </div>

      {/* Student Switcher Bar if in student view */}
      {viewMode === 'student' && (
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-indigo-900 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            현재 시간표 표시 학생:{' '}
            <strong className="text-indigo-950 font-bold">
              {activeStudent.name} ({activeStudent.grade}-{activeStudent.classNum})
            </strong>
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">학생 전환:</span>
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
      )}

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                <th className="py-3 px-3 w-16 border-r border-slate-200">교시</th>
                {DAYS.map((d) => (
                  <th key={d} className="py-3 px-3 border-r last:border-r-0 border-slate-200">
                    {DAY_KOREAN[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {PERIODS.map((period) => (
                <tr key={period} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-2 font-bold text-slate-600 bg-slate-50/60 border-r border-slate-200 tabular-nums">
                    {period}교시
                  </td>
                  {DAYS.map((day) => {
                    const slot = getSlot(day, period);
                    if (!slot) {
                      return (
                        <td
                          key={day}
                          className="py-2.5 px-2 border-r last:border-r-0 border-slate-100 text-slate-300"
                        >
                          -
                        </td>
                      );
                    }

                    const isElective = slot.block !== 'COMMON';
                    const course = isElective ? getStudentCourseForBlock(slot.block) : null;

                    // Block colors (1·2학년 A~D, 3학년 E~H)
                    const blockColorStyles: Record<string, string> = {
                      A: 'bg-indigo-50 border-indigo-200 text-indigo-900',
                      B: 'bg-emerald-50 border-emerald-200 text-emerald-900',
                      C: 'bg-amber-50 border-amber-200 text-amber-900',
                      D: 'bg-purple-50 border-purple-200 text-purple-900',
                      E: 'bg-indigo-50 border-indigo-200 text-indigo-900',
                      F: 'bg-emerald-50 border-emerald-200 text-emerald-900',
                      G: 'bg-amber-50 border-amber-200 text-amber-900',
                      H: 'bg-purple-50 border-purple-200 text-purple-900',
                      COMMON: 'bg-slate-50 border-slate-200 text-slate-600',
                    };

                    return (
                      <td
                        key={day}
                        className="py-2.5 px-2 border-r last:border-r-0 border-slate-100 align-top"
                      >
                        <div
                          className={`p-2 rounded-xl border text-left flex flex-col justify-between min-h-[64px] transition-all ${
                            blockColorStyles[slot.block] || 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                            <span className="font-mono">
                              {slot.block === 'COMMON' ? '공통' : `${slot.block}블록`}
                            </span>
                            {isElective && (
                              <span className="text-[9px] px-1 rounded bg-black/5">선택</span>
                            )}
                          </div>

                          {viewMode === 'student' && isElective && course ? (
                            <div className="mt-1">
                              <div className="font-bold text-xs text-slate-900 truncate">
                                {course.subject}
                              </div>
                              <div className="text-[10px] text-slate-600 truncate mt-0.5 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                {course.room || '교실 미지정'}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-1 font-medium text-[11px] truncate">
                              {slot.label || `${slot.block}블록`}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
