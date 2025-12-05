/**
 * Table Node Component
 * 
 * Displays a single table with its seats in a grid
 */

'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import SeatNode from './SeatNode';
import type { TableSummary } from '@/lib/tables/seatMapUtils';

interface TableNodeProps {
  table: TableSummary;
}

export default function TableNode({ table }: TableNodeProps) {
  // Determine grid columns based on capacity
  const getGridCols = (capacity: number) => {
    if (capacity <= 4) return 'grid-cols-2';
    if (capacity <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {table.name}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({table.assignedCount} / {table.capacity})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid ${getGridCols(table.capacity)} gap-2`}>
          {table.seats.map((seat) => (
            <SeatNode key={seat.seatNumber} seat={seat} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

