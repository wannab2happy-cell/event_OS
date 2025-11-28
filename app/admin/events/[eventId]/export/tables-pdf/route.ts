import { NextRequest } from 'next/server';
import { assertAdminAuth, getCurrentUserWithRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateTablesPdf } from '@/lib/pdf/tablesPdf';
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

    // 테이블 조회
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('tables')
      .select('id, name, capacity, sort_order')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true });

    if (tablesError) {
      console.error('Tables fetch error:', tablesError);
      return new Response('Failed to fetch tables', { status: 500 });
    }

    if (!tables || tables.length === 0) {
      return new Response('No tables found', { status: 404 });
    }

    // 테이블 배정 조회
    const tableIds = tables.map((t) => t.id) || [];
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
        .select('id, name, company, vip_level')
        .in('id', participantIds);

      participants?.forEach((p) => {
        participantsMap.set(p.id, p);
      });
    }

    // 테이블별 데이터 가공
    const tablesWithAssignments = tables.map((table) => {
      const assignments = assignmentsMap.get(table.id) || [];
      return {
        table,
        assignments: assignments.map((assignment) => {
          const participant = participantsMap.get(assignment.participant_id);
          return {
            table_id: assignment.table_id,
            seat_number: assignment.seat_number,
            participant_id: assignment.participant_id,
            participant_name: participant?.name || null,
            participant_company: participant?.company || null,
            participant_vip_level: participant?.vip_level || null,
          };
        }),
      };
    });

    // PDF 생성
    const stream = await generateTablesPdf(event, tablesWithAssignments);
    const buffer = await streamToBuffer(stream);

    // operation_logs 기록
    try {
      const userInfo = await getCurrentUserWithRole();
      await createOperationLog({
        eventId,
        type: 'export',
        message: '테이블 배정표 PDF 생성',
        actor: userInfo?.email || 'admin',
        metadata: { kind: 'tables_pdf' },
      });
    } catch (logError) {
      console.error('Operation log error:', logError);
    }

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="table_assignments_${event.code || eventId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Export tables PDF error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

