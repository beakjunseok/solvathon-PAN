import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toCompactDate } from '../utils/textbookList';
import { useNeisTimetable } from '../utils/useNeisTimetable';

interface NeisTimetablePanelProps {
  grade: number;
  classNum: number;
}

const DAY_LABELS = ['월', '화', '수', '목', '금'];

export const NeisTimetablePanel: React.FC<NeisTimetablePanelProps> = ({ grade, classNum }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const { rows, days, isLimited, isLoading, error } = useNeisTimetable(grade, classNum, weekOffset);

  const maxPeriod = Math.max(0, ...rows.map((row) => row.period));
  const periods = Array.from({ length: maxPeriod }, (_, index) => index + 1);

  const getSubject = (day: Date, period: number) => {
    const date = toCompactDate(day);
    return rows
      .filter((row) => row.date === date && row.period === period)
      .map((row) => row.subject)
      .join(' / ');
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="font-bold text-slate-800">
            {grade}학년 {classNum}반 실제 시간표 (NEIS)
          </h3>
          <p className="text-[11px] text-slate-500">학급 기준 자료입니다. 선택과목은 학생마다 다를 수 있습니다.</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="이전 주"
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-semibold tabular-nums">
            {days[0].getMonth() + 1}/{days[0].getDate()} ~ {days[4].getMonth() + 1}/{days[4].getDate()}
          </span>
          <button
            type="button"
            title="다음 주"
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLimited && (
        <p className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
          NEIS 키가 설정되지 않아 일부 수업만 표시됩니다.
        </p>
      )}
      {error && <p className="font-semibold text-rose-700">{error}</p>}

      {isLoading ? (
        <p className="text-slate-500">시간표를 불러오는 중입니다.</p>
      ) : !error && rows.length === 0 ? (
        <p className="text-slate-500">이 주에 등록된 시간표가 없습니다.</p>
      ) : (
        !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-center">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-2 border border-slate-200">교시</th>
                  {DAY_LABELS.map((label, index) => (
                    <th key={label} className="p-2 border border-slate-200">
                      {label} ({days[index].getMonth() + 1}/{days[index].getDate()})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period}>
                    <td className="p-2 border border-slate-200 font-bold tabular-nums">{period}</td>
                    {days.map((day) => (
                      <td key={day.getTime()} className="p-2 border border-slate-200">
                        {getSubject(day, period) || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};
