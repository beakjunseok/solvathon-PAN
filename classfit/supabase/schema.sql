-- Supabase 대시보드의 SQL Editor에서 한 번 실행합니다.
create table if not exists public.assessments (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.assessments enable row level security;

-- 시연용 정책: 로그인이 없어 키를 가진 누구나 읽고 쓸 수 있습니다.
-- 실제 운영 전에는 교사 인증을 추가하고 쓰기 정책을 좁혀야 합니다.
create policy "assessments demo read" on public.assessments
  for select to anon using (true);
create policy "assessments demo insert" on public.assessments
  for insert to anon with check (true);
create policy "assessments demo update" on public.assessments
  for update to anon using (true) with check (true);
create policy "assessments demo delete" on public.assessments
  for delete to anon using (true);

create table if not exists public.submissions (
  id text primary key,
  assessment_id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists submissions_assessment_id on public.submissions (assessment_id);

alter table public.submissions enable row level security;

-- 시연용 정책: 제출물도 키를 가진 누구나 읽고 쓸 수 있으므로 실제 학생 과제를 넣으면 안 됩니다.
create policy "submissions demo read" on public.submissions
  for select to anon using (true);
create policy "submissions demo insert" on public.submissions
  for insert to anon with check (true);
create policy "submissions demo update" on public.submissions
  for update to anon using (true) with check (true);

-- 평가 문서와 제출 파일 저장소 (파일당 20MB)
insert into storage.buckets (id, name, public, file_size_limit)
values ('classfit-files', 'classfit-files', true, 20971520)
on conflict (id) do nothing;

create policy "classfit files demo read" on storage.objects
  for select to anon using (bucket_id = 'classfit-files');
create policy "classfit files demo upload" on storage.objects
  for insert to anon with check (bucket_id = 'classfit-files');

-- 푸시 구독: 공개 키 정책을 만들지 않아 서버 전용 키로만 접근할 수 있습니다.
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  subscription jsonb not null,
  profile jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

-- 교사가 고친 블록 위치와 시간표. 로그인이 없어 시연용 정책입니다.
create table if not exists public.school_settings (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.school_settings enable row level security;

create policy "school settings demo read" on public.school_settings
  for select to anon using (true);
create policy "school settings demo insert" on public.school_settings
  for insert to anon with check (true);
create policy "school settings demo update" on public.school_settings
  for update to anon using (true) with check (true);
