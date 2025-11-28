export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { assertEventStaffAuth, getCurrentUserWithRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import StaffLayoutShell from '@/components/staff/StaffLayoutShell';
import StaffParticipantsClient from '@/components/staff/StaffParticipantsClient';

type StaffParticipantsPageProps = {
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

async function fetchParticipants(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('event_participants')
    .select(
      'id, name, email, company, status, is_checked_in, vip_level, checked_in_at'
    )
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Participants fetch error:', error);
    return [];
  }

  // 테이블 배정 정보 조인
  const participantIds = data?.map((p) => p.id) || [];
  if (participantIds.length > 0) {
    const { data: assignments } = await supabaseAdmin
      .from('table_assignments')
      .select('participant_id, table_id, tables(name)')
      .in('participant_id', participantIds);

    const assignmentMap = new Map(
      assignments?.map((a) => [a.participant_id, a.tables?.name || null]) || []
    );

    return (
      data?.map((p) => ({
        ...p,
        tableName: assignmentMap.get(p.id) || null,
      })) || []
    );
  }

  return data || [];
}

async function fetchTodaySummary(eventId: string) {
  const { count: totalCount } = await supabaseAdmin
    .from('event_participants')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);

  const { count: checkedInCount } = await supabaseAdmin
    .from('event_participants')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('is_checked_in', true);

  return {
    totalParticipants: totalCount || 0,
    checkedIn: checkedInCount || 0,
  };
}

export default async function StaffParticipantsPage({ params }: StaffParticipantsPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // 권한 체크
  await assertEventStaffAuth(eventId);
  const userInfo = await getCurrentUserWithRole();

  const [event, participants, todaySummary] = await Promise.all([
    fetchEvent(eventId),
    fetchParticipants(eventId),
    fetchTodaySummary(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  return (
    <StaffLayoutShell
      eventId={eventId}
      eventTitle={event.title}
      eventCode={event.code}
      staffEmail={userInfo?.email}
      todaySummary={todaySummary}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">참가자 리스트</h1>
          <p className="text-sm text-gray-500 mt-1">전체 참가자 목록을 확인하고 검색할 수 있습니다.</p>
        </div>
        <StaffParticipantsClient eventId={eventId} participants={participants} />
      </div>
    </StaffLayoutShell>
  );
}

