export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { assertAdminAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import ExportCenterClient from '@/components/admin/ExportCenterClient';

type ExportPageProps = {
  params: Promise<{ eventId?: string }>;
};

interface ExportSummary {
  totalParticipants: number;
  vipCount: number;
  tableCount: number;
  checkedInCount: number;
}

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

async function fetchExportSummary(eventId: string): Promise<ExportSummary> {
  // 총 참가자 수
  const { count: totalParticipants } = await supabaseAdmin
    .from('event_participants')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);

  // VIP 수 (vip_level > 0 또는 guest_of IS NOT NULL)
  const { count: vipCount } = await supabaseAdmin
    .from('event_participants')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .or('vip_level.gt.0,guest_of.not.is.null');

  // 테이블 수
  const { count: tableCount } = await supabaseAdmin
    .from('tables')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId);

  // 체크인 완료 수
  const { count: checkedInCount } = await supabaseAdmin
    .from('event_participants')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('is_checked_in', true);

  return {
    totalParticipants: totalParticipants || 0,
    vipCount: vipCount || 0,
    tableCount: tableCount || 0,
    checkedInCount: checkedInCount || 0,
  };
}

export default async function ExportPage({ params }: ExportPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, summary] = await Promise.all([
    fetchEvent(eventId),
    fetchExportSummary(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Export & Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          {event.title} ({event.code}) - 이벤트 운영에 필요한 참가자/테이블/체크인 리포트를 CSV / Print / PDF로
          내려받거나 확인할 수 있습니다.
        </p>
      </div>
      <ExportCenterClient event={event} summary={summary} eventId={eventId} />
    </div>
  );
}

