export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import ScannerClient from '@/components/admin/ScannerClient';

type ScannerPageProps = {
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

async function fetchRecentCheckinLogs(eventId: string) {
  const { data: logs, error } = await supabaseAdmin
    .from('checkin_logs')
    .select(`
      id,
      created_at,
      is_duplicate,
      scanned_by,
      source,
      participant:event_participants!inner (
        id,
        name,
        email,
        vip_level
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Checkin logs fetch error:', error);
    return [];
  }

  return logs || [];
}

export default async function ScannerPage({ params }: ScannerPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, recentLogs] = await Promise.all([
    fetchEvent(eventId),
    fetchRecentCheckinLogs(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  // 로그 데이터 변환
  const transformedLogs = recentLogs.map((log: any) => ({
    id: log.id,
    createdAt: log.created_at,
    isDuplicate: log.is_duplicate,
    scannedBy: log.scanned_by,
    source: log.source,
    participant: {
      id: log.participant.id,
      name: log.participant.name,
      email: log.participant.email,
      vipLevel: log.participant.vip_level || 0,
    },
  }));

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">체크인 스캐너</h1>
        <p className="text-sm text-gray-500 mt-1">
          {event.title} ({event.code}) - 참가자 QR 코드를 스캔하여 체크인하세요.
        </p>
      </div>

      {/* 스캐너 클라이언트 컴포넌트 */}
      <ScannerClient eventId={eventId} recentLogs={transformedLogs} />
    </div>
  );
}

