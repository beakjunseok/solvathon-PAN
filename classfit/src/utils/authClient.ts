import { StudentProfile } from '../types';

export interface AuthSession {
  token: string;
  id: string;
  role: 'student' | 'teacher';
  name: string;
  profile: StudentProfile | null;
}

const SESSION_KEY = 'classfit_session_v1';

async function post<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || '요청을 처리하지 못했습니다.');
  return result;
}

export function readSession(): AuthSession | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function writeSession(session: AuthSession | null): void {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // 저장에 실패하면 새로고침 후 다시 로그인한다.
  }
}

export function authenticate(body: Record<string, unknown>): Promise<AuthSession> {
  return post<AuthSession>(body);
}

export function verifySession(token: string): Promise<AuthSession> {
  return post<AuthSession>({ action: 'me', token });
}

export async function saveRemoteProfile(token: string, profile: StudentProfile): Promise<void> {
  await post({ action: 'save-profile', token, profile });
}

export async function fetchStudentAccounts(token: string): Promise<StudentProfile[]> {
  const result = await post<{ students: StudentProfile[] }>({ action: 'list-students', token });
  return result.students;
}
