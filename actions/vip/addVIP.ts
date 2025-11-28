'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 타입 정의
interface AddVIPInput {
  eventId: string;
  participantId: string;
  vipLevel: number;
  guestOf?: string | null;
  vipNote?: string | null;
}

// 간단한 유효성 검사
function validateInput(input: unknown): AddVIPInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input');
  }
  const data = input as any;
  
  if (!data.eventId || typeof data.eventId !== 'string') {
    throw new Error('eventId is required');
  }
  
  if (!data.participantId || typeof data.participantId !== 'string') {
    throw new Error('participantId is required');
  }
  
  if (typeof data.vipLevel !== 'number' || data.vipLevel < 1 || data.vipLevel > 3) {
    throw new Error('vipLevel must be between 1 and 3');
  }
  
  return {
    eventId: data.eventId,
    participantId: data.participantId,
    vipLevel: data.vipLevel,
    guestOf: data.guestOf || null,
    vipNote: data.vipNote || null,
  };
}

/**
 * VIP 추가/설정 Server Action
 */
export async function addVIPAction(input: unknown): Promise<{ success: boolean; message?: string }> {
  try {
    const { eventId, participantId, vipLevel, guestOf, vipNote } = validateInput(input);

    // 참가자 존재 확인
    const { data: participant, error: fetchError } = await supabaseAdmin
      .from('event_participants')
      .select('id, event_id')
      .eq('id', participantId)
      .eq('event_id', eventId)
      .single();

    if (fetchError || !participant) {
      throw new Error('참가자를 찾을 수 없습니다.');
    }

    // guest_of가 설정된 경우, 해당 참가자가 존재하는지 확인
    if (guestOf) {
      const { data: hostParticipant } = await supabaseAdmin
        .from('event_participants')
        .select('id')
        .eq('id', guestOf)
        .eq('event_id', eventId)
        .single();

      if (!hostParticipant) {
        throw new Error('동반자로 지정할 VIP를 찾을 수 없습니다.');
      }
    }

    // VIP 정보 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('event_participants')
      .update({
        vip_level: vipLevel,
        guest_of: guestOf,
        vip_note: vipNote,
        updated_at: new Date().toISOString(),
      })
      .eq('id', participantId)
      .eq('event_id', eventId);

    if (updateError) {
      throw new Error(`VIP 설정에 실패했습니다: ${updateError.message}`);
    }

    // 페이지 재검증
    revalidatePath(`/admin/events/${eventId}/vip`);

    return {
      success: true,
      message: 'VIP가 성공적으로 설정되었습니다.',
    };
  } catch (error: any) {
    console.error('addVIPAction error:', error);
    return {
      success: false,
      message: error?.message || 'VIP 설정 중 오류가 발생했습니다.',
    };
  }
}

