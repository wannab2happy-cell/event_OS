export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { assertAdminAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createOperationLog } from '@/actions/operations/createLog';

type TablesPrintPageProps = {
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

async function fetchTableAssignments(eventId: string) {
  // 테이블 조회
  const { data: tables, error: tablesError } = await supabaseAdmin
    .from('tables')
    .select('id, name, sort_order')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true });

  if (tablesError) {
    console.error('Tables fetch error:', tablesError);
    return { tables: [], assignmentsMap: new Map(), participantsMap: new Map() };
  }

  // 테이블 배정 조회
  const tableIds = tables?.map((t) => t.id) || [];
  const assignmentsMap = new Map<string, any[]>();

  if (tableIds.length > 0) {
    const { data: assignments } = await supabaseAdmin
      .from('table_assignments')
      .select('table_id, seat_number, participant_id')
      .in('table_id', tableIds)
      .order('seat_number', { ascending: true });

    assignments?.forEach((a) => {
      if (!assignmentsMap.has(a.table_id)) {
        assignmentsMap.set(a.table_id, []);
      }
      assignmentsMap.get(a.table_id)?.push(a);
    });
  }

  // 참가자 정보 조회
  const participantIds =
    Array.from(assignmentsMap.values())
      .flat()
      .map((a) => a.participant_id) || [];
  const participantsMap = new Map<string, any>();

  if (participantIds.length > 0) {
    const { data: participants } = await supabaseAdmin
      .from('event_participants')
      .select('id, name, email, company, vip_level')
      .in('id', participantIds);

    participants?.forEach((p) => {
      participantsMap.set(p.id, p);
    });
  }

  return {
    tables: tables || [],
    assignmentsMap,
    participantsMap,
  };
}

export default async function TablesPrintPage({ params }: TablesPrintPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, tableData] = await Promise.all([
    fetchEvent(eventId),
    fetchTableAssignments(eventId),
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
      message: '테이블 배정표 인쇄용 보기',
      actor: userInfo?.email || 'admin',
      metadata: { kind: 'tables_print' },
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
          {event.title} - Table Assignments
        </h1>
        <p className="text-sm text-gray-600 mb-2">Printed at: {printTime}</p>
        <p className="text-sm text-gray-500">
          테이블별 좌석 배정을 한눈에 보기 위한 인쇄용 레이아웃입니다.
        </p>
      </div>

      {/* 테이블별 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tableData.tables.map((table) => {
          const assignments = tableData.assignmentsMap.get(table.id) || [];
          return (
            <div
              key={table.id}
              className="border border-gray-300 rounded-lg p-4 page-break-inside-avoid"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-3">{table.name}</h3>
              {assignments.length === 0 ? (
                <p className="text-gray-500 text-sm">배정된 참가자가 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-2 py-1 text-left font-semibold text-gray-700">Seat</th>
                        <th className="px-2 py-1 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-2 py-1 text-left font-semibold text-gray-700">VIP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment) => {
                        const participant = tableData.participantsMap.get(assignment.participant_id);
                        return (
                          <tr key={assignment.participant_id}>
                            <td className="px-2 py-1 border-b border-gray-200">
                              {assignment.seat_number || '-'}
                            </td>
                            <td className="px-2 py-1 border-b border-gray-200">
                              {participant?.name || '-'}
                            </td>
                            <td className="px-2 py-1 border-b border-gray-200">
                              {participant?.vip_level && participant.vip_level > 0 ? (
                                <span className="text-xs font-medium text-amber-600">
                                  Lv{participant.vip_level}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

