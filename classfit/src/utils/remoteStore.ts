/// <reference types="vite/client" />
import { Assessment, FileRef, Submission } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const FILE_BUCKET = 'classfit-files';

export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = [
  'pdf', 'hwp', 'hwpx', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png',
];
export const FILE_ACCEPT = ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',');

export const isRemoteConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase is not configured');
  }
  const response = await fetch(`${SUPABASE_URL}/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      ...init.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`);
  }
  return response;
}

const JSON_HEADER = { 'Content-Type': 'application/json' };
const UPSERT_HEADERS = { ...JSON_HEADER, Prefer: 'resolution=merge-duplicates,return=minimal' };

export async function fetchRemoteAssessments(): Promise<Assessment[]> {
  const response = await request('rest/v1/assessments?select=data&order=created_at.desc');
  const rows: Array<{ data: Assessment }> = await response.json();
  return rows.map((row) => row.data);
}

export async function upsertRemoteAssessments(assessments: Assessment[]): Promise<void> {
  await request('rest/v1/assessments', {
    method: 'POST',
    headers: UPSERT_HEADERS,
    body: JSON.stringify(assessments.map((a) => ({ id: a.id, data: a }))),
  });
}

export async function deleteRemoteAssessment(id: string): Promise<void> {
  await request(`rest/v1/assessments?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function fetchRemoteSubmissions(assessmentId?: string): Promise<Submission[]> {
  const filter = assessmentId ? `&assessment_id=eq.${encodeURIComponent(assessmentId)}` : '';
  const response = await request(`rest/v1/submissions?select=data${filter}`);
  const rows: Array<{ data: Submission }> = await response.json();
  return rows.map((row) => row.data);
}

export async function upsertRemoteSubmission(submission: Submission): Promise<void> {
  await request('rest/v1/submissions', {
    method: 'POST',
    headers: UPSERT_HEADERS,
    body: JSON.stringify({
      id: submission.id,
      assessment_id: submission.assessmentId,
      data: submission,
    }),
  });
}

export function validateFile(file: File): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return `${file.name}: 올릴 수 없는 형식입니다.`;
  }
  if (file.size > MAX_FILE_BYTES) {
    return `${file.name}: 20MB를 넘는 파일은 올릴 수 없습니다.`;
  }
  return null;
}

// 저장소 경로에는 한글을 쓸 수 없어 영문 경로로 저장하고, 표시 이름은 따로 보관한다.
export async function uploadFile(folder: string, file: File, displayName = file.name): Promise<FileRef> {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  await request(`storage/v1/object/${FILE_BUCKET}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  return { name: displayName, path, size: file.size };
}

export function getFileUrl(file: FileRef): string {
  const name = encodeURIComponent(file.name);
  return `${SUPABASE_URL}/storage/v1/object/public/${FILE_BUCKET}/${file.path}?download=${name}`;
}
