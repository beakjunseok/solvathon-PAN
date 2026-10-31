import { createHmac, timingSafeEqual } from 'node:crypto';

const TOKEN_DAYS = 30;

function sign(payload) {
  return createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url');
}

export function createToken(account) {
  const payload = Buffer.from(
    JSON.stringify({
      id: account.id,
      role: account.role,
      exp: Date.now() + TOKEN_DAYS * 24 * 60 * 60 * 1000,
    })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function readToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature || '');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  return data.exp > Date.now() ? data : null;
}
