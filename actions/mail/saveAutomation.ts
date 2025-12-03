'use server';

import { createClient } from '@/lib/supabase/server';
import { computeNextRun } from '@/lib/mail/automation';
import type { EmailAutomation } from '@/lib/mail/types';
import { revalidatePath } from 'next/cache';

interface SaveAutomationInput {
  id?: string;
  eventId: string;
  templateId: string;
  name: string;
  type: 'time_based' | 'event_based';
  timeType?: 'absolute' | 'relative';
  sendAt?: string; // ISO timestamp
  relativeDays?: number;
  triggerKind?: string;
  segmentation: any;
  isActive: boolean;
}

export async function saveAutomation(
  input: SaveAutomationInput
): Promise<{ ok: boolean; error?: string; automationId?: string }> {
  try {
    const supabase = await createClient();

    // Load event to compute next_run_at for time-based automations
    let nextRunAt: string | null = null;
    if (input.type === 'time_based' && input.isActive) {
      const { data: event } = await supabase
        .from('events')
        .select('id, start_date, end_date')
        .eq('id', input.eventId)
        .single();

      if (event) {
        const automation: EmailAutomation = {
          id: input.id || '',
          event_id: input.eventId,
          template_id: input.templateId,
          name: input.name,
          type: input.type,
          time_type: input.timeType || null,
          send_at: input.sendAt || null,
          relative_days: input.relativeDays || null,
          trigger_kind: null,
          segmentation: input.segmentation || null,
          is_active: input.isActive,
          last_run_at: null,
          next_run_at: null,
          created_at: '',
          updated_at: '',
        };

        const computedNextRun = computeNextRun(automation, event);
        nextRunAt = computedNextRun ? computedNextRun.toISOString() : null;
      }
    }

    const payload: Record<string, any> = {
      event_id: input.eventId,
      template_id: input.templateId,
      name: input.name,
      type: input.type,
      time_type: input.type === 'time_based' ? (input.timeType || null) : null,
      send_at: input.type === 'time_based' && input.timeType === 'absolute' ? input.sendAt || null : null,
      relative_days: input.type === 'time_based' && input.timeType === 'relative' ? input.relativeDays || null : null,
      trigger_kind: input.type === 'event_based' ? (input.triggerKind || null) : null,
      segmentation: input.segmentation || null,
      is_active: input.isActive,
      next_run_at: nextRunAt,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (input.id) {
      // Update existing automation
      const { data, error } = await supabase
        .from('email_automations')
        .update(payload)
        .eq('id', input.id)
        .select('id')
        .single();

      if (error) {
        return { ok: false, error: `Failed to update automation: ${error.message}` };
      }

      result = data;
    } else {
      // Create new automation
      payload.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('email_automations')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        return { ok: false, error: `Failed to create automation: ${error.message}` };
      }

      result = data;
    }

    revalidatePath(`/admin/events/${input.eventId}/mail/automations`);

    return { ok: true, automationId: result.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

