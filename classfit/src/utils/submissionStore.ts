import { Assessment, StudentProfile, Submission } from '../types';
import { findStudentSlot } from './scheduleMatcher';
import {
  fetchRemoteSubmissions,
  isRemoteConfigured,
  upsertRemoteSubmission,
} from './remoteStore';

const LOCAL_KEY = 'classfit_submissions_v1';

function readLocal(): Submission[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeLocal(submission: Submission): void {
  try {
    const others = readLocal().filter((s) => s.id !== submission.id);
    localStorage.setItem(LOCAL_KEY, JSON.stringify([...others, submission]));
  } catch (err) {
    console.error('Failed to save submission to localStorage', err);
  }
}

export function getSubmissionId(assessmentId: string, studentId: string): string {
  return `${assessmentId}__${studentId}`;
}

export async function loadSubmissions(assessmentId?: string): Promise<Submission[]> {
  if (isRemoteConfigured) return fetchRemoteSubmissions(assessmentId);
  const all = readLocal();
  return assessmentId ? all.filter((s) => s.assessmentId === assessmentId) : all;
}

// 서버 저장에 실패하면 예외를 그대로 올려 화면이 제출 완료로 표시하지 않게 한다.
export async function saveSubmission(submission: Submission): Promise<void> {
  if (isRemoteConfigured) await upsertRemoteSubmission(submission);
  writeLocal(submission);
}

export function getStudentNumber(student: StudentProfile): string {
  const classNum = String(student.classNum).padStart(2, '0');
  const studentNum = String(student.studentNum).padStart(2, '0');
  return `${student.grade}${classNum}${studentNum}`;
}

export function getTargetStudents(assessment: Assessment, students: StudentProfile[]): StudentProfile[] {
  return students.filter((student) => {
    if (student.grade !== assessment.targetGrade) return false;
    if (assessment.slots && assessment.slots.length > 0) return findStudentSlot(assessment, student) !== null;
    if (assessment.block === 'COMMON') return true;
    return student.courses.some(
      (c) =>
        c.block === assessment.block &&
        (c.subject.includes(assessment.subject) || assessment.subject.includes(c.subject))
    );
  });
}

export function countCharacters(text: string): number {
  return text.replace(/\s/g, '').length;
}

function toTrigrams(text: string): Set<string> {
  const compact = text.replace(/\s/g, '');
  const grams = new Set<string>();
  for (let i = 0; i <= compact.length - 3; i += 1) {
    grams.add(compact.slice(i, i + 3));
  }
  return grams;
}

function similarity(a: string, b: string): number {
  const gramsA = toTrigrams(a);
  const gramsB = toTrigrams(b);
  if (gramsA.size === 0 || gramsB.size === 0) return 0;
  let shared = 0;
  gramsA.forEach((gram) => {
    if (gramsB.has(gram)) shared += 1;
  });
  return shared / (gramsA.size + gramsB.size - shared);
}

export interface SimilarPair {
  first: Submission;
  second: Submission;
  percent: number;
}

// 세 글자 단위로 글을 나눠 겹치는 비율을 비교한다.
export function findSimilarPairs(submissions: Submission[], threshold = 0.3): SimilarPair[] {
  const withText = submissions.filter((s) => countCharacters(s.content) >= 20);
  const pairs: SimilarPair[] = [];
  withText.forEach((first, index) => {
    withText.slice(index + 1).forEach((second) => {
      const score = similarity(first.content, second.content);
      if (score >= threshold) {
        pairs.push({ first, second, percent: Math.round(score * 100) });
      }
    });
  });
  return pairs.sort((a, b) => b.percent - a.percent);
}

function csvCell(value: string | number): string {
  const text = String(value);
  // 엑셀이 셀 값을 수식으로 실행하지 않도록 막는다.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function buildSubmissionCsv(rows: Array<Array<string | number>>): string {
  // 엑셀이 한글을 깨뜨리지 않도록 BOM을 붙인다.
  return `﻿${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
}
