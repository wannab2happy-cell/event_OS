/**
 * Update Event Settings
 * 
 * Server action to update event settings
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getEventSettings } from './getEventSettings';
import { mergeEventSettings } from '@/lib/settings/utils';
import type { EventSettings } from '@/lib/settings/eventSettingsTypes';

export async function updateEventSettings(
  eventId: string,
  partial: Partial<EventSettings>
): Promise<EventSettings> {
  try {
    // Get existing settings
    const existing = await getEventSettings(eventId);

    // Merge with partial
    const updated = mergeEventSettings(existing, partial);

    // Update database
    const { error } = await supabaseAdmin
      .from('events')
      .update({ settings: updated })
      .eq('id', eventId);

    if (error) {
      console.error('Error updating event settings:', error);
      throw new Error(`Failed to update settings: ${error.message}`);
    }

    return updated;
  } catch (err) {
    console.error('Error in updateEventSettings:', err);
    throw err;
  }
}

