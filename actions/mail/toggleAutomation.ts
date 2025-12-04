'use server';

import { createClient } from '@/lib/supabase/server';
import { computeNextRun, getAutomation } from '@/lib/mail/automation';
import { revalidatePath } from 'next/cache';

export async function toggleAutomation(
  id: string,
  isActive: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    const automation = await getAutomation(id);
    if (!automation) {
      return { ok: false, error: 'Automation not found' };
    }

    const supabase = await createClient();

    // If turning on a time-based automation, recompute next_run_at
    let nextRunAt: string | null = null;
    if (isActive && automation.type === 'time_based') {
      const { data: event } = await supabase
        .from('events')
        .select('id, start_date, end_date')
        .eq('id', automation.event_id)
        .single();

      if (event) {
        const computedNextRun = computeNextRun(automation, event);
        nextRunAt = computedNextRun ? computedNextRun.toISOString() : null;
      }
    }

    const { error } = await supabase
      .from('email_automations')
      .update({
        is_active: isActive,
        next_run_at: nextRunAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return { ok: false, error: `Failed to toggle automation: ${error.message}` };
    }

    revalidatePath(`/admin/events/${automation.event_id}/mail/automations`);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}




