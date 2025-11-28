'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logParticipantUpdate } from '@/actions/participant/logParticipantUpdate';
import { assertAdminAuth, getCurrentUserWithRole } from '@/lib/auth';

const basicInfoSchema = z.object({
  eventId: z.string().uuid(),
  participantId: z.string().uuid(),
  company: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  mobile_phone: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  dietary_restrictions: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export async function updateParticipantBasicInfoAction(input: unknown) {
  try {
    const admin = await assertAdminAuth();
    const userInfo = await getCurrentUserWithRole();
    const actor = userInfo?.email || 'admin';

    const payload = basicInfoSchema.parse(input);

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
        company: payload.company,
        position: payload.position,
        mobile_phone: payload.mobile_phone,
        phone: payload.phone,
        dietary_restrictions: payload.dietary_restrictions,
        note: payload.note,
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

    return { success: true, message: '기본 정보가 업데이트되었습니다.' };
  } catch (error: any) {
    console.error('updateParticipantBasicInfoAction error:', error);
    return {
      success: false,
      message: error?.message || '기본 정보 업데이트 중 오류가 발생했습니다.',
    };
  }
}

