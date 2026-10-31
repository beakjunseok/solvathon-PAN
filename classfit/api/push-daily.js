import webpush from 'web-push';
import { supabaseRequest } from './_supabase.js';

const VAPID_PUBLIC_KEY = 'BJLWfSETk_fp_NOX_91FOb_taVwcY74GzILKCVKA_a2aN0cPMb5XqNgT4bOKwSQo2-oiIawFDYkUnzA5iNaBrm0';
const VAPID_CONTACT = 'https://classfit-nine.vercel.app/';
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getTodayInKorea() {
  return new Date(Date.now() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function daysBetween(today, date) {
  return Math.round((Date.parse(date) - Date.parse(today)) / MS_PER_DAY);
}

function findCourse(assessment, profile) {
  return profile.courses.find(
    (course) =>
      course.block === assessment.block &&
      (course.subject.includes(assessment.subject) || assessment.subject.includes(course.subject))
  );
}

function isForStudent(assessment, profile) {
  if (assessment.targetGrade !== profile.grade) return false;
  return assessment.block === 'COMMON' || Boolean(findCourse(assessment, profile));
}

function buildMessage(assessments, profile, today) {
  const next = assessments
    .filter((a) => isForStudent(a, profile))
    .filter((a) => !profile.completedAssessments.includes(a.id))
    .map((a) => ({ ...a, days: daysBetween(today, a.date) }))
    .filter((a) => a.days >= 0)
    .sort((a, b) => a.days - b.days)[0];

  if (!next) {
    return { title: '수행알리미', body: '예정된 수행평가가 없습니다.' };
  }

  const dDay = next.days === 0 ? 'D-Day' : `D-${next.days}`;
  const room = findCourse(next, profile)?.room;
  const details = [next.title, room, next.supplies?.length ? `준비물: ${next.supplies.join(', ')}` : '']
    .filter(Boolean)
    .join('\n');
  return { title: `${dDay} ${next.subject} 수행평가`, body: details };
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).json({ error: '권한이 없습니다.' });
    return;
  }

  try {
    webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

    const today = getTodayInKorea();
    const [assessmentRows, subscriptions] = await Promise.all([
      supabaseRequest('assessments?select=data').then((r) => r.json()),
      supabaseRequest('push_subscriptions?select=endpoint,subscription,profile').then((r) => r.json()),
    ]);
    const assessments = assessmentRows.map((row) => row.data);

    let sent = 0;
    let removed = 0;
    await Promise.all(
      subscriptions.map(async (row) => {
        try {
          const message = buildMessage(assessments, row.profile, today);
          await webpush.sendNotification(row.subscription, JSON.stringify(message));
          sent += 1;
        } catch (err) {
          // 브라우저에서 알림을 끈 구독은 다시 보내지 않도록 지운다.
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabaseRequest(`push_subscriptions?endpoint=eq.${encodeURIComponent(row.endpoint)}`, {
              method: 'DELETE',
            });
            removed += 1;
          } else {
            console.error('Push send failed', err.statusCode);
          }
        }
      })
    );

    res.status(200).json({ total: subscriptions.length, sent, removed });
  } catch (err) {
    console.error('Daily push failed', err);
    res.status(500).json({ error: '알림을 보내지 못했습니다.' });
  }
}
