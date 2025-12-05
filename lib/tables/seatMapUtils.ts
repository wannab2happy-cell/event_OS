/**
 * Seat Map Utility Functions
 * 
 * Helper functions for building seat map data structures
 */

import type { TableForAssignment, TableAssignment } from './assignmentTypes';

export interface Participant {
  id: string;
  name: string;
  isVip?: boolean;
  company?: string | null;
}

export interface Seat {
  seatNumber: number;
  participant: Participant | null;
  conflict: boolean;
  vip: boolean;
}

export interface TableSummary {
  id: string;
  name: string;
  capacity: number;
  assignedCount: number;
  seats: Seat[];
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Build seat array for a table
 */
export function buildSeatArrayForTable(
  table: TableForAssignment,
  assignments: TableAssignment[],
  participantsMap: Map<string, Participant>
): Seat[] {
  const seats: Seat[] = [];
  const tableAssignments = assignments.filter((a) => a.tableId === table.id);

  // Create a map of seat number to assignment
  const seatAssignmentMap = new Map<number, TableAssignment>();
  tableAssignments.forEach((assignment) => {
    // If seat_number is available in assignment, use it; otherwise assign sequentially
    // For now, we'll assign sequentially based on order
    const participant = participantsMap.get(assignment.participantId);
    if (participant) {
      const seatNumber = seatAssignmentMap.size + 1;
      seatAssignmentMap.set(seatNumber, assignment);
    }
  });

  // Build seats array
  for (let i = 1; i <= table.capacity; i++) {
    const assignment = seatAssignmentMap.get(i);
    const participant = assignment ? participantsMap.get(assignment.participantId) : null;

    seats.push({
      seatNumber: i,
      participant: participant || null,
      conflict: false, // TODO: Implement conflict detection
      vip: participant?.isVip || false,
    });
  }

  return seats;
}

/**
 * Build seat map for all tables
 */
export function buildSeatMap(
  tables: TableForAssignment[],
  assignments: TableAssignment[],
  participants: Participant[]
): Map<string, TableSummary> {
  const participantsMap = new Map<string, Participant>();
  participants.forEach((p) => {
    participantsMap.set(p.id, p);
  });

  const seatMap = new Map<string, TableSummary>();

  tables.forEach((table) => {
    const seats = buildSeatArrayForTable(table, assignments, participantsMap);
    const assignedCount = seats.filter((s) => s.participant !== null).length;

    seatMap.set(table.id, {
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      assignedCount,
      seats,
    });
  });

  return seatMap;
}

