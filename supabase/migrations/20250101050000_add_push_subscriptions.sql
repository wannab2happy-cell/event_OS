-- Push subscriptions 테이블 생성
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.event_participants(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,  -- 브라우저에서 받은 Web Push Subscription 전체 JSON
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_event
  ON public.push_subscriptions (event_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_participant
  ON public.push_subscriptions (participant_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at
  ON public.push_subscriptions (created_at DESC);

-- Comments
COMMENT ON TABLE public.push_subscriptions IS 'Web Push 구독 정보';
COMMENT ON COLUMN public.push_subscriptions.subscription IS '브라우저 PushSubscription 객체 전체 JSON';
COMMENT ON COLUMN public.push_subscriptions.user_agent IS '등록한 브라우저 User Agent';

