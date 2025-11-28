import { NextRequest } from 'next/server';
import { assertAdminAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { toCsv, formatDateForCsv } from '@/lib/utils/csv';
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

    // 참가자 데이터 조회
    const { data: participants, error: participantsError } = await supabaseAdmin
      .from('event_participants')
      .select('id, name, email, company, status, vip_level, is_checked_in, checked_in_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (participantsError) {
      console.error('Participants fetch error:', participantsError);
      return new Response('Failed to fetch participants', { status: 500 });
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

    // CSV 데이터 생성
    const headers = [
      'Name',
      'Email',
      'Company',
      'Status',
      'VIP Level',
      'Table',
      'Checked In',
      'Checked In At',
    ];

    const rows =
      participants?.map((p) => [
        p.name || '',
        p.email || '',
        p.company || '',
        p.status || '',
        p.vip_level ? String(p.vip_level) : '',
        tableMap.get(p.id) || '',
        p.is_checked_in ? 'Yes' : 'No',
        formatDateForCsv(p.checked_in_at),
      ]) || [];

    const csv = toCsv(headers, rows);

    // operation_logs 기록 (실패해도 CSV는 반환)
    try {
      const userInfo = await import('@/lib/auth').then((m) => m.getCurrentUserWithRole());
      await createOperationLog({
        eventId,
        type: 'export',
        message: '참가자 명단 CSV 다운로드',
        actor: userInfo?.email || 'admin',
        metadata: { kind: 'participants_csv' },
      });
    } catch (logError) {
      console.error('Operation log error:', logError);
    }

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="participants_${eventId}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export participants CSV error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

