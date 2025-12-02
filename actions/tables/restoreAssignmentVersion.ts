'use server';

import { createClient } from '@/lib/supabase/server';
import { TableAssignment } from '@/lib/tables/assignmentTypes';

export async function restoreAssignmentVersion({
  eventId,
  versionId,
  assignedBy,
}: {
  eventId: string;
  versionId: string;
  assignedBy?: string;
}) {
  const supabase = await createClient();

  // 버전 조회
  const { data: version, error: versionError } = await supabase
    .from('table_assignment_versions')
    .select('*')
    .eq('id', versionId)
    .eq('event_id', eventId)
    .single();

  if (versionError || !version) {
    throw new Error(`Version not found: ${versionError?.message}`);
  }

  const assignments = version.assignments as TableAssignment[];

  // 기존 draft 삭제
  const { error: deleteError } = await supabase
    .from('table_assignments')
    .delete()
    .eq('event_id', eventId)
    .eq('is_draft', true);

  if (deleteError) {
    throw new Error(`Failed to clear existing drafts: ${deleteError.message}`);
  }

  // 새 draft 삽입
  const payload = assignments.map((a) => ({
    event_id: eventId,
    participant_id: a.participantId,
    table_id: a.tableId,
    is_draft: true,
    source: `restored_from_version_${version.version_number}`,
    assigned_by: assignedBy || null,
  }));

  const { error: insertError } = await supabase
    .from('table_assignments')
    .insert(payload);

  if (insertError) {
    throw new Error(`Failed to restore assignments: ${insertError.message}`);
  }

  return {
    success: true,
    assignments,
    versionNumber: version.version_number,
  };
}

