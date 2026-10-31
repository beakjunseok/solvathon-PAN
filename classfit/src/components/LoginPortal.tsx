import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { JungsanLogo } from './JungsanLogo';
import {
  GraduationCap,
  BookOpen,
  User,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Trophy,
  X,
} from 'lucide-react';

export type AuthSession =
  | { role: 'student'; studentId: string }
  | { role: 'teacher'; teacherName: string };

interface LoginPortalProps {
  students: StudentProfile[];
  onLoginAsStudent: (studentId: string) => void;
  onLoginAsTeacher: (teacherName: string) => void;
  onGoToDualCompare: () => void;
  onGoToSlideDeck: () => void;
  onRegisterNewStudent?: (newStudent: StudentProfile) => void;
  onClose?: () => void;
  initialRole?: 'student' | 'teacher';
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  students,
  onLoginAsStudent,
  onLoginAsTeacher,
  onGoToDualCompare,
  onGoToSlideDeck,
  onRegisterNewStudent,
  onClose,
  initialRole = 'student',
}) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>(initialRole);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [teacherName, setTeacherName] = useState<string>('박물리 선생님');
  const [teacherPasscode, setTeacherPasscode] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');

  // New student direct creation form state
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [newGrade, setNewGrade] = useState(3);
  const [newClass, setNewClass] = useState(2);
  const [newNum, setNewNum] = useState(15);
  const [newName, setNewName] = useState('');

  const handleCreateAndLoginStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newStudent: StudentProfile = {
      id: `student-${Date.now()}`,
      name: newName.trim(),
      grade: newGrade,
      classNum: newClass,
      studentNum: newNum,
      avatarColor: 'indigo',
      courses: [
        { block: newGrade === 3 ? 'E' : 'A', subject: newGrade === 3 ? '물리Ⅱ' : '물리Ⅰ', room: '신관 3층 물리실 (3-4)' },
        { block: newGrade === 3 ? 'F' : 'B', subject: newGrade === 3 ? '화학Ⅱ' : '화학Ⅰ', room: '신관 2층 화학실' },
        { block: newGrade === 3 ? 'G' : 'C', subject: newGrade === 3 ? '세계사' : '정치와 법', room: '본관 4층 사회과실' },
        { block: newGrade === 3 ? 'H' : 'D', subject: newGrade === 3 ? '심화영어' : '일본어Ⅰ', room: '본관 2층 어학실' },
      ],
      checkedSupplies: {},
      completedAssessments: [],
    };

    if (onRegisterNewStudent) {
      onRegisterNewStudent(newStudent);
    }
    onLoginAsStudent(newStudent.id);
  };

  return (
    <div className="min-h-screen bg-slate-900/95 text-white flex flex-col justify-between p-4 sm:p-8 animate-fade-in relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <JungsanLogo size={42} className="bg-white rounded-full p-0.5 shadow-md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-tight text-white">
                중산고등학교 맞춤 수행평가 알림
              </span>
              <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded uppercase">
                2026 솔버톤
              </span>
            </div>
            <p className="text-xs text-slate-400">
              선택과목제(1·2학년 A~D, 3학년 E~H 블록) 학생 시간표 ↔ 교사 수행평가 공지서 자동 연동 시스템
            </p>
          </div>
        </div>

        {/* Quick Demo Shortcuts for Judges */}
        <div className="flex items-center gap-2">
          <button
            onClick={onGoToDualCompare}
            className="hidden sm:flex px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            시연 듀얼 비교
          </button>
          <button
            onClick={onGoToSlideDeck}
            className="hidden sm:flex px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-colors items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5" />
            3분 피칭 덱
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Center Main Login Portal Cards */}
      <div className="max-w-4xl mx-auto w-full my-8 relative z-10">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
            LOGIN PORTAL · 사용자 역할 선택
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            선생님 또는 학생 계정으로 접속하세요
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            선생님은 수행평가 공지서와 준비물을 작성하고,<br />
            학생은 A~D 블록 시간표를 등록하여 나만의 D-day와 교시를 배정받습니다.
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="flex items-center justify-center mb-8">
          <div className="p-1 bg-slate-800/80 rounded-2xl border border-slate-700 flex gap-2">
            <button
              onClick={() => {
                setSelectedRole('student');
                setIsCreatingStudent(false);
              }}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                selectedRole === 'student'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              학생 계정으로 로그인
            </button>
            <button
              onClick={() => setSelectedRole('teacher')}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                selectedRole === 'teacher'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              선생님으로 로그인
            </button>
          </div>
        </div>

        {/* Dynamic Card based on selected role */}
        {selectedRole === 'student' ? (
          /* STUDENT PORTAL CARD */
          <div className="bg-slate-900/90 rounded-3xl border border-indigo-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <GraduationCap className="w-4 h-4" />
                  학생 전용 맞춤 대시보드 로그인
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  내 학년·반과 A~D 블록 시간표를 연결합니다
                </h2>
              </div>
              <span className="text-[11px] text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full font-semibold">
                학생 모드
              </span>
            </div>

            {/* Existing Student Selector vs New Registration */}
            {!isCreatingStudent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    학생 프로필 선택 (시연용 사전 세팅 계정)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {students.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStudentId(st.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                          selectedStudentId === st.id
                            ? 'bg-indigo-600/20 border-indigo-400 ring-2 ring-indigo-500/40'
                            : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
                          {st.name.slice(0, 1)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-white text-sm">{st.name}</div>
                            <span className="text-[11px] text-indigo-300 font-medium">
                              {st.grade}학년 {st.classNum}반 {st.studentNum}번
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 truncate">
                            {st.courses.map((c) => `${c.block}:${c.subject}`).join(' · ')}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    학생 계정 로그인 후 바로 제공되는 기능:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-400">✓</span> A·B·C·D 블록 과목/교실 자유 편집
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-400">✓</span> 내 과목 D-day 및 교시 자동 계산
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-400">✓</span> 48시간 이내 긴급 준비물 점검
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingStudent(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-4 font-semibold"
                  >
                    + 내 이름과 반으로 새 계정 등록하기
                  </button>

                  <button
                    type="button"
                    onClick={() => onLoginAsStudent(selectedStudentId)}
                    className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>{students.find((s) => s.id === selectedStudentId)?.name || '학생'} 계정으로 시작하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* New Student Creation Form */
              <form onSubmit={handleCreateAndLoginStudent} className="space-y-4">
                <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 space-y-3">
                  <div className="font-bold text-white text-xs">새 학생 인적사항 입력</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">이름</label>
                      <input
                        type="text"
                        required
                        placeholder="예: 홍길동"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">학년</label>
                      <select
                        value={newGrade}
                        onChange={(e) => setNewGrade(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value={1}>1학년</option>
                        <option value={2}>2학년</option>
                        <option value={3}>3학년</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">반</label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        required
                        value={newClass}
                        onChange={(e) => setNewClass(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">번호</label>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        required
                        value={newNum}
                        onChange={(e) => setNewNum(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    * 로그인 후 A~D 블록별 선택과목과 교실을 자유롭게 수정할 수 있습니다.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingStudent(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ← 기존 프로필 선택으로 돌아가기
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
                  >
                    <span>새 학생 등록 및 로그인</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* TEACHER PORTAL CARD */
          <div className="bg-slate-900/90 rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <BookOpen className="w-4 h-4" />
                  교원 전용 수행평가 공지서 등록 포털
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  학교 수행평가 공지서 1회 작성으로 전교생 자동 매칭
                </h2>
              </div>
              <span className="text-[11px] text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full font-semibold">
                선생님 모드
              </span>
            </div>

            {/* Teacher Selection / Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  담당 선생님 선택 또는 직접 입력
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                  {['박물리 선생님 (물리Ⅱ)', '최생명 선생님 (생명과학Ⅱ)', '이화학 선생님 (화학Ⅱ)'].map(
                    (preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setTeacherName(preset.split(' ')[0] + ' ' + preset.split(' ')[1])}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                          teacherName.includes(preset.split(' ')[0])
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {preset}
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="선생님 성함 직접 입력 (예: 김교사)"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Teacher Passcode Security Verification */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    교원 보안 인증번호 (선생님 권한 확인)
                  </label>
                  <span className="text-[10px] text-slate-400">시연용 기본번호: 1234</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    maxLength={10}
                    value={teacherPasscode}
                    onChange={(e) => {
                      setTeacherPasscode(e.target.value);
                      setPasscodeError('');
                    }}
                    placeholder="교원 인증번호 4자리 (1234)"
                    className="w-full sm:w-48 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                  <span className="text-[11px] text-slate-400">
                    * 시연용 화면 구분이며 실제 보안 기능은 아닙니다
                  </span>
                </div>
                {passcodeError && (
                  <p className="text-xs text-rose-400 font-semibold">{passcodeError}</p>
                )}
              </div>

              {/* Teacher Features Checklist */}
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/60 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  선생님 포털에서 수행 가능한 작업:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400">✓</span> 학교 수행평가 공지서 원클릭 발행
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400">✓</span> 과목·블록·일자·D-DAY·준비물 설정
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400">✓</span> 학교 블록표 기반 교시 자동 역산 배정
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (teacherPasscode.trim() !== '1234' && teacherPasscode.trim() !== '0000' && teacherPasscode.trim() !== 'jungsan') {
                      setPasscodeError('교원 인증번호가 일치하지 않습니다. (시연용 기본 번호: 1234)');
                      return;
                    }
                    onLoginAsTeacher(teacherName);
                  }}
                  className="w-full sm:w-auto px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>{teacherName} 계정으로 공지 관리 접속</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto w-full text-center text-xs text-slate-500 border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10">
        <span>중산고등학교 2026 중산 솔버톤 (No.1 바이브 코딩 개발자)</span>
        <div className="flex items-center gap-3 text-slate-400">
          <span>대회일: 2026. 10. 31.(토) 09:00 - 17:00</span>
          <span>·</span>
          <span>주관: ICT기획부</span>
        </div>
      </div>
    </div>
  );
};
