export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { assertAdminAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createOperationLog } from '@/actions/operations/createLog';

type VipsPrintPageProps = {
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

async function fetchVIPs(eventId: string) {
  const { data: vips, error } = await supabaseAdmin
    .from('event_participants')
    .select('id, name, email, company, vip_level, guest_of, vip_note, is_checked_in')
    .eq('event_id', eventId)
    .or('vip_level.gt.0,guest_of.not.is.null')
    .order('vip_level', { ascending: false, nullsLast: true });

  if (error) {
    console.error('VIPs fetch error:', error);
    return { vips: [], guestOfMap: new Map(), tableMap: new Map() };
  }

  // guest_of 참가자 이름 조회
  const guestOfIds = vips?.filter((v) => v.guest_of).map((v) => v.guest_of) || [];
  const guestOfMap = new Map<string, string>();

  if (guestOfIds.length > 0) {
    const { data: guestOfParticipants } = await supabaseAdmin
      .from('event_participants')
      .select('id, name')
      .in('id', guestOfIds);

    guestOfParticipants?.forEach((p) => {
      guestOfMap.set(p.id, p.name || '');
    });
  }

  // 테이블 배정 정보 조회
  const vipIds = vips?.map((v) => v.id) || [];
  const tableMap = new Map<string, string>();

  if (vipIds.length > 0) {
    const { data: assignments } = await supabaseAdmin
      .from('table_assignments')
      .select('participant_id, tables(name)')
      .in('participant_id', vipIds);

    assignments?.forEach((a) => {
      if (a.tables?.name) {
        tableMap.set(a.participant_id, a.tables.name);
      }
    });
  }

  return {
    vips: vips || [],
    guestOfMap,
    tableMap,
  };
}

function getVipLevelBadgeClass(level: number | null) {
  if (!level) return 'bg-gray-100 text-gray-800';
  if (level === 1) return 'bg-amber-100 text-amber-800';
  if (level === 2) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

export default async function VipsPrintPage({ params }: VipsPrintPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, vipsData] = await Promise.all([fetchEvent(eventId), fetchVIPs(eventId)]);

  if (!event) {
    return notFound();
  }

  // operation_logs 기록
  try {
    const userInfo = await import('@/lib/auth').then((m) => m.getCurrentUserWithRole());
    await createOperationLog({
      eventId,
      type: 'export',
      message: 'VIP 리스트 인쇄용 보기',
      actor: userInfo?.email || 'admin',
      metadata: { kind: 'vips_print' },
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title} - VIP List</h1>
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
                Email
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Company
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                VIP Level
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                Guest Of
              </th>
              <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">
                VIP Note
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
            {vipsData.vips.map((vip) => (
              <tr key={vip.id} className="page-break-inside-avoid">
                <td className="border border-gray-300 px-4 py-2">{vip.name || '-'}</td>
                <td className="border border-gray-300 px-4 py-2">{vip.email || '-'}</td>
                <td className="border border-gray-300 px-4 py-2">{vip.company || '-'}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {vip.vip_level && vip.vip_level > 0 ? (
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getVipLevelBadgeClass(
                        vip.vip_level
                      )}`}
                    >
                      Level {vip.vip_level}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {vip.guest_of ? vipsData.guestOfMap.get(vip.guest_of) || '-' : '-'}
                </td>
                <td className="border border-gray-300 px-4 py-2">{vip.vip_note || '-'}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {vipsData.tableMap.get(vip.id) || '-'}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {vip.is_checked_in ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

