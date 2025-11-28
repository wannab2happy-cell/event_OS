export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import UpdatesDashboardClient from '@/components/admin/UpdatesDashboardClient';

type UpdatesPageProps = {
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

async function fetchUpdateLogs(eventId: string) {
  // operation_logs에서 participant_update만 필터
  const { data: logs, error } = await supabaseAdmin
    .from('operation_logs')
    .select('*')
    .eq('event_id', eventId)
    .eq('type', 'participant_update')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Update logs fetch error:', error);
    return [];
  }

  // 참가자 정보 조인 (metadata에서 participant_id 추출)
  const logsWithParticipants = await Promise.all(
    (logs || []).map(async (log) => {
      const participantId = log.metadata?.participant_id;
      if (participantId) {
        const { data: participant } = await supabaseAdmin
          .from('event_participants')
          .select('id, name, email')
          .eq('id', participantId)
          .single();

        return {
          ...log,
          participant: participant || null,
        };
      }
      return {
        ...log,
        participant: null,
      };
    })
  );

  return logsWithParticipants;
}

async function fetchUpdateStats(eventId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  // 오늘 변경 건수
  const { count: todayCount } = await supabaseAdmin
    .from('operation_logs')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('type', 'participant_update')
    .gte('created_at', todayISO);

  // 지난 7일 변경 건수
  const { count: last7DaysCount } = await supabaseAdmin
    .from('operation_logs')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('type', 'participant_update')
    .gte('created_at', sevenDaysAgoISO);

  // 가장 많이 변경된 필드 TOP 3
  const { data: allLogs } = await supabaseAdmin
    .from('operation_logs')
    .select('metadata')
    .eq('event_id', eventId)
    .eq('type', 'participant_update')
    .gte('created_at', sevenDaysAgoISO);

  const fieldCounts: Record<string, number> = {};
  allLogs?.forEach((log) => {
    const changes = log.metadata?.changes || [];
    changes.forEach((change: any) => {
      const field = change.field;
      fieldCounts[field] = (fieldCounts[field] || 0) + 1;
    });
  });

  const topFields = Object.entries(fieldCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([field]) => field);

  return {
    todayUpdates: todayCount || 0,
    last7DaysUpdates: last7DaysCount || 0,
    topFields,
  };
}

export default async function UpdatesPage({ params }: UpdatesPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, logs, stats] = await Promise.all([
    fetchEvent(eventId),
    fetchUpdateLogs(eventId),
    fetchUpdateStats(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">정보 변경 로그</h1>
        <p className="text-sm text-gray-500 mt-1">
          {event.title} ({event.code}) - 참가자 정보 변경 이력을 확인하세요.
        </p>
      </div>

      {/* 업데이트 대시보드 클라이언트 컴포넌트 */}
      <UpdatesDashboardClient eventId={eventId} logs={logs} stats={stats} />
    </div>
  );
}

