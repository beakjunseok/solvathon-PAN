import React, { useState } from 'react';
import { StudentCourse, StudentProfile, getBlocksForGrade, getGradeBlockLabel } from '../types';
import { getBlockSubjects } from '../data/blockLayouts';
import { useNeisTimetable } from '../utils/useNeisTimetable';
import { Save, User, BookOpen, MapPin, X, Sparkles, Check, Info } from 'lucide-react';

interface StudentScheduleEditorProps {
  student: StudentProfile;
  onSave: (updated: StudentProfile) => void;
  onClose: () => void;
}

export const StudentScheduleEditor: React.FC<StudentScheduleEditorProps> = ({
  student,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(student.name);
  const [grade, setGrade] = useState(student.grade);
  const [classNum, setClassNum] = useState(student.classNum);
  const [studentNum, setStudentNum] = useState(student.studentNum);

  const activeBlocks = getBlocksForGrade(grade);
  const { rows: gradeRows } = useNeisTimetable(grade, null);

  const [courses, setCourses] = useState<StudentCourse[]>(() => {
    const blocks = getBlocksForGrade(student.grade);
    return blocks.map((blk, idx) => {
      // Find matching course by block or fallback by position
      const existing =
        student.courses.find((c) => c.block === blk) ||
        (student.courses[idx] ? { ...student.courses[idx], block: blk } : null);
      return (
        existing || {
          block: blk,
          subject: '',
          room: '',
          teacherName: '',
        }
      );
    });
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGradeChange = (newGrade: number) => {
    setGrade(newGrade);
    const targetBlocks = getBlocksForGrade(newGrade);
    setCourses((prev) => {
      return targetBlocks.map((blk, idx) => {
        const prevCourse = prev[idx];
        return {
          block: blk,
          subject: prevCourse?.subject || '',
          room: prevCourse?.room || '',
          teacherName: prevCourse?.teacherName || '',
        };
      });
    });
  };

  const handleUpdateCourse = (
    block: StudentCourse['block'],
    field: keyof StudentCourse,
    value: string
  ) => {
    setCourses((prev) =>
      prev.map((c) => (c.block === block ? { ...c, [field]: value } : c))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      ...student,
      name,
      grade,
      classNum,
      studentNum,
      courses,
    };
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              내 시간표 및 선택과목 블록 설정
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              <strong>2학년은 A~D 블록</strong>, <strong>3학년은 E~H 블록</strong>의 과목을 고릅니다. 1학년은 선택과목이 없습니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-6 text-sm">
          {/* Basic Student Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              학생 기본 인적사항
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">이름</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">학년</label>
                <select
                  value={grade}
                  onChange={(e) => handleGradeChange(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-indigo-700"
                >
                  <option value={1}>1학년 (선택과목 없음)</option>
                  <option value={2}>2학년 (A~D블록)</option>
                  <option value={3}>3학년 (E~H블록)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">반</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={classNum}
                  onChange={(e) => setClassNum(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">번호</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={studentNum}
                  onChange={(e) => setStudentNum(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Grade Block Notice badge */}
            <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg text-xs text-indigo-900 font-medium border border-indigo-100">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                {grade === 1
                  ? '1학년은 선택과목이 없어 고를 과목이 없습니다.'
                  : `${grade}학년은 ${grade === 3 ? 'E, F, G, H' : 'A, B, C, D'} 블록의 과목을 고릅니다.`}
              </span>
            </div>
          </div>

          {/* Block-by-Block Course Setup */}
          <div className="space-y-4">
            {grade !== 1 && (
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {getGradeBlockLabel(grade)}별 선택과목 & 이동 교실 등록
              </h3>
              <span className="text-xs text-indigo-600 font-medium">
                NEIS 과목 목록
              </span>
            </div>
            )}

            {activeBlocks.map((block) => {
              const blockSubjects = getBlockSubjects(gradeRows, grade, block);
              const course = courses.find((c) => c.block === block) || {
                block,
                subject: '',
                room: '',
              };

              return (
                <div
                  key={block}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center">
                        {block}
                      </span>
                      <span className="font-semibold text-slate-900 text-sm">
                        {block}블록 선택과목 ({grade}학년)
                      </span>
                    </div>
                    {course.subject && (
                      <span className="text-xs text-slate-500">
                        현재: <strong className="text-slate-800">{course.subject}</strong> ({course.room || '교실 미지정'})
                      </span>
                    )}
                  </div>

                  {/* Input fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2.5">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">과목명</label>
                      {blockSubjects.length > 0 ? (
                        <select
                          value={course.subject}
                          onChange={(e) => handleUpdateCourse(block, 'subject', e.target.value)}
                          className="w-full min-h-10 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="">과목을 고르세요</option>
                          {course.subject && !blockSubjects.includes(course.subject) && (
                            <option value={course.subject}>{course.subject}</option>
                          )}
                          {blockSubjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="과목명을 입력하세요"
                          value={course.subject}
                          onChange={(e) => handleUpdateCourse(block, 'subject', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">이동 교실 / 특별실</label>
                      <input
                        type="text"
                        placeholder="예: 신관 3층 물리실 (선택 입력)"
                        value={course.room}
                        onChange={(e) =>
                          handleUpdateCourse(block, 'room', e.target.value)
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  저장되었습니다!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  시간표 저장 및 반영
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
