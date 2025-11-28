-- Add additional fields to events table for event creation and cloning
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS hero_tagline TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT,
  ADD COLUMN IF NOT EXISTS secondary_color TEXT,
  ADD COLUMN IF NOT EXISTS venue_name TEXT,
  ADD COLUMN IF NOT EXISTS venue_address TEXT,
  ADD COLUMN IF NOT EXISTS venue_latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS venue_longitude DECIMAL(11, 8);

-- Comments
COMMENT ON COLUMN public.events.hero_tagline IS 'Hero 섹션에 표시될 태그라인';
COMMENT ON COLUMN public.events.primary_color IS 'Primary 색상 (hex 코드)';
COMMENT ON COLUMN public.events.secondary_color IS 'Secondary 색상 (hex 코드, 선택)';
COMMENT ON COLUMN public.events.venue_name IS '장소명';
COMMENT ON COLUMN public.events.venue_address IS '장소 주소';
COMMENT ON COLUMN public.events.venue_latitude IS '장소 위도';
COMMENT ON COLUMN public.events.venue_longitude IS '장소 경도';

