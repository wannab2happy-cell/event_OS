/**
 * Create Event
 * 
 * Server action to create a new event
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getDefaultEventSettings } from '@/lib/settings/defaults';
import { mergeEventSettings } from '@/lib/settings/utils';
import type { EventSettings } from '@/lib/settings/eventSettingsTypes';

export interface CreateEventInput {
  name: string;
  startDate: string;
  endDate: string;
  location?: string;
  timezone?: string;
  settingsOverrides?: Partial<EventSettings>;
}

export async function createEvent(input: CreateEventInput): Promise<{ id: string } | { error: string }> {
  try {
    // Generate event code (simple: first 3 letters of name + timestamp)
    const codePrefix = input.name
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase();
    const code = `${codePrefix}-${Date.now().toString().slice(-6)}`;

    // Merge settings
    const defaultSettings = getDefaultEventSettings();
    const settings = input.settingsOverrides
      ? mergeEventSettings(defaultSettings, input.settingsOverrides)
      : defaultSettings;

    // Update general settings with provided values
    if (input.timezone) {
      settings.general.timezone = input.timezone;
    }

    // Insert event
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({
        title: input.name,
        code,
        start_date: input.startDate,
        end_date: input.endDate,
        status: 'planning',
        settings,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Failed to create event' };
    }

    // TODO: Optionally seed default mail templates

    return { id: data.id };
  } catch (err) {
    console.error('Error in createEvent:', err);
    return { error: err instanceof Error ? err.message : 'Failed to create event' };
  }
}

