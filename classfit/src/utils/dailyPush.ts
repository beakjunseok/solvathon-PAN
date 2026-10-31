import { MatchedAssessment, StudentProfile } from '../types';

const VAPID_PUBLIC_KEY = 'BJLWfSETk_fp_NOX_91FOb_taVwcY74GzILKCVKA_a2aN0cPMb5XqNgT4bOKwSQo2-oiIawFDYkUnzA5iNaBrm0';
const ENABLED_KEY = 'classfit_daily_push_enabled';
const NOTIFICATION_TAG = 'classfit-dday';

export const isDailyPushSupported =
  'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

function toKeyBytes(key: string): Uint8Array {
  const base64 = key.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

function toProfile(student: StudentProfile) {
  return {
    grade: student.grade,
    classNum: student.classNum,
    courses: student.courses,
    completedAssessments: student.completedAssessments,
  };
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register('/sw.js');
  return navigator.serviceWorker.ready;
}

async function sendSubscription(method: 'POST' | 'DELETE', subscription: PushSubscription, student?: StudentProfile) {
  const response = await fetch('/api/push-subscribe', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      profile: student ? toProfile(student) : undefined,
    }),
  });
  if (!response.ok) throw new Error('알림 설정을 저장하지 못했습니다.');
}

export function isDailyPushEnabled(): boolean {
  try {
    return localStorage.getItem(ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

function setDailyPushEnabled(enabled: boolean): void {
  try {
    if (enabled) localStorage.setItem(ENABLED_KEY, 'true');
    else localStorage.removeItem(ENABLED_KEY);
  } catch {
    // 저장에 실패해도 서버 구독은 유지된다.
  }
}

export async function enableDailyPush(student: StudentProfile): Promise<void> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('브라우저 설정에서 알림을 허용해 주세요.');

  const registration = await getRegistration();
  const subscription =
    (await registration.pushManager.getSubscription()) ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toKeyBytes(VAPID_PUBLIC_KEY),
    }));
  await sendSubscription('POST', subscription, student);
  setDailyPushEnabled(true);
}

export async function disableDailyPush(): Promise<void> {
  const registration = await getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await sendSubscription('DELETE', subscription);
    await subscription.unsubscribe();
  }
  setDailyPushEnabled(false);
  const shown = await registration.getNotifications({ tag: NOTIFICATION_TAG });
  shown.forEach((notification) => notification.close());
}

// 앱을 열 때마다 서버 정보와 표시 중인 알림을 최신 상태로 맞춘다.
export async function refreshDailyPush(
  student: StudentProfile,
  closest: MatchedAssessment | null | undefined
): Promise<void> {
  if (!isDailyPushSupported || !isDailyPushEnabled() || Notification.permission !== 'granted') return;

  const registration = await getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) await sendSubscription('POST', subscription, student);

  const days = closest?.daysRemaining ?? -1;
  const hasNext = Boolean(closest) && !closest?.isCompleted && days >= 0;
  const title = hasNext
    ? `${days === 0 ? 'D-Day' : `D-${days}`} ${closest?.subject} 수행평가`
    : '수행알리미';
  const body = hasNext
    ? [closest?.title, closest?.studentRoom].filter(Boolean).join('\n')
    : '예정된 수행평가가 없습니다.';

  await registration.showNotification(title, {
    body,
    tag: NOTIFICATION_TAG,
    icon: '/assets/aistudio/images_0069c149.png',
    requireInteraction: true,
    silent: true,
  });
}
