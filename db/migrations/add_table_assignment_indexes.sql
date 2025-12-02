-- Phase 4: Supabase & Data Fetch Optimization
-- Database Indexes for Table Assignment Engine
-- Execute these in Supabase SQL Editor

-- Index for table_assignments by event_id (most common query)
CREATE INDEX IF NOT EXISTS idx_table_assignments_event 
ON table_assignments(event_id);

-- Index for table_assignments by event_id and is_draft (common filter)
CREATE INDEX IF NOT EXISTS idx_table_assignments_event_draft 
ON table_assignments(event_id, is_draft);

-- Index for assignment_versions by event_id
CREATE INDEX IF NOT EXISTS idx_assignment_versions_event 
ON table_assignment_versions(event_id);

-- Index for assignment_versions by event_id and created_at (for pagination and ordering)
CREATE INDEX IF NOT EXISTS idx_assignment_versions_event_created 
ON table_assignment_versions(event_id, created_at DESC);

-- Index for event_participants by event_id and is_active (common filter)
CREATE INDEX IF NOT EXISTS idx_event_participants_event_active 
ON event_participants(event_id, is_active);

-- Index for event_tables by event_id
CREATE INDEX IF NOT EXISTS idx_event_tables_event 
ON event_tables(event_id);

-- Composite index for faster participant lookups
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id_active 
ON event_participants(event_id) 
WHERE is_active = true;

-- Composite index for faster draft assignment lookups
CREATE INDEX IF NOT EXISTS idx_table_assignments_event_draft_true 
ON table_assignments(event_id) 
WHERE is_draft = true;

