-- Create event_vendor_notes table for vendor task management

CREATE TABLE IF NOT EXISTS event_vendor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('hotel', 'av', 'graphics', 'logistics', 'other')),
  title text NOT NULL,
  content text,
  vendor_name text,
  owner text,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status text NOT NULL CHECK (status IN ('planned', 'in_progress', 'done', 'blocked')) DEFAULT 'planned',
  due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_vendor_notes_event_id ON event_vendor_notes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_vendor_notes_category ON event_vendor_notes(category);
CREATE INDEX IF NOT EXISTS idx_event_vendor_notes_status ON event_vendor_notes(status);
CREATE INDEX IF NOT EXISTS idx_event_vendor_notes_due_at ON event_vendor_notes(due_at);

-- Enable RLS
ALTER TABLE event_vendor_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only event admins can access
CREATE POLICY IF NOT EXISTS "Event admins can manage vendor notes"
  ON event_vendor_notes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM event_staff_roles
      WHERE event_staff_roles.event_id = event_vendor_notes.event_id
        AND event_staff_roles.user_id = auth.uid()
        AND event_staff_roles.role = 'admin'
    )
  );

