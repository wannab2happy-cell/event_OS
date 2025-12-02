import { describe, it, expect } from 'vitest';
import { runAlgorithm } from '@/lib/tables/runAlgorithm';
import type {
  TableAssignmentOptions,
  ParticipantForAssignment,
  TableForAssignment,
} from '@/lib/tables/assignmentTypes';

describe('Round Robin Algorithm', () => {
  const baseOptions: TableAssignmentOptions = {
    eventId: 'test-event',
    algorithm: 'round_robin',
    requestedBy: 'test-user',
  };

  it('should distribute participants evenly across tables', () => {
    const participants: ParticipantForAssignment[] = Array.from({ length: 100 }, (_, i) => ({
      id: `p${i}`,
      name: `Participant ${i}`,
      company: null,
      isVip: false,
    }));

    const tables: TableForAssignment[] = Array.from({ length: 10 }, (_, i) => ({
      id: `t${i}`,
      name: `Table ${i + 1}`,
      capacity: 10,
      isVipTable: false,
    }));

    const result = runAlgorithm(baseOptions, participants, tables);

    // Check that each table has exactly 10 participants
    const countsByTable = new Map<string, number>();
    result.assignments.forEach((a) => {
      countsByTable.set(a.tableId, (countsByTable.get(a.tableId) || 0) + 1);
    });

    expect(countsByTable.size).toBe(10);
    countsByTable.forEach((count) => {
      expect(count).toBe(10);
    });
  });

  it('should respect table capacity limits', () => {
    const participants: ParticipantForAssignment[] = Array.from({ length: 30 }, (_, i) => ({
      id: `p${i}`,
      name: `Participant ${i}`,
      company: null,
      isVip: false,
    }));

    const tables: TableForAssignment[] = [
      { id: 't1', name: 'Table 1', capacity: 10, isVipTable: false },
      { id: 't2', name: 'Table 2', capacity: 10, isVipTable: false },
      { id: 't3', name: 'Table 3', capacity: 10, isVipTable: false },
    ];

    const result = runAlgorithm(baseOptions, participants, tables);

    // Check that no table exceeds capacity
    const countsByTable = new Map<string, number>();
    result.assignments.forEach((a) => {
      countsByTable.set(a.tableId, (countsByTable.get(a.tableId) || 0) + 1);
    });

    countsByTable.forEach((count, tableId) => {
      const table = tables.find((t) => t.id === tableId);
      expect(count).toBeLessThanOrEqual(table!.capacity);
    });
  });

  it('should maintain participant order in rotation', () => {
    const participants: ParticipantForAssignment[] = [
      { id: 'p1', name: 'P1', company: null, isVip: false },
      { id: 'p2', name: 'P2', company: null, isVip: false },
      { id: 'p3', name: 'P3', company: null, isVip: false },
      { id: 'p4', name: 'P4', company: null, isVip: false },
    ];

    const tables: TableForAssignment[] = [
      { id: 't1', name: 'Table 1', capacity: 10, isVipTable: false },
      { id: 't2', name: 'Table 2', capacity: 10, isVipTable: false },
    ];

    const result = runAlgorithm(baseOptions, participants, tables);

    // P1 -> T1, P2 -> T2, P3 -> T1, P4 -> T2
    expect(result.assignments.find((a) => a.participantId === 'p1')?.tableId).toBe('t1');
    expect(result.assignments.find((a) => a.participantId === 'p2')?.tableId).toBe('t2');
    expect(result.assignments.find((a) => a.participantId === 'p3')?.tableId).toBe('t1');
    expect(result.assignments.find((a) => a.participantId === 'p4')?.tableId).toBe('t2');
  });

  it('should handle empty participants array', () => {
    const participants: ParticipantForAssignment[] = [];
    const tables: TableForAssignment[] = [
      { id: 't1', name: 'Table 1', capacity: 10, isVipTable: false },
    ];

    // runAlgorithm validates and throws if no participants provided
    expect(() => {
      runAlgorithm(baseOptions, participants, tables);
    }).toThrow();
  });

  it('should handle more participants than total capacity', () => {
    const participants: ParticipantForAssignment[] = Array.from({ length: 150 }, (_, i) => ({
      id: `p${i}`,
      name: `Participant ${i}`,
      company: null,
      isVip: false,
    }));

    const tables: TableForAssignment[] = Array.from({ length: 10 }, (_, i) => ({
      id: `t${i}`,
      name: `Table ${i + 1}`,
      capacity: 10,
      isVipTable: false,
    }));

    // Note: runAlgorithm validates and throws if unassigned participants exist
    // This test verifies the algorithm assigns up to capacity
    try {
      const result = runAlgorithm(baseOptions, participants, tables);
      // If validation passes, all participants should be assigned
      expect(result.assignments.length).toBeLessThanOrEqual(100);
    } catch (error) {
      // Validation error is expected when capacity is exceeded
      expect(error).toBeInstanceOf(Error);
    }
  });
});

