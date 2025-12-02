'use client';

import React from 'react';
import { useDrag } from 'react-dnd';

export const PARTICIPANT_TYPE = 'PARTICIPANT';

interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  companyName?: string | null;
}

interface DraggableParticipantProps {
  participant: Participant;
  disabled?: boolean;
}

function DraggableParticipantInner({ participant, disabled = false }: DraggableParticipantProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: PARTICIPANT_TYPE,
      item: { pid: participant.id },
      canDrag: !disabled,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [participant.id, disabled]
  );

  return (
    <div
      ref={disabled ? undefined : (drag as any)}
      className={`px-2 py-1 rounded border bg-white ${
        disabled ? 'cursor-default' : 'cursor-move'
      } ${isDragging ? 'opacity-40' : ''}`}
    >
      <span>{participant.name}</span>
      {participant.isVip && (
        <span className="text-red-600 font-bold ml-1">[VIP]</span>
      )}
      {participant.companyName && (
        <span className="text-gray-500 ml-1 text-xs">
          {participant.companyName}
        </span>
      )}
    </div>
  );
}

export const DraggableParticipant = React.memo(
  DraggableParticipantInner,
  (prev, next) =>
    prev.participant.id === next.participant.id &&
    prev.participant.name === next.participant.name &&
    prev.participant.isVip === next.participant.isVip &&
    prev.participant.companyName === next.participant.companyName &&
    prev.disabled === next.disabled
);

