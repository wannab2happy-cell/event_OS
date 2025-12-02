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

function companyKey(p: ParticipantForAssignment): string {
  if (p.companyId) return `id:${p.companyId}`;
  if (p.companyName) return `name:${p.companyName}`;
  if (p.company) return `name:${p.company}`;
  return 'unknown';
}

export function groupByCompany(
  options: TableAssignmentOptions,
  participants: ParticipantForAssignment[],
  tables: TableForAssignment[]
): TableAssignmentResult {
  const batchId = randomUUID();
  const tableStates = createInitialTableStates(tables);

  // Group participants by company (single pass)
  const groups = new Map<string, ParticipantForAssignment[]>();

  for (const p of participants) {
    const key = companyKey(p);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(p);
  }

  // Sort groups by size once (descending) so larger companies are placed first
  const companyGroups = Array.from(groups.entries()).sort(
    (a, b) => b[1].length - a[1].length
  );

  // Helper to build capacity heap (key = -remainingCapacity for max-heap behavior)
  const buildCapacityHeap = (): MinHeap<TableState> => {
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

  // Greedy placement with priority queue
  for (const [companyKey, members] of companyGroups) {
    let remaining = [...members];

    while (remaining.length > 0) {
      const capacityHeap = buildCapacityHeap();
      if (capacityHeap.isEmpty()) break;

      const heapItem = capacityHeap.pop();
      if (!heapItem || heapItem.value.remainingCapacity <= 0) {
        // No more seats; break and rely on validation
        break;
      }

      const table = heapItem.value;
      const seats = Math.min(table.remainingCapacity, remaining.length);
      const toAssign = remaining.slice(0, seats);
      remaining = remaining.slice(seats);

      // Bulk assign all members that fit
      for (const p of toAssign) {
        table.participants.push(p);
        table.remainingCapacity -= 1;
        if (p.isVip) {
          table.vipCount += 1;
        }
      }
    }
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

