export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { assertEventStaffAuth, getCurrentUserWithRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import StaffLayoutShell from '@/components/staff/StaffLayoutShell';
import StaffScannerClient from '@/components/staff/StaffScannerClient';

type StaffScannerPageProps = {
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

export default async function StaffScannerPage({ params }: StaffScannerPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // 권한 체크
  const staffInfo = await assertEventStaffAuth(eventId);
  const userInfo = await getCurrentUserWithRole();

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
          <h1 className="text-2xl font-semibold text-gray-900">체크인 스캐너</h1>
          <p className="text-sm text-gray-500 mt-1">QR 코드를 스캔하거나 참가자 정보를 입력하세요.</p>
        </div>
        <StaffScannerClient eventId={eventId} staffEmail={staffInfo.email} />
      </div>
    </StaffLayoutShell>
  );
}

