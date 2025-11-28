import { NextRequest } from 'next/server';
import { assertAdminAuth, getCurrentUserWithRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createOperationLog } from '@/actions/operations/createLog';
import React from 'react';
import { Document, Page, pdf } from '@react-pdf/renderer';
import TableCardLayout from '@/components/pdf/TableCardLayout';
import { generateQRCodeDataUrl } from '@/lib/pdf/utils';
import { A4_SIZE } from '@/lib/pdf/base';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId?: string }> }
) {
  try {
    const session = await assertAdminAuth();
    const user = await getCurrentUserWithRole();
    const actor = user?.email || 'admin';

    const resolvedParams = await params;
    const eventId = resolvedParams?.eventId;

    if (!eventId) {
      return new Response('Event ID is required', { status: 400 });
    }

    // 이벤트 정보 로드
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, code, primary_color')
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
      return new Response('Failed to load tables', { status: 500 });
    }

    if (!tables || tables.length === 0) {
      return new Response('No tables found', { status: 404 });
    }

    // 테이블별 참가자 조회
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
      .from('table_assignments')
      .select('table_id, participant_id, seat_number, event_participants(id, name, vip_level)')
      .eq('event_id', eventId);

    if (assignmentsError) {
      return new Response('Failed to load assignments', { status: 500 });
    }

    // 테이블별 참가자 그룹화
    const tablesWithParticipants = tables.map((table) => {
      const tableAssignments = assignments?.filter((a) => a.table_id === table.id) || [];
      const participants = tableAssignments
        .map((assignment) => {
          const participant = assignment.event_participants as any;
          return {
            name: participant?.name || 'Unknown',
            seatNumber: assignment.seat_number,
            isVip: (participant?.vip_level || 0) > 0,
          };
        })
        .sort((a, b) => (a.seatNumber || 0) - (b.seatNumber || 0));

      // VIP 테이블 여부 확인 (참가자 중 VIP가 있으면)
      const isVipTable = participants.some((p) => p.isVip);

      return {
        ...table,
        participants,
        isVipTable,
      };
    });

    // PDF 생성 (A4 2-up 레이아웃)
    const pages: React.ReactElement[] = [];
    for (let i = 0; i < tablesWithParticipants.length; i += 2) {
      const leftTable = tablesWithParticipants[i];
      const rightTable = tablesWithParticipants[i + 1];

      pages.push(
        <Page
          key={`page-${i}`}
          size={A4_SIZE}
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'flex-start',
          }}
        >
          <TableCardLayout
            tableName={leftTable.name}
            participants={leftTable.participants}
            isVipTable={leftTable.isVipTable}
            primaryColor={event.primary_color}
          />
          {rightTable && (
            <TableCardLayout
              tableName={rightTable.name}
              participants={rightTable.participants}
              isVipTable={rightTable.isVipTable}
              primaryColor={event.primary_color}
            />
          )}
        </Page>
      );
    }

    const TableDocument = <Document>{pages}</Document>;

    // PDF 렌더링
    const pdfBlob = await pdf(TableDocument).toBlob();
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // operation_logs 기록
    await createOperationLog({
      eventId,
      type: 'pdf_export',
      message: `[PDF] Exported Table Cards PDF`,
      actor,
      metadata: {
        pdfType: 'tables',
        count: tables.length,
      },
    });

    // 파일명 생성
    const filename = `tables_${event.code || eventId}.pdf`;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Table PDF generation error:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

