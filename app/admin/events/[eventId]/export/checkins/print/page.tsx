export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { assertAdminAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createOperationLog } from '@/actions/operations/createLog';

type CheckinsPrintPageProps = {
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

async function fetchCheckinLogs(eventId: string) {
  const { data: checkinLogs, error } = await supabaseAdmin
    .from('checkin_logs')
    .select('id, created_at, source, is_duplicate, scanned_by, participant_id')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Checkin logs fetch error:', error);
    return { logs: [], participantsMap: new Map(), stats: { total: 0, duplicates: 0, kiosk: 0 } };
  }

  // 참가자 정보 조회
  const participantIds = checkinLogs?.map((log) => log.participant_id) || [];
  const participantsMap = new Map<string, any>();

  if (participantIds.length > 0) {
    const { data: participants } = await supabaseAdmin
      .from('event_participants')
      .select('id, name, email, company')
      .in('id', participantIds);

    participants?.forEach((p) => {
      participantsMap.set(p.id, p);
    });
  }

  // 통계 계산
  const total = checkinLogs?.length || 0;
  const duplicates = checkinLogs?.filter((log) => log.is_duplicate).length || 0;
  const kiosk = checkinLogs?.filter((log) => log.source === 'kiosk').length || 0;

  return {
    logs: checkinLogs || [],
    participantsMap,
    stats: {
      total,
      duplicates,
      kiosk,
      kioskRatio: total > 0 ? Math.round((kiosk / total) * 100) : 0,
    },
  };
}

const sourceLabelMap: Record<string, string> = {
  admin_scanner: 'Admin',
  staff_scanner: 'Staff',
  kiosk: 'KIOSK',
};

export default async function CheckinsPrintPage({ params }: CheckinsPrintPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, checkinData] = await Promise.all([
    fetchEvent(eventId),
    fetchCheckinLogs(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  // operation_logs 기록
  try {
    const userInfo = await import('@/lib/auth').then((m) => m.getCurrentUserWithRole());
    await createOperationLog({
      eventId,
      type: 'export',
      message: '체크인 리포트 인쇄용 보기',
      actor: userInfo?.email || 'admin',
      metadata: { kind: 'checkins_print' },
    });
  } catch (logError) {
    console.error('Operation log error:', logError);
  }

  const printTime = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-[1024px] mx-auto p-8">
      {/* 헤더 */}
      <div className="mb-6 print-hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          인쇄
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {event.title} - Check-in Report
        </h1>
        <p className="text-sm text-gray-600">Printed at: {printTime}</p>
      </div>

      {/* 요약 통계 */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="border border-gray-300 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Check-ins</p>
          <p className="text-2xl font-bold text-gray-900">{checkinData.stats.total}</p>
        </div>
        <div className="border border-gray-300 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Duplicate Check-ins</p>
          <p className="text-2xl font-bold text-red-600">{checkinData.stats.duplicates}</p>
        </div>
        <div className="border border-gray-300 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">KIOSK Ratio</p>
          <p className="text-2xl font-bold text-blue-600">{checkinData.stats.kioskRatio}%</p>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Time
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Name
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Company
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Source
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Is Duplicate
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Scanned By
              </th>
            </tr>
          </thead>
          <tbody>
            {checkinData.logs.map((log) => {
              const participant = checkinData.participantsMap.get(log.participant_id);
              const timeStr = new Date(log.created_at).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              return (
                <tr key={log.id} className="page-break-inside-avoid">
                  <td className="border border-gray-300 px-4 py-2">{timeStr}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {participant?.name || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {participant?.company || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {sourceLabelMap[log.source || ''] || log.source || '-'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {log.is_duplicate ? (
                      <span className="text-red-600 font-medium">Yes</span>
                    ) : (
                      'No'
                    )}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{log.scanned_by || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

