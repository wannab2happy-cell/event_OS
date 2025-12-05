-- Add role column to profiles table
-- If profiles table doesn't exist, create it first

-- Check if profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add role column if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'guest_viewer'
  CHECK (role IN ('super_admin', 'event_manager', 'operations_staff', 'guest_viewer', 'vendor'));

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

