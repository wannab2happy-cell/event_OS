export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import DashboardClient from '@/components/admin/DashboardClient';

type LivePageProps = {
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

  // VIP 체크인 수
  const { count: vipCheckedInCount } = await supabaseAdmin
    .from('event_participants')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('is_checked_in', true)
    .gt('vip_level', 0);

  // 오늘 정보 변경 건수
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const { count: todayUpdatesCount } = await supabaseAdmin
    .from('operation_logs')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('type', 'participant_update')
    .gte('created_at', todayISO);

  return {
    totalParticipants: totalCount || 0,
    checkedIn: checkedInCount || 0,
    vipCheckedIn: vipCheckedInCount || 0,
    todayUpdates: todayUpdatesCount || 0,
  };
}

async function fetchRecentCheckins(eventId: string) {
  const { data: logs, error } = await supabaseAdmin
    .from('checkin_logs')
    .select(`
      id,
      created_at,
      is_duplicate,
      scanned_by,
      participant:event_participants!inner (
        id,
        name,
        email,
        vip_level,
        company
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Recent checkins fetch error:', error);
    return [];
  }

  return logs || [];
}

async function fetchHourlyCheckinData(eventId: string) {
  // 오늘 날짜 기준으로 체크인 로그 조회
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const { data: logs, error } = await supabaseAdmin
    .from('checkin_logs')
    .select('created_at, is_duplicate')
    .eq('event_id', eventId)
    .gte('created_at', todayISO)
    .eq('is_duplicate', false); // 중복 제외

  if (error) {
    console.error('Hourly checkin data fetch error:', error);
    return [];
  }

  // 시간대별로 그룹화
  const hourlyData: Record<string, number> = {};

  logs?.forEach((log) => {
    const date = new Date(log.created_at);
    const hour = String(date.getHours()).padStart(2, '0');
    const hourKey = `${hour}:00`;

    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = 0;
    }
    hourlyData[hourKey]++;
  });

  // 시간대별로 정렬하여 배열로 변환
  const result = Object.entries(hourlyData)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  return result;
}

export default async function LivePage({ params }: LivePageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, stats, recentCheckins, hourlyData] = await Promise.all([
    fetchEvent(eventId),
    fetchDashboardStats(eventId),
    fetchRecentCheckins(eventId),
    fetchHourlyCheckinData(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  // 로그 데이터 변환
  const transformedCheckins = recentCheckins.map((log: any) => ({
    id: log.id,
    createdAt: log.created_at,
    isDuplicate: log.is_duplicate,
    scannedBy: log.scanned_by,
    participant: {
      id: log.participant.id,
      name: log.participant.name,
      email: log.participant.email,
      vipLevel: log.participant.vip_level || 0,
      company: log.participant.company,
    },
  }));

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">라이브 체크인 대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">
          {event.title} ({event.code}) - 실시간 체크인 현황을 확인하세요.
        </p>
      </div>

      {/* 대시보드 클라이언트 컴포넌트 */}
      <DashboardClient
        eventId={eventId}
        stats={stats}
        recentCheckins={transformedCheckins}
        hourlyData={hourlyData}
      />
    </div>
  );
}

