import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { supabaseRequest } from './_supabase.js';

const TOKEN_DAYS = 30;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 10;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PROFILE_BYTES = 200000;
const LOGIN_ERROR = '입력한 정보가 맞지 않습니다.';

function hashPassword(password, salt) {
  return scryptSync(password, salt, 64).toString('hex');
}

function sign(payload) {
  return createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url');
}

function createToken(account) {
  const payload = Buffer.from(
    JSON.stringify({
      id: account.id,
      role: account.role,
      exp: Date.now() + TOKEN_DAYS * 24 * 60 * 60 * 1000,
    })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function readToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature || '');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  return data.exp > Date.now() ? data : null;
}

function parseStudentNumber(value) {
  const match = /^([123])(\d{2})(\d{2})$/.exec(String(value || ''));
  if (!match) return null;
  const [grade, classNum, studentNum] = match.slice(1).map(Number);
  if (classNum < 1 || classNum > 15 || studentNum < 1 || studentNum > 50) return null;
  return { grade, classNum, studentNum };
}

function asName(value) {
  return typeof value === 'string' ? value.trim().slice(0, 20) : '';
}

async function findAccount(loginKey) {
  const response = await supabaseRequest(
    `accounts?select=*&login_key=eq.${encodeURIComponent(loginKey)}`
  );
  return (await response.json())[0] || null;
}

async function findAccountById(id) {
  const response = await supabaseRequest(`accounts?select=*&id=eq.${encodeURIComponent(id)}`);
  return (await response.json())[0] || null;
}

async function updateAccount(id, values) {
  await supabaseRequest(`accounts?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  });
}

async function createAccount(values) {
  const salt = randomBytes(16).toString('hex');
  const { password, ...rest } = values;
  const response = await supabaseRequest('accounts', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...rest, salt, password_hash: hashPassword(password, salt) }),
  });
  return (await response.json())[0];
}

function toSession(account) {
  return {
    token: createToken(account),
    id: account.id,
    role: account.role,
    name: account.name,
    profile: account.role === 'student' ? { ...account.profile, id: account.id } : null,
  };
}

async function signupStudent(body) {
  const number = parseStudentNumber(body.studentNumber);
  const name = asName(body.name);
  if (!number || !name) return [400, { error: '학번 5자리와 이름을 확인해 주세요.' }];

  const loginKey = `student:${body.studentNumber}`;
  if (await findAccount(loginKey)) return [409, { error: '이미 가입된 학번입니다.' }];

  const account = await createAccount({
    login_key: loginKey,
    role: 'student',
    name,
    password: body.password,
    profile: {
      name,
      ...number,
      avatarColor: 'indigo',
      courses: [],
      checkedSupplies: {},
      completedAssessments: [],
    },
  });
  return [200, toSession(account)];
}

async function signupTeacher(body) {
  const name = asName(body.name);
  if (!name) return [400, { error: '성함을 입력해 주세요.' }];
  if (!process.env.TEACHER_SIGNUP_CODE || body.signupCode !== process.env.TEACHER_SIGNUP_CODE) {
    return [403, { error: '교사 등록 코드가 맞지 않습니다.' }];
  }

  const loginKey = `teacher:${name}`;
  if (await findAccount(loginKey)) return [409, { error: '이미 등록된 성함입니다.' }];

  const account = await createAccount({
    login_key: loginKey,
    role: 'teacher',
    name,
    password: body.password,
    profile: {},
  });
  return [200, toSession(account)];
}

async function login(body) {
  const isStudent = body.role === 'student';
  const name = asName(body.name);
  const loginKey = isStudent ? `student:${body.studentNumber}` : `teacher:${name}`;
  const account = await findAccount(loginKey);

  if (account?.locked_until && Date.parse(account.locked_until) > Date.now()) {
    return [429, { error: `로그인을 ${LOCK_MINUTES}분 동안 쉬었다가 다시 시도해 주세요.` }];
  }

  // 없는 계정에도 해시를 계산해 응답 시간으로 계정 유무를 알 수 없게 한다.
  const hash = hashPassword(String(body.password), account?.salt || 'no-account');
  const isMatch =
    account &&
    account.name === name &&
    timingSafeEqual(Buffer.from(hash), Buffer.from(account.password_hash));

  if (!isMatch) {
    if (account) {
      const failed = (account.failed_attempts || 0) + 1;
      await updateAccount(account.id, {
        failed_attempts: failed >= MAX_FAILED_ATTEMPTS ? 0 : failed,
        locked_until: failed >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() : null,
      });
    }
    return [401, { error: LOGIN_ERROR }];
  }

  await updateAccount(account.id, { failed_attempts: 0, locked_until: null });
  return [200, toSession(account)];
}

async function me(user) {
  const account = await findAccountById(user.id);
  return account ? [200, toSession(account)] : [401, { error: '다시 로그인해 주세요.' }];
}

async function saveProfile(user, profile) {
  if (user.role !== 'student') return [403, { error: '권한이 없습니다.' }];
  const size = JSON.stringify(profile || null).length;
  if (!profile || typeof profile !== 'object' || size > MAX_PROFILE_BYTES) {
    return [400, { error: '저장할 정보가 올바르지 않습니다.' }];
  }

  const account = await findAccountById(user.id);
  if (!account) return [401, { error: '다시 로그인해 주세요.' }];

  // 학번과 이름은 계정 정보이므로 학생이 임의로 바꿀 수 없다.
  await updateAccount(user.id, {
    profile: {
      ...account.profile,
      courses: profile.courses,
      checkedSupplies: profile.checkedSupplies,
      completedAssessments: profile.completedAssessments,
    },
  });
  return [200, { ok: true }];
}

async function listStudents(user) {
  if (user.role !== 'teacher') return [403, { error: '권한이 없습니다.' }];
  const response = await supabaseRequest('accounts?select=id,name,profile&role=eq.student&order=login_key');
  const rows = await response.json();
  return [200, { students: rows.map((row) => ({ ...row.profile, id: row.id, name: row.name })) }];
}

async function route(body) {
  const { action, token } = body;

  if (['login', 'signup-student', 'signup-teacher'].includes(action)) {
    if (typeof body.password !== 'string' || body.password.length > 100) {
      return [400, { error: LOGIN_ERROR }];
    }
    if (action === 'login') return login(body);
    if (body.password.length < MIN_PASSWORD_LENGTH) {
      return [400, { error: `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.` }];
    }
    return action === 'signup-student' ? signupStudent(body) : signupTeacher(body);
  }

  const user = readToken(token);
  if (!user) return [401, { error: '다시 로그인해 주세요.' }];
  if (action === 'me') return me(user);
  if (action === 'save-profile') return saveProfile(user, body.profile);
  if (action === 'list-students') return listStudents(user);
  return [400, { error: '알 수 없는 요청입니다.' }];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST만 사용할 수 있습니다.' });
    return;
  }
  if (!process.env.AUTH_SECRET) {
    res.status(503).json({ error: '로그인 서버 설정이 끝나지 않았습니다.' });
    return;
  }

  try {
    const [status, result] = await route(req.body || {});
    res.status(status).json(result);
  } catch (err) {
    console.error('Auth failed', err);
    res.status(500).json({ error: '로그인을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.' });
  }
}
