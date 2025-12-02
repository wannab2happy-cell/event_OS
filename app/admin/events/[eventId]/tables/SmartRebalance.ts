import { TableAssignment, TableForAssignment } from '@/lib/tables/assignmentTypes';
import { MinHeap, MaxHeap } from '@/lib/tables/priorityQueue';

interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  company?: string | null;
  companyName?: string | null;
  companyId?: string | null;
}

interface TableLoad {
  tableId: string;
  count: number;
  capacity: number;
  table: TableForAssignment;
}

export interface RebalanceResult {
  assignments: TableAssignment[];
  changes: string[];
}

export function rebalanceAssignments(
  assignments: TableAssignment[],
  tables: TableForAssignment[],
  participants: Participant[],
  maxIterations: number = 10
): RebalanceResult {
  const changes: string[] = [];
  let newAssignments = [...assignments];

  // Build participant lookup map
  const participantMap = new Map<string, Participant>();
  for (const p of participants) {
    participantMap.set(p.id, p);
  }

  // Build table lookup map
  const tableMap = new Map<string, TableForAssignment>();
  for (const t of tables) {
    tableMap.set(t.id, t);
  }

  // Build assignment lookup by table
  const assignmentsByTable = new Map<string, TableAssignment[]>();
  for (const a of newAssignments) {
    if (!assignmentsByTable.has(a.tableId)) {
      assignmentsByTable.set(a.tableId, []);
    }
    assignmentsByTable.get(a.tableId)!.push(a);
  }

  const maxIterationCount = Math.min(maxIterations, tables.length * 2);

  for (let iteration = 0; iteration < maxIterationCount; iteration++) {
    // 각 테이블의 현재 인원 수 계산 (single pass)
    const tableCounts = new Map<string, number>();
    for (const a of newAssignments) {
      tableCounts.set(a.tableId, (tableCounts.get(a.tableId) || 0) + 1);
    }

    // Build priority queues for max and min load tables
    const maxLoadHeap = new MaxHeap<TableLoad>();
    const minLoadHeap = new MinHeap<TableLoad>();

    for (const table of tables) {
      const count = tableCounts.get(table.id) || 0;
      const remaining = table.capacity - count;

      const tableLoad: TableLoad = {
        tableId: table.id,
        count,
        capacity: table.capacity,
        table,
      };

      // Only add to max heap if table has participants
      if (count > 0) {
        maxLoadHeap.push({
          key: count,
          value: tableLoad,
        });
      }

      // Only add to min heap if table has remaining capacity
      if (remaining > 0) {
        minLoadHeap.push({
          key: count,
          value: tableLoad,
        });
      }
    }

    // Get max and min loaded tables
    const maxItem = maxLoadHeap.pop();
    const minItem = minLoadHeap.pop();

    if (!maxItem || !minItem) break;

    const maxTable = maxItem.value;
    const minTable = minItem.value;

    // 균형이 맞으면 종료
    if (maxTable.count - minTable.count <= 1) {
      break;
    }

    // 최다 인원 테이블에서 최저 인원 테이블로 이동할 참가자 찾기
    const candidates = assignmentsByTable.get(maxTable.tableId) || [];

    if (candidates.length === 0) break;

    // VIP가 아닌 참가자 우선, 같은 회사 그룹 유지 고려
    const candidate = candidates.find((a) => !a.isVip) || candidates[0];

    if (candidate) {
      const participant = participantMap.get(candidate.participantId);
      const fromTable = maxTable.table;
      const toTable = minTable.table;

      // 이동
      newAssignments = newAssignments.filter(
        (a) => a.participantId !== candidate.participantId
      );

      newAssignments.push({
        participantId: candidate.participantId,
        tableId: toTable.id,
        tableName: toTable.name,
        isVip: candidate.isVip,
      });

      // Update assignmentsByTable
      const fromAssignments = assignmentsByTable.get(fromTable.id) || [];
      assignmentsByTable.set(
        fromTable.id,
        fromAssignments.filter((a) => a.participantId !== candidate.participantId)
      );

      if (!assignmentsByTable.has(toTable.id)) {
        assignmentsByTable.set(toTable.id, []);
      }
      assignmentsByTable.get(toTable.id)!.push({
        participantId: candidate.participantId,
        tableId: toTable.id,
        tableName: toTable.name,
        isVip: candidate.isVip,
      });

      changes.push(
        `Rebalanced: Moved "${participant?.name || candidate.participantId}" from "${fromTable.name}" to "${toTable.name}"`
      );
    }
  }

  return {
    assignments: newAssignments,
    changes,
  };
}

