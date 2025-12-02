'use client';

import React, { useMemo } from 'react';
import { List } from 'react-window';
import { TableAssignment, TableForAssignment } from '@/lib/tables/assignmentTypes';
import { calculateDiff } from './AuditStore';

interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  companyName?: string | null;
}

interface DiffViewerProps {
  before: TableAssignment[];
  after: TableAssignment[];
  tables: TableForAssignment[];
  participants: Participant[];
}

interface DiffItem {
  type: 'added' | 'removed' | 'moved';
  message: string;
  color: string;
}

export function DiffViewer({
  before,
  after,
  tables,
  participants,
}: DiffViewerProps) {
  const diff = calculateDiff(before, after);

  // Build lookup maps for performance
  const tableNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tables) {
      map.set(t.id, t.name);
    }
    return map;
  }, [tables]);

  const participantNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of participants) {
      map.set(p.id, p.name);
    }
    return map;
  }, [participants]);

  const getTableName = (tableId: string) => {
    return tableNameMap.get(tableId) || tableId;
  };

  const getParticipantName = (participantId: string) => {
    return participantNameMap.get(participantId) || participantId;
  };

  // Build flat diff items list
  const diffItems = useMemo<DiffItem[]>(() => {
    const items: DiffItem[] = [];
    
    for (const a of diff.added) {
      items.push({
        type: 'added',
        message: `${getParticipantName(a.participantId)} → ${getTableName(a.tableId)}`,
        color: 'text-green-600',
      });
    }

    for (const a of diff.removed) {
      items.push({
        type: 'removed',
        message: `${getParticipantName(a.participantId)} ← ${getTableName(a.tableId)}`,
        color: 'text-red-600',
      });
    }

    for (const m of diff.moved) {
      items.push({
        type: 'moved',
        message: `${getParticipantName(m.participantId)}: ${getTableName(m.fromTableId)} → ${getTableName(m.toTableId)}`,
        color: 'text-blue-600',
      });
    }

    return items;
  }, [diff, tableNameMap, participantNameMap]);

  if (diffItems.length === 0) {
    return <p className="text-gray-500 text-sm">No changes detected.</p>;
  }

  // Use virtualization for large diffs
  if (diffItems.length > 50) {
    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = diffItems[index];
      return (
        <div style={style} className={`text-sm px-2 py-1 ${item.color}`}>
          {item.type === 'added' && '➕ '}
          {item.type === 'removed' && '➖ '}
          {item.type === 'moved' && '🔄 '}
          {item.message}
        </div>
      );
    };

    const ListComponent = List as any;
    
    return (
      <div className="border rounded max-h-[400px] overflow-hidden">
        <ListComponent height={400} itemCount={diffItems.length} itemSize={24} width="100%">
          {Row}
        </ListComponent>
      </div>
    );
  }

  // Small diffs: render normally with sections
  return (
    <div className="space-y-4">
      {diff.added.length > 0 && (
        <div>
          <h4 className="font-semibold text-green-700 mb-2">➕ Added Assignments</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {diff.added.map((a, idx) => (
              <li key={idx} className="text-green-600">
                {getParticipantName(a.participantId)} → {getTableName(a.tableId)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {diff.removed.length > 0 && (
        <div>
          <h4 className="font-semibold text-red-700 mb-2">➖ Removed Assignments</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {diff.removed.map((a, idx) => (
              <li key={idx} className="text-red-600">
                {getParticipantName(a.participantId)} ← {getTableName(a.tableId)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {diff.moved.length > 0 && (
        <div>
          <h4 className="font-semibold text-blue-700 mb-2">🔄 Moved Assignments</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {diff.moved.map((m, idx) => (
              <li key={idx} className="text-blue-600">
                {getParticipantName(m.participantId)}: {getTableName(m.fromTableId)} →{' '}
                {getTableName(m.toTableId)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

