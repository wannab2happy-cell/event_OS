'use client';

import { Undo2, Redo2 } from 'lucide-react';
import { TableAssignment } from '@/lib/tables/assignmentTypes';

interface UndoRedoToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function UndoRedoToolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: UndoRedoToolbarProps) {
  return (
    <div className="flex gap-2 items-center bg-gray-100 px-3 py-2 rounded">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`flex items-center gap-1 px-3 py-1 rounded ${
          canUndo
            ? 'bg-white text-gray-700 hover:bg-gray-50'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
        <span className="text-sm">Undo</span>
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`flex items-center gap-1 px-3 py-1 rounded ${
          canRedo
            ? 'bg-white text-gray-700 hover:bg-gray-50'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="w-4 h-4" />
        <span className="text-sm">Redo</span>
      </button>
    </div>
  );
}

