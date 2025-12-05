/**
 * Vendor Print Layout Component
 * 
 * Printable layout for vendor notes (PDF export)
 */

'use client';

import type { VendorNote, VendorCategory } from '@/lib/vendors/vendorTypes';
import { getCategoryLabel, getPriorityLabel, getStatusLabel } from '@/lib/vendors/vendorTypes';
import { formatDateTimeKorean } from '@/lib/utils/date';

interface VendorPrintLayoutProps {
  eventName: string;
  eventDateRange?: string;
  category: VendorCategory;
  notes: VendorNote[];
}

export default function VendorPrintLayout({
  eventName,
  eventDateRange,
  category,
  notes,
}: VendorPrintLayoutProps) {
  const now = new Date().toLocaleString('ko-KR');

  return (
    <div className="w-[1000px] bg-white p-8" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{eventName}</h1>
        <h2 className="text-xl font-semibold text-gray-700">
          Vendor Briefing — {getCategoryLabel(category)}
        </h2>
        {eventDateRange && <p className="text-sm text-gray-600 mt-1">{eventDateRange}</p>}
        <p className="text-xs text-gray-500 mt-2">Generated: {now}</p>
      </div>

      {/* Body */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notes in this category</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-800">
                <th className="text-left p-2 font-semibold text-sm">Title</th>
                <th className="text-left p-2 font-semibold text-sm">Vendor</th>
                <th className="text-left p-2 font-semibold text-sm">Owner</th>
                <th className="text-left p-2 font-semibold text-sm">Priority</th>
                <th className="text-left p-2 font-semibold text-sm">Status</th>
                <th className="text-left p-2 font-semibold text-sm">Due Date</th>
                <th className="text-left p-2 font-semibold text-sm">Content</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note, index) => (
                <tr key={note.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2 text-sm border-b border-gray-200 font-medium">{note.title}</td>
                  <td className="p-2 text-sm border-b border-gray-200">{note.vendor_name || '—'}</td>
                  <td className="p-2 text-sm border-b border-gray-200">{note.owner || '—'}</td>
                  <td className="p-2 text-sm border-b border-gray-200">{getPriorityLabel(note.priority)}</td>
                  <td className="p-2 text-sm border-b border-gray-200">{getStatusLabel(note.status)}</td>
                  <td className="p-2 text-sm border-b border-gray-200">
                    {note.due_at ? formatDateTimeKorean(note.due_at) : '—'}
                  </td>
                  <td className="p-2 text-sm border-b border-gray-200 max-w-xs">
                    <div className="line-clamp-2">{note.content || '—'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

