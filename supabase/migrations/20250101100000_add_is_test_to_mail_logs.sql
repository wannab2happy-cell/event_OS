-- Add is_test field to mail_logs table
ALTER TABLE public.mail_logs
ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.mail_logs.is_test IS '테스트 발송 여부';

