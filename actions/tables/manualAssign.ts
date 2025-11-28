'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCurrentUserWithRole } from '@/lib/auth';
import { createOperationLog } from '@/actions/operations/createLog';

interface ManualAssignInput {
  eventId: string;
  fromAssignmentId?: string | null;
  toTableId: string;
  toSeatNumber: number;
  participantId: string;
}

/**
 * 수동 배정 (Drag & Drop)
 */
export async function manualAssignAction(input: unknown): Promise<{ success: boolean }> {
  try {
    const { eventId, fromAssignmentId, toTableId, toSeatNumber, participantId } = input as ManualAssignInput;

    if (!eventId || typeof eventId !== 'string') {
      throw new Error('eventId is required');
    }

    if (!toTableId || typeof toTableId !== 'string') {
      throw new Error('toTableId is required');
    }

    if (!participantId || typeof participantId !== 'string') {
      throw new Error('participantId is required');
    }

    // 관리자 정보 가져오기
    const userInfo = await getCurrentUserWithRole();
    const assignedBy = userInfo?.email || 'admin';

    // 1) 유효성 검사: 같은 eventId에서 동일 participant가 Draft 상태로 두 번 배정되는지 검사
    const { data: existingDraft, error: checkError } = await supabaseAdmin
      .from('table_assignments')
      .select('id, table_id, seat_number')
      .eq('event_id', eventId)
      .eq('participant_id', participantId)
      .eq('is_draft', true)
      .neq('id', fromAssignmentId || '');

    if (checkError) {
      throw new Error(`중복 배정 검사 실패: ${checkError.message}`);
    }

    if (existingDraft && existingDraft.length > 0) {
      throw new Error('이 참가자는 이미 다른 좌석에 배정되어 있습니다.');
    }

    // 2) 유효성 검사: 같은 table_id, seat_number에 다른 참가자가 이미 있는지 검사
    const { data: seatConflict, error: seatError } = await supabaseAdmin
      .from('table_assignments')
      .select('id, participant_id')
      .eq('event_id', eventId)
      .eq('table_id', toTableId)
      .eq('seat_number', toSeatNumber)
      .eq('is_draft', true)
      .neq('participant_id', participantId);

    if (seatError) {
      throw new Error(`좌석 충돌 검사 실패: ${seatError.message}`);
    }

    if (seatConflict && seatConflict.length > 0) {
      throw new Error('이 좌석에는 이미 다른 참가자가 배정되어 있습니다.');
    }

    // 3) 기존 배정이 있으면 업데이트, 없으면 새로 생성
    if (fromAssignmentId) {
      // 기존 배정 업데이트
      const { error: updateError } = await supabaseAdmin
        .from('table_assignments')
        .update({
          table_id: toTableId,
          seat_number: toSeatNumber,
          source: 'manual_drag',
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
        })
        .eq('id', fromAssignmentId)
        .eq('is_draft', true);

      if (updateError) {
        throw new Error(`배정 업데이트 실패: ${updateError.message}`);
      }
    } else {
      // 새 배정 생성
      const { error: insertError } = await supabaseAdmin
        .from('table_assignments')
        .insert({
          event_id: eventId,
          table_id: toTableId,
          participant_id: participantId,
          seat_number: toSeatNumber,
          is_draft: true,
          source: 'manual_drag',
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error(`배정 생성 실패: ${insertError.message}`);
      }
    }

    // 4) 기존 배정 정보 가져오기 (로깅용)
    let fromTableId: string | null = null;
    let fromSeatNumber: number | null = null;

    if (fromAssignmentId) {
      const { data: oldAssignment } = await supabaseAdmin
        .from('table_assignments')
        .select('table_id, seat_number')
        .eq('id', fromAssignmentId)
        .single();

      if (oldAssignment) {
        fromTableId = oldAssignment.table_id as string;
        fromSeatNumber = oldAssignment.seat_number as number | null;
      }
    }

    // 5) operation_logs 기록
    await createOperationLog({
      eventId,
      type: 'table_assign_manual',
      message: `[TABLE] Manual drag & drop`,
      actor: assignedBy,
      metadata: {
        fromTableId,
        toTableId,
        fromSeatNumber,
        toSeatNumber,
        participantId,
      },
    });

    revalidatePath(`/admin/events/${eventId}/tables`);

    return { success: true };
  } catch (error: any) {
    console.error('manualAssignAction error:', error);
    throw error;
  }
}

