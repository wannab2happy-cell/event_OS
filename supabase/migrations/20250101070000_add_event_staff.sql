-- event_staff 테이블 생성
-- 이벤트별 스태프 권한 매핑 테이블

create table if not exists public.event_staff (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'staff', -- 'staff' | 'lead'
  created_at timestamptz default now()
);

-- 유니크 제약: 한 이벤트에 같은 유저는 한 번만 할당 가능
create unique index if not exists idx_event_staff_unique
  on public.event_staff (event_id, user_id);

-- 인덱스 추가
create index if not exists idx_event_staff_event_id on public.event_staff (event_id);
create index if not exists idx_event_staff_user_id on public.event_staff (user_id);

-- 코멘트
comment on table public.event_staff is '이벤트별 스태프 권한 매핑 테이블';
comment on column public.event_staff.role is 'staff 또는 lead 역할';

-- RLS 정책 (Admin 전용 접근)
-- Admin은 service_role로 접근하므로 RLS는 우선 비활성화
-- 필요 시 이벤트별 스태프만 자신의 이벤트에 접근하도록 RLS 정책 추가 가능
alter table public.event_staff enable row level security;

-- 기본 정책: Admin만 접근 가능 (service_role 사용)
create policy "Admin can manage event_staff"
  on public.event_staff
  for all
  using (true)
  with check (true);

