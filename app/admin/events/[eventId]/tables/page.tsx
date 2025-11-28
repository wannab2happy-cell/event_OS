export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import TablesClient from '@/components/admin/TablesClient';

type TablesPageProps = {
  params: Promise<{ eventId?: string }>;
};

async function fetchEvent(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('id, title, code')
    .eq('id', eventId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function fetchTablesData(eventId: string) {
  // 참가자 (등록 완료된 참가자만)
  const { data: participants, error: participantsError } = await supabaseAdmin
    .from('event_participants')
    .select('id, name, email, status, company, vip_level')
    .eq('event_id', eventId)
    .eq('status', 'completed')
    .order('name', { ascending: true });

  if (participantsError) {
    console.error('Participants fetch error:', participantsError);
  }

  // 테이블
  const { data: tables, error: tablesError } = await supabaseAdmin
    .from('tables')
    .select('id, name, capacity, sort_order')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true });

  if (tablesError) {
    console.error('Tables fetch error:', tablesError);
  }

  // 확정 배정 (is_draft = false)
  const { data: confirmedAssignments, error: confirmedError } = await supabaseAdmin
    .from('table_assignments')
    .select('id, table_id, participant_id, seat_number, is_draft')
    .eq('event_id', eventId)
    .eq('is_draft', false);

  if (confirmedError) {
    console.error('Confirmed assignments fetch error:', confirmedError);
  }

  // Draft 배정 (is_draft = true)
  const { data: draftAssignments, error: draftError } = await supabaseAdmin
    .from('table_assignments')
    .select('id, table_id, participant_id, seat_number, is_draft')
    .eq('event_id', eventId)
    .eq('is_draft', true);

  if (draftError) {
    console.error('Draft assignments fetch error:', draftError);
  }

  return {
    participants: participants || [],
    tables: tables || [],
    confirmedAssignments: confirmedAssignments || [],
    draftAssignments: draftAssignments || [],
  };
}

export default async function TablesPage({ params }: TablesPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, tablesData] = await Promise.all([
    fetchEvent(eventId),
    fetchTablesData(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  const { participants, tables, confirmedAssignments, draftAssignments } = tablesData;

  // Summary 계산
  const totalParticipants = participants.length;
  const allAssignments = [...confirmedAssignments, ...draftAssignments];
  const assignedParticipantIds = new Set(allAssignments.map((a) => a.participant_id));
  const assignedCount = assignedParticipantIds.size;
  const unassignedCount = totalParticipants - assignedCount;
  const tableCount = tables.length;
  const draftCount = draftAssignments.length;
  const confirmedCount = confirmedAssignments.length;

  // 미배정 참가자 목록
  const unassignedParticipants = participants.filter(
    (p) => !assignedParticipantIds.has(p.id)
  );

  // Tables with participants 매핑 (Confirmed + Draft 구분)
  const tablesWithAssignments = tables.map((table) => {
    const tableConfirmed = confirmedAssignments.filter((a) => a.table_id === table.id);
    const tableDraft = draftAssignments.filter((a) => a.table_id === table.id);

    const confirmedList = tableConfirmed.map((a) => {
      const participant = participants.find((p) => p.id === a.participant_id);
      return participant
        ? {
            assignmentId: a.id,
            participantId: participant.id,
            name: participant.name,
            company: participant.company,
            vipLevel: participant.vip_level || 0,
            seatNumber: a.seat_number,
            isDraft: false,
          }
        : null;
    }).filter((p): p is NonNullable<typeof p> => p !== null);

    const draftList = tableDraft.map((a) => {
      const participant = participants.find((p) => p.id === a.participant_id);
      return participant
        ? {
            assignmentId: a.id,
            participantId: participant.id,
            name: participant.name,
            company: participant.company,
            vipLevel: participant.vip_level || 0,
            seatNumber: a.seat_number,
            isDraft: true,
          }
        : null;
    }).filter((p): p is NonNullable<typeof p> => p !== null);

    return {
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      confirmedAssignments: confirmedList,
      draftAssignments: draftList,
      totalAssigned: confirmedList.length + draftList.length,
    };
  });

  const summary = {
    totalParticipants,
    tableCount,
    assignedCount,
    unassignedCount: unassignedCount > 0 ? unassignedCount : 0,
    draftCount,
    confirmedCount,
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">테이블 배정</h1>
        <p className="text-sm text-gray-500 mt-1">
          {event.title} ({event.code}) - 참가자 좌석 배정을 관리하세요.
        </p>
      </div>

      {/* 테이블 배정 클라이언트 컴포넌트 */}
      <TablesClient
        eventId={eventId}
        summary={summary}
        tables={tablesWithAssignments}
        unassignedParticipants={unassignedParticipants.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          company: p.company,
          vipLevel: p.vip_level || 0,
        }))}
      />
    </div>
  );
}

