import { describe, it, expect } from 'vitest';
import { runAlgorithm } from '@/lib/tables/runAlgorithm';
import type {
  TableAssignmentOptions,
  ParticipantForAssignment,
  TableForAssignment,
} from '@/lib/tables/assignmentTypes';

describe('VIP Spread Algorithm', () => {
  const baseOptions: TableAssignmentOptions = {
    eventId: 'test-event',
    algorithm: 'vip_spread',
    requestedBy: 'test-user',
  };

  it('should distribute VIPs evenly across tables', () => {
    const participants: ParticipantForAssignment[] = [
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `vip${i}`,
        name: `VIP ${i}`,
        company: null,
        isVip: true,
      })),
      ...Array.from({ length: 80 }, (_, i) => ({
        id: `regular${i}`,
        name: `Regular ${i}`,
        company: null,
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

    // Count VIPs per table
    const vipCountsByTable = new Map<string, number>();
    result.assignments.forEach((a) => {
      if (a.isVip) {
        vipCountsByTable.set(a.tableId, (vipCountsByTable.get(a.tableId) || 0) + 1);
      }
    });

    // Each table should have 2 VIPs (20 VIPs / 10 tables)
    vipCountsByTable.forEach((count) => {
      expect(count).toBe(2);
    });
  });

  it('should respect table capacity limits', () => {
    const participants: ParticipantForAssignment[] = [
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `vip${i}`,
        name: `VIP ${i}`,
        company: null,
        isVip: true,
      })),
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `regular${i}`,
        name: `Regular ${i}`,
        company: null,
        isVip: false,
      })),
    ];

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

  it('should handle VIP-only tables', () => {
    const participants: ParticipantForAssignment[] = [
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `vip${i}`,
        name: `VIP ${i}`,
        company: null,
        isVip: true,
      })),
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `regular${i}`,
        name: `Regular ${i}`,
        company: null,
        isVip: false,
      })),
    ];

    const tables: TableForAssignment[] = [
      { id: 't1', name: 'VIP Table', capacity: 10, isVipTable: true },
      { id: 't2', name: 'Regular Table', capacity: 20, isVipTable: false },
    ];

    const result = runAlgorithm(baseOptions, participants, tables);

    // All VIPs should be in VIP table
    const vipTableAssignments = result.assignments.filter(
      (a) => a.isVip && a.tableId === 't1'
    );
    expect(vipTableAssignments.length).toBe(10);

    // Regular participants should be in regular table
    const regularTableAssignments = result.assignments.filter(
      (a) => !a.isVip && a.tableId === 't2'
    );
    expect(regularTableAssignments.length).toBe(20);
  });

  it('should distribute non-VIP participants evenly', () => {
    const participants: ParticipantForAssignment[] = [
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `vip${i}`,
        name: `VIP ${i}`,
        company: null,
        isVip: true,
      })),
      ...Array.from({ length: 40 }, (_, i) => ({
        id: `regular${i}`,
        name: `Regular ${i}`,
        company: null,
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

    // Count regular participants per table
    const regularCountsByTable = new Map<string, number>();
    result.assignments.forEach((a) => {
      if (!a.isVip) {
        regularCountsByTable.set(a.tableId, (regularCountsByTable.get(a.tableId) || 0) + 1);
      }
    });

    // Each table should have approximately 8 regular participants (40 / 5)
    regularCountsByTable.forEach((count) => {
      expect(count).toBeGreaterThanOrEqual(7);
      expect(count).toBeLessThanOrEqual(9);
    });
  });
});

