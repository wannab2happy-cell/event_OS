/**
 * Get Participants for Segmentation
 * 
 * Server action to fetch participants for client-side filtering
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { Participant } from '@/lib/types/participants';

export async function getParticipantsForSegmentation(eventId: string): Promise<Participant[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching participants:', error);
      return [];
    }

    return (data || []) as Participant[];
  } catch (err) {
    console.error('Error in getParticipantsForSegmentation:', err);
    return [];
  }
}

