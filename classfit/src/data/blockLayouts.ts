import { BlockId, DayOfWeek } from '../types';

type BlockSlots = Partial<Record<BlockId, string[]>>;

// 학년별 선택과목 블록 위치. 같은 학년은 모든 반이 같다. 형식: 'MON-2'는 월요일 2교시
export const BLOCK_LAYOUTS: Record<number, BlockSlots> = {
  1: {},
  2: {},
  3: {},
};

export function hasBlockLayout(grade: number): boolean {
  return Object.keys(BLOCK_LAYOUTS[grade] || {}).length > 0;
}

export function getBlockAt(grade: number, day: DayOfWeek, period: number): BlockId | null {
  const slot = `${day}-${period}`;
  const entry = Object.entries(BLOCK_LAYOUTS[grade] || {}).find(([, slots]) => slots?.includes(slot));
  return entry ? (entry[0] as BlockId) : null;
}
