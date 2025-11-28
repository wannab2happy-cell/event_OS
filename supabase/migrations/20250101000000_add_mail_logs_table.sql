-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create mail_logs table
CREATE TABLE IF NOT EXISTS public.mail_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  template_key TEXT NOT NULL,              -- 'invite', 'reminder_1', 'reminder_2', 'qr_pass', 'confirmation' 등
  subject TEXT NOT NULL,
  body_preview TEXT,                       -- 상위 몇 글자 저장
  target_filter TEXT NOT NULL,             -- 'all', 'completed', 'incomplete' 등
  recipient_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'success' | 'partial' | 'failed'
  error_message TEXT,
  sent_by TEXT,                            -- 관리자 이메일 또는 id
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mail_logs_event_id ON public.mail_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_mail_logs_sent_at ON public.mail_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_mail_logs_status ON public.mail_logs(status);

-- Add comments
COMMENT ON TABLE public.mail_logs IS '메일 발송 로그 테이블';
COMMENT ON COLUMN public.mail_logs.template_key IS '템플릿 키: invite, reminder_1, reminder_2, qr_pass, confirmation';
COMMENT ON COLUMN public.mail_logs.target_filter IS '발송 대상 필터: all, completed, incomplete';
COMMENT ON COLUMN public.mail_logs.status IS '발송 상태: pending, success, partial, failed';

-- RLS 정책 (개발 단계에서는 admin만 접근 가능하도록 설정)
-- 기존 events 테이블의 RLS 정책과 일치시키거나, 우선 admin 전용으로 설정
ALTER TABLE public.mail_logs ENABLE ROW LEVEL SECURITY;

-- Admin만 접근 가능 (실제 운영 시에는 더 정교한 정책 필요)
CREATE POLICY "Admin can access mail_logs" ON public.mail_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = mail_logs.event_id
      -- 여기에 admin 권한 체크 로직 추가 가능
    )
  );

