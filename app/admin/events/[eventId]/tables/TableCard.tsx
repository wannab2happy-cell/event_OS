'use client';

import React from 'react';
import { TableForAssignment } from '@/lib/tables/assignmentTypes';
import { DroppableTable } from './DroppableTable';
import { DraggableParticipant } from './DraggableParticipant';
import { WarningBadge } from './WarningBadge';
import { Conflict } from './ConflictInspector';

interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  company?: string | null;
  companyName?: string | null;
  companyId?: string | null;
}

interface TableCardProps {
  table: TableForAssignment;
  participants: Participant[];
  onDrop?: (participantId: string, tableId: string) => void;
  isDraftMode?: boolean;
  conflicts?: Conflict[];
}

function TableCardInner({ table, participants, onDrop, isDraftMode = false, conflicts = [] }: TableCardProps) {
  const handleDrop = onDrop || (() => {});

  return (
    <DroppableTable table={table} onDrop={isDraftMode ? handleDrop : () => {}}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">
          {table.name} ({participants.length}/{table.capacity})
        </h3>
        {isDraftMode && <WarningBadge conflicts={conflicts} tableId={table.id} />}
      </div>

      {participants.length === 0 ? (
        <p className="text-gray-400 text-sm">No participants assigned</p>
      ) : (
        <div className="space-y-1">
          {participants.map((p) => (
            <DraggableParticipant
              key={p.id}
              participant={{
                id: p.id,
                name: p.name,
                isVip: p.isVip,
                companyName: p.companyName || p.company,
              }}
              disabled={!isDraftMode}
            />
          ))}
        </div>
      )}
    </DroppableTable>
  );
}

export const TableCard = React.memo(
  TableCardInner,
  (prev, next) => {
    // Only re-render when relevant props change
    if (prev.table.id !== next.table.id) return false;
    if (prev.table.capacity !== next.table.capacity) return false;
    if (prev.table.name !== next.table.name) return false;
    if (prev.isDraftMode !== next.isDraftMode) return false;
    
    // Check participants array - compare by length and IDs
    if (prev.participants.length !== next.participants.length) return false;
    const prevIds = prev.participants.map(p => p.id).sort().join(',');
    const nextIds = next.participants.map(p => p.id).sort().join(',');
    if (prevIds !== nextIds) return false;
    
    // Check conflicts - compare by table conflicts count
    const prevConflictCount = prev.conflicts?.filter(c => c.tableId === prev.table.id).length || 0;
    const nextConflictCount = next.conflicts?.filter(c => c.tableId === next.table.id).length || 0;
    if (prevConflictCount !== nextConflictCount) return false;
    
    // onDrop callback reference check (if changed, we need to re-render)
    if (prev.onDrop !== next.onDrop) return false;
    
    return true; // Props are equal, skip re-render
  }
);

