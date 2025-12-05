/**
 * Seat Node Component
 * 
 * Displays a single seat with participant information
 */

'use client';

import { getInitials } from '@/lib/tables/seatMapUtils';
import type { Seat } from '@/lib/tables/seatMapUtils';

interface SeatNodeProps {
  seat: Seat;
}

export default function SeatNode({ seat }: SeatNodeProps) {
  const { seatNumber, participant, conflict, vip } = seat;

  // Determine border style
  let borderClass = 'border-2 border-dashed border-gray-300 opacity-60';
  if (conflict) {
    borderClass = 'border-2 border-red-500';
  } else if (vip) {
    borderClass = 'border-2 border-yellow-400';
  } else if (participant) {
    borderClass = 'border-2 border-gray-400';
  }

  return (
    <div
      className={`rounded-lg p-2 text-center min-h-[60px] flex flex-col items-center justify-center ${borderClass} ${
        participant ? 'bg-white' : 'bg-gray-50'
      }`}
    >
      <div className="text-xs font-medium text-gray-500 mb-1">Seat {seatNumber}</div>
      {participant ? (
        <>
          <div className="text-sm font-semibold text-gray-900 truncate w-full">
            {participant.name}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {getInitials(participant.name)}
          </div>
        </>
      ) : (
        <div className="text-xs text-gray-400">Empty</div>
      )}
    </div>
  );
}

