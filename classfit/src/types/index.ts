export type BlockId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'COMMON';

export function getBlocksForGrade(grade: number): Array<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'> {
  if (grade === 3) {
    return ['E', 'F', 'G', 'H'];
  }
  return ['A', 'B', 'C', 'D'];
}

export function getGradeBlockLabel(grade: number): string {
  return grade === 3 ? 'E~H 블록' : 'A~D 블록';
}

export function isGrade3Block(block: string): boolean {
  return ['E', 'F', 'G', 'H'].includes(block);
}

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';

export interface WeeklyBlockSlot {
  day: DayOfWeek;
  period: number; // 1 ~ 7
  block: BlockId;
  label?: string; // e.g. "공통 국어" for common periods
}

export interface StudentCourse {
  block: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
  subject: string;
  room: string;
  teacherName?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: number;
  classNum: number;
  studentNum: number;
  avatarColor: string;
  courses: StudentCourse[];
  checkedSupplies: Record<string, string[]>; // assessmentId -> checked item array
  completedAssessments: string[]; // assessment IDs
}

export type AssessmentType =
  | '실험/탐구'
  | '논술/서술'
  | '구술/발표'
  | '프로젝트'
  | '포트폴리오'
  | '단원평가';

export interface Assessment {
  id: string;
  subject: string;
  block: BlockId;
  targetGrade: number;
  title: string;
  type: AssessmentType;
  date: string; // YYYY-MM-DD
  periodOverride?: number; // Optional override
  supplies: string[];
  description: string;
  criteria: string[];
  teacherName: string;
  createdAt: string;
}

export interface MatchedAssessment extends Assessment {
  studentRoom: string;
  calculatedPeriod: number;
  dayOfWeekStr: string;
  daysRemaining: number;
  isToday: boolean;
  status: 'today' | 'urgent' | 'upcoming' | 'future' | 'past';
  isCompleted: boolean;
}

export type AppRole = 'student' | 'teacher' | 'dual_compare' | 'solverthon';

export type AuthUser =
  | { role: 'student'; id: string; name: string }
  | { role: 'teacher'; name: string };
