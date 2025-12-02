import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MyTableClient from './MyTableClient';

type MyTablePageProps = {
  params: Promise<{ eventCode?: string }>;
  searchParams: Promise<{ pid?: string }>;
};

interface EventData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  location_name?: string | null;
}

interface ParticipantData {
  id: string;
  name: string;
  company_name?: string | null;
  is_vip?: boolean;
}

interface TableData {
  id: string;
  name: string;
  capacity: number;
}

export default async function MyTablePage({ params, searchParams }: MyTablePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const eventCode = resolvedParams?.eventCode;
  const participantId = resolvedSearchParams?.pid;

  if (!eventCode) {
    return notFound();
  }

  if (!participantId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">참가자 정보가 필요합니다</h1>
          <p className="text-gray-600">올바른 링크를 통해 접속해주세요.</p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  // Fetch event by code
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, title, start_date, end_date, location_name')
    .eq('code', eventCode)
    .single();

  if (eventError || !event) {
    return notFound();
  }

  // Fetch participant
  const { data: participant, error: participantError } = await supabase
    .from('event_participants')
    .select('id, name, company_name, is_vip')
    .eq('id', participantId)
    .eq('event_id', event.id)
    .eq('is_active', true)
    .single();

  if (participantError || !participant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">참가자 정보를 찾을 수 없습니다</h1>
          <p className="text-gray-600">올바른 링크를 통해 접속해주세요.</p>
        </div>
      </div>
    );
  }

  // Fetch confirmed assignment only
  const { data: assignment, error: assignmentError } = await supabase
    .from('table_assignments')
    .select('table_id')
    .eq('participant_id', participantId)
    .eq('event_id', event.id)
    .eq('is_draft', false)
    .maybeSingle();

  let table: TableData | null = null;

  if (assignment?.table_id) {
    const { data: tableData, error: tableError } = await supabase
      .from('event_tables')
      .select('id, name, capacity')
      .eq('id', assignment.table_id)
      .single();

    if (!tableError && tableData) {
      table = tableData;
    }
  }

  return (
    <MyTableClient
      event={event as EventData}
      participant={participant as ParticipantData}
      table={table}
    />
  );
}

