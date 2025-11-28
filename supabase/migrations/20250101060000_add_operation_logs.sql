-- 운영 로그 테이블 생성
CREATE TABLE IF NOT EXISTS public.operation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  type TEXT NOT NULL,  -- 'info_update', 'checkin', 'vip_update', 'broadcast', 'subscription', etc.
  message TEXT NOT NULL,
  actor TEXT,  -- 운영자 이메일/이름
  metadata JSONB,  -- 추가 정보 (participant_id, details 등)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_operation_logs_event_id
  ON public.operation_logs (event_id);

CREATE INDEX IF NOT EXISTS idx_operation_logs_type
  ON public.operation_logs (event_id, type);

CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at
  ON public.operation_logs (created_at DESC);

-- Comments
COMMENT ON TABLE public.operation_logs IS '이벤트 운영 로그';
COMMENT ON COLUMN public.operation_logs.type IS '로그 타입 (info_update, checkin, vip_update, broadcast, subscription 등)';
COMMENT ON COLUMN public.operation_logs.message IS '로그 메시지';
COMMENT ON COLUMN public.operation_logs.actor IS '작업 수행자 (운영자 이메일/이름)';
COMMENT ON COLUMN public.operation_logs.metadata IS '추가 정보 (JSON)';

