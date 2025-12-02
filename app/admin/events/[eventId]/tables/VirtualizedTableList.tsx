'use client';

import React from 'react';
import { List } from 'react-window';
import { TableCard } from './TableCard';
import { TableForAssignment } from '@/lib/tables/assignmentTypes';
import { Conflict } from './ConflictInspector';

interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  company?: string | null;
  companyName?: string | null;
  companyId?: string | null;
}

interface VirtualizedTableListProps {
  tables: TableForAssignment[];
  participantsById: Map<string, Participant>;
  participantIdsByTable: Map<string, string[]>;
  onMove?: (participantId: string, tableId: string) => void;
  isDraftMode?: boolean;
  conflictsByTable?: Map<string, Conflict[]>;
  rowHeight?: number;
  height?: number;
}

export function VirtualizedTableList({
  tables,
  participantsById,
  participantIdsByTable,
  onMove,
  isDraftMode = false,
  conflictsByTable,
  rowHeight = 280,
  height = 600,
}: VirtualizedTableListProps) {
  const itemCount = tables.length;

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const t = tables[index];
    const ids = participantIdsByTable.get(t.id) ?? [];
    const tableParticipants = ids
      .map((pid) => participantsById.get(pid))
      .filter((p): p is Participant => p !== undefined);

    const conflicts = conflictsByTable?.get(t.id) || [];

    return (
      <div style={style} className="px-2 pb-4">
        <TableCard
          table={t}
          participants={tableParticipants}
          onDrop={onMove}
          isDraftMode={isDraftMode}
          conflicts={conflicts}
        />
      </div>
    );
  };

  const ListComponent = List as any;
  
  return (
    <div className="w-full">
      <ListComponent
        height={height}
        itemCount={itemCount}
        itemSize={rowHeight}
        width="100%"
      >
        {Row}
      </ListComponent>
    </div>
  );
}

