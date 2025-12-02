'use client';

import { useState } from 'react';
import { List } from 'react-window';
import { AssignmentVersion } from '@/actions/tables/getAssignmentVersions';
import { VersionRestoreModal } from './VersionRestoreModal';
import { TableAssignment, TableForAssignment } from '@/lib/tables/assignmentTypes';
import { History, Eye } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  companyName?: string | null;
}

interface VersionHistoryPanelProps {
  versions: AssignmentVersion[];
  currentAssignments: TableAssignment[];
  tables: TableForAssignment[];
  participants: Participant[];
  onRestore: (version: AssignmentVersion) => void;
  isLoading?: boolean;
}

export function VersionHistoryPanel({
  versions,
  currentAssignments,
  tables,
  participants,
  onRestore,
  isLoading = false,
}: VersionHistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<AssignmentVersion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVersionClick = (version: AssignmentVersion) => {
    setSelectedVersion(version);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <History className="w-5 h-5" />
          <span className="text-sm">Loading version history...</span>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <History className="w-5 h-5" />
          <span className="text-sm">No version history available</span>
        </div>
      </div>
    );
  }

  // 버전이 적을 때는 기존 리스트 방식
  if (versions.length < 20) {
    return (
      <>
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Version History</h3>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {versions.map((version) => (
              <div
                key={version.id}
                className="bg-white rounded p-3 border border-gray-200 hover:border-blue-300 cursor-pointer transition"
                onClick={() => handleVersionClick(version)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        Version {version.version_number}
                      </span>
                      {version.is_draft && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                          Draft
                        </span>
                      )}
                      {!version.is_draft && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          Confirmed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {version.source}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(version.created_at).toLocaleString('ko-KR')}
                    </p>
                    {version.assigned_by && (
                      <p className="text-xs text-gray-500">
                        by {version.assigned_by}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVersionClick(version);
                    }}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <VersionRestoreModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRestore={onRestore}
          version={selectedVersion}
          currentAssignments={currentAssignments}
          tables={tables}
          participants={participants}
        />
      </>
    );
  }

  // 버전이 많을 때는 virtualized
  const ListComponent = List as any;
  
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const version = versions[index];
    return (
      <div style={style} className="px-2 pb-2">
        <div
          className="bg-white rounded p-3 border border-gray-200 hover:border-blue-300 cursor-pointer transition"
          onClick={() => handleVersionClick(version)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  Version {version.version_number}
                </span>
                {version.is_draft && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                    Draft
                  </span>
                )}
                {!version.is_draft && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                    Confirmed
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {version.source}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(version.created_at).toLocaleString('ko-KR')}
              </p>
              {version.assigned_by && (
                <p className="text-xs text-gray-500">
                  by {version.assigned_by}
                </p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVersionClick(version);
              }}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              View
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Version History</h3>
        </div>

        <div className="border rounded bg-white">
          <ListComponent height={300} itemCount={versions.length} itemSize={120} width="100%">
            {Row}
          </ListComponent>
        </div>
      </div>

      <VersionRestoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRestore={onRestore}
        version={selectedVersion}
        currentAssignments={currentAssignments}
        tables={tables}
        participants={participants}
      />
    </>
  );
}

