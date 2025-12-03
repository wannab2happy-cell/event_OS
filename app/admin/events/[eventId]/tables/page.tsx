import { notFound } from 'next/navigation';
import { cache } from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import { TableForAssignment, TableAssignment } from '@/lib/tables/assignmentTypes';
import { AssignmentStateBadge } from './AssignmentStateBadge';
import { AlgorithmSelector } from './AlgorithmSelector';
import { TableAssignmentPanel } from './TableAssignmentPanel';
import { TableList } from './TableList';
import { TablesPageClient } from './TablesPageClient';

// Revalidate every 10 seconds for server component caching
export const revalidate = 10;

type TablesPageProps = {
  params: Promise<{ eventId?: string }>;
};

interface Participant {
  id: string;
  name: string;
  is_vip?: boolean;
  company?: string | null;
  company_id?: string | null;
  company_name?: string | null;
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

export default async function TablesPage({ params }: TablesPageProps) {
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
    .select('id, name, is_vip, company, company_id, company_name')
    .eq('event_id', eventId)
    .eq('is_active', true);

  if (participantsError) {
    console.error('Failed to load participants:', participantsError);
    return <div>Failed to load participants</div>;
  }

  // Fetch assignments
  const { data: assignmentsData, error: assignmentsError } = await supabaseAdmin
    .from('table_assignments')
    .select('id, event_id, participant_id, table_id, is_draft')
    .eq('event_id', eventId);

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

  const participants: Participant[] = participantsData ?? [];

  const assignmentsDraft: TableAssignment[] = [];
  const assignmentsConfirmed: TableAssignment[] = [];

  if (assignmentsData) {
    for (const assignment of assignmentsData as TableAssignmentRow[]) {
      const table = tables.find((t) => t.id === assignment.table_id);
      if (!table) continue;

      const assignmentObj: TableAssignment = {
        participantId: assignment.participant_id,
        tableId: assignment.table_id,
        tableName: table.name,
        isVip: participants.find((p) => p.id === assignment.participant_id)?.is_vip ?? false,
      };

      if (assignment.is_draft) {
        assignmentsDraft.push(assignmentObj);
      } else {
        assignmentsConfirmed.push(assignmentObj);
      }
    }
  }

  const hasDraft = assignmentsDraft.length > 0;
  const hasConfirmed = assignmentsConfirmed.length > 0;

  // Version history will be lazy-loaded by client component
  // No initial fetch to improve page load time

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Table Assignment</h1>
        <AssignmentStateBadge hasDraft={hasDraft} hasConfirmed={hasConfirmed} />
      </div>

      <TablesPageClient
        eventId={eventId}
        tables={tables}
        participants={participants.map((p) => ({
          id: p.id,
          name: p.name,
          isVip: p.is_vip,
          company: p.company,
          companyId: p.company_id,
          companyName: p.company_name,
        }))}
        assignmentsDraft={assignmentsDraft}
        assignmentsConfirmed={assignmentsConfirmed}
      />
    </div>
  );
}

