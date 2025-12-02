'use client';

import { Conflict } from './ConflictInspector';

interface WarningBadgeProps {
  conflicts: Conflict[];
  tableId: string;
}

export function WarningBadge({ conflicts, tableId }: WarningBadgeProps) {
  const tableConflicts = conflicts.filter((c) => c.tableId === tableId);

  if (tableConflicts.length === 0) {
    return null;
  }

  const hasError = tableConflicts.some((c) => c.severity === 'error');
  const hasWarning = tableConflicts.some((c) => c.severity === 'warning');

  const getBadgeInfo = () => {
    if (tableConflicts.some((c) => c.type === 'capacity_overflow')) {
      return { text: 'Overflow', color: 'bg-red-500 text-white' };
    }
    if (tableConflicts.some((c) => c.type === 'vip_imbalance')) {
      return { text: 'VIP Imbalance', color: 'bg-orange-500 text-white' };
    }
    if (tableConflicts.some((c) => c.type === 'group_scatter')) {
      return { text: 'Group Scatter', color: 'bg-blue-500 text-white' };
    }
    return hasError
      ? { text: 'Error', color: 'bg-red-500 text-white' }
      : { text: 'Warning', color: 'bg-yellow-500 text-white' };
  };

  const badge = getBadgeInfo();

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${badge.color}`}>
      ⚠️ {badge.text}
    </span>
  );
}

