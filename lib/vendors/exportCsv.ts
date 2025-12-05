/**
 * CSV Export Utility for Vendor Notes
 * 
 * Generates Excel-compatible CSV files
 */

import type { VendorNote, VendorCategory } from './vendorTypes';
import { getCategoryLabel, getPriorityLabel, getStatusLabel } from './vendorTypes';

export interface ExportCsvOptions {
  eventName: string;
  fileName?: string;
}

/**
 * Escape CSV field
 */
function escapeCsvField(field: string | null | undefined): string {
  if (!field) return '';
  const str = String(field);
  // Replace quotes with double quotes and wrap in quotes
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Format date for CSV
 */
function formatDateForCsv(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return '';
  }
}

/**
 * Sanitize content for CSV (remove newlines, escape quotes)
 */
function sanitizeContent(content: string | null | undefined): string {
  if (!content) return '';
  return content.replace(/\n/g, ' ').replace(/\r/g, '');
}

export function exportVendorCategoryToCsv(
  category: VendorCategory,
  notes: VendorNote[],
  options: ExportCsvOptions
): void {
  // Filter notes by category
  const filteredNotes = notes.filter((note) => note.category === category);

  if (filteredNotes.length === 0) {
    throw new Error(`No notes found for category: ${getCategoryLabel(category)}`);
  }

  // CSV Headers
  const headers = [
    'Category',
    'Title',
    'Vendor',
    'Owner',
    'Priority',
    'Status',
    'Due Date',
    'Content',
  ];

  // Build CSV rows
  const rows = filteredNotes.map((note) => [
    escapeCsvField(getCategoryLabel(note.category)),
    escapeCsvField(note.title),
    escapeCsvField(note.vendor_name),
    escapeCsvField(note.owner),
    escapeCsvField(getPriorityLabel(note.priority)),
    escapeCsvField(getStatusLabel(note.status)),
    escapeCsvField(formatDateForCsv(note.due_at)),
    escapeCsvField(sanitizeContent(note.content)),
  ]);

  // Combine headers and rows
  const csvContent = [headers.map(escapeCsvField).join(','), ...rows.map((row) => row.join(','))].join(
    '\n'
  );

  // Create Blob
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;

  // Set filename
  const fileName =
    options.fileName ||
    `${options.eventName.replace(/[^a-zA-Z0-9]/g, '_')}_${getCategoryLabel(category)}_export.csv`;
  link.download = fileName;

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup
  URL.revokeObjectURL(url);
}

