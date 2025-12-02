'use server';

import { createClient } from '@/lib/supabase/server';

export async function clearDraftAssignment(eventId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('table_assignments')
    .delete()
    .eq('event_id', eventId)
    .eq('is_draft', true);

  if (error) {
    throw new Error(`Failed to clear draft assignments: ${error.message}`);
  }

  return { success: true };
}

