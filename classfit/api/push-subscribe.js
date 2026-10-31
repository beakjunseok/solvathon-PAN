import { supabaseRequest } from './_supabase.js';

const MAX_PROFILE_COURSES = 12;

function cleanProfile(profile) {
  if (!profile || ![1, 2, 3].includes(profile.grade) || !Array.isArray(profile.courses)) return null;
  return {
    grade: profile.grade,
    classNum: Number(profile.classNum) || 0,
    courses: profile.courses.slice(0, MAX_PROFILE_COURSES).map((course) => ({
      block: String(course.block).slice(0, 10),
      subject: String(course.subject).slice(0, 50),
      room: String(course.room || '').slice(0, 100),
    })),
    completedAssessments: Array.isArray(profile.completedAssessments)
      ? profile.completedAssessments.map(String).slice(0, 500)
      : [],
  };
}

export default async function handler(req, res) {
  const { subscription, profile } = req.body || {};
  const endpoint = subscription?.endpoint;
  const isPushUrl = typeof endpoint === 'string' && endpoint.startsWith('https://');

  if (!isPushUrl) {
    res.status(400).json({ error: '구독 정보가 올바르지 않습니다.' });
    return;
  }

  try {
    if (req.method === 'DELETE') {
      await supabaseRequest(`push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, {
        method: 'DELETE',
      });
      res.status(200).json({ ok: true });
      return;
    }

    const cleaned = cleanProfile(profile);
    if (req.method !== 'POST' || !cleaned || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      res.status(400).json({ error: '구독 정보가 올바르지 않습니다.' });
      return;
    }

    await supabaseRequest('push_subscriptions', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ endpoint, subscription, profile: cleaned }),
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Push subscription failed', err);
    res.status(502).json({ error: '알림을 설정하지 못했습니다.' });
  }
}
