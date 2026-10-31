import { StudentProfile } from '../types';
import { getBlockAt, getDayFromCompactDate, isSpecialSchedule } from '../data/blockLayouts';

// 수업이 아닌 시간표 항목에는 교과서가 필요 없다.
const NON_TEXTBOOK_PATTERN = /자율|자치|동아리|진로활동|봉사|휴업|스포츠|체육|행사|고사|시험/;
const SCHOOL_END_HOUR = 16;

export function toCompactDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}${month}${day}`;
}

// 하교 시간이 지났거나 주말이면 다음 평일을 기준으로 준비한다.
export function getNextSchoolDay(now: Date): Date {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (now.getHours() >= SCHOOL_END_HOUR) date.setDate(date.getDate() + 1);
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
  return date;
}

export function getTextbookSubjects(rows: Array<{ period: number; subject: string }>): string[] {
  const sorted = [...rows].sort((a, b) => a.period - b.period);
  const subjects = sorted.map((row) => row.subject).filter((name) => !NON_TEXTBOOK_PATTERN.test(name));
  return Array.from(new Set(subjects));
}

// 블록 시간의 NEIS 과목은 학급 대표 과목이므로 학생이 고른 과목으로 바꾼다.
export function applyMyElectives<T extends { date: string; period: number; subject: string }>(
  rows: T[],
  student: StudentProfile
): T[] {
  return rows.flatMap((row) => {
    const day = getDayFromCompactDate(row.date);
    const block = day ? getBlockAt(student.grade, day, row.period) : null;
    if (!block || isSpecialSchedule(row.subject)) return [row];
    const subject = student.courses.find((course) => course.block === block)?.subject;
    return subject ? [{ ...row, subject }] : [];
  });
}

function getStorageKey(studentId: string, date: string): string {
  return `classfit_textbooks_${studentId}_${date}`;
}

export function readCheckedTextbooks(studentId: string, date: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(studentId, date)) || '[]');
  } catch {
    return [];
  }
}

export function saveCheckedTextbooks(studentId: string, date: string, subjects: string[]): void {
  try {
    localStorage.setItem(getStorageKey(studentId, date), JSON.stringify(subjects));
  } catch {
    // 체크 상태 저장 실패는 화면 사용을 막지 않는다.
  }
}
