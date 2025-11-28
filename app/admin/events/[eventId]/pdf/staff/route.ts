import { NextRequest } from 'next/server';
import { assertAdminAuth, getCurrentUserWithRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createOperationLog } from '@/actions/operations/createLog';
import React from 'react';
import { Document, Page, pdf } from '@react-pdf/renderer';
import StaffBadgeLayout from '@/components/pdf/StaffBadgeLayout';
import { generateQRCodeDataUrl, generateKioskUrl } from '@/lib/pdf/utils';
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

    // Staff 조회
    const { data: eventStaff, error: staffError } = await supabaseAdmin
      .from('event_staff')
      .select('id, role, user_id')
      .eq('event_id', eventId)
      .order('role', { ascending: true });

    if (staffError) {
      return new Response('Failed to load staff', { status: 500 });
    }

    if (!eventStaff || eventStaff.length === 0) {
      return new Response('No staff found', { status: 404 });
    }

    // auth.users에서 이메일/이름 가져오기
    const staffMembers = await Promise.all(
      eventStaff.map(async (es) => {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(es.user_id);
        const user = userData?.user;
        const name = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Staff';
        const email = user?.email || '';
        
        // role 결정: admin은 'admin', 나머지는 event_staff의 role 사용
        let role: 'staff' | 'lead' | 'admin' = es.role as 'staff' | 'lead';
        // TODO: admin 여부 확인 로직 추가 가능
        
        return {
          id: es.id,
          name,
          email,
          role,
        };
      })
    );

    // QR 코드 생성 (KIOSK URL)
    const kioskUrl = generateKioskUrl(eventId);
    const qrCodeDataUrl = await generateQRCodeDataUrl(kioskUrl, 150);

    // PDF 생성 (A4 2-up 레이아웃)
    const pages: React.ReactElement[] = [];
    for (let i = 0; i < staffMembers.length; i += 2) {
      const leftStaff = staffMembers[i];
      const rightStaff = staffMembers[i + 1];

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
          <StaffBadgeLayout
            staffName={leftStaff.name}
            role={leftStaff.role}
            eventTitle={event.title}
            primaryColor={event.primary_color}
            qrCodeDataUrl={qrCodeDataUrl}
          />
          {rightStaff && (
            <StaffBadgeLayout
              staffName={rightStaff.name}
              role={rightStaff.role}
              eventTitle={event.title}
              primaryColor={event.primary_color}
              qrCodeDataUrl={qrCodeDataUrl}
            />
          )}
        </Page>
      );
    }

    const StaffDocument = <Document>{pages}</Document>;

    // PDF 렌더링
    const pdfBlob = await pdf(StaffDocument).toBlob();
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // operation_logs 기록
    await createOperationLog({
      eventId,
      type: 'pdf_export',
      message: `[PDF] Exported Staff Badge PDF`,
      actor,
      metadata: {
        pdfType: 'staff',
        count: staffMembers.length,
      },
    });

    // 파일명 생성
    const filename = `staff_${event.code || eventId}.pdf`;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Staff PDF generation error:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

