'use server';

import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const schema = z.object({
  eventId: z.string().uuid(),
  participantId: z.string().uuid(),
});

export async function getParticipantDetailAction(input: unknown) {
  try {
    const { eventId, participantId } = schema.parse(input);

    // 참가자 정보 조회
    const { data: participant, error: pError } = await supabaseAdmin
      .from('event_participants')
      .select('*')
      .eq('id', participantId)
      .eq('event_id', eventId)
      .single();

    if (pError || !participant) {
      throw new Error('참가자를 찾을 수 없습니다.');
    }

    // 테이블 배정 정보 조인
    const { data: assignment } = await supabaseAdmin
      .from('table_assignments')
      .select('table_id, tables(name)')
      .eq('participant_id', participantId)
      .single();

    return {
      success: true,
      participant: {
        ...participant,
        tableName: assignment?.tables?.name || null,
      },
    };
  } catch (error: any) {
    console.error('getParticipantDetailAction error:', error);
    return {
      success: false,
      participant: null,
      message: error.message || '참가자 정보를 불러오는 중 오류가 발생했습니다.',
    };
  }
}

