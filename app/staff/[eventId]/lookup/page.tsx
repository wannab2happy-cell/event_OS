export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { assertEventStaffAuth, getCurrentUserWithRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import StaffLayoutShell from '@/components/staff/StaffLayoutShell';
import StaffLookupClient from '@/components/staff/StaffLookupClient';

type StaffLookupPageProps = {
  params: Promise<{ eventId?: string }>;
  searchParams?: Promise<{ participantId?: string }>;
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

export default async function StaffLookupPage({ params, searchParams }: StaffLookupPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // 권한 체크
  await assertEventStaffAuth(eventId);
  const userInfo = await getCurrentUserWithRole();

  const resolvedSearch = searchParams ? await searchParams : {};
  const participantId = resolvedSearch?.participantId;

  const [event, todaySummary] = await Promise.all([
    fetchEvent(eventId),
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
          <h1 className="text-2xl font-semibold text-gray-900">참가자 검색</h1>
          <p className="text-sm text-gray-500 mt-1">이름, 이메일, 회사로 참가자를 검색하고 상세 정보를 확인하세요.</p>
        </div>
        <StaffLookupClient eventId={eventId} initialParticipantId={participantId} staffEmail={userInfo?.email || ''} />
      </div>
    </StaffLayoutShell>
  );
}

