import { BlockId, DayOfWeek } from '../types';

type BlockSlots = Partial<Record<BlockId, string[]>>;
export type BlockLayouts = Record<number, BlockSlots>;

const DAY_ORDER: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

// 학년별 선택과목 블록 위치. 같은 학년은 모든 반이 같다. 형식: 'MON-2'는 월요일 2교시
// 2·3학년은 컴시간 화면과 NEIS 학년 전체 시간표로 교차 확인했다.
export const DEFAULT_BLOCK_LAYOUTS: BlockLayouts = {
  1: {},
  2: {
    A: ['MON-5', 'WED-1', 'THU-6'],
    B: ['MON-3', 'WED-6', 'THU-2'],
    C: ['MON-2', 'TUE-6', 'FRI-2'],
    D: ['TUE-4', 'WED-3', 'THU-7'],
  },
  3: {
    E: ['MON-1', 'THU-3', 'FRI-3'],
    F: ['MON-4', 'TUE-4', 'FRI-2'],
    G: ['TUE-1', 'WED-2', 'THU-5'],
    H: ['MON-6', 'WED-5', 'THU-4'],
  },
};

// 교사가 저장한 위치가 있으면 그 값을 쓴다.
let activeLayouts: BlockLayouts = DEFAULT_BLOCK_LAYOUTS;

export function setBlockLayouts(layouts: BlockLayouts): void {
  activeLayouts = layouts;
}

export function hasBlockLayout(grade: number): boolean {
  return Object.keys(activeLayouts[grade] || {}).length > 0;
}

export function getBlockAt(grade: number, day: DayOfWeek, period: number): BlockId | null {
  const slot = `${day}-${period}`;
  const entry = Object.entries(activeLayouts[grade] || {}).find(([, slots]) => slots?.includes(slot));
  return entry ? (entry[0] as BlockId) : null;
}

export function getBlockPeriodOnDay(grade: number, block: string, day: DayOfWeek): number | null {
  const slots = activeLayouts[grade]?.[block as BlockId] || [];
  const periods = slots.filter((item) => item.startsWith(`${day}-`)).map((item) => Number(item.split('-')[1]));
  return periods.length > 0 ? Math.min(...periods) : null;
}

// NEIS 날짜(YYYYMMDD)를 요일로 바꾼다. 주말은 null이다.
export function getDayFromCompactDate(date: string): DayOfWeek | null {
  const parsed = new Date(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8)));
  return DAY_ORDER[parsed.getDay() - 1] || null;
}

// 그 블록 시간에 실제로 열린 과목만 고를 수 있게 한다.
export function getBlockSubjects(
  rows: Array<{ date: string; period: number; subject: string }>,
  grade: number,
  block: string
): string[] {
  const subjects = rows
    .filter((row) => {
      const day = getDayFromCompactDate(row.date);
      return day !== null && getBlockAt(grade, day, row.period) === block;
    })
    .map((row) => row.subject);
  return Array.from(new Set(subjects)).sort((a, b) => a.localeCompare(b, 'ko'));
}
