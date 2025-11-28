import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { createBaseDocument } from './pdfUtils';

interface Event {
  id: string;
  title: string;
  code: string;
}

interface VIPParticipant {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  vip_level: number | null;
  guest_of: string | null;
  vip_note: string | null;
  is_checked_in: boolean | null;
  guest_of_name?: string | null;
  table_name?: string | null;
}

/**
 * VIP 리스트 PDF 생성
 */
export async function generateVipListPdf(
  event: Event,
  vipParticipants: VIPParticipant[]
): Promise<PassThrough> {
  const doc = createBaseDocument({
    title: `${event.title} - VIP List`,
  });

  const stream = new PassThrough();
  doc.pipe(stream);

  // 상단: 타이틀
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text(`${event.title} - VIP List`, { align: 'center' })
    .moveDown(1);

  // 테이블 헤더
  const startY = doc.y;
  const tableTop = startY;
  const rowHeight = 25;
  const pageHeight = 842; // A4 height in points
  const margin = 40;
  const tableWidth = 515.28; // A4 width - 2*margin

  // 컬럼 너비
  const colWidths = {
    name: 100,
    email: 120,
    company: 100,
    vipLevel: 60,
    guestOf: 80,
    vipNote: 80,
    table: 60,
    checkedIn: 60,
  };

  let currentY = tableTop;

  // 헤더 행
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
  doc.text('Name', margin, currentY, { width: colWidths.name });
  doc.text('Email', margin + colWidths.name, currentY, { width: colWidths.email });
  doc.text('Company', margin + colWidths.name + colWidths.email, currentY, {
    width: colWidths.company,
  });
  doc.text('VIP', margin + colWidths.name + colWidths.email + colWidths.company, currentY, {
    width: colWidths.vipLevel,
  });
  doc.text(
    'Guest Of',
    margin + colWidths.name + colWidths.email + colWidths.company + colWidths.vipLevel,
    currentY,
    { width: colWidths.guestOf }
  );
  doc.text(
    'Note',
    margin +
      colWidths.name +
      colWidths.email +
      colWidths.company +
      colWidths.vipLevel +
      colWidths.guestOf,
    currentY,
    { width: colWidths.vipNote }
  );
  doc.text(
    'Table',
    margin +
      colWidths.name +
      colWidths.email +
      colWidths.company +
      colWidths.vipLevel +
      colWidths.guestOf +
      colWidths.vipNote,
    currentY,
    { width: colWidths.table }
  );
  doc.text(
    'Checked',
    margin +
      colWidths.name +
      colWidths.email +
      colWidths.company +
      colWidths.vipLevel +
      colWidths.guestOf +
      colWidths.vipNote +
      colWidths.table,
    currentY,
    { width: colWidths.checkedIn }
  );

  // 헤더 구분선
  currentY += rowHeight;
  doc
    .moveTo(margin, currentY)
    .lineTo(margin + tableWidth, currentY)
    .strokeColor('#000000')
    .lineWidth(1)
    .stroke();

  currentY += 5;

  // 데이터 행
  doc.fontSize(9).font('Helvetica').fillColor('#000000');

  for (const vip of vipParticipants) {
    // 페이지 넘어가면 새 페이지 추가
    if (currentY + rowHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin + 20;
    }

    const vipLevel = vip.vip_level || 0;
    const vipLevelText = vipLevel > 0 ? `Lv${vipLevel}` : '-';

    doc.text(vip.name || '-', margin, currentY, { width: colWidths.name });
    doc.text(vip.email || '-', margin + colWidths.name, currentY, { width: colWidths.email });
    doc.text(vip.company || '-', margin + colWidths.name + colWidths.email, currentY, {
      width: colWidths.company,
    });
    doc.text(
      vipLevelText,
      margin + colWidths.name + colWidths.email + colWidths.company,
      currentY,
      { width: colWidths.vipLevel }
    );
    doc.text(
      vip.guest_of_name || '-',
      margin + colWidths.name + colWidths.email + colWidths.company + colWidths.vipLevel,
      currentY,
      { width: colWidths.guestOf }
    );
    doc.text(
      vip.vip_note || '-',
      margin +
        colWidths.name +
        colWidths.email +
        colWidths.company +
        colWidths.vipLevel +
        colWidths.guestOf,
      currentY,
      { width: colWidths.vipNote }
    );
    doc.text(
      vip.table_name || '-',
      margin +
        colWidths.name +
        colWidths.email +
        colWidths.company +
        colWidths.vipLevel +
        colWidths.guestOf +
        colWidths.vipNote,
      currentY,
      { width: colWidths.table }
    );
    doc.text(
      vip.is_checked_in ? 'Yes' : 'No',
      margin +
        colWidths.name +
        colWidths.email +
        colWidths.company +
        colWidths.vipLevel +
        colWidths.guestOf +
        colWidths.vipNote +
        colWidths.table,
      currentY,
      { width: colWidths.checkedIn }
    );

    // 행 구분선
    currentY += rowHeight;
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

