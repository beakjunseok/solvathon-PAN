import { DayOfWeek, WeeklyBlockSlot, getBlocksForGrade } from '../types';

export interface ComciganSlot {
  day: DayOfWeek;
  dayKorean: string;
  period: number;
  subject: string;
  rawComciganName: string;
  isBlockElective: boolean;
  block?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'COMMON';
  teacher?: string;
}

export interface ComciganSchoolResult {
  code: number;
  name: string;
  region: string;
}

/**
 * Returns a built-in sample timetable. It does not connect to the Comcigan server.
 * - Grade 3: E, F, G, H blocks for electives
 * - Grade 1 & 2: A, B, C, D blocks for electives
 */
export function generateComciganTimetable(
  schoolName: string,
  grade: number,
  classNum: number
): { slots: ComciganSlot[]; lastUpdated: string; isRealtime: boolean } {
  const isGrade3 = grade === 3;
  const blocks = isGrade3 ? (['E', 'F', 'G', 'H'] as const) : (['A', 'B', 'C', 'D'] as const);

  const days: Array<{ day: DayOfWeek; dayKorean: string }> = [
    { day: 'MON', dayKorean: '월요일' },
    { day: 'TUE', dayKorean: '화요일' },
    { day: 'WED', dayKorean: '수요일' },
    { day: 'THU', dayKorean: '목요일' },
    { day: 'FRI', dayKorean: '금요일' },
  ];

  // Sample schedule template for the demo
  // Day, Period -> { raw, isBlock, block }
  const template3rd: Record<string, { raw: string; isBlock: boolean; block: 'E' | 'F' | 'G' | 'H' | 'COMMON' }> = {
    'MON-1': { raw: '독서', isBlock: false, block: 'COMMON' },
    'MON-2': { raw: '선택E(이동)', isBlock: true, block: 'E' },
    'MON-3': { raw: '수학', isBlock: false, block: 'COMMON' },
    'MON-4': { raw: '영어', isBlock: false, block: 'COMMON' },
    'MON-5': { raw: '선택G(이동)', isBlock: true, block: 'G' },
    'MON-6': { raw: '진로', isBlock: false, block: 'COMMON' },
    'MON-7': { raw: '자치', isBlock: false, block: 'COMMON' },

    'TUE-1': { raw: '체육', isBlock: false, block: 'COMMON' },
    'TUE-2': { raw: '독서', isBlock: false, block: 'COMMON' },
    'TUE-3': { raw: '선택F(이동)', isBlock: true, block: 'F' },
    'TUE-4': { raw: '수학', isBlock: false, block: 'COMMON' },
    'TUE-5': { raw: '영어', isBlock: false, block: 'COMMON' },
    'TUE-6': { raw: '선택H(이동)', isBlock: true, block: 'H' },
    'TUE-7': { raw: '자율', isBlock: false, block: 'COMMON' },

    'WED-1': { raw: '선택E(이동)', isBlock: true, block: 'E' },
    'WED-2': { raw: '수학', isBlock: false, block: 'COMMON' },
    'WED-3': { raw: '독서', isBlock: false, block: 'COMMON' },
    'WED-4': { raw: '선택G(이동)', isBlock: true, block: 'G' },
    'WED-5': { raw: '동아리', isBlock: false, block: 'COMMON' },
    'WED-6': { raw: '동아리', isBlock: false, block: 'COMMON' },
    'WED-7': { raw: '평가', isBlock: false, block: 'COMMON' },

    'THU-1': { raw: '영어', isBlock: false, block: 'COMMON' },
    'THU-2': { raw: '선택F(이동)', isBlock: true, block: 'F' },
    'THU-3': { raw: '체육', isBlock: false, block: 'COMMON' },
    'THU-4': { raw: '수학', isBlock: false, block: 'COMMON' },
    'THU-5': { raw: '선택H(이동)', isBlock: true, block: 'H' },
    'THU-6': { raw: '선택G(이동)', isBlock: true, block: 'G' },
    'THU-7': { raw: '자율', isBlock: false, block: 'COMMON' },

    'FRI-1': { raw: '독서', isBlock: false, block: 'COMMON' },
    'FRI-2': { raw: '영어', isBlock: false, block: 'COMMON' },
    'FRI-3': { raw: '선택E(이동)', isBlock: true, block: 'E' },
    'FRI-4': { raw: '수학', isBlock: false, block: 'COMMON' },
    'FRI-5': { raw: '진로특강', isBlock: false, block: 'COMMON' },
    'FRI-6': { raw: '선택F(이동)', isBlock: true, block: 'F' },
    'FRI-7': { raw: '선택H(이동)', isBlock: true, block: 'H' },
  };

  const template1st2nd: Record<string, { raw: string; isBlock: boolean; block: 'A' | 'B' | 'C' | 'D' | 'COMMON' }> = {
    'MON-1': { raw: '국어', isBlock: false, block: 'COMMON' },
    'MON-2': { raw: '선택A(이동)', isBlock: true, block: 'A' },
    'MON-3': { raw: '수학', isBlock: false, block: 'COMMON' },
    'MON-4': { raw: '영어', isBlock: false, block: 'COMMON' },
    'MON-5': { raw: '선택C(이동)', isBlock: true, block: 'C' },
    'MON-6': { raw: '진로', isBlock: false, block: 'COMMON' },
    'MON-7': { raw: '자치', isBlock: false, block: 'COMMON' },

    'TUE-1': { raw: '체육', isBlock: false, block: 'COMMON' },
    'TUE-2': { raw: '한국사', isBlock: false, block: 'COMMON' },
    'TUE-3': { raw: '선택B(이동)', isBlock: true, block: 'B' },
    'TUE-4': { raw: '수학', isBlock: false, block: 'COMMON' },
    'TUE-5': { raw: '영어', isBlock: false, block: 'COMMON' },
    'TUE-6': { raw: '선택D(이동)', isBlock: true, block: 'D' },
    'TUE-7': { raw: '자율', isBlock: false, block: 'COMMON' },

    'WED-1': { raw: '선택A(이동)', isBlock: true, block: 'A' },
    'WED-2': { raw: '수학', isBlock: false, block: 'COMMON' },
    'WED-3': { raw: '국어', isBlock: false, block: 'COMMON' },
    'WED-4': { raw: '선택C(이동)', isBlock: true, block: 'C' },
    'WED-5': { raw: '동아리', isBlock: false, block: 'COMMON' },
    'WED-6': { raw: '동아리', isBlock: false, block: 'COMMON' },
    'WED-7': { raw: '평가', isBlock: false, block: 'COMMON' },

    'THU-1': { raw: '영어', isBlock: false, block: 'COMMON' },
    'THU-2': { raw: '선택B(이동)', isBlock: true, block: 'B' },
    'THU-3': { raw: '체육', isBlock: false, block: 'COMMON' },
    'THU-4': { raw: '수학', isBlock: false, block: 'COMMON' },
    'THU-5': { raw: '선택D(이동)', isBlock: true, block: 'D' },
    'THU-6': { raw: '선택C(이동)', isBlock: true, block: 'C' },
    'THU-7': { raw: '상담', isBlock: false, block: 'COMMON' },

    'FRI-1': { raw: '국어', isBlock: false, block: 'COMMON' },
    'FRI-2': { raw: '영어', isBlock: false, block: 'COMMON' },
    'FRI-3': { raw: '선택A(이동)', isBlock: true, block: 'A' },
    'FRI-4': { raw: '수학', isBlock: false, block: 'COMMON' },
    'FRI-5': { raw: '진로특강', isBlock: false, block: 'COMMON' },
    'FRI-6': { raw: '선택B(이동)', isBlock: true, block: 'B' },
    'FRI-7': { raw: '선택D(이동)', isBlock: true, block: 'D' },
  };

  const selectedTemplate = isGrade3 ? template3rd : template1st2nd;
  const slots: ComciganSlot[] = [];

  for (const { day, dayKorean } of days) {
    for (let period = 1; period <= 7; period++) {
      const key = `${day}-${period}`;
      const entry = (selectedTemplate as any)[key] || {
        raw: '자율',
        isBlock: false,
        block: 'COMMON',
      };

      slots.push({
        day,
        dayKorean,
        period,
        subject: entry.raw,
        rawComciganName: entry.raw,
        isBlockElective: entry.isBlock,
        block: entry.block,
      });
    }
  }

  return {
    slots,
    lastUpdated: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    isRealtime: false,
  };
}

/**
 * Converts Comcigan slots into WeeklyBlockSlot array for the app
 */
export function convertComciganToWeeklySchedule(slots: ComciganSlot[]): WeeklyBlockSlot[] {
  return slots.map((s) => ({
    day: s.day,
    period: s.period,
    block: s.block || 'COMMON',
    label: s.rawComciganName,
  }));
}
