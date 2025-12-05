/**
 * Find Participant
 * 
 * Server action to search for participants by name or email
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { Participant } from '@/lib/types/participants';

export async function findParticipant(
  eventId: string,
  query: string
): Promise<Participant[]> {
  try {
    const searchTerm = `%${query.toLowerCase()}%`;

    const { data, error } = await supabaseAdmin
      .from('event_participants')
      .select(
        `
        id,
        event_id,
        name,
        email,
        company,
        vip,
        is_vip,
        checked_in,
        checked_in_at,
        table_name,
        seat_number
      `
      )
      .eq('event_id', eventId)
      .or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .limit(10);

    if (error) {
      console.error('Error finding participant:', error);
      return [];
    }

    return (data || []).map((p) => ({
      id: p.id,
      event_id: p.event_id,
      name: p.name,
      email: p.email,
      company: p.company,
      vip: p.vip || p.is_vip || false,
      checked_in: p.checked_in,
      checked_in_at: p.checked_in_at,
      table_name: p.table_name,
      seat_number: p.seat_number,
    })) as Participant[];
  } catch (err) {
    console.error('Error in findParticipant:', err);
    return [];
  }
}

