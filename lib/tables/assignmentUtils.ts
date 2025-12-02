import { ParticipantForAssignment, TableForAssignment } from './assignmentTypes';

export interface TableState {
  table: TableForAssignment;
  remainingCapacity: number;
  participants: ParticipantForAssignment[];
  vipCount: number;
}

export function createInitialTableStates(
  tables: TableForAssignment[]
): TableState[] {
  return tables.map((table) => ({
    table,
    remainingCapacity: table.capacity ?? 0,
    participants: [],
    vipCount: 0,
  }));
}

export function pickTableWithMostRemainingCapacity(
  tables: TableState[]
): TableState | undefined {
  return tables
    .filter((t) => t.remainingCapacity > 0)
    .sort((a, b) => b.remainingCapacity - a.remainingCapacity)[0];
}

export function pickTableWithLeastVip(
  tables: TableState[]
): TableState | undefined {
  return tables
    .filter((t) => t.remainingCapacity > 0)
    .sort((a, b) => {
      if (a.vipCount !== b.vipCount) {
        return a.vipCount - b.vipCount;
      }
      return a.participants.length - b.participants.length;
    })[0];
}

