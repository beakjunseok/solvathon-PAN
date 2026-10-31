import React, { useEffect, useMemo, useState } from 'react';
import { AssessmentSlot, BlockId, DayOfWeek } from '../types';
import { getBlockAt } from '../data/blockLayouts';
import { NoClassDayCell } from './NoClassDayCell';
import { formatSlot } from '../utils/scheduleMatcher';
import { applyTimetableOverrides } from '../utils/schoolSettings';
import { toCompactDate } from '../utils/textbookList';
import { getWeekDays, useNeisTimetable } from '../utils/useNeisTimetable';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface AssessmentSlotPickerProps {
  grade: number;
  subject: string;
  slots: AssessmentSlot[];
  focusDate: string;
  onChange: (slots: AssessmentSlot[]) => void;
}

const DAYS: Array<{ key: DayOfWeek; label: string }> = [
  { key: 'MON', label: '월' },
  { key: 'TUE', label: '화' },
  { key: 'WED', label: '수' },
  { key: 'THU', label: '목' },
  { key: 'FRI', label: '금' },
];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function normalize(text: string): string {
  return text.replace(/\s/g, '').toLowerCase();
}

function isSameSubject(a: string, b: string): boolean {
  const left = normalize(a);
  const right = normalize(b);
  return left.length > 0 && right.length > 0 && (left.includes(right) || right.includes(left));
}

function toSlotDate(date: Date): string {
  const compact = toCompactDate(date);
  return `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
}

function isSameSlot(a: AssessmentSlot, b: AssessmentSlot): boolean {
  return a.date === b.date && a.period === b.period && a.block === b.block && a.classNum === b.classNum;
}

export const AssessmentSlotPicker: React.FC<AssessmentSlotPickerProps> = ({
  grade,
  subject,
  slots,
  focusDate,
  onChange,
}) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const { rows, days, isLoading, error, isProjected, noClassDays } = useNeisTimetable(grade, null, weekOffset);

  // AI가 문서에서 찾은 날짜가 있는 주로 이동한다.
  useEffect(() => {
    if (!focusDate) return;
    const [year, month, day] = focusDate.split('-').map(Number);
    const firstMonday = getWeekDays(0)[0].getTime();
    const offset = Math.floor((new Date(year, month - 1, day).getTime() - firstMonday) / MS_PER_WEEK);
    setWeekOffset(Math.max(0, offset));
  }, [focusDate]);

  const finalRows = useMemo(() => {
    const classes = Array.from(new Set(rows.map((row) => row.classNum))).filter((value) => value > 0);
    return classes.flatMap((classNum) =>
      applyTimetableOverrides(rows.filter((row) => row.classNum === classNum), grade, classNum)
    );
  }, [rows, grade]);

  const hasMatch = finalRows.some((row) => isSameSubject(row.subject, subject));

  const toggleSlot = (slot: AssessmentSlot) => {
    const exists = slots.some((item) => isSameSlot(item, slot));
    onChange(exists ? slots.filter((item) => !isSameSlot(item, slot)) : [...slots, slot]);
  };

  const renderChoice = (slot: AssessmentSlot, label: string) => {
    const isSelected = slots.some((item) => isSameSlot(item, slot));
    return (
      <button
        key={label}
        type="button"
        aria-pressed={isSelected}
        onClick={() => toggleSlot(slot)}
        className={`min-h-9 min-w-9 px-2 py-1 rounded-lg border font-semibold transition-colors ${
          isSelected
            ? 'bg-indigo-600 border-indigo-600 text-white'
            : 'bg-white border-indigo-200 text-indigo-800 hover:bg-indigo-50'
        }`}
      >
        {label}
      </button>
    );
  };

  const renderCell = (day: DayOfWeek, dayIndex: number, period: number) => {
    const compactDate = toCompactDate(days[dayIndex]);
    const date = toSlotDate(days[dayIndex]);
    const cellRows = finalRows.filter((row) => {
      return row.date === compactDate && row.period === period && isSameSubject(row.subject, subject);
    });
    if (cellRows.length === 0) return <span className="text-slate-300">-</span>;

    const block: BlockId | null = getBlockAt(grade, day, period);
    if (block) return renderChoice({ date, period, block }, `${block}블록`);

    const classes = Array.from(new Set(cellRows.map((row) => row.classNum))).sort((a, b) => a - b);
    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {classes.map((classNum) => renderChoice({ date, period, classNum }, `${classNum}반`))}
      </div>
    );
  };

  return (
    <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="font-semibold text-slate-800">수행평가 볼 시간표 칸 선택</p>
          <p className="text-[11px] text-slate-600">
            선택과목은 블록 칸을, 일반 과목은 반 칸을 체크하세요. 체크한 칸의 학생에게만 보입니다.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="이전 주"
            disabled={weekOffset === 0}
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-1 font-semibold tabular-nums">
            {days[0].getMonth() + 1}/{days[0].getDate()} ~ {days[4].getMonth() + 1}/{days[4].getDate()}
          </span>
          <button
            type="button"
            title="다음 주"
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && <p className="font-semibold text-rose-700">{error}</p>}
      {isProjected && <p className="text-amber-800">이 주는 NEIS에 시간표가 없어 현재 시간표를 반복해 표시합니다.</p>}
      {!subject.trim() && <p className="text-slate-600">과목을 먼저 고르면 시간표가 나타납니다.</p>}
      {subject.trim() && !isLoading && !error && !hasMatch && (
        <p className="font-semibold text-amber-800">
          이 주 시간표에 “{subject}” 수업이 없습니다. 다른 주로 이동해 보세요.
        </p>
      )}

      {subject.trim() && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse bg-white text-center">
            <thead>
              <tr className="bg-slate-50">
                <th className="p-1.5 border border-slate-200 w-10">교시</th>
                {DAYS.map((day, index) => (
                  <th key={day.key} className="p-1.5 border border-slate-200">
                    {day.label} ({days[index].getMonth() + 1}/{days[index].getDate()})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period}>
                  <td className="p-1.5 border border-slate-200 font-bold tabular-nums">{period}</td>
                  {DAYS.map((day, index) => {
                    const noClassName = noClassDays[toCompactDate(days[index])];
                    if (noClassName) {
                      return period === PERIODS[0] ? (
                        <NoClassDayCell key={day.key} name={noClassName} rowSpan={PERIODS.length} />
                      ) : null;
                    }
                    return (
                      <td key={day.key} className="p-1 border border-slate-200 align-middle">
                        {renderCell(day.key, index, period)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {slots.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {[...slots]
            .sort((a, b) => a.date.localeCompare(b.date) || a.period - b.period)
            .map((slot) => (
              <span
                key={`${slot.date}-${slot.period}-${slot.block || slot.classNum}`}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-indigo-200 rounded-lg text-indigo-900"
              >
                {formatSlot(slot)}
                <button type="button" title="선택 취소" onClick={() => toggleSlot(slot)} className="text-slate-400 hover:text-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
};
