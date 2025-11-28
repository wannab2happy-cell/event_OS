import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { createBaseDocument } from './pdfUtils';

interface Event {
  id: string;
  title: string;
  code: string;
}

interface CheckinLog {
  id: string;
  created_at: string;
  source: string | null;
  is_duplicate: boolean;
  scanned_by: string | null;
  participant_name: string | null;
  participant_company: string | null;
}

interface CheckinStats {
  total: number;
  duplicates: number;
  kiosk: number;
  kioskRatio: number;
}

const sourceLabelMap: Record<string, string> = {
  admin_scanner: 'Admin',
  staff_scanner: 'Staff',
  kiosk: 'KIOSK',
};

/**
 * 체크인 리포트 PDF 생성
 */
export async function generateCheckinsPdf(
  event: Event,
  checkinLogs: CheckinLog[],
  stats: CheckinStats
): Promise<PassThrough> {
  const doc = createBaseDocument({
    title: `${event.title} - Check-in Report`,
  });

  const stream = new PassThrough();
  doc.pipe(stream);

  // 상단: 타이틀
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text(`${event.title} - Check-in Report`, { align: 'center' })
    .moveDown(1);

  // 요약 통계
  doc.fontSize(12).font('Helvetica').fillColor('#000000');
  doc.text(`Total Check-ins: ${stats.total}`, { align: 'left' });
  doc.text(`Duplicate Check-ins: ${stats.duplicates}`, { align: 'left' });
  doc.text(`KIOSK Ratio: ${stats.kioskRatio}%`, { align: 'left' });
  doc.moveDown(1);

  // 테이블 헤더
  const startY = doc.y;
  const rowHeight = 20;
  const pageHeight = 842;
  const margin = 40;
  const tableWidth = 515.28;

  const colWidths = {
    time: 100,
    name: 100,
    company: 100,
    source: 60,
    duplicate: 60,
    scannedBy: 95,
  };

  let currentY = startY;

  // 헤더 행
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
  doc.text('Time', margin, currentY, { width: colWidths.time });
  doc.text('Name', margin + colWidths.time, currentY, { width: colWidths.name });
  doc.text('Company', margin + colWidths.time + colWidths.name, currentY, {
    width: colWidths.company,
  });
  doc.text('Source', margin + colWidths.time + colWidths.name + colWidths.company, currentY, {
    width: colWidths.source,
  });
  doc.text(
    'Duplicate',
    margin + colWidths.time + colWidths.name + colWidths.company + colWidths.source,
    currentY,
    { width: colWidths.duplicate }
  );
  doc.text(
    'Scanned By',
    margin +
      colWidths.time +
      colWidths.name +
      colWidths.company +
      colWidths.source +
      colWidths.duplicate,
    currentY,
    { width: colWidths.scannedBy }
  );

  currentY += rowHeight;

  // 헤더 구분선
  doc
    .moveTo(margin, currentY)
    .lineTo(margin + tableWidth, currentY)
    .strokeColor('#000000')
    .lineWidth(1)
    .stroke();

  currentY += 5;

  // 데이터 행
  doc.fontSize(9).font('Helvetica').fillColor('#000000');

  for (const log of checkinLogs) {
    // 페이지 넘어가면 새 페이지 추가
    if (currentY + rowHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin + 20;
    }

    const timeStr = new Date(log.created_at).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const sourceText = sourceLabelMap[log.source || ''] || log.source || '-';
    const duplicateText = log.is_duplicate ? 'Yes' : 'No';
    const duplicateColor = log.is_duplicate ? '#ff0000' : '#000000';

    doc.text(timeStr, margin, currentY, { width: colWidths.time });
    doc.text(log.participant_name || '-', margin + colWidths.time, currentY, {
      width: colWidths.name,
    });
    doc.text(log.participant_company || '-', margin + colWidths.time + colWidths.name, currentY, {
      width: colWidths.company,
    });
    doc.text(
      sourceText,
      margin + colWidths.time + colWidths.name + colWidths.company,
      currentY,
      { width: colWidths.source }
    );
    doc
      .fillColor(duplicateColor)
      .text(
        duplicateText,
        margin +
          colWidths.time +
          colWidths.name +
          colWidths.company +
          colWidths.source,
        currentY,
        { width: colWidths.duplicate }
      )
      .fillColor('#000000');
    doc.text(
      log.scanned_by || '-',
      margin +
        colWidths.time +
        colWidths.name +
        colWidths.company +
        colWidths.source +
        colWidths.duplicate,
      currentY,
      { width: colWidths.scannedBy }
    );

    currentY += rowHeight;

    // 행 구분선
    doc
      .moveTo(margin, currentY)
      .lineTo(margin + tableWidth, currentY)
      .strokeColor('#cccccc')
      .lineWidth(0.5)
      .stroke();

    currentY += 2;
  }

  doc.end();
  return stream;
}

