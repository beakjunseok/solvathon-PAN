import { Assessment, DayOfWeek, MatchedAssessment, StudentProfile, WeeklyBlockSlot } from '../types';

export const TODAY_DATE_STR = '2026-10-23'; // Base demo date matching system context

const DAY_MAP: Record<number, DayOfWeek | null> = {
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  0: null, // Sun
  6: null, // Sat
};

export const DAY_KOREAN: Record<DayOfWeek, string> = {
  MON: '월요일',
  TUE: '화요일',
  WED: '수요일',
  THU: '목요일',
  FRI: '금요일',
};

/**
 * Returns the DayOfWeek enum for a YYYY-MM-DD date string
 */
export function getDayOfWeekFromDate(dateStr: string): DayOfWeek | null {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayIndex = date.getDay();
  return DAY_MAP[dayIndex] || null;
}

/**
 * Calculates remaining days between baseDate (defaults to TODAY_DATE_STR) and targetDate
 */
export function calculateDaysRemaining(targetDateStr: string, baseDateStr = TODAY_DATE_STR): number {
  const [by, bm, bd] = baseDateStr.split('-').map(Number);
  const [ty, tm, td] = targetDateStr.split('-').map(Number);

  const baseDate = new Date(by, bm - 1, bd);
  const targetDate = new Date(ty, tm - 1, td);

  const diffTime = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculates period for a block on a given date using weekly schedule matrix
 */
export function getPeriodForBlockAndDate(
  block: string,
  dateStr: string,
  weeklySchedule: WeeklyBlockSlot[],
  periodOverride?: number
): { period: number; dayStr: string } {
  const dayOfWeek = getDayOfWeekFromDate(dateStr);
  const dayStr = dayOfWeek ? DAY_KOREAN[dayOfWeek] : '주말/지정일';

  if (periodOverride && periodOverride > 0) {
    return { period: periodOverride, dayStr };
  }

  if (!dayOfWeek) {
    return { period: 1, dayStr };
  }

  // Find slot for this day and block
  const slot = weeklySchedule.find(s => s.day === dayOfWeek && s.block === block);
  if (slot) {
    return { period: slot.period, dayStr };
  }

  // Fallback default
  return { period: 2, dayStr };
}

/**
 * Core Matching Algorithm:
 * Matches student's personal A~D block timetable with teacher's assessment announcements.
 * Filters out assessments for subjects the student does NOT take.
 * Fills in the student's personal room & calculated period.
 */
export function matchStudentAssessments(
  student: StudentProfile,
  allAssessments: Assessment[],
  weeklySchedule: WeeklyBlockSlot[],
  baseDateStr = TODAY_DATE_STR
): MatchedAssessment[] {
  const matched: MatchedAssessment[] = [];

  for (const asmt of allAssessments) {
    // 1. Grade check
    if (asmt.targetGrade && asmt.targetGrade !== student.grade) {
      continue;
    }

    // 2. Block & Subject Matching
    if (asmt.block === 'COMMON') {
      // Common grade-wide subject: matches all students in this grade
      const { period, dayStr } = getPeriodForBlockAndDate(asmt.block, asmt.date, weeklySchedule, asmt.periodOverride);
      const daysRemaining = calculateDaysRemaining(asmt.date, baseDateStr);

      matched.push({
        ...asmt,
        studentRoom: `${student.grade}-${student.classNum} 우리 반 교실`,
        calculatedPeriod: period,
        dayOfWeekStr: dayStr,
        daysRemaining,
        isToday: daysRemaining === 0,
        status: getAssessmentStatus(daysRemaining),
        isCompleted: student.completedAssessments.includes(asmt.id),
      });
      continue;
    }

    // Elective Block (A, B, C, D)
    const enrolledCourse = student.courses.find(
      c => c.block === asmt.block && (
        c.subject.trim().toLowerCase() === asmt.subject.trim().toLowerCase() ||
        c.subject.includes(asmt.subject) ||
        asmt.subject.includes(c.subject)
      )
    );

    if (enrolledCourse) {
      const { period, dayStr } = getPeriodForBlockAndDate(asmt.block, asmt.date, weeklySchedule, asmt.periodOverride);
      const daysRemaining = calculateDaysRemaining(asmt.date, baseDateStr);

      matched.push({
        ...asmt,
        studentRoom: enrolledCourse.room || `${asmt.block}블록 이동교실`,
        calculatedPeriod: period,
        dayOfWeekStr: dayStr,
        daysRemaining,
        isToday: daysRemaining === 0,
        status: getAssessmentStatus(daysRemaining),
        isCompleted: student.completedAssessments.includes(asmt.id),
      });
    }
  }

  // Sort: Incomplete first, then by daysRemaining (imminent first, past last)
  return matched.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    // Future/today (daysRemaining >= 0) sorted ascending (0, 1, 2...)
    // Past (daysRemaining < 0) moved to bottom
    const aIsPast = a.daysRemaining < 0;
    const bIsPast = b.daysRemaining < 0;

    if (aIsPast && !bIsPast) return 1;
    if (!aIsPast && bIsPast) return -1;
    if (aIsPast && bIsPast) return b.daysRemaining - a.daysRemaining; // newest past first
    return a.daysRemaining - b.daysRemaining;
  });
}

function getAssessmentStatus(daysRemaining: number): 'today' | 'urgent' | 'upcoming' | 'future' | 'past' {
  if (daysRemaining < 0) return 'past';
  if (daysRemaining === 0) return 'today';
  if (daysRemaining <= 2) return 'urgent';
  if (daysRemaining <= 7) return 'upcoming';
  return 'future';
}

/**
 * Format D-day label cleanly
 */
export function formatDDay(daysRemaining: number): { text: string; label: string } {
  if (daysRemaining === 0) {
    return { text: 'D-Day', label: '오늘 평가' };
  }
  if (daysRemaining === 1) {
    return { text: 'D-1', label: '내일' };
  }
  if (daysRemaining > 1) {
    return { text: `D-${daysRemaining}`, label: `${daysRemaining}일 후` };
  }
  return { text: `D+${Math.abs(daysRemaining)}`, label: '평가 완료' };
}

export const MORNING_ASSEMBLY = { start: '08:00', end: '08:10' };
export const LUNCH_TIME = { start: '12:10', end: '13:20' };

export const PERIOD_TIMES: Record<number, { start: string; end: string; startHour: number; startMin: number }> = {
  1: { start: '08:20', end: '09:10', startHour: 8, startMin: 20 },
  2: { start: '09:20', end: '10:10', startHour: 9, startMin: 20 },
  3: { start: '10:20', end: '11:10', startHour: 10, startMin: 20 },
  4: { start: '11:20', end: '12:10', startHour: 11, startMin: 20 },
  5: { start: '13:20', end: '14:10', startHour: 13, startMin: 20 },
  6: { start: '14:20', end: '15:10', startHour: 14, startMin: 20 },
  7: { start: '15:20', end: '16:10', startHour: 15, startMin: 20 },
};

export interface DetailedTimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  humanBadge: string;
  detailedText: string;
  periodTime: string;
  isToday: boolean;
  isUrgent: boolean;
}

/**
 * Calculates human readable remaining time down to hours/minutes for an assessment
 */
export function getDetailedTimeRemaining(
  targetDateStr: string,
  period: number,
  baseDateStr = TODAY_DATE_STR
): DetailedTimeRemaining {
  const days = calculateDaysRemaining(targetDateStr, baseDateStr);
  const periodInfo = PERIOD_TIMES[period] || PERIOD_TIMES[3];

  if (days < 0) {
    return {
      days,
      hours: 0,
      minutes: 0,
      humanBadge: `D+${Math.abs(days)}`,
      detailedText: '평가 완료됨',
      periodTime: `${periodInfo.start}~${periodInfo.end}`,
      isToday: false,
      isUrgent: false,
    };
  }

  if (days === 0) {
    // Today: simulate remaining time to this period (e.g., current morning time ~08:30 on demo date)
    // For 3교시 (10:50 start), from 08:30 is 2 hours 20 mins
    const baseHour = 8;
    const baseMin = 30;
    const targetTotalMins = periodInfo.startHour * 60 + periodInfo.startMin;
    const baseTotalMins = baseHour * 60 + baseMin;
    const diffMins = Math.max(10, targetTotalMins - baseTotalMins);
    const remHours = Math.floor(diffMins / 60);
    const remMins = diffMins % 60;

    return {
      days: 0,
      hours: remHours,
      minutes: remMins,
      humanBadge: 'D-Day 오늘!',
      detailedText: remHours > 0 ? `약 ${remHours}시간 ${remMins}분 후 시작` : `약 ${remMins}분 후 시작`,
      periodTime: `${periodInfo.start}~${periodInfo.end}`,
      isToday: true,
      isUrgent: true,
    };
  }

  // Future days
  const totalHours = days * 24 + (periodInfo.startHour - 9);
  return {
    days,
    hours: totalHours,
    minutes: periodInfo.startMin,
    humanBadge: days === 1 ? 'D-1 내일' : `D-${days}`,
    detailedText: days === 1 ? `내일 ${period}교시 (약 ${totalHours}시간 남음)` : `${days}일 후 (약 ${totalHours}시간 남음)`,
    periodTime: `${periodInfo.start}~${periodInfo.end}`,
    isToday: false,
    isUrgent: days <= 2,
  };
}

/**
 * Finds the single closest upcoming assessment for student
 */
export function getClosestStudentAssessment(
  matchedAssessments: MatchedAssessment[]
): MatchedAssessment | null {
  const upcoming = matchedAssessments.filter((a) => !a.isCompleted && a.daysRemaining >= 0);
  if (upcoming.length === 0) return null;

  return upcoming.sort((a, b) => {
    if (a.daysRemaining !== b.daysRemaining) {
      return a.daysRemaining - b.daysRemaining;
    }
    return a.calculatedPeriod - b.calculatedPeriod;
  })[0];
}

/**
 * Finds the single closest upcoming assessment for teacher/school
 */
export function getClosestTeacherAssessment(
  allAssessments: Assessment[],
  weeklySchedule: WeeklyBlockSlot[]
): (Assessment & { period: number; dayStr: string; daysRemaining: number }) | null {
  const withCalculations = allAssessments.map((a) => {
    const { period, dayStr } = getPeriodForBlockAndDate(a.block, a.date, weeklySchedule, a.periodOverride);
    const daysRemaining = calculateDaysRemaining(a.date);
    return {
      ...a,
      period,
      dayStr,
      daysRemaining,
    };
  });

  const upcoming = withCalculations.filter((a) => a.daysRemaining >= 0);
  if (upcoming.length === 0) return null;

  return upcoming.sort((a, b) => {
    if (a.daysRemaining !== b.daysRemaining) {
      return a.daysRemaining - b.daysRemaining;
    }
    return a.period - b.period;
  })[0];
}

