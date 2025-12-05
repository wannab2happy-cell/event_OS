/**
 * Duplicate Event
 * 
 * Server action to duplicate an event with optional copying of templates and tables
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getEventSettings } from '@/actions/settings/getEventSettings';

export interface DuplicateEventInput {
  originalEventId: string;
  newName: string;
  newStartDate: string;
  newEndDate: string;
  copySettings: boolean;
  copyMailTemplates: boolean;
  copyTables: boolean;
}

export async function duplicateEvent(
  input: DuplicateEventInput
): Promise<{ id: string } | { error: string }> {
  try {
    // Fetch original event
    const { data: originalEvent, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', input.originalEventId)
      .single();

    if (eventError || !originalEvent) {
      return { error: 'Original event not found' };
    }

    // Get settings
    let settings = originalEvent.settings || {};
    if (input.copySettings) {
      const originalSettings = await getEventSettings(input.originalEventId);
      settings = originalSettings;
      // Update general settings with new dates/name
      if (settings.general) {
        settings.general.eventNameOverride = input.newName;
      }
    }

    // Generate new event code
    const codePrefix = input.newName
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase();
    const code = `${codePrefix}-${Date.now().toString().slice(-6)}`;

    // Create new event
    const { data: newEvent, error: createError } = await supabaseAdmin
      .from('events')
      .insert({
        title: input.newName,
        code,
        start_date: input.newStartDate,
        end_date: input.newEndDate,
        status: 'planning',
        settings,
      })
      .select('id')
      .single();

    if (createError || !newEvent) {
      return { error: createError?.message || 'Failed to create duplicate event' };
    }

    const newEventId = newEvent.id;

    // Copy mail templates if requested
    if (input.copyMailTemplates) {
      const { data: templates } = await supabaseAdmin
        .from('email_templates')
        .select('*')
        .eq('event_id', input.originalEventId);

      if (templates && templates.length > 0) {
        const newTemplates = templates.map((t) => ({
          event_id: newEventId,
          name: t.name,
          subject: t.subject,
          body_html: t.body_html,
          body_text: t.body_text,
          merge_variables: t.merge_variables,
        }));

        await supabaseAdmin.from('email_templates').insert(newTemplates);
      }
    }

    // Copy tables if requested
    if (input.copyTables) {
      const { data: tables } = await supabaseAdmin
        .from('event_tables')
        .select('*')
        .eq('event_id', input.originalEventId);

      if (tables && tables.length > 0) {
        const newTables = tables.map((t) => ({
          event_id: newEventId,
          name: t.name,
          capacity: t.capacity,
          is_vip_table: t.is_vip_table,
        }));

        await supabaseAdmin.from('event_tables').insert(newTables);
      }
    }

    return { id: newEventId };
  } catch (err) {
    console.error('Error in duplicateEvent:', err);
    return { error: err instanceof Error ? err.message : 'Failed to duplicate event' };
  }
}

