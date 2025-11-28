import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { createBaseDocument } from './pdfUtils';

interface Event {
  id: string;
  title: string;
  code: string;
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  sort_order: number;
}

interface TableAssignment {
  table_id: string;
  seat_number: number | null;
  participant_id: string;
  participant_name: string | null;
  participant_company: string | null;
  participant_vip_level: number | null;
}

interface TableWithAssignments {
  table: Table;
  assignments: TableAssignment[];
}

/**
 * 테이블 배정표 PDF 생성
 */
export async function generateTablesPdf(
  event: Event,
  tablesWithAssignments: TableWithAssignments[]
): Promise<PassThrough> {
  const doc = createBaseDocument({
    title: `${event.title} - Table Assignments`,
  });

  const stream = new PassThrough();
  doc.pipe(stream);

  // 상단: 타이틀
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .fillColor('#000000')
    .text(`${event.title} - Table Assignments`, { align: 'center' })
    .moveDown(1);

  const pageHeight = 842; // A4 height in points
  const margin = 40;
  const sectionSpacing = 30;

  for (const tableData of tablesWithAssignments) {
    const { table, assignments } = tableData;

    // 페이지 넘어가면 새 페이지 추가
    if (doc.y + 150 > pageHeight - margin) {
      doc.addPage();
    }

    // 테이블명 (큰 제목)
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(table.name, margin, doc.y)
      .moveDown(0.5);

    // 테이블 정보 (정원)
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#666666')
      .text(`Capacity: ${table.capacity} | Assigned: ${assignments.length}`, margin, doc.y)
      .moveDown(0.8);

    if (assignments.length === 0) {
      doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#999999')
        .text('No assignments', margin, doc.y)
        .moveDown(1.5);
      continue;
    }

    // 좌석 리스트
    const startY = doc.y;
    const rowHeight = 20;
    let currentY = startY;

    // 헤더
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000');
    doc.text('Seat', margin, currentY, { width: 50 });
    doc.text('Name', margin + 60, currentY, { width: 150 });
    doc.text('Company', margin + 220, currentY, { width: 120 });
    doc.text('VIP', margin + 350, currentY, { width: 50 });

    currentY += rowHeight;

    // 구분선
    doc
      .moveTo(margin, currentY)
      .lineTo(margin + 400, currentY)
      .strokeColor('#000000')
      .lineWidth(1)
      .stroke();

    currentY += 5;

    // 데이터 행
    doc.fontSize(9).font('Helvetica').fillColor('#000000');

    for (const assignment of assignments) {
      // 페이지 넘어가면 새 페이지 추가
      if (currentY + rowHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin + 20;
      }

      const seatText = assignment.seat_number ? String(assignment.seat_number) : '-';
      const nameText = assignment.participant_name || '-';
      const companyText = assignment.participant_company || '-';
      const vipText =
        assignment.participant_vip_level && assignment.participant_vip_level > 0
          ? `Lv${assignment.participant_vip_level}`
          : '-';

      doc.text(seatText, margin, currentY, { width: 50 });
      doc.text(nameText, margin + 60, currentY, { width: 150 });
      doc.text(companyText, margin + 220, currentY, { width: 120 });
      doc.text(vipText, margin + 350, currentY, { width: 50 });

      currentY += rowHeight;

      // 행 구분선
      doc
        .moveTo(margin, currentY)
        .lineTo(margin + 400, currentY)
        .strokeColor('#cccccc')
        .lineWidth(0.5)
        .stroke();

      currentY += 2;
    }

    doc.moveDown(1);
  }

  doc.end();
  return stream;
}

