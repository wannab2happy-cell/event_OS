'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 타입 정의
interface DeleteVIPInput {
  eventId: string;
  participantId: string;
}

// 간단한 유효성 검사
function validateInput(input: unknown): DeleteVIPInput {
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
  
  return {
    eventId: data.eventId,
    participantId: data.participantId,
  };
}

/**
 * VIP 제거 Server Action (VIP 정보를 초기화)
 */
export async function deleteVIPAction(input: unknown): Promise<{ success: boolean; message?: string }> {
  try {
    const { eventId, participantId } = validateInput(input);

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

    // VIP 정보 초기화
    const { error: updateError } = await supabaseAdmin
      .from('event_participants')
      .update({
        vip_level: 0,
        guest_of: null,
        vip_note: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', participantId)
      .eq('event_id', eventId);

    if (updateError) {
      throw new Error(`VIP 제거에 실패했습니다: ${updateError.message}`);
    }

    // 페이지 재검증
    revalidatePath(`/admin/events/${eventId}/vip`);

    return {
      success: true,
      message: 'VIP가 성공적으로 제거되었습니다.',
    };
  } catch (error: any) {
    console.error('deleteVIPAction error:', error);
    return {
      success: false,
      message: error?.message || 'VIP 제거 중 오류가 발생했습니다.',
    };
  }
}

