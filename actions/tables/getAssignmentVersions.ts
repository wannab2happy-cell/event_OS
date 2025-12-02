'use server';

import { createClient } from '@/lib/supabase/server';
import { TableAssignment } from '@/lib/tables/assignmentTypes';

export interface AssignmentVersion {
  id: string;
  event_id: string;
  version_number: number;
  assignments: TableAssignment[];
  source: string;
  assigned_by: string | null;
  metadata: Record<string, any>;
  is_draft: boolean;
  created_at: string;
}

const PAGE_SIZE = 20;

export async function getAssignmentVersions(
  eventId: string,
  page: number = 0
): Promise<{ versions: AssignmentVersion[]; hasMore: boolean; total: number }> {
  const supabase = await createClient();

  // Get total count
  const { count, error: countError } = await supabase
    .from('table_assignment_versions')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  if (countError) {
    throw new Error(`Failed to fetch version count: ${countError.message}`);
  }

  const total = count || 0;

  // Fetch paginated data - only necessary columns
  const { data, error } = await supabase
    .from('table_assignment_versions')
    .select('id, event_id, version_number, assignments, source, assigned_by, metadata, is_draft, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (error) {
    throw new Error(`Failed to fetch versions: ${error.message}`);
  }

  const hasMore = (page + 1) * PAGE_SIZE < total;

  return {
    versions: (data || []) as AssignmentVersion[],
    hasMore,
    total,
  };
}

