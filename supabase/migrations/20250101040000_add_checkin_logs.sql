-- 1) checkin_logs 테이블 생성
CREATE TABLE IF NOT EXISTS public.checkin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.event_participants(id) ON DELETE CASCADE,
  scanned_by TEXT,              -- 스캐너 사용 관리자 이메일/이름
  source TEXT,                  -- 'admin_scanner', 'kiosk', 등
  is_duplicate BOOLEAN DEFAULT FALSE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_checkin_logs_event_id
  ON public.checkin_logs (event_id);

CREATE INDEX IF NOT EXISTS idx_checkin_logs_participant_id
  ON public.checkin_logs (participant_id);

CREATE INDEX IF NOT EXISTS idx_checkin_logs_created_at
  ON public.checkin_logs (created_at DESC);

-- 3) event_participants 테이블 확장 (체크인 상태)
ALTER TABLE public.event_participants
  ADD COLUMN IF NOT EXISTS is_checked_in BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

-- 4) 인덱스 생성 (체크인 상태 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_event_participants_checked_in
  ON public.event_participants (event_id, is_checked_in)
  WHERE is_checked_in = TRUE;

-- 5) Comments
COMMENT ON TABLE public.checkin_logs IS '체크인 로그 테이블';
COMMENT ON COLUMN public.checkin_logs.scanned_by IS '스캐너를 사용한 관리자 이메일/이름';
COMMENT ON COLUMN public.checkin_logs.source IS '체크인 소스 (admin_scanner, kiosk 등)';
COMMENT ON COLUMN public.checkin_logs.is_duplicate IS '중복 체크인 여부';
COMMENT ON COLUMN public.event_participants.is_checked_in IS '체크인 완료 여부';
COMMENT ON COLUMN public.event_participants.checked_in_at IS '체크인 완료 시각';

