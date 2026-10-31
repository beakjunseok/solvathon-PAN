import { describe, expect, it } from 'vitest';
import { Assessment, StudentProfile, Submission } from '../types';
import { DEFAULT_BLOCK_LAYOUTS, getBlockAt, getBlockSubjects } from '../data/blockLayouts';
import { parseNotice } from './noticeParser';
import {
  calculateDaysRemaining,
  findStudentSlot,
  getPeriodForBlockAndDate,
  matchStudentAssessments,
} from './scheduleMatcher';
import { findSimilarPairs } from './submissionStore';
import { applyMyElectives, getNextSchoolDay, getTextbookSubjects } from './textbookList';

function student(overrides: Partial<StudentProfile>): StudentProfile {
  return {
    id: 'student',
    name: '테스트',
    grade: 2,
    classNum: 5,
    studentNum: 10,
    avatarColor: 'indigo',
    courses: [{ block: 'A', subject: '화학', room: '3-1' }],
    checkedSupplies: {},
    completedAssessments: [],
    ...overrides,
  };
}

function assessment(overrides: Partial<Assessment>): Assessment {
  return {
    id: 'assessment',
    subject: '화학',
    block: 'A',
    targetGrade: 2,
    title: '탐구 보고서',
    type: '실험/탐구',
    date: '2026-11-04',
    supplies: [],
    description: '',
    criteria: [],
    teacherName: '교사',
    createdAt: '2026-10-31T00:00:00.000Z',
    ...overrides,
  };
}

describe('학년별 블록 위치', () => {
  it('2·3학년 블록은 주 3칸씩이고 칸이 겹치지 않는다', () => {
    [2, 3].forEach((grade) => {
      const slots = Object.values(DEFAULT_BLOCK_LAYOUTS[grade]).flat();
      Object.values(DEFAULT_BLOCK_LAYOUTS[grade]).forEach((items) => expect(items).toHaveLength(3));
      expect(new Set(slots).size).toBe(slots.length);
    });
  });

  it('1학년은 선택과목 블록이 없다', () => {
    expect(getBlockAt(1, 'MON', 5)).toBeNull();
  });

  it('블록 위치로 교시를 찾고 수업 없는 요일을 구분한다', () => {
    const empty: never[] = [];
    expect(getPeriodForBlockAndDate('A', '2026-11-02', empty, undefined, 2)).toMatchObject({ period: 5, isBlockDay: true });
    expect(getPeriodForBlockAndDate('A', '2026-11-03', empty, undefined, 2).isBlockDay).toBe(false);
  });

  it('블록 시간에 열린 과목만 후보로 고른다', () => {
    const rows = [
      { date: '20261102', period: 5, subject: '화학' },
      { date: '20261102', period: 1, subject: '스포츠 생활2' },
    ];
    expect(getBlockSubjects(rows, 2, 'A')).toEqual(['화학']);
  });
});

describe('학생별 평가 매칭', () => {
  it('체크한 블록과 과목이 맞는 학생에게만 보인다', () => {
    const target = assessment({ slots: [{ date: '2026-11-04', period: 1, block: 'A' }] });
    expect(findStudentSlot(target, student({}), '2026-10-31')).not.toBeNull();
    expect(
      findStudentSlot(target, student({ courses: [{ block: 'A', subject: '경제', room: '' }] }), '2026-10-31')
    ).toBeNull();
  });

  it('일반 과목은 체크한 반 학생에게만 보인다', () => {
    const target = assessment({ block: 'COMMON', subject: '미적분Ⅰ', slots: [{ date: '2026-11-03', period: 5, classNum: 5 }] });
    expect(findStudentSlot(target, student({ classNum: 5 }), '2026-10-31')).not.toBeNull();
    expect(findStudentSlot(target, student({ classNum: 4 }), '2026-10-31')).toBeNull();
  });

  it('여러 칸 중 앞으로 가장 가까운 칸을 고른다', () => {
    const target = assessment({
      slots: [
        { date: '2026-10-28', period: 1, block: 'A' },
        { date: '2026-11-04', period: 1, block: 'A' },
        { date: '2026-11-05', period: 6, block: 'A' },
      ],
    });
    expect(findStudentSlot(target, student({}), '2026-10-31')?.date).toBe('2026-11-04');
  });

  it('학생별 날짜·교시·교실로 평가를 만든다', () => {
    const target = assessment({ slots: [{ date: '2026-11-04', period: 1, block: 'A' }] });
    const other = assessment({ id: 'other', targetGrade: 3 });
    const [matched, ...rest] = matchStudentAssessments(student({}), [target, other], [], '2026-10-31');

    expect(rest).toHaveLength(0);
    expect(matched).toMatchObject({ date: '2026-11-04', calculatedPeriod: 1, studentRoom: '3-1', daysRemaining: 4 });
  });

  it('D-Day는 기준일과의 날짜 차이다', () => {
    expect(calculateDaysRemaining('2026-11-03', '2026-10-31')).toBe(3);
    expect(calculateDaysRemaining('2026-10-31', '2026-10-31')).toBe(0);
  });
});

describe('공지 분석', () => {
  it('공지 글에서 평가 정보를 뽑는다', () => {
    const text =
      '[3학년] 11월 4일(수) E블록 물리Ⅱ 시간에 전자기 유도 탐구 실험평가를 실시합니다. 준비물은 공학용 계산기와 실험 가운입니다. 신관 3층 물리실험실로 이동하세요.';
    expect(parseNotice(text, new Date(2026, 9, 31), ['물리Ⅱ'])).toMatchObject({
      grade: 3,
      block: 'E',
      subject: '물리Ⅱ',
      date: '2026-11-04',
      title: '전자기 유도 탐구 실험평가',
      room: '신관 3층 물리실험실',
      supplies: ['공학용 계산기', '실험 가운'],
      missing: [],
    });
  });

  it('찾지 못한 항목을 알려 준다', () => {
    expect(parseNotice('다음 주에 평가가 있습니다.', new Date(2026, 9, 31), []).missing).toContain('날짜');
  });
});

describe('등교 준비물', () => {
  it('블록 칸은 내가 고른 과목으로 바꾼다', () => {
    const rows = [
      { date: '20261102', period: 5, subject: '경제' },
      { date: '20261102', period: 4, subject: '일본 문화' },
    ];
    expect(applyMyElectives(rows, student({})).map((row) => row.subject)).toEqual(['화학', '일본 문화']);
  });

  it('행사로 바뀐 블록 칸은 NEIS 내용을 그대로 쓴다', () => {
    const rows = [{ date: '20261102', period: 5, subject: '동아리활동' }];
    expect(applyMyElectives(rows, student({}))[0].subject).toBe('동아리활동');
  });

  it('고르지 않은 블록과 교과서가 없는 시간은 뺀다', () => {
    const rows = [
      { date: '20261102', period: 1, subject: '자율·자치활동' },
      { date: '20261102', period: 2, subject: '스포츠 생활2' },
      { date: '20261102', period: 3, subject: '화학' },
    ];
    expect(getTextbookSubjects(rows)).toEqual(['화학']);
    expect(applyMyElectives([{ date: '20261102', period: 5, subject: '경제' }], student({ courses: [] }))).toEqual([]);
  });

  it('주말과 하교 후에는 다음 평일을 준비한다', () => {
    expect(getNextSchoolDay(new Date(2026, 9, 31, 10)).getDate()).toBe(2);
    expect(getNextSchoolDay(new Date(2026, 10, 2, 9)).getDate()).toBe(2);
    expect(getNextSchoolDay(new Date(2026, 10, 2, 17)).getDate()).toBe(3);
  });
});

describe('제출물 유사도', () => {
  it('비슷한 글만 찾아낸다', () => {
    const make = (id: string, content: string): Submission => ({
      id,
      assessmentId: 'a',
      studentId: id,
      studentName: id,
      studentNumber: id,
      content,
      files: [],
      submittedAt: '',
      isLate: false,
      score: null,
      feedback: '',
    });
    const pairs = findSimilarPairs([
      make('1', '코일의 감은 수가 늘어나면 유도기전력도 비례하여 증가합니다.'),
      make('2', '코일의 감은 수가 늘어나면 유도기전력도 비례하여 커집니다.'),
      make('3', '조선 후기 실학의 등장 배경과 사회 변화를 정리한 글입니다.'),
    ]);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].percent).toBeGreaterThan(50);
  });
});
