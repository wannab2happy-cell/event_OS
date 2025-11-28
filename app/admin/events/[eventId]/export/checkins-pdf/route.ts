import { NextRequest } from 'next/server';
import { assertAdminAuth, getCurrentUserWithRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateCheckinsPdf } from '@/lib/pdf/checkinsPdf';
import { streamToBuffer } from '@/lib/pdf/pdfUtils';
import { createOperationLog } from '@/actions/operations/createLog';

export const runtime = 'nodejs';
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

    // 이벤트 정보 로드
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, code')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return new Response('Event not found', { status: 404 });
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

    if (!checkinLogs || checkinLogs.length === 0) {
      return new Response('No checkin logs found', { status: 404 });
    }

    // 참가자 정보 조회
    const participantIds = checkinLogs.map((log) => log.participant_id) || [];
    const participantsMap = new Map<string, any>();

    if (participantIds.length > 0) {
      const { data: participants } = await supabaseAdmin
        .from('event_participants')
        .select('id, name, company')
        .in('id', participantIds);

      participants?.forEach((p) => {
        participantsMap.set(p.id, p);
      });
    }

    // 통계 계산
    const total = checkinLogs.length;
    const duplicates = checkinLogs.filter((log) => log.is_duplicate).length;
    const kiosk = checkinLogs.filter((log) => log.source === 'kiosk').length;
    const kioskRatio = total > 0 ? Math.round((kiosk / total) * 100) : 0;

    // 체크인 로그 데이터 가공
    const checkinData = checkinLogs.map((log) => {
      const participant = participantsMap.get(log.participant_id);
      return {
        id: log.id,
        created_at: log.created_at,
        source: log.source,
        is_duplicate: log.is_duplicate,
        scanned_by: log.scanned_by,
        participant_name: participant?.name || null,
        participant_company: participant?.company || null,
      };
    });

    // PDF 생성
    const stream = await generateCheckinsPdf(
      event,
      checkinData,
      {
        total,
        duplicates,
        kiosk,
        kioskRatio,
      }
    );
    const buffer = await streamToBuffer(stream);

    // operation_logs 기록
    try {
      const userInfo = await getCurrentUserWithRole();
      await createOperationLog({
        eventId,
        type: 'export',
        message: '체크인 리포트 PDF 생성',
        actor: userInfo?.email || 'admin',
        metadata: { kind: 'checkins_pdf' },
      });
    } catch (logError) {
      console.error('Operation log error:', logError);
    }

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="checkin_report_${event.code || eventId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Export checkins PDF error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

