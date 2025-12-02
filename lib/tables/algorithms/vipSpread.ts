import {
  TableAssignmentOptions,
  ParticipantForAssignment,
  TableForAssignment,
  TableAssignmentResult,
  TableAssignment,
} from '../assignmentTypes';
import { randomUUID } from 'crypto';
import {
  createInitialTableStates,
  TableState,
} from '../assignmentUtils';
import { MinHeap } from '../priorityQueue';

export function vipSpread(
  options: TableAssignmentOptions,
  participants: ParticipantForAssignment[],
  tables: TableForAssignment[]
): TableAssignmentResult {
  const batchId = randomUUID();
  const tableStates = createInitialTableStates(tables);

  // Split participants
  const vips = participants.filter((p) => p.isVip === true);
  const regulars = participants.filter((p) => !p.isVip);

  // Check if VIP tables exist
  const hasVipTables = tables.some((t) => t.isVipTable === true);
  const vipEligibleTableStates = hasVipTables
    ? tableStates.filter((ts) => ts.table.isVipTable === true)
    : tableStates;

  // Helper to build VIP heap
  const buildVipHeap = (): MinHeap<TableState> => {
    const heap = new MinHeap<TableState>();
    for (const ts of vipEligibleTableStates) {
      if (ts.remainingCapacity > 0) {
        heap.push({
          key: ts.vipCount * 10000 + ts.participants.length, // Tie-break by total participants
          value: ts,
        });
      }
    }
    return heap;
  };

  // Helper to build load heap for regular participants (key = -remainingCapacity for max-heap behavior)
  const buildLoadHeap = (): MinHeap<TableState> => {
    const heap = new MinHeap<TableState>();
    for (const ts of tableStates) {
      if (ts.remainingCapacity > 0) {
        heap.push({
          key: -ts.remainingCapacity, // Negative for max-heap behavior
          value: ts,
        });
      }
    }
    return heap;
  };

  // VIP distribution using heap
  for (const vip of vips) {
    let targetTable: TableState | undefined;

    // Try to find VIP table with least VIPs using heap
    if (hasVipTables) {
      const vipHeap = buildVipHeap();
      if (!vipHeap.isEmpty()) {
        const heapItem = vipHeap.pop();
        if (heapItem && heapItem.value.remainingCapacity > 0) {
          targetTable = heapItem.value;
        }
      }
    }

    // Fallback to any table with capacity if no VIP table available
    if (!targetTable || targetTable.remainingCapacity <= 0) {
      const loadHeap = buildLoadHeap();
      const heapItem = loadHeap.pop();
      if (heapItem && heapItem.value.remainingCapacity > 0) {
        targetTable = heapItem.value;
      }
    }

    if (targetTable && targetTable.remainingCapacity > 0) {
      targetTable.participants.push(vip);
      targetTable.remainingCapacity -= 1;
      targetTable.vipCount += 1;
    }
  }

  // Regular distribution using heap
  for (const regular of regulars) {
    const loadHeap = buildLoadHeap();
    if (loadHeap.isEmpty()) break;

    const heapItem = loadHeap.pop();
    if (!heapItem || heapItem.value.remainingCapacity <= 0) break;

    const targetTable = heapItem.value;
    targetTable.participants.push(regular);
    targetTable.remainingCapacity -= 1;
  }

  // Build final assignments
  const assignments: TableAssignment[] = [];
  for (const ts of tableStates) {
    for (const p of ts.participants) {
      assignments.push({
        participantId: p.id,
        tableId: ts.table.id,
        tableName: ts.table.name,
        isVip: p.isVip ?? false,
      });
    }
  }

  return {
    eventId: options.eventId,
    algorithm: options.algorithm,
    batchId,
    assignments,
    summary: {
      totalParticipants: participants.length,
      totalTables: tables.length,
      unassignedCount: participants.length - assignments.length,
      byTable: tableStates.map((ts) => ({
        tableId: ts.table.id,
        tableName: ts.table.name,
        assignedCount: ts.participants.length,
        capacity: ts.table.capacity,
      })),
    },
  };
}

