'use client';

import { useDrop } from 'react-dnd';
import { ReactNode } from 'react';
import { PARTICIPANT_TYPE } from './DraggableParticipant';

interface DroppableTableProps {
  table: { id: string };
  onDrop: (participantId: string, tableId: string) => void;
  children: ReactNode;
}

export function DroppableTable({ table, onDrop, children }: DroppableTableProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: PARTICIPANT_TYPE,
    drop: (item: { pid: string }) => onDrop(item.pid, table.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop as any}
      className={`border rounded p-3 ${
        isOver ? 'bg-blue-50 border-blue-300' : 'bg-white'
      } transition`}
    >
      {children}
    </div>
  );
}

