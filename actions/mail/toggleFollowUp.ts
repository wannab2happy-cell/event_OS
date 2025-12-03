'use server';

import { createClient } from '@/lib/supabase/server';
import { getFollowUp, computeNextFollowUpRun } from '@/lib/mail/followup';
import { revalidatePath } from 'next/cache';

export async function toggleFollowUp(
  id: string,
  isActive: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    const followup = await getFollowUp(id);
    if (!followup) {
      return { ok: false, error: 'Follow-up not found' };
    }

    const supabase = await createClient();

    // If turning on an after_hours follow-up, recompute next_run_at
    let nextRunAt: string | null = null;
    if (isActive && followup.trigger_type === 'after_hours') {
      const { data: baseJob } = await supabase
        .from('email_jobs')
        .select('id, created_at, status')
        .eq('id', followup.base_job_id)
        .single();

      if (baseJob && baseJob.status === 'completed') {
        const computedNextRun = computeNextFollowUpRun(followup, baseJob);
        nextRunAt = computedNextRun ? computedNextRun.toISOString() : null;
      }
    }

    const { error } = await supabase
      .from('email_followups')
      .update({
        is_active: isActive,
        next_run_at: nextRunAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return { ok: false, error: `Failed to toggle follow-up: ${error.message}` };
    }

    revalidatePath(`/admin/events/${followup.event_id}/mail/followups`);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

