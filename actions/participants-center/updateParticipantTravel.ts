'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logParticipantUpdate } from '@/actions/participant/logParticipantUpdate';
import { assertAdminAuth, getCurrentUserWithRole } from '@/lib/auth';

const travelSchema = z.object({
  eventId: z.string().uuid(),
  participantId: z.string().uuid(),
  arrival_airport: z.string().optional().nullable(),
  arrival_date: z.string().optional().nullable(),
  arrival_time: z.string().optional().nullable(),
  arrival_flight: z.string().optional().nullable(),
  departure_airport: z.string().optional().nullable(),
  departure_date: z.string().optional().nullable(),
  departure_time: z.string().optional().nullable(),
  departure_flight: z.string().optional().nullable(),
  is_travel_confirmed: z.boolean().optional().nullable(),
});

export async function updateParticipantTravelAction(input: unknown) {
  try {
    const admin = await assertAdminAuth();
    const userInfo = await getCurrentUserWithRole();
    const actor = userInfo?.email || 'admin';

    const payload = travelSchema.parse(input);

    // Load before
    const { data: before, error: beforeError } = await supabaseAdmin
      .from('event_participants')
      .select('*')
      .eq('event_id', payload.eventId)
      .eq('id', payload.participantId)
      .single();

    if (beforeError || !before) {
      throw new Error('참가자 정보를 찾을 수 없습니다.');
    }

    // Update
    const { data: after, error } = await supabaseAdmin
      .from('event_participants')
      .update({
        arrival_airport: payload.arrival_airport,
        arrival_date: payload.arrival_date,
        arrival_time: payload.arrival_time,
        arrival_flight: payload.arrival_flight,
        departure_airport: payload.departure_airport,
        departure_date: payload.departure_date,
        departure_time: payload.departure_time,
        departure_flight: payload.departure_flight,
        is_travel_confirmed: payload.is_travel_confirmed ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq('event_id', payload.eventId)
      .eq('id', payload.participantId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`업데이트 실패: ${error.message}`);
    }

    if (!after) {
      throw new Error('업데이트 후 데이터를 가져올 수 없습니다.');
    }

    // Log diff
    await logParticipantUpdate({
      eventId: payload.eventId,
      participantId: payload.participantId,
      before,
      after,
      actor,
    });

    revalidatePath(`/admin/events/${payload.eventId}/participants-center`);
    revalidatePath(`/admin/events/${payload.eventId}/updates`);

    return { success: true, message: '항공 정보가 업데이트되었습니다.' };
  } catch (error: any) {
    console.error('updateParticipantTravelAction error:', error);
    return {
      success: false,
      message: error?.message || '항공 정보 업데이트 중 오류가 발생했습니다.',
    };
  }
}

