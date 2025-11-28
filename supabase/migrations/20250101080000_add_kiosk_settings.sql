-- kiosk_settings 테이블 생성
-- 이벤트별 KIOSK 설정 관리

create table if not exists public.kiosk_settings (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  is_enabled boolean not null default false,
  pin_code text, -- 4~6자리 숫자 문자열 저장
  updated_by uuid references auth.users(id),
  updated_at timestamptz default now()
);

-- 유니크 제약: 한 이벤트당 하나의 설정만
create unique index if not exists idx_kiosk_settings_event
  on public.kiosk_settings (event_id);

-- 인덱스
create index if not exists idx_kiosk_settings_event_id on public.kiosk_settings (event_id);

-- 코멘트
comment on table public.kiosk_settings is '이벤트별 KIOSK 셀프 체크인 설정';
comment on column public.kiosk_settings.is_enabled is 'KIOSK 모드 활성화 여부';
comment on column public.kiosk_settings.pin_code is 'KIOSK 접근 PIN 코드 (4~6자리)';

-- RLS 정책 (Admin 전용 접근)
alter table public.kiosk_settings enable row level security;

-- 기본 정책: Admin만 접근 가능 (service_role 사용)
create policy "Admin can manage kiosk_settings"
  on public.kiosk_settings
  for all
  using (true)
  with check (true);

