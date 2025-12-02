'use server';

import { createClient } from '@/lib/supabase/server';
import { TableAssignment } from '@/lib/tables/assignmentTypes';

export async function saveDraftVersion({
  eventId,
  assignments,
  source,
  assignedBy,
  metadata,
}: {
  eventId: string;
  assignments: TableAssignment[];
  source: string;
  assignedBy?: string;
  metadata?: Record<string, any>;
}) {
  const supabase = await createClient();

  // 현재 최대 버전 번호 조회
  const { data: maxVersion, error: versionError } = await supabase
    .from('table_assignment_versions')
    .select('version_number')
    .eq('event_id', eventId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single();

  const nextVersionNumber = maxVersion?.version_number
    ? maxVersion.version_number + 1
    : 1;

  // 버전 저장
  const { data: versionData, error: versionInsertError } = await supabase
    .from('table_assignment_versions')
    .insert({
      event_id: eventId,
      version_number: nextVersionNumber,
      assignments: assignments as any,
      source,
      assigned_by: assignedBy || null,
      metadata: metadata || {},
      is_draft: true,
    })
    .select()
    .single();

  if (versionInsertError) {
    throw new Error(`Failed to save version: ${versionInsertError.message}`);
  }

  return {
    success: true,
    versionId: versionData.id,
    versionNumber: nextVersionNumber,
  };
}

