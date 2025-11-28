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

    // VIP 참가자 조회 (vip_level > 0 또는 guest_of IS NOT NULL)
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

    // CSV 데이터 생성
    const headers = [
      'Name',
      'Email',
      'Company',
      'VIP Level',
      'Guest Of',
      'VIP Note',
      'Table',
      'Checked In',
    ];

    const rows =
      vips?.map((v) => [
        v.name || '',
        v.email || '',
        v.company || '',
        v.vip_level ? String(v.vip_level) : '',
        v.guest_of ? guestOfMap.get(v.guest_of) || '' : '',
        v.vip_note || '',
        tableMap.get(v.id) || '',
        v.is_checked_in ? 'Yes' : 'No',
      ]) || [];

    const csv = toCsv(headers, rows);

    // operation_logs 기록
    try {
      const userInfo = await import('@/lib/auth').then((m) => m.getCurrentUserWithRole());
      await createOperationLog({
        eventId,
        type: 'export',
        message: 'VIP 리스트 CSV 다운로드',
        actor: userInfo?.email || 'admin',
        metadata: { kind: 'vips_csv' },
      });
    } catch (logError) {
      console.error('Operation log error:', logError);
    }

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="vips_${eventId}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Export VIPs CSV error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

