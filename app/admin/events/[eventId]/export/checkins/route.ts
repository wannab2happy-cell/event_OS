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

    // 체크인 로그 조회
    const { data: checkinLogs, error: checkinError } = await supabaseAdmin
      .from('checkin_logs')
      .select('id, created_at, source, is_duplicate, scanned_by, participant_id')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (checkinError) {
      console.error('Checkin logs fetch error:', checkinError);
      return new Response('Failed to fetch checkin logs', { status: 500 });
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

    // Source 라벨 매핑
    const sourceLabelMap: Record<string, string> = {
      admin_scanner: 'Admin',
      staff_scanner: 'Staff',
      kiosk: 'KIOSK',
    };

    // CSV 데이터 생성
    const headers = ['Time', 'Name', 'Email', 'Company', 'Source', 'Is Duplicate', 'Scanned By'];

    const rows =
      checkinLogs?.map((log) => {
        const participant = participantsMap.get(log.participant_id);
        return [
          formatDateForCsv(log.created_at),
          participant?.name || '',
          participant?.email || '',
          participant?.company || '',
          sourceLabelMap[log.source || ''] || log.source || '',
          log.is_duplicate ? 'Yes' : 'No',
          log.scanned_by || '',
        ];
      }) || [];

    const csv = toCsv(headers, rows);

    // operation_logs 기록
    try {
      const userInfo = await import('@/lib/auth').then((m) => m.getCurrentUserWithRole());
      await createOperationLog({
        eventId,
        type: 'export',
        message: '체크인 리포트 CSV 다운로드',
        actor: userInfo?.email || 'admin',
        metadata: { kind: 'checkins_csv' },
      });
    } catch (logError) {
      console.error('Operation log error:', logError);
    }

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="checkins_${eventId}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export checkins CSV error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

