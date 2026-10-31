import { useEffect, useState } from 'react';
import { applyTimetableOverrides } from './schoolSettings';
import { toCompactDate } from './textbookList';

export interface TimetableRow {
  date: string;
  period: number;
  subject: string;
  classNum: number;
}

// 주말에는 다음 주 시간표를 보여 준다.
function getStartMonday(): Date {
  const today = new Date();
  const day = today.getDay();
  const offset = day === 0 ? 1 : day === 6 ? 2 : 1 - day;
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
}

export function getWeekDays(weekOffset: number): Date[] {
  const monday = getStartMonday();
  return [0, 1, 2, 3, 4].map((index) => {
    return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + weekOffset * 7 + index);
  });
}

// classNum을 생략하면 학년 전체 시간표를 받는다.
export function useNeisTimetable(grade: number, classNum: number | null, weekOffset = 0) {
  const [rows, setRows] = useState<TimetableRow[]>([]);
  const [isLimited, setIsLimited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const days = getWeekDays(weekOffset);
  const from = toCompactDate(days[0]);
  const to = toCompactDate(days[4]);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError('');
    const classQuery = classNum ? `&classNum=${classNum}` : '';
    fetch(`/api/timetable?grade=${grade}${classQuery}&from=${from}&to=${to}`)
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

  const finalRows = classNum ? applyTimetableOverrides(rows, grade, classNum) : rows;
  return { rows: finalRows, days, isLimited, isLoading, error };
}
