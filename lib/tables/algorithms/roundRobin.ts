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

export function roundRobin(
  options: TableAssignmentOptions,
  participants: ParticipantForAssignment[],
  tables: TableForAssignment[]
): TableAssignmentResult {
  const batchId = randomUUID();
  const tableStates = createInitialTableStates(tables);

  // Precompute only tables that have capacity
  const availableTableStates = tableStates.filter(
    (ts) => ts.remainingCapacity > 0
  );

  if (availableTableStates.length === 0) {
    // No available tables, return empty result
    return {
      eventId: options.eventId,
      algorithm: options.algorithm,
      batchId,
      assignments: [],
      summary: {
        totalParticipants: participants.length,
        totalTables: tables.length,
        unassignedCount: participants.length,
        byTable: tableStates.map((ts) => ({
          tableId: ts.table.id,
          tableName: ts.table.name,
          assignedCount: 0,
          capacity: ts.table.capacity,
        })),
      },
    };
  }

  // Maintain a rotating pointer with modulo
  let pointer = 0;

  for (const p of participants) {
    // Find next available table with capacity using rotating pointer
    let attempts = 0;
    let targetTable: TableState | undefined;

    while (attempts < availableTableStates.length) {
      const currentTableState = availableTableStates[pointer];

      if (currentTableState && currentTableState.remainingCapacity > 0) {
        targetTable = currentTableState;
        break;
      }

      pointer = (pointer + 1) % availableTableStates.length;
      attempts++;
    }

    if (targetTable && targetTable.remainingCapacity > 0) {
      targetTable.participants.push(p);
      targetTable.remainingCapacity -= 1;
      if (p.isVip) {
        targetTable.vipCount += 1;
      }

      // Move to next table for round-robin
      pointer = (pointer + 1) % availableTableStates.length;
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

