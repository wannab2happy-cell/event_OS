/**
 * Check In Participant
 * 
 * Server action to check in a participant
 */

'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { Participant } from '@/lib/types/participants';

export interface CheckInResult {
  success: boolean;
  status: 'checked_in' | 'already_checked_in' | 'not_found' | 'error';
  participant?: Participant;
  error?: string;
}

export async function checkInParticipant(
  eventId: string,
  participantId: string
): Promise<CheckInResult> {
  try {
    // Fetch participant with table assignment
    const { data: participant, error: fetchError } = await supabaseAdmin
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
        table_id,
        table_name,
        seat_number
      `
      )
      .eq('id', participantId)
      .eq('event_id', eventId)
      .single();

    if (fetchError || !participant) {
      return {
        success: false,
        status: 'not_found',
        error: 'Participant not found for this event',
      };
    }

    // Check if already checked in
    if (participant.checked_in) {
      return {
        success: true,
        status: 'already_checked_in',
        participant: {
          id: participant.id,
          event_id: participant.event_id,
          name: participant.name,
          email: participant.email,
          company: participant.company,
          vip: participant.vip || participant.is_vip || false,
          checked_in: true,
          checked_in_at: participant.checked_in_at,
          table_name: participant.table_name,
          seat_number: participant.seat_number,
        } as Participant,
      };
    }

    // Check in participant
    const now = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from('event_participants')
      .update({
        checked_in: true,
        checked_in_at: now,
      })
      .eq('id', participantId)
      .eq('event_id', eventId);

    if (updateError) {
      console.error('Error checking in participant:', updateError);
      return {
        success: false,
        status: 'error',
        error: updateError.message,
      };
    }

    return {
      success: true,
      status: 'checked_in',
      participant: {
        id: participant.id,
        event_id: participant.event_id,
        name: participant.name,
        email: participant.email,
        company: participant.company,
        vip: participant.vip || participant.is_vip || false,
        checked_in: true,
        checked_in_at: now,
        table_name: participant.table_name,
        seat_number: participant.seat_number,
      } as Participant,
    };
  } catch (err) {
    console.error('Error in checkInParticipant:', err);
    return {
      success: false,
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

