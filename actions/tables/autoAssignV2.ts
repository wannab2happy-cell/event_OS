'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCurrentUserWithRole } from '@/lib/auth';
import { createOperationLog } from '@/actions/operations/createLog';

interface AutoAssignV2Input {
  eventId: string;
  algorithm: 'round_robin' | 'vip_spread' | 'group_by_company';
}

interface AutoAssignV2Result {
  totalParticipants: number;
  assignedCount: number;
  unassignedCount: number;
  tableCount: number;
}

/**
 * Table Assignment Engine v2: 자동 배정 (Draft 생성)
 */
export async function autoAssignV2Action(input: unknown): Promise<AutoAssignV2Result> {
  try {
    const { eventId, algorithm } = input as AutoAssignV2Input;

    if (!eventId || typeof eventId !== 'string') {
      throw new Error('eventId is required');
    }

    if (!['round_robin', 'vip_spread', 'group_by_company'].includes(algorithm)) {
      throw new Error('Invalid algorithm');
    }

    // 관리자 정보 가져오기
    const userInfo = await getCurrentUserWithRole();
    const assignedBy = userInfo?.email || 'admin';

    // 1) 기존 Draft 배정 삭제
    const { error: deleteError } = await supabaseAdmin
      .from('table_assignments')
      .delete()
      .eq('event_id', eventId)
      .eq('is_draft', true);

    if (deleteError) {
      console.error('Draft 삭제 오류:', deleteError);
      // 삭제 실패해도 계속 진행
    }

    // 2) 참가자 로드 (등록 완료된 참가자만)
    const { data: participants, error: participantsError } = await supabaseAdmin
      .from('event_participants')
      .select('id, name, email, status, company, vip_level')
      .eq('event_id', eventId)
      .eq('status', 'completed')
      .order('name', { ascending: true });

    if (participantsError) {
      throw new Error(`참가자 정보를 불러오지 못했습니다: ${participantsError.message}`);
    }

    if (!participants || participants.length === 0) {
      throw new Error('배정할 참가자가 없습니다.');
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

    // 테이블이 없으면 기본 생성
    if (!tableList.length) {
      const defaultCapacity = 8;
      const defaultTableCount = Math.ceil(participants.length / defaultCapacity) || 1;

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

    // 4) 알고리즘별 배정 로직
    const batchId = crypto.randomUUID();
    const assignments: Array<{
      event_id: string;
      table_id: string;
      participant_id: string;
      seat_number: number;
      is_draft: boolean;
      source: string;
      batch_id: string;
      assigned_by: string;
      assigned_at: string;
    }> = [];

    // 테이블 상태 추적
    const tableState = tableList.map((t) => ({
      id: t.id as string,
      capacity: t.capacity as number,
      assigned: 0,
      nextSeat: 1,
    }));

    if (algorithm === 'round_robin') {
      // 기본 Round-robin
      let tableIndex = 0;
      for (const participant of participants) {
        let assigned = false;
        let tried = 0;

        while (tried < tableState.length) {
          const ts = tableState[tableIndex];
          if (ts.assigned < ts.capacity) {
            assignments.push({
              event_id: eventId,
              table_id: ts.id,
              participant_id: participant.id,
              seat_number: ts.nextSeat,
              is_draft: true,
              source: 'auto_round_robin',
              batch_id: batchId,
              assigned_by: assignedBy,
              assigned_at: new Date().toISOString(),
            });
            ts.assigned += 1;
            ts.nextSeat += 1;
            assigned = true;
            tableIndex = (tableIndex + 1) % tableState.length;
            break;
          }
          tableIndex = (tableIndex + 1) % tableState.length;
          tried += 1;
        }

        if (!assigned) {
          // 모든 테이블이 가득 참
          break;
        }
      }
    } else if (algorithm === 'vip_spread') {
      // VIP 분산 Round-robin
      const vipParticipants = participants.filter((p) => (p.vip_level || 0) > 0);
      const regularParticipants = participants.filter((p) => (p.vip_level || 0) === 0);

      // 1단계: VIP를 테이블에 균등 분산
      let tableIndex = 0;
      for (const vip of vipParticipants) {
        let assigned = false;
        let tried = 0;

        while (tried < tableState.length) {
          const ts = tableState[tableIndex];
          if (ts.assigned < ts.capacity) {
            assignments.push({
              event_id: eventId,
              table_id: ts.id,
              participant_id: vip.id,
              seat_number: ts.nextSeat,
              is_draft: true,
              source: 'auto_vip_spread',
              batch_id: batchId,
              assigned_by: assignedBy,
              assigned_at: new Date().toISOString(),
            });
            ts.assigned += 1;
            ts.nextSeat += 1;
            assigned = true;
            tableIndex = (tableIndex + 1) % tableState.length;
            break;
          }
          tableIndex = (tableIndex + 1) % tableState.length;
          tried += 1;
        }
      }

      // 2단계: 일반 참가자를 Round-robin으로 채움
      for (const participant of regularParticipants) {
        let assigned = false;
        let tried = 0;

        while (tried < tableState.length) {
          const ts = tableState[tableIndex];
          if (ts.assigned < ts.capacity) {
            assignments.push({
              event_id: eventId,
              table_id: ts.id,
              participant_id: participant.id,
              seat_number: ts.nextSeat,
              is_draft: true,
              source: 'auto_vip_spread',
              batch_id: batchId,
              assigned_by: assignedBy,
              assigned_at: new Date().toISOString(),
            });
            ts.assigned += 1;
            ts.nextSeat += 1;
            assigned = true;
            tableIndex = (tableIndex + 1) % tableState.length;
            break;
          }
          tableIndex = (tableIndex + 1) % tableState.length;
          tried += 1;
        }

        if (!assigned) {
          break;
        }
      }
    } else if (algorithm === 'group_by_company') {
      // 그룹(회사) 기반 배치
      const groups = new Map<string, typeof participants>();
      for (const participant of participants) {
        const key = participant.company || '기타';
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(participant);
      }

      let tableIndex = 0;
      for (const [company, groupMembers] of groups.entries()) {
        // 그룹 단위로 테이블에 배정
        for (const participant of groupMembers) {
          let assigned = false;
          let tried = 0;
          const startTableIndex = tableIndex;

          while (tried < tableState.length) {
            const ts = tableState[tableIndex];
            if (ts.assigned < ts.capacity) {
              assignments.push({
                event_id: eventId,
                table_id: ts.id,
                participant_id: participant.id,
                seat_number: ts.nextSeat,
                is_draft: true,
                source: 'auto_group_by_company',
                batch_id: batchId,
                assigned_by: assignedBy,
                assigned_at: new Date().toISOString(),
              });
              ts.assigned += 1;
              ts.nextSeat += 1;
              assigned = true;
              // 같은 그룹은 같은 테이블에 최대한 모으기 위해 tableIndex 유지
              // 다음 그룹으로 넘어갈 때만 tableIndex 증가
              break;
            }
            // 현재 테이블이 가득 차면 다음 테이블로
            tableIndex = (tableIndex + 1) % tableState.length;
            tried += 1;
          }

          if (!assigned) {
            // 모든 테이블이 가득 참
            break;
          }
        }

        // 그룹 배정 완료 후 다음 테이블로 이동
        tableIndex = (tableIndex + 1) % tableState.length;
      }
    }

    // 5) DB insert
    if (assignments.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('table_assignments')
        .insert(assignments);

      if (insertError) {
        throw new Error(`테이블 배정 저장에 실패했습니다: ${insertError.message}`);
      }
    }

    // 6) operation_logs 기록
    await createOperationLog({
      eventId,
      type: 'table_assign_auto',
      message: `[TABLE] Auto assign (${algorithm}) 완료`,
      actor: assignedBy,
      metadata: {
        algorithm,
        totalParticipants: participants.length,
        totalTables: tableList.length,
        assignedCount: assignments.length,
      },
    });

    // 7) 결과 반환
    const totalParticipants = participants.length;
    const assignedCount = assignments.length;
    const unassignedCount = totalParticipants - assignedCount;

    revalidatePath(`/admin/events/${eventId}/tables`);

    return {
      totalParticipants,
      assignedCount,
      unassignedCount: unassignedCount > 0 ? unassignedCount : 0,
      tableCount: tableList.length,
    };
  } catch (error: any) {
    console.error('autoAssignV2Action error:', error);
    throw error;
  }
}

