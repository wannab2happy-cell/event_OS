'use server';

import { createClient } from '@/lib/supabase/server';
import { computeNextFollowUpRun } from '@/lib/mail/followup';
import type { EmailFollowUp } from '@/lib/mail/types';
import { revalidatePath } from 'next/cache';

interface SaveFollowUpInput {
  id?: string;
  eventId: string;
  templateId: string;
  name: string;
  baseJobId: string;
  triggerType: 'on_fail' | 'on_success' | 'after_hours';
  delayHours?: number | null;
  segmentation: any;
  isActive: boolean;
}

export async function saveFollowUp(
  input: SaveFollowUpInput
): Promise<{ ok: boolean; error?: string; followUpId?: string }> {
  try {
    const supabase = await createClient();

    // Load base job to compute next_run_at
    let nextRunAt: string | null = null;
    if (input.isActive && input.triggerType === 'after_hours' && input.delayHours !== null && input.delayHours !== undefined) {
      const { data: baseJob } = await supabase
        .from('email_jobs')
        .select('id, created_at, status')
        .eq('id', input.baseJobId)
        .single();

      if (baseJob && baseJob.status === 'completed') {
        const followup: EmailFollowUp = {
          id: input.id || '',
          event_id: input.eventId,
          name: input.name,
          template_id: input.templateId,
          base_job_id: input.baseJobId,
          trigger_type: input.triggerType,
          delay_hours: input.delayHours,
          segmentation: input.segmentation || null,
          is_active: input.isActive,
          last_run_at: null,
          next_run_at: null,
          created_at: '',
          updated_at: '',
        };

        const computedNextRun = computeNextFollowUpRun(followup, baseJob);
        nextRunAt = computedNextRun ? computedNextRun.toISOString() : null;
      }
    }

    const payload: Record<string, any> = {
      event_id: input.eventId,
      template_id: input.templateId,
      name: input.name,
      base_job_id: input.baseJobId,
      trigger_type: input.triggerType,
      delay_hours: input.triggerType === 'after_hours' ? (input.delayHours || null) : null,
      segmentation: input.segmentation || null,
      is_active: input.isActive,
      next_run_at: nextRunAt,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (input.id) {
      // Update existing follow-up
      const { data, error } = await supabase
        .from('email_followups')
        .update(payload)
        .eq('id', input.id)
        .select('id')
        .single();

      if (error) {
        return { ok: false, error: `Failed to update follow-up: ${error.message}` };
      }

      result = data;
    } else {
      // Create new follow-up
      payload.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('email_followups')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        return { ok: false, error: `Failed to create follow-up: ${error.message}` };
      }

      result = data;
    }

    revalidatePath(`/admin/events/${input.eventId}/mail/followups`);

    return { ok: true, followUpId: result.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

