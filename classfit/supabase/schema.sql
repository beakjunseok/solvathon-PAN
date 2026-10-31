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
