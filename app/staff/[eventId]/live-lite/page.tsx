export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { assertEventStaffAuth, getCurrentUserWithRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import StaffLayoutShell from '@/components/staff/StaffLayoutShell';
import StaffLiveLiteClient from '@/components/staff/StaffLiveLiteClient';

type StaffLiveLitePageProps = {
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

async function fetchDashboardStats(eventId: string) {
  // 총 참가자 수
  const { count: totalCount } = await supabaseAdmin
    .from('event_participants')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);

  // 체크인 완료자 수
  const { count: checkedInCount } = await supabaseAdmin
    .from('event_participants')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('is_checked_in', true);

  // 미체크인 수
  const unCheckedInCount = (totalCount || 0) - (checkedInCount || 0);

  // VIP 체크인 수
  const { count: vipCheckedInCount } = await supabaseAdmin
    .from('event_participants')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('is_checked_in', true)
    .gt('vip_level', 0);

  return {
    totalParticipants: totalCount || 0,
    checkedIn: checkedInCount || 0,
    unCheckedIn: unCheckedInCount,
    vipCheckedIn: vipCheckedInCount || 0,
  };
}

async function fetchRecentCheckins(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('checkin_logs')
    .select(
      'id, created_at, is_duplicate, participant:event_participants(id, name, email, vip_level)'
    )
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Recent checkins fetch error:', error);
    return [];
  }

  return (
    data?.map((log: any) => ({
      id: log.id,
      createdAt: log.created_at,
      isDuplicate: log.is_duplicate,
      participant: log.participant || null,
    })) || []
  );
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

export default async function StaffLiveLitePage({ params }: StaffLiveLitePageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // 권한 체크
  await assertEventStaffAuth(eventId);
  const userInfo = await getCurrentUserWithRole();

  const [event, stats, recentCheckins, todaySummary] = await Promise.all([
    fetchEvent(eventId),
    fetchDashboardStats(eventId),
    fetchRecentCheckins(eventId),
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
          <h1 className="text-2xl font-semibold text-gray-900">라이브 현황</h1>
          <p className="text-sm text-gray-500 mt-1">실시간 체크인 현황을 확인하세요.</p>
        </div>
        <StaffLiveLiteClient eventId={eventId} stats={stats} recentCheckins={recentCheckins} />
      </div>
    </StaffLayoutShell>
  );
}

