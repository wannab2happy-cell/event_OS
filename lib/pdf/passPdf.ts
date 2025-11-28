import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import QRCode from 'qrcode';
import { createBaseDocument } from './pdfUtils';
import { generateQrContent } from '@/lib/qr';

interface Event {
  id: string;
  title: string;
  code: string;
  start_date?: string | null;
  end_date?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  primary_color?: string | null;
}

interface Participant {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  vip_level?: number | null;
  guest_of?: string | null;
  vip_note?: string | null;
}

interface GeneratePassPdfOptions {
  includeOnlyVip?: boolean;
  title?: string;
}

/**
 * 참가자 PASS PDF 생성
 */
export async function generatePassPdf(
  event: Event,
  participants: Participant[],
  options?: GeneratePassPdfOptions
): Promise<PassThrough> {
  const doc = createBaseDocument({
    title: options?.title ?? `${event.title} - Passes`,
  });

  const stream = new PassThrough();
  doc.pipe(stream);

  const primaryColor = event.primary_color || '#2563eb';

  for (const [index, participant] of participants.entries()) {
    if (index > 0) {
      doc.addPage();
    }

    // 상단: 이벤트명
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(event.title, { align: 'center' })
      .moveDown(0.5);

    // 행사 날짜/장소
    const dateInfo: string[] = [];
    if (event.start_date) {
      const startDate = new Date(event.start_date);
      const dateStr = startDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      dateInfo.push(dateStr);
    }
    if (event.venue_name) {
      dateInfo.push(event.venue_name);
    }
    if (event.venue_address) {
      dateInfo.push(event.venue_address);
    }

    if (dateInfo.length > 0) {
      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#666666')
        .text(dateInfo.join(' • '), { align: 'center' })
        .moveDown(1);
    }

    // 중간: 참가자 정보
    doc.moveDown(1);

    // VIP 뱃지 (VIP인 경우)
    const isVip = participant.vip_level && participant.vip_level > 0;
    if (isVip) {
      const vipLevel = participant.vip_level || 1;
      doc
        .rect(40, doc.y, 100, 30)
        .fill('#FFD700')
        .fillColor('#000000')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`VIP Level ${vipLevel}`, 50, doc.y - 20, { width: 80, align: 'center' });
      doc.moveDown(0.5);
    }

    // 참가자 이름 (가장 크게)
    doc
      .fontSize(32)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(participant.name || '이름 없음', { align: 'center' })
      .moveDown(0.5);

    // 회사/소속
    if (participant.company) {
      doc
        .fontSize(16)
        .font('Helvetica')
        .fillColor('#333333')
        .text(participant.company, { align: 'center' })
        .moveDown(0.3);
    }

    // 이메일 (작게)
    if (participant.email) {
      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#666666')
        .text(participant.email, { align: 'center' })
        .moveDown(2);
    }

    // 하단: QR 코드
    const qrContent = generateQrContent(event.id, participant.id);
    try {
      // QR 코드 생성 (JSON 문자열을 그대로 사용)
      const qrDataUrl = await QRCode.toDataURL(qrContent, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 300,
      });

      const base64Data = qrDataUrl.split(',')[1];
      const qrBuffer = Buffer.from(base64Data, 'base64');

      // QR 코드를 중앙에 배치
      const qrSize = 200;
      const pageWidth = 595.28; // A4 width in points
      const qrX = (pageWidth - qrSize) / 2;

      doc.image(qrBuffer, qrX, doc.y, {
        fit: [qrSize, qrSize],
        align: 'center',
      });

      doc.moveDown(0.5);

      // "Check-in QR" 안내 문구
      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#666666')
        .text('Check-in QR', { align: 'center' });
    } catch (error) {
      console.error('QR code generation error:', error);
      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#ff0000')
        .text('QR 코드 생성 실패', { align: 'center' });
    }
  }

  doc.end();
  return stream;
}

