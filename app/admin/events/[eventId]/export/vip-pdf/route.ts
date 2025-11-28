import { NextRequest } from 'next/server';
import { assertAdminAuth, getCurrentUserWithRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateVipListPdf } from '@/lib/pdf/vipPdf';
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

    // VIP 참가자 조회
    const { data: vips, error: vipsError } = await supabaseAdmin
      .from('event_participants')
      .select('id, name, email, company, vip_level, guest_of, vip_note, is_checked_in')
      .eq('event_id', eventId)
      .or('vip_level.gt.0,guest_of.not.is.null')
      .order('vip_level', { ascending: false, nullsLast: true });

    if (vipsError) {
      console.error('VIPs fetch error:', vipsError);
      return new Response('Failed to fetch VIPs', { status: 500 });
    }

    if (!vips || vips.length === 0) {
      return new Response('No VIPs found', { status: 404 });
    }

    // guest_of 참가자 이름 조회
    const guestOfIds = vips.filter((v) => v.guest_of).map((v) => v.guest_of) || [];
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
    const vipIds = vips.map((v) => v.id) || [];
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

    // VIP 데이터 가공
    const vipParticipants = vips.map((vip) => ({
      ...vip,
      guest_of_name: vip.guest_of ? guestOfMap.get(vip.guest_of) || null : null,
      table_name: tableMap.get(vip.id) || null,
    }));

    // PDF 생성
    const stream = await generateVipListPdf(event, vipParticipants);
    const buffer = await streamToBuffer(stream);

    // operation_logs 기록
    try {
      const userInfo = await getCurrentUserWithRole();
      await createOperationLog({
        eventId,
        type: 'export',
        message: 'VIP 리스트 PDF 생성',
        actor: userInfo?.email || 'admin',
        metadata: { kind: 'vip_pdf' },
      });
    } catch (logError) {
      console.error('Operation log error:', logError);
    }

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="vip_list_${event.code || eventId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Export VIP PDF error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

