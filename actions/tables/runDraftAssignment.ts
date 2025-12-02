'use server';

import { createClient } from '@/lib/supabase/server';
import { runAlgorithm } from '@/lib/tables/runAlgorithm';
import { TableAssignmentOptions } from '@/lib/tables/assignmentTypes';

export async function runDraftAssignment(options: TableAssignmentOptions) {
  const supabase = await createClient();

  // 1) 참가자 로드
  const { data: participants, error: participantsError } = await supabase
    .from('event_participants')
    .select('id, name, company, company_id, company_name, is_vip')
    .eq('event_id', options.eventId)
    .eq('is_active', true);

  if (participantsError) {
    throw new Error(`Failed to load participants: ${participantsError.message}`);
  }

  if (!participants || participants.length === 0) {
    throw new Error('No active participants found for this event');
  }

  // 2) 테이블 로드
  const { data: tables, error: tablesError } = await supabase
    .from('event_tables')
    .select('id, name, capacity, is_vip_table')
    .eq('event_id', options.eventId);

  if (tablesError) {
    throw new Error(`Failed to load tables: ${tablesError.message}`);
  }

  if (!tables || tables.length === 0) {
    throw new Error('No tables found for this event');
  }

  // 3) 알고리즘 실행
  const result = runAlgorithm(
    options,
    participants.map((p) => ({
      id: p.id,
      name: p.name,
      company: p.company,
      companyId: (p as any).company_id || null,
      companyName: p.company || null,
      isVip: p.is_vip,
    })),
    tables.map((t) => ({
      id: t.id,
      name: t.name,
      capacity: t.capacity,
      isVipTable: t.is_vip_table,
    }))
  );

  // 4) 기존 draft 삭제
  const { error: deleteError } = await supabase
    .from('table_assignments')
    .delete()
    .eq('event_id', options.eventId)
    .eq('is_draft', true);

  if (deleteError) {
    throw new Error(`Failed to clear existing drafts: ${deleteError.message}`);
  }

  // 5) Draft Insert
  const payload = result.assignments.map((a) => ({
    event_id: options.eventId,
    participant_id: a.participantId,
    table_id: a.tableId,
    is_draft: true,
    source: `auto_${options.algorithm}`,
    batch_id: result.batchId,
    assigned_by: options.requestedBy || null,
  }));

  const { error: insertError } = await supabase
    .from('table_assignments')
    .insert(payload);

  if (insertError) {
    throw new Error(`Failed to save draft assignments: ${insertError.message}`);
  }

  return result;
}

