-- Add settings jsonb column to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- Create index for settings queries (optional, but useful for filtering)
CREATE INDEX IF NOT EXISTS idx_events_settings ON events USING gin (settings);

