'use client';

import React, { useMemo } from 'react';
import { TableForAssignment, TableAssignment } from '@/lib/tables/assignmentTypes';
import { TableCard } from './TableCard';
import { Conflict } from './ConflictInspector';
import { VirtualizedTableList } from './VirtualizedTableList';

interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  company?: string | null;
  companyName?: string | null;
  companyId?: string | null;
}

interface TableListProps {
  tables: TableForAssignment[];
  assignments: TableAssignment[];
  participants: Participant[];
  onMove?: (participantId: string, tableId: string) => void;
  isDraftMode?: boolean;
  conflicts?: Conflict[];
}

export function TableList({ tables, assignments, participants, onMove, isDraftMode = false, conflicts = [] }: TableListProps) {
  // Build participant lookup map once (memoized)
  const participantsById = useMemo(() => {
    const map = new Map<string, Participant>();
    for (const p of participants) {
      map.set(p.id, p);
    }
    return map;
  }, [participants]);

  // Build table assignments map once (memoized)
  const participantIdsByTable = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const a of assignments) {
      if (!map.has(a.tableId)) {
        map.set(a.tableId, []);
      }
      map.get(a.tableId)!.push(a.participantId);
    }
    return map;
  }, [assignments]);

  // Build conflicts by table map (memoized)
  const conflictsByTable = useMemo(() => {
    const map = new Map<string, Conflict[]>();
    for (const conflict of conflicts) {
      if (conflict.tableId) {
        if (!map.has(conflict.tableId)) {
          map.set(conflict.tableId, []);
        }
        map.get(conflict.tableId)!.push(conflict);
      }
    }
    return map;
  }, [conflicts]);

  // Memoize participant arrays per table (always compute, used in both branches)
  const tableParticipantsMap = useMemo(() => {
    const result = new Map<string, Participant[]>();
    for (const table of tables) {
      const participantIds = participantIdsByTable.get(table.id) || [];
      const tableParticipants = participantIds
        .map((pid) => participantsById.get(pid))
        .filter((p): p is Participant => p !== undefined);
      result.set(table.id, tableParticipants);
    }
    return result;
  }, [tables, participantIdsByTable, participantsById]);

  // 테이블 수가 적을 때는 기존 그리드 방식 유지
  if (tables.length <= 10) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {tables.map((t) => (
          <TableCard
            key={t.id}
            table={t}
            participants={tableParticipantsMap.get(t.id) || []}
            onDrop={onMove}
            isDraftMode={isDraftMode}
            conflicts={conflictsByTable.get(t.id) || []}
          />
        ))}
      </div>
    );
  }

  // 테이블 많은 경우 virtualized
  return (
    <div className="mt-6">
      <VirtualizedTableList
        tables={tables}
        participantsById={participantsById}
        participantIdsByTable={participantIdsByTable}
        onMove={onMove}
        isDraftMode={isDraftMode}
        conflictsByTable={conflictsByTable}
      />
    </div>
  );
}

