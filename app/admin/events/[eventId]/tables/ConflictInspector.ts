import { TableAssignment, TableForAssignment } from '@/lib/tables/assignmentTypes';

interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  company?: string | null;
  companyName?: string | null;
  companyId?: string | null;
}

export interface Conflict {
  type: 'capacity_overflow' | 'duplicate_assignment' | 'unassigned' | 'vip_imbalance' | 'group_scatter';
  severity: 'error' | 'warning';
  tableId?: string;
  tableName?: string;
  participantIds?: string[];
  participants?: Participant[];
  count?: number;
  capacity?: number;
  details?: string;
}

export interface ConflictInspectionResult {
  conflicts: Conflict[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

export function inspectConflicts(
  assignments: TableAssignment[],
  tables: TableForAssignment[],
  participants: Participant[]
): ConflictInspectionResult {
  const conflicts: Conflict[] = [];

  // Build participant lookup map (single pass)
  const participantMap = new Map<string, Participant>();
  for (const p of participants) {
    participantMap.set(p.id, p);
  }

  // Build table lookup map
  const tableMap = new Map<string, TableForAssignment>();
  for (const t of tables) {
    tableMap.set(t.id, t);
  }

  // A. 용량 초과 체크 + B. 중복 배정 체크 + D. VIP 편중 체크 (single pass)
  const tableCounts = new Map<string, number>();
  const participantTableMap = new Map<string, string[]>();
  const vipCounts = new Map<string, number>();
  const totalCounts = new Map<string, number>();
  let totalVips = 0;
  let totalParticipants = 0;

  for (const a of assignments) {
    // Table counts for capacity check
    tableCounts.set(a.tableId, (tableCounts.get(a.tableId) || 0) + 1);

    // Participant table mapping for duplicate check
    if (!participantTableMap.has(a.participantId)) {
      participantTableMap.set(a.participantId, []);
    }
    participantTableMap.get(a.participantId)!.push(a.tableId);

    // VIP counts
    totalCounts.set(a.tableId, (totalCounts.get(a.tableId) || 0) + 1);
    totalParticipants++;

    if (a.isVip) {
      vipCounts.set(a.tableId, (vipCounts.get(a.tableId) || 0) + 1);
      totalVips++;
    }
  }

  // A. 용량 초과 체크
  for (const table of tables) {
    const count = tableCounts.get(table.id) || 0;
    if (count > table.capacity) {
      conflicts.push({
        type: 'capacity_overflow',
        severity: 'error',
        tableId: table.id,
        tableName: table.name,
        count,
        capacity: table.capacity,
        details: `Table "${table.name}" has ${count} participants but capacity is ${table.capacity}`,
      });
    }
  }

  // B. 중복 배정 체크
  for (const [participantId, tableIds] of participantTableMap.entries()) {
    if (tableIds.length > 1) {
      const participant = participantMap.get(participantId);
      conflicts.push({
        type: 'duplicate_assignment',
        severity: 'error',
        participantIds: [participantId],
        participants: participant ? [participant] : [],
        details: `Participant "${participant?.name || participantId}" is assigned to ${tableIds.length} tables`,
      });
    }
  }

  // C. 미배정 체크
  const assignedParticipantIds = new Set(assignments.map((a) => a.participantId));
  const unassigned: Participant[] = [];
  for (const p of participants) {
    if (!assignedParticipantIds.has(p.id)) {
      unassigned.push(p);
    }
  }

  if (unassigned.length > 0) {
    conflicts.push({
      type: 'unassigned',
      severity: 'error',
      participantIds: unassigned.map((p) => p.id),
      participants: unassigned,
      details: `${unassigned.length} participant(s) are not assigned to any table`,
    });
  }

  // D. VIP 편중 체크
  const avgVipRatio = totalVips / totalParticipants || 0;

  for (const table of tables) {
    const tableCount = totalCounts.get(table.id) || 0;
    const tableVipCount = vipCounts.get(table.id) || 0;
    const tableVipRatio = tableCount > 0 ? tableVipCount / tableCount : 0;

    // VIP 비율이 평균의 2배 이상이면 경고
    if (tableVipRatio > avgVipRatio * 2 && tableVipRatio > 0.5) {
      conflicts.push({
        type: 'vip_imbalance',
        severity: 'warning',
        tableId: table.id,
        tableName: table.name,
        details: `Table "${table.name}" has ${tableVipRatio.toFixed(1)} VIP ratio (avg: ${avgVipRatio.toFixed(1)})`,
      });
    }
  }

  // E. 회사 그룹 분산 체크 (optimized with maps)
  const companyTableMap = new Map<string, Set<string>>();
  const companyParticipantsMap = new Map<string, Participant[]>();

  // Build company key map for participants (single pass)
  for (const p of participants) {
    const companyKey = p.companyId || p.companyName || p.company || 'unknown';
    if (!companyParticipantsMap.has(companyKey)) {
      companyParticipantsMap.set(companyKey, []);
    }
    companyParticipantsMap.get(companyKey)!.push(p);
  }

  // Build company table mapping (single pass)
  for (const a of assignments) {
    const participant = participantMap.get(a.participantId);
    if (!participant) continue;

    const companyKey = participant.companyId || participant.companyName || participant.company || 'unknown';
    if (!companyTableMap.has(companyKey)) {
      companyTableMap.set(companyKey, new Set());
    }
    companyTableMap.get(companyKey)!.add(a.tableId);
  }

  // Check for scattered companies
  for (const [companyKey, tableIds] of companyTableMap.entries()) {
    if (tableIds.size > 1) {
      const companyParticipants = companyParticipantsMap.get(companyKey) || [];
      const assignedCompanyParticipants = companyParticipants.filter((p) =>
        assignedParticipantIds.has(p.id)
      );

      if (assignedCompanyParticipants.length > 2 && tableIds.size > 1) {
        conflicts.push({
          type: 'group_scatter',
          severity: 'warning',
          participantIds: assignedCompanyParticipants.map((p) => p.id),
          participants: assignedCompanyParticipants,
          details: `Company "${companyKey}" members are scattered across ${tableIds.size} tables`,
        });
      }
    }
  }

  return {
    conflicts,
    hasErrors: conflicts.some((c) => c.severity === 'error'),
    hasWarnings: conflicts.some((c) => c.severity === 'warning'),
  };
}

