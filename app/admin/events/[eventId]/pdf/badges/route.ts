import { NextRequest } from 'next/server';
import { assertAdminAuth, getCurrentUserWithRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createOperationLog } from '@/actions/operations/createLog';
import React from 'react';
import { Document, Page, pdf } from '@react-pdf/renderer';
import ParticipantBadgeLayout from '@/components/pdf/ParticipantBadgeLayout';
import { generateQRCodeDataUrl, generateParticipantPassUrl } from '@/lib/pdf/utils';
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

    // 참가자 조회 (등록 완료된 참가자만)
    const { data: participants, error: participantsError } = await supabaseAdmin
      .from('event_participants')
      .select('id, name, email, company, position, vip_level, guest_of')
      .eq('event_id', eventId)
      .eq('status', 'completed')
      .order('name', { ascending: true });

    if (participantsError) {
      return new Response('Failed to load participants', { status: 500 });
    }

    if (!participants || participants.length === 0) {
      return new Response('No participants found', { status: 404 });
    }

    // QR 코드 미리 생성 (배치 처리)
    const participantsWithQr = await Promise.all(
      participants.map(async (participant) => {
        const passUrl = generateParticipantPassUrl(eventId, participant.id);
        const qrCodeDataUrl = await generateQRCodeDataUrl(passUrl, 150);
        return {
          ...participant,
          qrCodeDataUrl,
        };
      })
    );

    // PDF 생성 (A4 2-up 레이아웃)
    const pages: React.ReactElement[] = [];
    for (let i = 0; i < participantsWithQr.length; i += 2) {
      const leftParticipant = participantsWithQr[i];
      const rightParticipant = participantsWithQr[i + 1];

      pages.push(
        <Page
          key={`page-${i}`}
          size={A4_SIZE}
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          <ParticipantBadgeLayout
            participantName={leftParticipant.name || ''}
            company={leftParticipant.company}
            position={leftParticipant.position}
            isVip={(leftParticipant.vip_level || 0) > 0}
            vipLevel={leftParticipant.vip_level}
            eventTitle={event.title}
            primaryColor={event.primary_color}
            qrCodeDataUrl={leftParticipant.qrCodeDataUrl}
          />
          {rightParticipant && (
            <ParticipantBadgeLayout
              participantName={rightParticipant.name || ''}
              company={rightParticipant.company}
              position={rightParticipant.position}
              isVip={(rightParticipant.vip_level || 0) > 0}
              vipLevel={rightParticipant.vip_level}
              eventTitle={event.title}
              primaryColor={event.primary_color}
              qrCodeDataUrl={rightParticipant.qrCodeDataUrl}
            />
          )}
        </Page>
      );
    }

    const BadgeDocument = <Document>{pages}</Document>;

    // PDF 렌더링
    const pdfBlob = await pdf(BadgeDocument).toBlob();
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // operation_logs 기록
    await createOperationLog({
      eventId,
      type: 'pdf_export',
      message: `[PDF] Exported Badge PDF`,
      actor,
      metadata: {
        pdfType: 'badges',
        count: participants.length,
      },
    });

    // 파일명 생성
    const filename = `badges_${event.code || eventId}.pdf`;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Badge PDF generation error:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

