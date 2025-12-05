/**
 * Seat Map Toolbar Component
 * 
 * Provides navigation and export actions
 */

'use client';

import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface SeatMapToolbarProps {
  eventId: string;
  onExportPNG: () => void;
  onExportPDF: () => void;
  isExporting?: boolean;
}

export default function SeatMapToolbar({
  eventId,
  onExportPNG,
  onExportPDF,
  isExporting = false,
}: SeatMapToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <Link href={`/admin/events/${eventId}/tables`}>
        <Button variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assignment
        </Button>
      </Link>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={onExportPNG}
          disabled={isExporting}
        >
          <Download className="w-4 h-4 mr-2" />
          Export PNG
        </Button>
        <Button
          variant="secondary"
          onClick={onExportPDF}
          disabled={isExporting}
        >
          <FileText className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>
    </div>
  );
}

