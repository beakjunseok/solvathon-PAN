/// <reference types="vite/client" />
import { Assessment } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isRemoteConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase is not configured');
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`);
  }
  return response;
}

export async function fetchRemoteAssessments(): Promise<Assessment[]> {
  const response = await request('assessments?select=data&order=created_at.desc');
  const rows: Array<{ data: Assessment }> = await response.json();
  return rows.map((row) => row.data);
}

export async function upsertRemoteAssessments(assessments: Assessment[]): Promise<void> {
  await request('assessments', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(assessments.map((a) => ({ id: a.id, data: a }))),
  });
}

export async function deleteRemoteAssessment(id: string): Promise<void> {
  await request(`assessments?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
}
