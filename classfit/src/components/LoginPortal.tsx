import React, { useState } from 'react';
import { AuthSession, authenticate } from '../utils/authClient';
import { JungsanLogo } from './JungsanLogo';
import { SubjectChooser } from './SubjectChooser';

interface LoginPortalProps {
  onLoggedIn: (session: AuthSession) => void;
}

type Role = 'student' | 'teacher';

const INPUT_CLASS =
  'w-full min-h-11 px-3 py-2 bg-white border border-slate-300 rounded-xl text-base sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none';

export const LoginPortal: React.FC<LoginPortalProps> = ({ onLoggedIn }) => {
  const [role, setRole] = useState<Role>('student');
  const [isSignup, setIsSignup] = useState(false);
  const [studentNumber, setStudentNumber] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [signupCode, setSignupCode] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSelectRole = (next: Role) => {
    setRole(next);
    setError('');
    setPassword('');
    setPasswordCheck('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignup && password !== passwordCheck) {
      setError('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (isSignup && role === 'teacher' && subjects.length === 0) {
      setError('담당 과목을 하나 이상 골라 주세요.');
      return;
    }

    const action = !isSignup ? 'login' : role === 'student' ? 'signup-student' : 'signup-teacher';
    setIsBusy(true);
    try {
      onLoggedIn(await authenticate({ action, role, studentNumber, name, password, signupCode, subjects }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인하지 못했습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="text-center space-y-2">
          <JungsanLogo size={48} className="mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">수행알리미</h1>
          <p className="text-sm text-slate-500">{isSignup ? '처음 사용하시면 가입해 주세요.' : '중산고등학교 계정으로 로그인하세요.'}</p>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl" role="tablist">
          {(['student', 'teacher'] as Role[]).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={role === item}
              onClick={() => handleSelectRole(item)}
              className={`min-h-10 rounded-lg text-sm font-semibold transition-colors ${
                role === item ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              {item === 'student' ? '학생' : '선생님'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {role === 'student' && (
            <label className="block text-sm font-medium text-slate-700">
              학번
              <input
                required
                inputMode="numeric"
                pattern="[123][0-9]{4}"
                maxLength={5}
                autoComplete="username"
                placeholder="예: 20510"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value.replace(/\D/g, ''))}
                className={`${INPUT_CLASS} mt-1`}
              />
            </label>
          )}

          <label className="block text-sm font-medium text-slate-700">
            {role === 'student' ? '이름' : '성함'}
            <input
              required
              autoComplete={role === 'student' ? 'name' : 'username'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${INPUT_CLASS} mt-1`}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            비밀번호
            <input
              required
              type="password"
              minLength={isSignup ? 6 : undefined}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${INPUT_CLASS} mt-1`}
            />
          </label>

          {isSignup && (
            <label className="block text-sm font-medium text-slate-700">
              비밀번호 확인
              <input
                required
                type="password"
                autoComplete="new-password"
                value={passwordCheck}
                onChange={(e) => setPasswordCheck(e.target.value)}
                className={`${INPUT_CLASS} mt-1`}
              />
            </label>
          )}

          {isSignup && role === 'teacher' && (
            <label className="block text-sm font-medium text-slate-700">
              교사 등록 코드
              <input
                required
                type="password"
                autoComplete="off"
                value={signupCode}
                onChange={(e) => setSignupCode(e.target.value)}
                className={`${INPUT_CLASS} mt-1`}
              />
            </label>
          )}

          {isSignup && role === 'teacher' && (
            <div className="text-sm font-medium text-slate-700 space-y-1.5">
              <p>담당 과목 (여러 개 선택 가능)</p>
              <SubjectChooser value={subjects} onChange={setSubjects} />
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm font-semibold text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="w-full min-h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors"
          >
            {isBusy ? '처리 중입니다' : isSignup ? '가입하기' : '로그인'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignup(!isSignup);
            setError('');
          }}
          className="w-full text-sm font-semibold text-indigo-700"
        >
          {isSignup ? '이미 계정이 있습니다' : '처음이신가요? 가입하기'}
        </button>
      </div>
    </div>
  );
};
