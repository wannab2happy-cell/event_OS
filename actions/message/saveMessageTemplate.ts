'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { MessageChannel } from '@/lib/mail/types';

interface SaveMessageTemplateInput {
  id?: string;
  eventId: string;
  name: string;
  body: string;
  channel: MessageChannel;
}

export async function saveMessageTemplate(
  input: SaveMessageTemplateInput
): Promise<{ ok: boolean; error?: string; templateId?: string }> {
  try {
    if (!input.name.trim()) {
      return { ok: false, error: 'Template name is required' };
    }
    if (!input.body.trim()) {
      return { ok: false, error: 'Message body is required' };
    }

    const supabase = await createClient();

    const payload: Record<string, any> = {
      event_id: input.eventId,
      name: input.name.trim(),
      body: input.body.trim(),
      channel: input.channel,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (input.id) {
      // Update existing template
      const { data, error } = await supabase
        .from('message_templates')
        .update(payload)
        .eq('id', input.id)
        .select('id')
        .single();

      if (error) {
        return { ok: false, error: `Failed to update template: ${error.message}` };
      }

      result = data;
    } else {
      // Create new template
      payload.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('message_templates')
        .insert(payload)
        .select('id')
        .single();

      if (error) {
        return { ok: false, error: `Failed to create template: ${error.message}` };
      }

      result = data;
    }

    revalidatePath(`/admin/events/${input.eventId}/messages`);

    return { ok: true, templateId: result.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

