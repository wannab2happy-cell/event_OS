-- Add schedule JSON field to events table
-- Schedule format: [{"time": "09:00", "title": "Registration", "description": "Welcome desk open"}]
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT NULL;

-- Add venue location fields for map integration
ALTER TABLE events
ADD COLUMN IF NOT EXISTS venue_address TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS venue_latitude DECIMAL(10, 8) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS venue_longitude DECIMAL(11, 8) DEFAULT NULL;

-- Add index for schedule queries (if needed)
CREATE INDEX IF NOT EXISTS idx_events_schedule ON events USING GIN (schedule);

-- Comment
COMMENT ON COLUMN events.schedule IS 'Event schedule as JSON array: [{"time": "HH:mm", "title": "Session name", "description": "Optional description"}]';
COMMENT ON COLUMN events.venue_address IS 'Full address for venue (used for map display)';
COMMENT ON COLUMN events.venue_latitude IS 'Latitude for venue location';
COMMENT ON COLUMN events.venue_longitude IS 'Longitude for venue location';

