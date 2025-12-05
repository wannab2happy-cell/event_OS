/**
 * PDF Export Utility for Vendor Notes
 * 
 * Uses html-to-image and jsPDF to generate PDFs
 */

import type { VendorNote, VendorCategory } from './vendorTypes';
import { getCategoryLabel, getPriorityLabel, getStatusLabel } from './vendorTypes';
import { formatDateTimeKorean } from '@/lib/utils/date';

export interface ExportPdfOptions {
  eventName: string;
  eventDateRange?: string;
  fileName?: string;
}

function createPrintHtml(
  eventName: string,
  eventDateRange: string | undefined,
  category: VendorCategory,
  notes: VendorNote[]
): string {
  const now = new Date().toLocaleString('ko-KR');
  const categoryLabel = getCategoryLabel(category);

  const notesHtml = notes
    .map((note, index) => {
      const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
      return `
        <tr class="${rowClass}">
          <td class="p-2 text-sm border-b border-gray-200 font-medium">${escapeHtml(note.title)}</td>
          <td class="p-2 text-sm border-b border-gray-200">${escapeHtml(note.vendor_name || '—')}</td>
          <td class="p-2 text-sm border-b border-gray-200">${escapeHtml(note.owner || '—')}</td>
          <td class="p-2 text-sm border-b border-gray-200">${escapeHtml(getPriorityLabel(note.priority))}</td>
          <td class="p-2 text-sm border-b border-gray-200">${escapeHtml(getStatusLabel(note.status))}</td>
          <td class="p-2 text-sm border-b border-gray-200">${note.due_at ? escapeHtml(formatDateTimeKorean(note.due_at)) : '—'}</td>
          <td class="p-2 text-sm border-b border-gray-200 max-w-xs">${escapeHtml(note.content || '—')}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <div style="width: 1000px; background: white; padding: 32px; font-family: system-ui, sans-serif;">
      <div style="border-bottom: 2px solid #1f2937; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 8px;">${escapeHtml(eventName)}</h1>
        <h2 style="font-size: 20px; font-weight: 600; color: #374151;">Vendor Briefing — ${escapeHtml(categoryLabel)}</h2>
        ${eventDateRange ? `<p style="font-size: 14px; color: #4b5563; margin-top: 4px;">${escapeHtml(eventDateRange)}</p>` : ''}
        <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">Generated: ${escapeHtml(now)}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f3f4f6; border-bottom: 2px solid #1f2937;">
            <th style="text-align: left; padding: 8px; font-weight: 600; font-size: 14px;">Title</th>
            <th style="text-align: left; padding: 8px; font-weight: 600; font-size: 14px;">Vendor</th>
            <th style="text-align: left; padding: 8px; font-weight: 600; font-size: 14px;">Owner</th>
            <th style="text-align: left; padding: 8px; font-weight: 600; font-size: 14px;">Priority</th>
            <th style="text-align: left; padding: 8px; font-weight: 600; font-size: 14px;">Status</th>
            <th style="text-align: left; padding: 8px; font-weight: 600; font-size: 14px;">Due Date</th>
            <th style="text-align: left; padding: 8px; font-weight: 600; font-size: 14px;">Content</th>
          </tr>
        </thead>
        <tbody>
          ${notes.length === 0 ? '<tr><td colspan="7" style="text-align: center; padding: 32px; color: #6b7280;">No notes in this category</td></tr>' : notesHtml}
        </tbody>
      </table>
    </div>
  `;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export async function exportVendorCategoryToPdf(
  category: VendorCategory,
  notes: VendorNote[],
  options: ExportPdfOptions
): Promise<void> {
  // Filter notes by category
  const filteredNotes = notes.filter((note) => note.category === category);

  if (filteredNotes.length === 0) {
    throw new Error(`No notes found for category: ${getCategoryLabel(category)}`);
  }

  // Dynamically import libraries
  const htmlToImageMod = await import('html-to-image');
  const jsPDFMod = await import('jspdf');

  // Create hidden container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '1000px';
  container.style.backgroundColor = 'white';
  container.innerHTML = createPrintHtml(options.eventName, options.eventDateRange, category, filteredNotes);
  document.body.appendChild(container);

  try {
    // Wait for render
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Convert to PNG
    const dataUrl = await htmlToImageMod.toPng(container, {
      quality: 1.0,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      width: 1000,
    });

    // Create PDF (A4 landscape)
    const { jsPDF: JsPDF } = jsPDFMod;
    const pdf = new JsPDF('landscape', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate image dimensions to fit A4 landscape
    const imgWidth = pdfWidth;
    const imgHeight = (container.offsetHeight * pdfWidth) / container.offsetWidth;

    // If content is taller than one page, we'd need to split it
    // For now, fit to one page
    const scale = imgHeight > pdfHeight ? pdfHeight / imgHeight : 1;
    const scaledWidth = imgWidth * scale;
    const scaledHeight = imgHeight * scale;

    // Add image to PDF
    pdf.addImage(dataUrl, 'PNG', 0, 0, scaledWidth, scaledHeight);

    // Save PDF
    const fileName =
      options.fileName ||
      `${options.eventName.replace(/[^a-zA-Z0-9]/g, '_')}_${getCategoryLabel(category)}_Briefing.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
}

