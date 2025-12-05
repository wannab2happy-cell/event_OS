/**
 * Get Event Settings
 * 
 * Server action to fetch event settings
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ensureCompleteSettings } from '@/lib/settings/utils';
import type { EventSettings } from '@/lib/settings/eventSettingsTypes';

export async function getEventSettings(eventId: string): Promise<EventSettings> {
  try {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('settings')
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching event settings:', error);
      return ensureCompleteSettings(null);
    }

    return ensureCompleteSettings(data?.settings || null);
  } catch (err) {
    console.error('Error in getEventSettings:', err);
    return ensureCompleteSettings(null);
  }
}

