'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 타입 정의
interface AssignTablesInput {
  eventId: string;
}

interface AssignTablesResult {
  totalParticipants: number;
  assignedCount: number;
  unassignedCount: number;
  tableCount: number;
}

// 간단한 유효성 검사
function validateInput(input: unknown): AssignTablesInput {
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
 * Round-robin 방식으로 테이블 자동 배정
 */
export async function assignTablesAction(input: unknown): Promise<AssignTablesResult> {
  try {
    const { eventId } = validateInput(input);

    // 1) 참가자 로드 (등록 완료된 참가자만)
    const { data: participants, error: participantsError } = await supabaseAdmin
      .from('event_participants')
      .select('id, name, email, status, company')
      .eq('event_id', eventId)
      .eq('status', 'completed');

    if (participantsError) {
      throw new Error(`참가자 정보를 불러오지 못했습니다: ${participantsError.message}`);
    }

    if (!participants || participants.length === 0) {
      throw new Error('배정할 참가자가 없습니다. 등록 완료된 참가자가 필요합니다.');
    }

    // 2) 기존 배정 삭제
    const { error: deleteError } = await supabaseAdmin
      .from('table_assignments')
      .delete()
      .eq('event_id', eventId);

    if (deleteError) {
      console.error('기존 배정 삭제 오류:', deleteError);
      // 삭제 실패해도 계속 진행 (이미 비어있을 수 있음)
    }

    // 3) 테이블 로드
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('tables')
      .select('id, name, capacity, sort_order')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true });

    if (tablesError) {
      throw new Error(`테이블 정보를 불러오지 못했습니다: ${tablesError.message}`);
    }

    let tableList = tables || [];

    // 3-1) 테이블이 없으면 기본 생성 (8인용 테이블)
    if (!tableList.length) {
      const defaultCapacity = 8;
      const defaultTableCount = Math.ceil(participants.length / defaultCapacity) || 1; // 최소 1개

      const insertPayload = Array.from({ length: defaultTableCount }).map((_, index) => ({
        event_id: eventId,
        name: `Table ${index + 1}`,
        capacity: defaultCapacity,
        sort_order: index + 1,
      }));

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('tables')
        .insert(insertPayload)
        .select('id, name, capacity, sort_order')
        .order('sort_order', { ascending: true });

      if (insertError) {
        throw new Error(`기본 테이블 생성에 실패했습니다: ${insertError.message}`);
      }

      tableList = inserted || [];
    }

    if (!tableList.length) {
      throw new Error('사용 가능한 테이블이 없습니다.');
    }

    // 4) Round-robin 배정
    const assignments: Array<{
      event_id: string;
      table_id: string;
      participant_id: string;
      seat_number: number | null;
    }> = [];

    // 각 테이블별 현재 인원/다음 seat_number 추적
    const tableState = tableList.map((t) => ({
      id: t.id as string,
      capacity: t.capacity as number,
      assigned: 0,
      nextSeat: 1,
    }));

    let unassignedCount = 0;
    let tableIndex = 0;

    for (const participant of participants) {
      // 가용 테이블을 찾기 위한 시도 횟수
      let tried = 0;
      let assigned = false;

      while (tried < tableState.length) {
        const ts = tableState[tableIndex];

        if (ts.assigned < ts.capacity) {
          assignments.push({
            event_id: eventId,
            table_id: ts.id,
            participant_id: participant.id,
            seat_number: ts.nextSeat,
          });

          ts.assigned += 1;
          ts.nextSeat += 1;
          assigned = true;
          tableIndex = (tableIndex + 1) % tableState.length;
          break;
        }

        // 현재 테이블이 full이면 다음 테이블로
        tableIndex = (tableIndex + 1) % tableState.length;
        tried += 1;
      }

      if (!assigned) {
        unassignedCount += 1;
      }
    }

    // 5) DB insert
    if (assignments.length > 0) {
      const { error: insertAssignError } = await supabaseAdmin
        .from('table_assignments')
        .insert(assignments);

      if (insertAssignError) {
        throw new Error(`테이블 배정 저장에 실패했습니다: ${insertAssignError.message}`);
      }
    }

    // 6) 결과 반환
    const totalParticipants = participants.length;
    const assignedCount = assignments.length;
    const resultUnassigned = totalParticipants - assignedCount;

    // 화면 재검증
    revalidatePath(`/admin/events/${eventId}/tables`);

    return {
      totalParticipants,
      assignedCount,
      unassignedCount: resultUnassigned > 0 ? resultUnassigned : 0,
      tableCount: tableState.length,
    };
  } catch (error: any) {
    console.error('assignTablesAction error:', error);
    throw error;
  }
}

