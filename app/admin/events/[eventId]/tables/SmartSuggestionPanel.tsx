'use client';

import React, { useMemo } from 'react';
import { Conflict } from './ConflictInspector';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface SmartSuggestionPanelProps {
  conflicts: Conflict[];
  onFix: (conflict: Conflict) => void;
  onFixAll: () => void;
  onPreview: (conflict: Conflict) => void;
}

function SmartSuggestionPanelInner({
  conflicts,
  onFix,
  onFixAll,
  onPreview,
}: SmartSuggestionPanelProps) {
  // Memoize filtered conflicts
  const { errors, warnings } = useMemo(() => {
    const errs = conflicts.filter((c) => c.severity === 'error');
    const warns = conflicts.filter((c) => c.severity === 'warning');
    return { errors: errs, warnings: warns };
  }, [conflicts]);
  if (conflicts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">No conflicts detected. All assignments are valid!</span>
        </div>
      </div>
    );
  }

  const getConflictLabel = (conflict: Conflict) => {
    switch (conflict.type) {
      case 'capacity_overflow':
        return `⚠️ 용량 초과: ${conflict.tableName} (${conflict.count}/${conflict.capacity})`;
      case 'duplicate_assignment':
        return `⚠️ 중복 배정: ${conflict.participants?.[0]?.name || 'Unknown'}`;
      case 'unassigned':
        return `⚠️ 미배정: ${conflict.participants?.length || 0}명`;
      case 'vip_imbalance':
        return `⚠️ VIP 편중: ${conflict.tableName}`;
      case 'group_scatter':
        return `⚠️ 회사 그룹 분산: ${conflict.participants?.[0]?.companyName || 'Unknown'}`;
      default:
        return 'Unknown conflict';
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <h3 className="font-semibold text-yellow-800">
          Detected Issues ({errors.length} errors, {warnings.length} warnings)
        </h3>
      </div>

      <div className="space-y-2 mb-4">
        {conflicts.map((conflict, idx) => (
          <div
            key={idx}
            className={`p-3 rounded ${
              conflict.severity === 'error' ? 'bg-red-50' : 'bg-orange-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {getConflictLabel(conflict)}
                </p>
                {conflict.details && (
                  <p className="text-xs text-gray-600 mt-1">{conflict.details}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onPreview(conflict)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Preview
                </button>
                <button
                  onClick={() => onFix(conflict)}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Fix
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {conflicts.length > 0 && (
        <button
          onClick={onFixAll}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold"
        >
          Auto-Fix All Issues
        </button>
      )}
    </div>
  );
}

export const SmartSuggestionPanel = React.memo(
  SmartSuggestionPanelInner,
  (prev, next) => {
    // Only re-render when conflicts array changes
    if (prev.conflicts.length !== next.conflicts.length) return false;
    
    // Compare conflicts by reference (if same array, skip re-render)
    if (prev.conflicts === next.conflicts) return true;
    
    // Deep comparison would be expensive, so we use reference equality
    // Conflicts are typically replaced as a whole array, not mutated
    return false; // Re-render if conflicts array reference changed
  }
);

