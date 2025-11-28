import { NextRequest } from 'next/server';
import { assertAdminAuth, getCurrentUserWithRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generatePassPdf } from '@/lib/pdf/passPdf';
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

    // URL 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const onlyVip = searchParams.get('onlyVip') === 'true';

    // 이벤트 정보 로드
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, code, start_date, end_date, venue_name, venue_address, primary_color')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return new Response('Event not found', { status: 404 });
    }

    // 참가자 조회
    let participantsQuery = supabaseAdmin
      .from('event_participants')
      .select('id, name, email, company, vip_level, guest_of, vip_note')
      .eq('event_id', eventId)
      .eq('status', 'completed');

    if (onlyVip) {
      participantsQuery = participantsQuery.or('vip_level.gt.0,guest_of.not.is.null');
    }

    const { data: participants, error: participantsError } = await participantsQuery.order(
      'created_at',
      { ascending: true }
    );

    if (participantsError) {
      console.error('Participants fetch error:', participantsError);
      return new Response('Failed to fetch participants', { status: 500 });
    }

    if (!participants || participants.length === 0) {
      return new Response('No participants found', { status: 404 });
    }

    // PDF 생성
    const stream = await generatePassPdf(event, participants, {
      includeOnlyVip: onlyVip,
      title: `${event.title} - ${onlyVip ? 'VIP ' : ''}Passes`,
    });

    const buffer = await streamToBuffer(stream);

    // operation_logs 기록
    try {
      const userInfo = await getCurrentUserWithRole();
      await createOperationLog({
        eventId,
        type: 'export',
        message: `참가자 PASS PDF 생성${onlyVip ? ' (VIP만)' : ''}`,
        actor: userInfo?.email || 'admin',
        metadata: { kind: 'pass_pdf', onlyVip },
      });
    } catch (logError) {
      console.error('Operation log error:', logError);
    }

    const filename = onlyVip
      ? `passes_vip_${event.code || eventId}.pdf`
      : `passes_${event.code || eventId}.pdf`;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export pass PDF error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

