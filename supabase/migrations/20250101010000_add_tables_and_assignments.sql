-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) 테이블 정보
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,              -- "Table 1", "Table A" 등
  capacity INTEGER NOT NULL,       -- 정원
  sort_order INTEGER NOT NULL,     -- 화면 표시 순서
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) 테이블 배정 정보
CREATE TABLE IF NOT EXISTS public.table_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.event_participants(id) ON DELETE CASCADE,
  seat_number INTEGER,             -- 선택: 테이블 내 좌석 번호
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) 유니크 제약
-- 한 참가자는 한 이벤트에서 하나의 테이블에만 배정 가능
ALTER TABLE public.table_assignments
  DROP CONSTRAINT IF EXISTS table_assignments_unique_participant;

ALTER TABLE public.table_assignments
  ADD CONSTRAINT table_assignments_unique_participant
  UNIQUE (event_id, participant_id);

-- 한 테이블 내에서 좌석 번호는 유니크 (null은 제외, PostgreSQL은 기본적으로 null을 유니크 제약에서 제외)
-- null이 아닌 경우에만 유니크 제약 적용
ALTER TABLE public.table_assignments
  DROP CONSTRAINT IF EXISTS table_assignments_unique_seat;

-- PostgreSQL에서는 null 값은 유니크 제약에서 자동으로 제외되므로, 일반 UNIQUE 제약으로 충분
-- 단, 동일한 table_id에 동일한 seat_number가 중복되지 않도록 함
CREATE UNIQUE INDEX IF NOT EXISTS idx_table_assignments_unique_seat
  ON public.table_assignments (table_id, seat_number)
  WHERE seat_number IS NOT NULL;

-- 4) 인덱스
CREATE INDEX IF NOT EXISTS idx_tables_event_id
  ON public.tables (event_id);

CREATE INDEX IF NOT EXISTS idx_table_assignments_event_id
  ON public.table_assignments (event_id);

CREATE INDEX IF NOT EXISTS idx_table_assignments_table_id
  ON public.table_assignments (table_id);

CREATE INDEX IF NOT EXISTS idx_table_assignments_participant_id
  ON public.table_assignments (participant_id);

-- 5) RLS 정책 (개발 단계: admin 전용)
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_assignments ENABLE ROW LEVEL SECURITY;

-- Admin만 접근 가능 (실제 운영 시에는 더 정교한 정책 필요)
CREATE POLICY "Admin can access tables" ON public.tables
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = tables.event_id
      -- 여기에 admin 권한 체크 로직 추가 가능
    )
  );

CREATE POLICY "Admin can access table_assignments" ON public.table_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = table_assignments.event_id
      -- 여기에 admin 권한 체크 로직 추가 가능
    )
  );

-- Comments
COMMENT ON TABLE public.tables IS '이벤트별 테이블 정보';
COMMENT ON TABLE public.table_assignments IS '테이블 배정 정보';
COMMENT ON COLUMN public.tables.capacity IS '테이블 정원';
COMMENT ON COLUMN public.tables.sort_order IS '화면 표시 순서';
COMMENT ON COLUMN public.table_assignments.seat_number IS '테이블 내 좌석 번호 (null 허용)';

