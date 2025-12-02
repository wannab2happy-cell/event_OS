'use server';

import { createClient } from '@/lib/supabase/server';

export async function saveDraftManualOverride({
  eventId,
  assignments,
}: {
  eventId: string;
  assignments: { tableId: string; participantId: string }[];
}) {
  const supabase = await createClient();

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
  const rows = assignments.map((a) => ({
    event_id: eventId,
    table_id: a.tableId,
    participant_id: a.participantId,
    is_draft: true,
    source: 'manual_drag',
  }));

  const { error: insertError } = await supabase
    .from('table_assignments')
    .insert(rows);

  if (insertError) {
    throw new Error(`Failed to save draft assignments: ${insertError.message}`);
  }

  return { ok: true };
}

