import { NextRequest } from 'next/server';
import { assertAdminAuth, getCurrentUserWithRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createOperationLog } from '@/actions/operations/createLog';
import { Document, Page, pdf } from '@react-pdf/renderer';
import QrPosterLayout from '@/components/pdf/QrPosterLayout';
import { generateQRCodeDataUrl, generateKioskUrl } from '@/lib/pdf/utils';

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

    // URL 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const size = (searchParams.get('size') || 'A4') as 'A4' | 'A3';
    const urlType = searchParams.get('urlType') || 'kiosk'; // 'kiosk' | 'pass'

    // 이벤트 정보 로드
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, title, code, primary_color, hero_tagline')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return new Response('Event not found', { status: 404 });
    }

    // QR 코드 URL 생성
    const qrUrl = urlType === 'kiosk' ? generateKioskUrl(eventId) : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${eventId}`;
    const qrCodeDataUrl = await generateQRCodeDataUrl(qrUrl, size === 'A3' ? 500 : 400);

    // PDF 생성
    const PosterDocument = (
      <Document>
        <Page>
          <QrPosterLayout
            title={urlType === 'kiosk' ? 'Check-in Here' : 'Event Entry'}
            subtitle={event.hero_tagline || event.title}
            qrCodeDataUrl={qrCodeDataUrl}
            primaryColor={event.primary_color}
            size={size}
          />
        </Page>
      </Document>
    );

    // PDF 렌더링
    const pdfBlob = await pdf(PosterDocument).toBlob();
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // operation_logs 기록
    await createOperationLog({
      eventId,
      type: 'pdf_export',
      message: `[PDF] Exported QR Poster PDF`,
      actor,
      metadata: {
        pdfType: 'qr-poster',
        size,
        urlType,
      },
    });

    // 파일명 생성
    const filename = `qr_poster_${event.code || eventId}.pdf`;

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('QR Poster PDF generation error:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

