'use client';

import { useState } from 'react';
import { TableAssignment, TableForAssignment } from '@/lib/tables/assignmentTypes';

interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  company?: string | null;
  companyName?: string | null;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  beforeAssignments: TableAssignment[];
  afterAssignments: TableAssignment[];
  tables: TableForAssignment[];
  participants: Participant[];
  changes: string[];
}

export function PreviewModal({
  isOpen,
  onClose,
  onApply,
  beforeAssignments,
  afterAssignments,
  tables,
  participants,
  changes,
}: PreviewModalProps) {
  if (!isOpen) return null;

  const getTableCount = (assignments: TableAssignment[], tableId: string) => {
    return assignments.filter((a) => a.tableId === tableId).length;
  };

  const getTableParticipants = (assignments: TableAssignment[], tableId: string) => {
    const participantIds = assignments
      .filter((a) => a.tableId === tableId)
      .map((a) => a.participantId);
    return participants.filter((p) => participantIds.includes(p.id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Preview Changes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {changes.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <h3 className="font-semibold mb-2">Changes:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {changes.map((change, idx) => (
                <li key={idx}>{change}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Before</h3>
            <div className="space-y-2">
              {tables.map((table) => {
                const count = getTableCount(beforeAssignments, table.id);
                const tableParticipants = getTableParticipants(beforeAssignments, table.id);
                return (
                  <div key={table.id} className="border rounded p-2">
                    <div className="font-semibold text-sm">
                      {table.name} ({count}/{table.capacity})
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {tableParticipants.map((p) => p.name).join(', ') || 'Empty'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* After */}
          <div>
            <h3 className="font-semibold text-lg mb-2">After</h3>
            <div className="space-y-2">
              {tables.map((table) => {
                const count = getTableCount(afterAssignments, table.id);
                const tableParticipants = getTableParticipants(afterAssignments, table.id);
                const beforeCount = getTableCount(beforeAssignments, table.id);
                const diff = count - beforeCount;
                return (
                  <div
                    key={table.id}
                    className={`border rounded p-2 ${
                      diff > 0 ? 'bg-green-50' : diff < 0 ? 'bg-red-50' : ''
                    }`}
                  >
                    <div className="font-semibold text-sm">
                      {table.name} ({count}/{table.capacity})
                      {diff !== 0 && (
                        <span className={`ml-2 ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {diff > 0 ? '+' : ''}
                          {diff}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {tableParticipants.map((p) => p.name).join(', ') || 'Empty'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}

