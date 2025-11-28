'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { logParticipantUpdate } from '@/actions/participant/logParticipantUpdate';

const schema = z.object({
  eventId: z.string(),
  company: z.string().max(200).optional(),
  jobTitle: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  mobilePhone: z.string().max(50).optional(),
  dietary: z.string().max(200).optional(),
  note: z.string().max(500).optional(),
});

export async function updateSelfProfileAction(input: unknown) {
  try {
    const payload = schema.parse(input);

    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user?.email) {
      throw new Error('Not authenticated');
    }

    // 본인 row 찾기
    const { data: participant, error: pErr } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', payload.eventId)
      .eq('email', session.user.email)
      .maybeSingle();

    if (pErr || !participant) {
      throw new Error('Participant not found');
    }

    // 업데이트 전 데이터 저장 (로그용)
    const beforeData = { ...participant };

    // 업데이트 실행
    const updateData: Record<string, any> = {};
    if (payload.company !== undefined) updateData.company = payload.company || null;
    if (payload.jobTitle !== undefined) updateData.position = payload.jobTitle || null;
    if (payload.phone !== undefined) updateData.phone = payload.phone || null;
    if (payload.mobilePhone !== undefined) updateData.mobile_phone = payload.mobilePhone || null;
    if (payload.dietary !== undefined) updateData.dietary_restrictions = payload.dietary || null;
    if (payload.note !== undefined) updateData.note = payload.note || null;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedParticipant, error } = await supabase
      .from('event_participants')
      .update(updateData)
      .eq('id', participant.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      throw new Error('Profile update failed');
    }

    // operation_logs 기록 (기존 logParticipantUpdate 헬퍼 재사용)
    try {
      await logParticipantUpdate({
        eventId: payload.eventId,
        participantId: participant.id,
        before: beforeData,
        after: updatedParticipant,
        actor: session.user.email,
      });
    } catch (logError) {
      console.error('Operation log error:', logError);
      // 로그 실패해도 업데이트는 성공한 것으로 처리
    }

    revalidatePath(`/${payload.eventId}/me`);

    return { ok: true };
  } catch (error: any) {
    console.error('updateSelfProfileAction error:', error);
    throw error;
  }
}

