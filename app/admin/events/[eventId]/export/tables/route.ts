import { NextRequest } from 'next/server';
import { assertAdminAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { toCsv } from '@/lib/utils/csv';
import { createOperationLog } from '@/actions/operations/createLog';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId?: string }> }
) {
  try {
    await assertAdminAuth();

    const resolvedParams = await params;
    const eventId = resolvedParams?.eventId;

    if (!eventId) {
      return new Response('Event ID is required', { status: 400 });
    }

    // 테이블 조회
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('tables')
      .select('id, name, sort_order')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true });

    if (tablesError) {
      console.error('Tables fetch error:', tablesError);
      return new Response('Failed to fetch tables', { status: 500 });
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
        .select('id, name, email, company, vip_level, is_checked_in')
        .in('id', participantIds);

      participants?.forEach((p) => {
        participantsMap.set(p.id, p);
      });
    }

    // CSV 데이터 생성
    const headers = [
      'Table Name',
      'Seat Number',
      'Participant Name',
      'Email',
      'Company',
      'VIP Level',
      'Checked In',
    ];

    const rows: (string | number)[][] = [];

    tables?.forEach((table) => {
      const assignments = assignmentsMap.get(table.id) || [];
      if (assignments.length === 0) {
        // 빈 테이블도 한 행 추가
        rows.push([table.name, '', '', '', '', '', '']);
      } else {
        assignments.forEach((assignment) => {
          const participant = participantsMap.get(assignment.participant_id);
          rows.push([
            table.name,
            assignment.seat_number || '',
            participant?.name || '',
            participant?.email || '',
            participant?.company || '',
            participant?.vip_level ? String(participant.vip_level) : '',
            participant?.is_checked_in ? 'Yes' : 'No',
          ]);
        });
      }
    });

    const csv = toCsv(headers, rows);

    // operation_logs 기록
    try {
      const userInfo = await import('@/lib/auth').then((m) => m.getCurrentUserWithRole());
      await createOperationLog({
        eventId,
        type: 'export',
        message: '테이블 배정표 CSV 다운로드',
        actor: userInfo?.email || 'admin',
        metadata: { kind: 'tables_csv' },
      });
    } catch (logError) {
      console.error('Operation log error:', logError);
    }

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="tables_${eventId}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export tables CSV error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

