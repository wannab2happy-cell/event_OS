/**
 * Seat Map View Component
 * 
 * Main container for the seat map visualization
 */

'use client';

import { forwardRef } from 'react';
import TableNode from './TableNode';
import type { TableSummary } from '@/lib/tables/seatMapUtils';
import type { TableForAssignment } from '@/lib/tables/assignmentTypes';

interface SeatMapViewProps {
  tables: TableForAssignment[];
  seatsByTable: Map<string, TableSummary>;
}

const SeatMapView = forwardRef<HTMLDivElement, SeatMapViewProps>(
  ({ tables, seatsByTable }, ref) => {
    return (
      <div ref={ref} className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tables.map((table) => {
            const tableSummary = seatsByTable.get(table.id);
            if (!tableSummary) return null;

            return <TableNode key={table.id} table={tableSummary} />;
          })}
        </div>
      </div>
    );
  }
);

SeatMapView.displayName = 'SeatMapView';

export default SeatMapView;

