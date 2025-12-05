/**
 * Seat Map Client Component
 * 
 * Client-side component handling export functionality
 */

'use client';

import { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import SeatMapView from '@/components/tables/seatmap/SeatMapView';
import SeatMapToolbar from '@/components/tables/seatmap/SeatMapToolbar';
import { buildSeatMap } from '@/lib/tables/seatMapUtils';
import type { TableForAssignment, TableAssignment } from '@/lib/tables/assignmentTypes';
import type { Participant } from '@/lib/tables/seatMapUtils';

// Export libraries are dynamically imported on demand to avoid SSR issues

interface SeatMapClientProps {
  eventId: string;
  tables: TableForAssignment[];
  participants: Participant[];
  assignments: TableAssignment[];
}

export default function SeatMapClient({
  eventId,
  tables,
  participants,
  assignments,
}: SeatMapClientProps) {
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build seat map
  const seatsByTable = useMemo(() => {
    return buildSeatMap(tables, assignments, participants);
  }, [tables, assignments, participants]);

  // Export PNG
  const handleExportPNG = async () => {
    if (!containerRef.current) {
      alert('Export functionality is loading. Please try again in a moment.');
      return;
    }

    setIsExporting(true);
    try {
      const htmlToImageMod = await import('html-to-image');
      const dataUrl = await htmlToImageMod.toPng(containerRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `seatmap-${eventId}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Failed to export PNG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export PDF
  const handleExportPDF = async () => {
    if (!containerRef.current) {
      alert('Export functionality is loading. Please try again in a moment.');
      return;
    }

    setIsExporting(true);
    try {
      // Dynamically import libraries
      const htmlToImageMod = await import('html-to-image');
      const jsPDFMod = await import('jspdf');

      // Convert to PNG first
      const dataUrl = await htmlToImageMod.toPng(containerRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      // Create PDF
      const { jsPDF: JsPDF } = jsPDFMod;
      const pdf = new JsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (containerRef.current.offsetHeight * imgWidth) / containerRef.current.offsetWidth;

      // Add image to PDF
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);

      // Save PDF
      pdf.save(`seatmap-${eventId}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <SeatMapToolbar
        eventId={eventId}
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
      />
      <SeatMapView ref={containerRef} tables={tables} seatsByTable={seatsByTable} />
    </div>
  );
}

