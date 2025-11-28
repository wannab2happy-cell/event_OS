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
    .select('id, name, email, status, company')
    .eq('event_id', eventId)
    .eq('status', 'completed');

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

  // 배정
  const { data: assignments, error: assignmentsError } = await supabaseAdmin
    .from('table_assignments')
    .select('id, table_id, participant_id, seat_number')
    .eq('event_id', eventId);

  if (assignmentsError) {
    console.error('Assignments fetch error:', assignmentsError);
  }

  return {
    participants: participants || [],
    tables: tables || [],
    assignments: assignments || [],
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

  const { participants, tables, assignments } = tablesData;

  // Summary 계산
  const totalParticipants = participants.length;
  const assignedParticipantIds = new Set(assignments.map((a) => a.participant_id));
  const assignedCount = assignedParticipantIds.size;
  const unassignedCount = totalParticipants - assignedCount;
  const tableCount = tables.length;

  // Tables with participants 매핑
  const tablesWithParticipants = tables.map((table) => {
    const tableAssignments = assignments.filter((a) => a.table_id === table.id);
    const participantList = tableAssignments
      .map((a) => {
        const participant = participants.find((p) => p.id === a.participant_id);
        return participant
          ? {
              id: participant.id,
              name: participant.name,
              company: participant.company,
            }
          : null;
      })
      .filter((p): p is { id: string; name: string; company: string | null } => p !== null);

    return {
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      assignedCount: participantList.length,
      participants: participantList,
    };
  });

  const summary = {
    totalParticipants,
    tableCount,
    assignedCount,
    unassignedCount: unassignedCount > 0 ? unassignedCount : 0,
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
      <TablesClient eventId={eventId} summary={summary} tables={tablesWithParticipants} />
    </div>
  );
}

