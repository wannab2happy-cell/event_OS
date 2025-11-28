'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCurrentUserWithRole } from '@/lib/auth';
import { createOperationLog } from '@/actions/operations/createLog';

/**
 * Draft 배정을 확정으로 전환
 */
export async function applyDraftAssignmentsAction(eventId: string): Promise<{ success: boolean; totalAssignments: number }> {
  try {
    if (!eventId || typeof eventId !== 'string') {
      throw new Error('eventId is required');
    }

    // 관리자 정보 가져오기
    const userInfo = await getCurrentUserWithRole();
    const actor = userInfo?.email || 'admin';

    // 1) Draft 배정 개수 확인
    const { data: draftAssignments, error: countError } = await supabaseAdmin
      .from('table_assignments')
      .select('id')
      .eq('event_id', eventId)
      .eq('is_draft', true);

    if (countError) {
      throw new Error(`Draft 배정 조회 실패: ${countError.message}`);
    }

    const totalAssignments = draftAssignments?.length || 0;

    if (totalAssignments === 0) {
      throw new Error('확정할 Draft 배정이 없습니다.');
    }

    // 2) 기존 확정 배정 삭제
    const { error: deleteError } = await supabaseAdmin
      .from('table_assignments')
      .delete()
      .eq('event_id', eventId)
      .eq('is_draft', false);

    if (deleteError) {
      console.error('기존 확정 배정 삭제 오류:', deleteError);
      // 삭제 실패해도 계속 진행
    }

    // 3) Draft를 확정으로 전환
    const { error: updateError } = await supabaseAdmin
      .from('table_assignments')
      .update({ is_draft: false })
      .eq('event_id', eventId)
      .eq('is_draft', true);

    if (updateError) {
      throw new Error(`Draft 확정 실패: ${updateError.message}`);
    }

    // 4) operation_logs 기록
    await createOperationLog({
      eventId,
      type: 'table_assign_confirm',
      message: `[TABLE] Draft 배정 확정`,
      actor,
      metadata: {
        totalAssignments,
      },
    });

    revalidatePath(`/admin/events/${eventId}/tables`);

    return {
      success: true,
      totalAssignments,
    };
  } catch (error: any) {
    console.error('applyDraftAssignmentsAction error:', error);
    throw error;
  }
}

