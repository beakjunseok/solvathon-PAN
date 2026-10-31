import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NeisTimetablePanelProps {
  grade: number;
  classNum: number;
}

interface TimetableRow {
  date: string;
  period: number;
  subject: string;
}

const DAY_LABELS = ['월', '화', '수', '목', '금'];

function toCompactDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}${month}${day}`;
}

// 주말에는 다음 주 시간표를 보여 준다.
function getStartMonday(): Date {
  const today = new Date();
  const day = today.getDay();
  const offset = day === 0 ? 1 : day === 6 ? 2 : 1 - day;
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
}

export const NeisTimetablePanel: React.FC<NeisTimetablePanelProps> = ({ grade, classNum }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [rows, setRows] = useState<TimetableRow[]>([]);
  const [isLimited, setIsLimited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const monday = getStartMonday();
  monday.setDate(monday.getDate() + weekOffset * 7);
  const days = DAY_LABELS.map((_, index) => {
    return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
  });
  const from = toCompactDate(days[0]);
  const to = toCompactDate(days[4]);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError('');
    fetch(`/api/timetable?grade=${grade}&classNum=${classNum}&from=${from}&to=${to}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (!isActive) return;
        setRows(data.rows);
        setIsLimited(data.limited);
      })
      .catch(() => {
        if (!isActive) return;
        setRows([]);
        setError('시간표를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [grade, classNum, from, to]);

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
