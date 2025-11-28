export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { assertAdminAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createOperationLog } from '@/actions/operations/createLog';

type ParticipantsPrintPageProps = {
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
  const { data: participants, error } = await supabaseAdmin
    .from('event_participants')
    .select('id, name, email, company, status, vip_level, is_checked_in')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Participants fetch error:', error);
    return [];
  }

  // 테이블 배정 정보 조회
  const participantIds = participants?.map((p) => p.id) || [];
  const tableMap = new Map<string, string>();

  if (participantIds.length > 0) {
    const { data: assignments } = await supabaseAdmin
      .from('table_assignments')
      .select('participant_id, tables(name)')
      .in('participant_id', participantIds);

    assignments?.forEach((a) => {
      if (a.tables?.name) {
        tableMap.set(a.participant_id, a.tables.name);
      }
    });
  }

  return {
    participants: participants || [],
    tableMap,
  };
}

export default async function ParticipantsPrintPage({ params }: ParticipantsPrintPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, participantsData] = await Promise.all([
    fetchEvent(eventId),
    fetchParticipants(eventId),
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
      message: '참가자 명단 인쇄용 보기',
      actor: userInfo?.email || 'admin',
      metadata: { kind: 'participants_print' },
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
          {event.title} - Participant List
        </h1>
        <p className="text-sm text-gray-600">Printed at: {printTime}</p>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Name
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Company
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Email
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Status
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                VIP
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Table
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Checked In
              </th>
            </tr>
          </thead>
          <tbody>
            {participantsData.participants.map((participant) => (
              <tr key={participant.id} className="page-break-inside-avoid">
                <td className="border border-gray-300 px-4 py-2">{participant.name || '-'}</td>
                <td className="border border-gray-300 px-4 py-2">{participant.company || '-'}</td>
                <td className="border border-gray-300 px-4 py-2">{participant.email || '-'}</td>
                <td className="border border-gray-300 px-4 py-2">{participant.status || '-'}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {participant.vip_level && participant.vip_level > 0
                    ? `Level ${participant.vip_level}`
                    : '-'}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {participantsData.tableMap.get(participant.id) || '-'}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {participant.is_checked_in ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

