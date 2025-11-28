-- Add VIP fields to event_participants table
ALTER TABLE public.event_participants
  ADD COLUMN IF NOT EXISTS vip_level INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS guest_of UUID REFERENCES public.event_participants(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS vip_note TEXT;

-- Index for VIP queries
CREATE INDEX IF NOT EXISTS idx_event_participants_vip_level
  ON public.event_participants (event_id, vip_level)
  WHERE vip_level > 0;

CREATE INDEX IF NOT EXISTS idx_event_participants_guest_of
  ON public.event_participants (guest_of)
  WHERE guest_of IS NOT NULL;

-- Comments
COMMENT ON COLUMN public.event_participants.vip_level IS 'VIP 등급 (0: 일반, 1-3: VIP 등급)';
COMMENT ON COLUMN public.event_participants.guest_of IS '동반자로 참석하는 경우, 주인 VIP의 participant_id';
COMMENT ON COLUMN public.event_participants.vip_note IS 'VIP 관련 비고 사항';

