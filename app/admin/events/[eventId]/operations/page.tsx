export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import OperationDashboardClient from '@/components/admin/OperationDashboardClient';

type OperationsPageProps = {
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

async function fetchOperationsStats(eventId: string) {
  // 총 참가자 수
  const { count: totalCount } = await supabaseAdmin
    .from('event_participants')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);

  // 등록 완료자 수
  const { count: completedCount } = await supabaseAdmin
    .from('event_participants')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'completed');

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

  // Push 구독자 수
  const { count: pushSubscribersCount } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);

  // 오늘 변경된 정보 수 (participant_update 타입만, 오늘 날짜 기준)
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
    completed: completedCount || 0,
    checkedIn: checkedInCount || 0,
    vipCheckedIn: vipCheckedInCount || 0,
    pushSubscribers: pushSubscribersCount || 0,
    todayUpdates: todayUpdatesCount || 0,
  };
}

async function fetchOperationLogs(eventId: string) {
  // operation_logs 조회
  const { data: operationLogs, error: opError } = await supabaseAdmin
    .from('operation_logs')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (opError) {
    console.error('Operation logs fetch error:', opError);
  }

  // 체크인 로그 조회
  const { data: checkinLogs, error: checkinError } = await supabaseAdmin
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
        vip_level
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (checkinError) {
    console.error('Checkin logs fetch error:', checkinError);
  }

  // 통합 로그 생성
  const integratedLogs: Array<{
    id: string;
    type: string;
    message: string;
    actor: string | null;
    createdAt: string;
    metadata?: any;
    participant?: {
      id: string;
      name: string;
      email: string;
      vipLevel: number;
    };
  }> = [];

  // operation_logs 추가
  operationLogs?.forEach((log) => {
    integratedLogs.push({
      id: log.id,
      type: log.type,
      message: log.message,
      actor: log.actor,
      createdAt: log.created_at,
      metadata: log.metadata,
    });
  });

  // checkin_logs 추가
  checkinLogs?.forEach((log: any) => {
    integratedLogs.push({
      id: log.id,
      type: 'checkin',
      message: log.is_duplicate
        ? `${log.participant.name} 님 중복 체크인 시도`
        : `${log.participant.name} 님 체크인 완료`,
      actor: log.scanned_by,
      createdAt: log.created_at,
      metadata: { is_duplicate: log.is_duplicate },
      participant: {
        id: log.participant.id,
        name: log.participant.name,
        email: log.participant.email,
        vipLevel: log.participant.vip_level || 0,
      },
    });
  });

  // 시간순 정렬 (최신순)
  integratedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return integratedLogs.slice(0, 100);
}

export default async function OperationsPage({ params }: OperationsPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, stats, logs] = await Promise.all([
    fetchEvent(eventId),
    fetchOperationsStats(eventId),
    fetchOperationLogs(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">운영 메인 대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">
          {event.title} ({event.code}) - 실시간 운영 현황을 확인하세요.
        </p>
      </div>

      {/* 운영 대시보드 클라이언트 컴포넌트 */}
      <OperationDashboardClient eventId={eventId} stats={stats} logs={logs} />
    </div>
  );
}

