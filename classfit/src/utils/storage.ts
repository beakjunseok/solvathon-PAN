import { DEFAULT_WEEKLY_SCHEDULE, INITIAL_ASSESSMENTS, INITIAL_STUDENTS } from '../data/initialData';
import { Assessment, StudentCourse, StudentProfile, WeeklyBlockSlot } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'blockedu_students_v2',
  ASSESSMENTS: 'blockedu_assessments_v2',
  SCHEDULE: 'blockedu_schedule_v2',
  ACTIVE_STUDENT: 'blockedu_active_student_v2',
};

export function getStoredStudents(): StudentProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STUDENTS;
  }
}

export function saveStudents(students: StudentProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error('Failed to save students to localStorage', err);
  }
}

export function getStoredAssessments(): Assessment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSESSMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(INITIAL_ASSESSMENTS));
      return INITIAL_ASSESSMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ASSESSMENTS;
  }
}

export function saveAssessments(assessments: Assessment[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
  } catch (err) {
    console.error('Failed to save assessments to localStorage', err);
  }
}

export function getStoredSchedule(): WeeklyBlockSlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(DEFAULT_WEEKLY_SCHEDULE));
      return DEFAULT_WEEKLY_SCHEDULE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WEEKLY_SCHEDULE;
  }
}

export function saveSchedule(schedule: WeeklyBlockSlot[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  } catch (err) {
    console.error('Failed to save schedule to localStorage', err);
  }
}

export function getActiveStudentId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDENT);
    return raw || INITIAL_STUDENTS[0].id;
  } catch {
    return INITIAL_STUDENTS[0].id;
  }
}

export function setActiveStudentId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDENT, id);
  } catch (err) {
    console.error('Failed to set active student id', err);
  }
}

export function resetAllData(): {
  students: StudentProfile[];
  assessments: Assessment[];
  schedule: WeeklyBlockSlot[];
} {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(INITIAL_ASSESSMENTS));
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(DEFAULT_WEEKLY_SCHEDULE));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDENT, INITIAL_STUDENTS[0].id);
  } catch (err) {
    console.error('Failed to reset localStorage data', err);
  }
  return {
    students: INITIAL_STUDENTS,
    assessments: INITIAL_ASSESSMENTS,
    schedule: DEFAULT_WEEKLY_SCHEDULE,
  };
}
