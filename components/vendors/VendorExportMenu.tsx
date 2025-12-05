/**
 * Vendor Export Menu Component
 * 
 * Dropdown menu for exporting vendor notes
 */

'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { exportVendorCategoryToPdf } from '@/lib/vendors/exportPdf';
import { exportVendorCategoryToCsv } from '@/lib/vendors/exportCsv';
import type { VendorNote } from '@/lib/vendors/vendorTypes';
import { getCategoryLabel } from '@/lib/vendors/vendorTypes';
import toast from 'react-hot-toast';

interface VendorExportMenuProps {
  eventId: string;
  eventName: string;
  eventDateRange?: string;
  notes: VendorNote[];
}

export default function VendorExportMenu({
  eventId,
  eventName,
  eventDateRange,
  notes,
}: VendorExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  const hotelNotes = notes.filter((n) => n.category === 'hotel');
  const avNotes = notes.filter((n) => n.category === 'av');
  const graphicsNotes = notes.filter((n) => n.category === 'graphics');
  const logisticsNotes = notes.filter((n) => n.category === 'logistics');

  const handleExportPdf = async (category: 'hotel' | 'av') => {
    const categoryNotes = category === 'hotel' ? hotelNotes : avNotes;

    if (categoryNotes.length === 0) {
      toast.error(`No notes found for ${getCategoryLabel(category)}`);
      return;
    }

    setIsExporting(true);
    toast.loading('Generating PDF...', { id: 'export-pdf' });

    try {
      await exportVendorCategoryToPdf(category, notes, {
        eventName,
        eventDateRange,
        fileName: `${eventName.replace(/[^a-zA-Z0-9]/g, '_')}_${getCategoryLabel(category)}_Briefing.pdf`,
      });
      toast.success('Download started.', { id: 'export-pdf' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export PDF', { id: 'export-pdf' });
    } finally {
      setIsExporting(false);
      setOpenMenu(false);
    }
  };

  const handleExportCsv = (category: 'graphics' | 'logistics') => {
    const categoryNotes = category === 'graphics' ? graphicsNotes : logisticsNotes;

    if (categoryNotes.length === 0) {
      toast.error(`No notes found for ${getCategoryLabel(category)}`);
      return;
    }

    try {
      exportVendorCategoryToCsv(category, notes, {
        eventName,
        fileName: `${eventName.replace(/[^a-zA-Z0-9]/g, '_')}_${getCategoryLabel(category)}_export.csv`,
      });
      toast.success('Download started.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export CSV');
    } finally {
      setOpenMenu(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setOpenMenu(!openMenu)}
        disabled={isExporting}
        variant="secondary"
      >
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>

      {openMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpenMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 z-20 w-56 bg-white border rounded-lg shadow-lg py-1">
            <button
              onClick={() => handleExportPdf('hotel')}
              disabled={isExporting || hotelNotes.length === 0}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              Hotel Briefing (PDF)
            </button>
            <button
              onClick={() => handleExportPdf('av')}
              disabled={isExporting || avNotes.length === 0}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-4 h-4" />
              AV Briefing (PDF)
            </button>
            <button
              onClick={() => handleExportCsv('graphics')}
              disabled={graphicsNotes.length === 0}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Graphics Output List (CSV)
            </button>
            <button
              onClick={() => handleExportCsv('logistics')}
              disabled={logisticsNotes.length === 0}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Logistics Manifest (CSV)
            </button>
          </div>
        </>
      )}
    </div>
  );
}

