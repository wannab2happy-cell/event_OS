import { describe, it, expect } from 'vitest';
import { runAlgorithm } from '@/lib/tables/runAlgorithm';
import type {
  TableAssignmentOptions,
  ParticipantForAssignment,
  TableForAssignment,
} from '@/lib/tables/assignmentTypes';

describe('Group By Company Algorithm', () => {
  const baseOptions: TableAssignmentOptions = {
    eventId: 'test-event',
    algorithm: 'group_by_company',
    requestedBy: 'test-user',
  };

  it('should keep company members together in minimum tables', () => {
    const participants: ParticipantForAssignment[] = [
      // Company A: 15 members
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `a${i}`,
        name: `Company A Member ${i}`,
        company: 'Company A',
        isVip: false,
      })),
      // Company B: 10 members
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `b${i}`,
        name: `Company B Member ${i}`,
        company: 'Company B',
        isVip: false,
      })),
      // Company C: 5 members
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `c${i}`,
        name: `Company C Member ${i}`,
        company: 'Company C',
        isVip: false,
      })),
    ];

    const tables: TableForAssignment[] = Array.from({ length: 10 }, (_, i) => ({
      id: `t${i}`,
      name: `Table ${i + 1}`,
      capacity: 10,
      isVipTable: false,
    }));

    const result = runAlgorithm(baseOptions, participants, tables);

    // Company A should use 2 tables (15 members / 10 capacity)
    const companyATables = new Set(
      result.assignments
        .filter((a) => {
          const p = participants.find((p) => p.id === a.participantId);
          return p?.company === 'Company A';
        })
        .map((a) => a.tableId)
    );
    expect(companyATables.size).toBeLessThanOrEqual(2);

    // Company B should use 1 table (10 members / 10 capacity)
    const companyBTables = new Set(
      result.assignments
        .filter((a) => {
          const p = participants.find((p) => p.id === a.participantId);
          return p?.company === 'Company B';
        })
        .map((a) => a.tableId)
    );
    expect(companyBTables.size).toBe(1);

    // Company C should use 1 table (5 members / 10 capacity)
    const companyCTables = new Set(
      result.assignments
        .filter((a) => {
          const p = participants.find((p) => p.id === a.participantId);
          return p?.company === 'Company C';
        })
        .map((a) => a.tableId)
    );
    expect(companyCTables.size).toBe(1);
  });

  it('should respect table capacity limits', () => {
    const participants: ParticipantForAssignment[] = Array.from({ length: 20 }, (_, i) => ({
      id: `p${i}`,
      name: `Participant ${i}`,
      company: `Company ${Math.floor(i / 5)}`,
      isVip: false,
    }));

    const tables: TableForAssignment[] = [
      { id: 't1', name: 'Table 1', capacity: 10, isVipTable: false },
      { id: 't2', name: 'Table 2', capacity: 10, isVipTable: false },
    ];

    const result = runAlgorithm(baseOptions, participants, tables);

    const countsByTable = new Map<string, number>();
    result.assignments.forEach((a) => {
      countsByTable.set(a.tableId, (countsByTable.get(a.tableId) || 0) + 1);
    });

    countsByTable.forEach((count, tableId) => {
      const table = tables.find((t) => t.id === tableId);
      expect(count).toBeLessThanOrEqual(table!.capacity);
    });
  });

  it('should handle participants without company', () => {
    const participants: ParticipantForAssignment[] = [
      { id: 'p1', name: 'P1', company: null, isVip: false },
      { id: 'p2', name: 'P2', company: null, isVip: false },
      { id: 'p3', name: 'P3', company: 'Company A', isVip: false },
    ];

    const tables: TableForAssignment[] = [
      { id: 't1', name: 'Table 1', capacity: 10, isVipTable: false },
    ];

    const result = runAlgorithm(baseOptions, participants, tables);

    // All participants should be assigned
    expect(result.assignments.length).toBe(3);
  });

  it('should handle multiple companies with mixed sizes', () => {
    const participants: ParticipantForAssignment[] = [
      // Company A: 8 members
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `a${i}`,
        name: `A ${i}`,
        company: 'Company A',
        isVip: false,
      })),
      // Company B: 12 members
      ...Array.from({ length: 12 }, (_, i) => ({
        id: `b${i}`,
        name: `B ${i}`,
        company: 'Company B',
        isVip: false,
      })),
      // Company C: 3 members
      ...Array.from({ length: 3 }, (_, i) => ({
        id: `c${i}`,
        name: `C ${i}`,
        company: 'Company C',
        isVip: false,
      })),
    ];

    const tables: TableForAssignment[] = Array.from({ length: 5 }, (_, i) => ({
      id: `t${i}`,
      name: `Table ${i + 1}`,
      capacity: 10,
      isVipTable: false,
    }));

    const result = runAlgorithm(baseOptions, participants, tables);

    // Verify all participants are assigned
    expect(result.assignments.length).toBe(23);

    // Verify capacity is respected
    const countsByTable = new Map<string, number>();
    result.assignments.forEach((a) => {
      countsByTable.set(a.tableId, (countsByTable.get(a.tableId) || 0) + 1);
    });

    countsByTable.forEach((count) => {
      expect(count).toBeLessThanOrEqual(10);
    });
  });
});

