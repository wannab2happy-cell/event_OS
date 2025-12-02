'use server';

import { createClient } from '@/lib/supabase/server';

export async function confirmAssignment(eventId: string) {
  const supabase = await createClient();

  // 1) 기존 확정 배정 삭제
  const { error: deleteError } = await supabase
    .from('table_assignments')
    .delete()
    .eq('event_id', eventId)
    .eq('is_draft', false);

  if (deleteError) {
    throw new Error(`Failed to clear existing confirmed assignments: ${deleteError.message}`);
  }

  // 2) draft → 확정
  const { error: updateError } = await supabase
    .from('table_assignments')
    .update({
      is_draft: false,
    })
    .eq('event_id', eventId)
    .eq('is_draft', true);

  if (updateError) {
    throw new Error(`Failed to confirm assignments: ${updateError.message}`);
  }

  return { success: true };
}

