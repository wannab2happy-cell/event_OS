import { TableAssignment, TableForAssignment } from '@/lib/tables/assignmentTypes';
import { Conflict } from './ConflictInspector';

interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  company?: string | null;
  companyName?: string | null;
  companyId?: string | null;
}

export interface FixResult {
  assignments: TableAssignment[];
  changes: string[];
}

export function fixConflict(
  conflict: Conflict,
  assignments: TableAssignment[],
  tables: TableForAssignment[],
  participants: Participant[]
): FixResult {
  const changes: string[] = [];
  let newAssignments = [...assignments];

  switch (conflict.type) {
    case 'capacity_overflow': {
      if (!conflict.tableId) break;

      const overflowTable = tables.find((t) => t.id === conflict.tableId);
      if (!overflowTable) break;

      const overflowCount = (conflict.count || 0) - (conflict.capacity || 0);
      const overflowParticipants = newAssignments
        .filter((a) => a.tableId === conflict.tableId)
        .slice(conflict.capacity || 0);

      // 빈자리 있는 테이블 찾기
      const tableCounts = new Map<string, number>();
      for (const a of newAssignments) {
        tableCounts.set(a.tableId, (tableCounts.get(a.tableId) || 0) + 1);
      }

      for (const participant of overflowParticipants) {
        // VIP는 VIP 테이블 우선, 일반은 일반 테이블 우선
        const availableTables = tables
          .filter((t) => {
            const count = tableCounts.get(t.id) || 0;
            return count < t.capacity;
          })
          .sort((a, b) => {
            const aCount = tableCounts.get(a.id) || 0;
            const bCount = tableCounts.get(b.id) || 0;
            const aRemaining = a.capacity - aCount;
            const bRemaining = b.capacity - bCount;

            // VIP인 경우 VIP 테이블 우선
            if (participant.isVip) {
              if (a.isVipTable && !b.isVipTable) return -1;
              if (!a.isVipTable && b.isVipTable) return 1;
            }

            return bRemaining - aRemaining;
          });

        if (availableTables.length > 0) {
          const targetTable = availableTables[0];
          const p = participants.find((p) => p.id === participant.participantId);

          // 기존 배정 제거
          newAssignments = newAssignments.filter(
            (a) => a.participantId !== participant.participantId
          );

          // 새 배정 추가
          newAssignments.push({
            participantId: participant.participantId,
            tableId: targetTable.id,
            tableName: targetTable.name,
            isVip: participant.isVip,
          });

          tableCounts.set(targetTable.id, (tableCounts.get(targetTable.id) || 0) + 1);
          changes.push(`Moved "${p?.name || participant.participantId}" from "${overflowTable.name}" to "${targetTable.name}"`);
        }
      }
      break;
    }

    case 'unassigned': {
      if (!conflict.participants) break;

      const tableCounts = new Map<string, number>();
      for (const a of newAssignments) {
        tableCounts.set(a.tableId, (tableCounts.get(a.tableId) || 0) + 1);
      }

      for (const participant of conflict.participants) {
        const availableTables = tables
          .filter((t) => {
            const count = tableCounts.get(t.id) || 0;
            return count < t.capacity;
          })
          .sort((a, b) => {
            const aCount = tableCounts.get(a.id) || 0;
            const bCount = tableCounts.get(b.id) || 0;
            const aRemaining = a.capacity - aCount;
            const bRemaining = b.capacity - bCount;

            // VIP는 VIP 테이블 우선
            if (participant.isVip) {
              if (a.isVipTable && !b.isVipTable) return -1;
              if (!a.isVipTable && b.isVipTable) return 1;
            }

            return bRemaining - aRemaining;
          });

        if (availableTables.length > 0) {
          const targetTable = availableTables[0];
          newAssignments.push({
            participantId: participant.id,
            tableId: targetTable.id,
            tableName: targetTable.name,
            isVip: participant.isVip || false,
          });

          tableCounts.set(targetTable.id, (tableCounts.get(targetTable.id) || 0) + 1);
          changes.push(`Assigned "${participant.name}" to "${targetTable.name}"`);
        }
      }
      break;
    }

    case 'duplicate_assignment': {
      if (!conflict.participantIds || conflict.participantIds.length === 0) break;

      for (const participantId of conflict.participantIds) {
        // 첫 번째 배정만 유지, 나머지 제거
        const assignmentsForParticipant = newAssignments.filter(
          (a) => a.participantId === participantId
        );
        if (assignmentsForParticipant.length > 1) {
          const keepAssignment = assignmentsForParticipant[0];
          newAssignments = newAssignments.filter(
            (a) => !(a.participantId === participantId && a.tableId !== keepAssignment.tableId)
          );
          const p = participants.find((p) => p.id === participantId);
          changes.push(`Removed duplicate assignment for "${p?.name || participantId}"`);
        }
      }
      break;
    }

    case 'vip_imbalance': {
      if (!conflict.tableId) break;

      // VIP 편중 테이블에서 VIP를 다른 테이블로 재분산
      const vipTable = tables.find((t) => t.id === conflict.tableId);
      if (!vipTable) break;

      const allVipParticipants = newAssignments.filter(
        (a) => a.tableId === conflict.tableId && a.isVip
      );
      const vipParticipants = allVipParticipants.slice(0, Math.floor(allVipParticipants.length / 2)); // 절반만 이동

      const tableCounts = new Map<string, number>();
      for (const a of newAssignments) {
        tableCounts.set(a.tableId, (tableCounts.get(a.tableId) || 0) + 1);
      }

      for (const vip of vipParticipants) {
        const availableTables = tables
          .filter((t) => {
            const count = tableCounts.get(t.id) || 0;
            return t.id !== conflict.tableId && count < t.capacity && (t.isVipTable || true);
          })
          .sort((a, b) => {
            const aCount = tableCounts.get(a.id) || 0;
            const bCount = tableCounts.get(b.id) || 0;
            return aCount - bCount; // VIP가 적은 테이블 우선
          });

        if (availableTables.length > 0) {
          const targetTable = availableTables[0];
          const p = participants.find((p) => p.id === vip.participantId);

          newAssignments = newAssignments.filter(
            (a) => a.participantId !== vip.participantId
          );

          newAssignments.push({
            participantId: vip.participantId,
            tableId: targetTable.id,
            tableName: targetTable.name,
            isVip: true,
          });

          tableCounts.set(targetTable.id, (tableCounts.get(targetTable.id) || 0) + 1);
          changes.push(`Moved VIP "${p?.name || vip.participantId}" from "${vipTable.name}" to "${targetTable.name}"`);
        }
      }
      break;
    }

    case 'group_scatter': {
      if (!conflict.participants || conflict.participants.length === 0) break;

      // 같은 회사 사람들을 가능한 한 같은 테이블로 모으기
      const companyKey =
        conflict.participants[0]?.companyId ||
        conflict.participants[0]?.companyName ||
        conflict.participants[0]?.company ||
        'unknown';

      const companyParticipantIds = conflict.participants.map((p) => p.id);
      const companyAssignments = newAssignments.filter((a) =>
        companyParticipantIds.includes(a.participantId)
      );

      // 가장 많은 회사 인원이 있는 테이블 찾기
      const tableCounts = new Map<string, number>();
      for (const a of companyAssignments) {
        tableCounts.set(a.tableId, (tableCounts.get(a.tableId) || 0) + 1);
      }

      let targetTableId: string | null = null;
      let maxCount = 0;
      for (const [tableId, count] of tableCounts.entries()) {
        const table = tables.find((t) => t.id === tableId);
        if (table && count > maxCount) {
          const currentTotal = newAssignments.filter((a) => a.tableId === tableId).length;
          if (currentTotal < table.capacity) {
            targetTableId = tableId;
            maxCount = count;
          }
        }
      }

      if (targetTableId) {
        const targetTable = tables.find((t) => t.id === targetTableId);
        if (targetTable) {
          // 다른 테이블에 있는 회사 인원들을 타겟 테이블로 이동
          for (const assignment of companyAssignments) {
            if (assignment.tableId !== targetTableId) {
              const currentTotal = newAssignments.filter((a) => a.tableId === targetTableId).length;
              if (currentTotal < targetTable.capacity) {
                const p = participants.find((p) => p.id === assignment.participantId);

                newAssignments = newAssignments.filter(
                  (a) => a.participantId !== assignment.participantId
                );

                newAssignments.push({
                  participantId: assignment.participantId,
                  tableId: targetTableId,
                  tableName: targetTable.name,
                  isVip: assignment.isVip,
                });

                changes.push(`Moved "${p?.name || assignment.participantId}" to "${targetTable.name}" for company grouping`);
              }
            }
          }
        }
      }
      break;
    }
  }

  return {
    assignments: newAssignments,
    changes,
  };
}

