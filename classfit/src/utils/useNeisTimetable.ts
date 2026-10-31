import { useEffect, useState } from 'react';
import { applyTimetableOverrides } from './schoolSettings';
import { toCompactDate } from './textbookList';

export interface TimetableRow {
  date: string;
  period: number;
  subject: string;
  classNum: number;
}

const NO_CLASS_PATTERN = /휴업|방학|재량|개교|고사|시험/;

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

async function fetchRows(grade: number, classNum: number | null, days: Date[]) {
  const classQuery = classNum ? `&classNum=${classNum}` : '';
  const from = toCompactDate(days[0]);
  const to = toCompactDate(days[4]);
  const response = await fetch(`/api/timetable?grade=${grade}${classQuery}&from=${from}&to=${to}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data as { rows: TimetableRow[]; limited: boolean };
}

// NEIS에 아직 없는 요일은 기준 주의 같은 요일 시간표를 반복한다.
function fillFromBaseWeek(rows: TimetableRow[], baseRows: TimetableRow[], days: Date[]) {
  const baseDays = getWeekDays(0);
  const filled = [...rows];
  let isProjected = false;

  days.forEach((day, index) => {
    const date = toCompactDate(day);
    if (rows.some((row) => row.date === date)) return;

    const baseDate = toCompactDate(baseDays[index]);
    const copied = baseRows
      .filter((row) => row.date === baseDate && !NO_CLASS_PATTERN.test(row.subject))
      .map((row) => ({ ...row, date }));
    if (copied.length > 0) isProjected = true;
    filled.push(...copied);
  });

  return { filled, isProjected };
}

// classNum을 생략하면 학년 전체 시간표를 받는다.
export function useNeisTimetable(grade: number, classNum: number | null, weekOffset = 0) {
  const [rows, setRows] = useState<TimetableRow[]>([]);
  const [baseRows, setBaseRows] = useState<TimetableRow[]>([]);
  const [isLimited, setIsLimited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const days = getWeekDays(weekOffset);
  const from = toCompactDate(days[0]);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError('');
    const baseRequest = weekOffset > 0 ? fetchRows(grade, classNum, getWeekDays(0)) : null;

    Promise.all([fetchRows(grade, classNum, days), baseRequest])
      .then(([week, base]) => {
        if (!isActive) return;
        setRows(week.rows);
        setBaseRows(base ? base.rows : []);
        setIsLimited(week.limited);
      })
      .catch(() => {
        if (!isActive) return;
        setRows([]);
        setBaseRows([]);
        setError('시간표를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [grade, classNum, from, weekOffset]);

  const { filled, isProjected } = fillFromBaseWeek(rows, baseRows, days);
  const finalRows = classNum ? applyTimetableOverrides(filled, grade, classNum) : filled;
  return { rows: finalRows, days, isLimited, isLoading, error, isProjected };
}
