import { BlockLayouts, DEFAULT_BLOCK_LAYOUTS, getDayFromCompactDate, setBlockLayouts } from '../data/blockLayouts';
import { fetchRemoteSchoolSettings, isRemoteConfigured, upsertRemoteSchoolSettings } from './remoteStore';

export interface SchoolSettings {
  layouts: BlockLayouts;
  // 예: overrides['2-5']['MON-1'] = '영어Ⅱ'. 빈 문자열은 수업 없음이다.
  overrides: Record<string, Record<string, string>>;
}

const LOCAL_KEY = 'classfit_school_settings_v1';
const NO_CLASS_PATTERN = /휴업|방학|재량|개교/;

let settings: SchoolSettings = { layouts: DEFAULT_BLOCK_LAYOUTS, overrides: {} };

function apply(next: SchoolSettings): void {
  settings = next;
  setBlockLayouts(next.layouts);
}

function readLocal(): void {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) apply(JSON.parse(raw));
  } catch {
    // 저장된 값을 못 읽으면 기본 시간표를 쓴다.
  }
}

function writeLocal(next: SchoolSettings): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
  } catch {
    // 서버 값이 기준이므로 로컬 저장 실패는 무시한다.
  }
}

readLocal();

export function getSchoolSettings(): SchoolSettings {
  return settings;
}

// 값이 바뀌었으면 true를 돌려주어 화면을 다시 계산하게 한다.
export async function refreshSchoolSettings(): Promise<boolean> {
  if (!isRemoteConfigured) return false;
  const remote = await fetchRemoteSchoolSettings<SchoolSettings>();
  if (!remote || JSON.stringify(remote) === JSON.stringify(settings)) return false;
  apply(remote);
  writeLocal(remote);
  return true;
}

export async function saveSchoolSettings(next: SchoolSettings): Promise<void> {
  if (isRemoteConfigured) await upsertRemoteSchoolSettings(next);
  apply(next);
  writeLocal(next);
}

// 교사가 고친 칸을 NEIS 시간표 위에 덮어쓴다. 휴업일은 건드리지 않는다.
export function applyTimetableOverrides<T extends { date: string; period: number; subject: string; classNum?: number }>(
  rows: T[],
  grade: number,
  classNum: number
): T[] {
  const cells = settings.overrides[`${grade}-${classNum}`];
  if (!cells || Object.keys(cells).length === 0) return rows;

  const result = [...rows];
  Array.from(new Set(rows.map((row) => row.date))).forEach((date) => {
    const day = getDayFromCompactDate(date);
    const isNoClassDay = rows.some((row) => row.date === date && NO_CLASS_PATTERN.test(row.subject));
    if (!day || isNoClassDay) return;

    Object.entries(cells).forEach(([cell, subject]) => {
      const [cellDay, cellPeriod] = cell.split('-');
      if (cellDay !== day) return;
      const period = Number(cellPeriod);
      const index = result.findIndex((row) => row.date === date && row.period === period);
      if (index >= 0) result.splice(index, 1);
      if (subject) result.push({ date, period, subject, classNum } as T);
    });
  });
  return result;
}
