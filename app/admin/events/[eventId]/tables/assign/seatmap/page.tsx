/**
 * Seat Map Page
 * 
 * Live Seat Map View with PNG/PDF export functionality
 */

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import SeatMapClient from './SeatMapClient';
import type { TableForAssignment } from '@/lib/tables/assignmentTypes';

type SeatMapPageProps = {
  params: Promise<{ eventId?: string }>;
};

interface Participant {
  id: string;
  name: string;
  is_vip?: boolean;
  company?: string | null;
}

interface TableAssignmentRow {
  id: string;
  event_id: string;
  participant_id: string;
  table_id: string;
  is_draft: boolean;
}

interface TableRow {
  id: string;
  name: string;
  capacity: number;
  is_vip_table?: boolean;
}

export default async function SeatMapPage({ params }: SeatMapPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // Fetch tables
  const { data: tablesData, error: tablesError } = await supabaseAdmin
    .from('event_tables')
    .select('id, name, capacity, is_vip_table')
    .eq('event_id', eventId)
    .order('name');

  if (tablesError) {
    console.error('Failed to load tables:', tablesError);
    return <div>Failed to load tables</div>;
  }

  // Fetch participants
  const { data: participantsData, error: participantsError } = await supabaseAdmin
    .from('event_participants')
    .select('id, name, is_vip, company')
    .eq('event_id', eventId)
    .eq('is_active', true);

  if (participantsError) {
    console.error('Failed to load participants:', participantsError);
    return <div>Failed to load participants</div>;
  }

  // Fetch assignments (prefer confirmed, fallback to draft)
  const { data: assignmentsData, error: assignmentsError } = await supabaseAdmin
    .from('table_assignments')
    .select('id, event_id, participant_id, table_id, is_draft')
    .eq('event_id', eventId)
    .order('is_draft', { ascending: true }); // Confirmed first

  if (assignmentsError) {
    console.error('Failed to load assignments:', assignmentsError);
    return <div>Failed to load assignments</div>;
  }

  const tables: TableForAssignment[] =
    tablesData?.map((t: TableRow) => ({
      id: t.id,
      name: t.name,
      capacity: t.capacity,
      isVipTable: t.is_vip_table,
    })) ?? [];

  const participants = (participantsData ?? []).map((p: Participant) => ({
    id: p.id,
    name: p.name,
    isVip: p.is_vip,
    company: p.company,
  }));

  // Build assignments array
  const assignments = (assignmentsData ?? []).map((a: TableAssignmentRow) => {
    const table = tables.find((t) => t.id === a.table_id);
    return {
      participantId: a.participant_id,
      tableId: a.table_id,
      tableName: table?.name || '',
      isVip: participants.find((p) => p.id === a.participant_id)?.isVip || false,
    };
  });

  // Use confirmed assignments if available, otherwise use draft
  const confirmedAssignments = assignments.filter((_, index) => {
    const assignment = assignmentsData?.[index];
    return assignment && !assignment.is_draft;
  });

  const assignmentsToUse = confirmedAssignments.length > 0 ? confirmedAssignments : assignments;

  return (
    <AdminPage title="Seat Map" subtitle="좌석 배정 현황을 시각적으로 확인합니다">
      <SeatMapClient
        eventId={eventId}
        tables={tables}
        participants={participants}
        assignments={assignmentsToUse}
      />
    </AdminPage>
  );
}

