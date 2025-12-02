'use client';

import { useState } from 'react';
import { TableAssignment } from '@/lib/tables/assignmentTypes';
import { AssignmentVersion } from '@/actions/tables/getAssignmentVersions';
import { DiffViewer } from './DiffViewer';
import { TableForAssignment } from '@/lib/tables/assignmentTypes';

interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  companyName?: string | null;
}

interface VersionRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (version: AssignmentVersion) => void;
  version: AssignmentVersion | null;
  currentAssignments: TableAssignment[];
  tables: TableForAssignment[];
  participants: Participant[];
}

export function VersionRestoreModal({
  isOpen,
  onClose,
  onRestore,
  version,
  currentAssignments,
  tables,
  participants,
}: VersionRestoreModalProps) {
  if (!isOpen || !version) return null;

  const handleRestore = () => {
    if (confirm(`Version ${version.version_number}으로 복원하시겠습니까? 현재 변경사항은 저장되지 않습니다.`)) {
      onRestore(version);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Version {version.version_number} 복원
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            <strong>Source:</strong> {version.source}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Created:</strong> {new Date(version.created_at).toLocaleString('ko-KR')}
          </p>
          {version.assigned_by && (
            <p className="text-sm text-gray-600">
              <strong>Assigned by:</strong> {version.assigned_by}
            </p>
          )}
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">Changes Preview:</h3>
          <DiffViewer
            before={currentAssignments}
            after={version.assignments}
            tables={tables}
            participants={participants}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleRestore}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Restore This Version
          </button>
        </div>
      </div>
    </div>
  );
}

