'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 타입 정의
interface ClearAssignmentsInput {
  eventId: string;
}

// 간단한 유효성 검사
function validateInput(input: unknown): ClearAssignmentsInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input');
  }
  const { eventId } = input as any;
  
  if (!eventId || typeof eventId !== 'string') {
    throw new Error('eventId is required');
  }
  
  return { eventId };
}

/**
 * 테이블 배정 초기화 (모든 배정 삭제)
 */
export async function clearAssignmentsAction(input: unknown): Promise<{ success: boolean }> {
  try {
    const { eventId } = validateInput(input);

    const { error } = await supabaseAdmin
      .from('table_assignments')
      .delete()
      .eq('event_id', eventId);

    if (error) {
      throw new Error(`테이블 배정 초기화에 실패했습니다: ${error.message}`);
    }

    // 화면 재검증
    revalidatePath(`/admin/events/${eventId}/tables`);

    return { success: true };
  } catch (error: any) {
    console.error('clearAssignmentsAction error:', error);
    throw error;
  }
}

