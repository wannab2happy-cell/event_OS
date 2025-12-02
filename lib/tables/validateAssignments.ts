import {
  ParticipantForAssignment,
  TableForAssignment,
  TableAssignment,
} from './assignmentTypes';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export interface AssignmentInput {
  participants: ParticipantForAssignment[];
  tables: TableForAssignment[];
}

export function validateAssignmentResult(
  input: AssignmentInput,
  assignments: TableAssignment[]
): ValidationResult {
  const errors: string[] = [];

  // 1) basic input checks
  if (!input.tables.length) {
    errors.push('No tables provided.');
  }
  if (!input.participants.length) {
    errors.push('No participants provided.');
  }
  if (input.tables.some((t) => (t.capacity ?? 0) <= 0)) {
    errors.push('One or more tables have non-positive capacity.');
  }

  // 2) duplicate participant assignment
  const participantMap = new Map<string, number>();
  for (const a of assignments) {
    participantMap.set(
      a.participantId,
      (participantMap.get(a.participantId) ?? 0) + 1
    );
  }
  const duplicated = Array.from(participantMap.entries()).filter(
    ([, count]) => count > 1
  );
  if (duplicated.length > 0) {
    errors.push('Some participants are assigned to multiple tables.');
  }

  // 3) over capacity check
  const tableCapacities = new Map(
    input.tables.map((t) => [t.id, t.capacity ?? 0])
  );
  const tableCounts = new Map<string, number>();

  for (const a of assignments) {
    tableCounts.set(a.tableId, (tableCounts.get(a.tableId) ?? 0) + 1);
  }

  for (const [tableId, count] of tableCounts.entries()) {
    const cap = tableCapacities.get(tableId);
    if (cap != null && count > cap) {
      const tableName =
        input.tables.find((t) => t.id === tableId)?.name || tableId;
      errors.push(
        `Table "${tableName}" (${tableId}) is over capacity: ${count}/${cap}.`
      );
    }
  }

  // 4) unassigned participants (soft check)
  const assignedIds = new Set(assignments.map((a) => a.participantId));
  const unassigned = input.participants.filter(
    (p) => !assignedIds.has(p.id)
  );
  if (unassigned.length > 0) {
    errors.push(
      `Some participants are not assigned to any table. Count: ${unassigned.length}`
    );
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

