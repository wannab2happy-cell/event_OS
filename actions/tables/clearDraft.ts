'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCurrentUserWithRole } from '@/lib/auth';
import { createOperationLog } from '@/actions/operations/createLog';

/**
 * Draft 배정 초기화
 */
export async function clearDraftAssignmentsAction(eventId: string): Promise<{ success: boolean }> {
  try {
    if (!eventId || typeof eventId !== 'string') {
      throw new Error('eventId is required');
    }

    // 관리자 정보 가져오기
    const userInfo = await getCurrentUserWithRole();
    const actor = userInfo?.email || 'admin';

    // Draft 배정 삭제
    const { error } = await supabaseAdmin
      .from('table_assignments')
      .delete()
      .eq('event_id', eventId)
      .eq('is_draft', true);

    if (error) {
      throw new Error(`Draft 초기화 실패: ${error.message}`);
    }

    // operation_logs 기록
    await createOperationLog({
      eventId,
      type: 'table_assign_clear_draft',
      message: `[TABLE] Draft 배정 초기화`,
      actor,
    });

    revalidatePath(`/admin/events/${eventId}/tables`);

    return { success: true };
  } catch (error: any) {
    console.error('clearDraftAssignmentsAction error:', error);
    throw error;
  }
}

