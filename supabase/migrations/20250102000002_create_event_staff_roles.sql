-- Create event_staff_roles table for per-event role assignments

CREATE TABLE IF NOT EXISTS event_staff_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'staff', 'vendor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_event_staff_roles_event_id ON event_staff_roles(event_id);
CREATE INDEX IF NOT EXISTS idx_event_staff_roles_user_id ON event_staff_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_event_staff_roles_event_user ON event_staff_roles(event_id, user_id);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE event_staff_roles ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy: users can read their own roles
CREATE POLICY IF NOT EXISTS "Users can view their own event roles"
  ON event_staff_roles
  FOR SELECT
  USING (auth.uid() = user_id);

