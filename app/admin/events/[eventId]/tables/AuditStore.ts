import { TableAssignment } from '@/lib/tables/assignmentTypes';

export interface AssignmentDiff {
  added: TableAssignment[];
  removed: TableAssignment[];
  moved: {
    participantId: string;
    fromTableId: string;
    toTableId: string;
  }[];
}

export interface AuditLogEntry {
  eventId: string;
  versionNumber: number;
  assignedBy: string;
  timestamp: string;
  source: string;
  diff: AssignmentDiff;
  metadata?: {
    algorithm?: string;
    fixType?: string;
    rebalance?: boolean;
  };
}

export function calculateDiff(
  before: TableAssignment[],
  after: TableAssignment[]
): AssignmentDiff {
  const beforeMap = new Map<string, TableAssignment>();
  const afterMap = new Map<string, TableAssignment>();

  for (const a of before) {
    beforeMap.set(a.participantId, a);
  }

  for (const a of after) {
    afterMap.set(a.participantId, a);
  }

  const added: TableAssignment[] = [];
  const removed: TableAssignment[] = [];
  const moved: { participantId: string; fromTableId: string; toTableId: string }[] = [];

  // 추가된 배정
  for (const [participantId, assignment] of afterMap.entries()) {
    if (!beforeMap.has(participantId)) {
      added.push(assignment);
    }
  }

  // 제거된 배정
  for (const [participantId, assignment] of beforeMap.entries()) {
    if (!afterMap.has(participantId)) {
      removed.push(assignment);
    }
  }

  // 이동된 배정
  for (const [participantId, afterAssignment] of afterMap.entries()) {
    const beforeAssignment = beforeMap.get(participantId);
    if (beforeAssignment && beforeAssignment.tableId !== afterAssignment.tableId) {
      moved.push({
        participantId,
        fromTableId: beforeAssignment.tableId,
        toTableId: afterAssignment.tableId,
      });
    }
  }

  return { added, removed, moved };
}

export function createAuditLogEntry(
  eventId: string,
  versionNumber: number,
  assignedBy: string,
  source: string,
  before: TableAssignment[],
  after: TableAssignment[],
  metadata?: AuditLogEntry['metadata']
): AuditLogEntry {
  return {
    eventId,
    versionNumber,
    assignedBy,
    timestamp: new Date().toISOString(),
    source,
    diff: calculateDiff(before, after),
    metadata,
  };
}

