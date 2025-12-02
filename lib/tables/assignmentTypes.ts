export type TableAssignmentAlgorithm = 'round_robin' | 'vip_spread' | 'group_by_company';

export interface TableAssignmentOptions {
  eventId: string;
  algorithm: TableAssignmentAlgorithm;
  requestedBy?: string;
}

export interface ParticipantForAssignment {
  id: string;
  name: string;
  company?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  isVip?: boolean;
}

export interface TableForAssignment {
  id: string;
  name: string;
  capacity: number;
  isVipTable?: boolean;
}

export interface TableAssignment {
  participantId: string;
  tableId: string;
  tableName: string;
  isVip: boolean;
}

export interface TableAssignmentSummary {
  totalParticipants: number;
  totalTables: number;
  unassignedCount: number;
  byTable: {
    tableId: string;
    tableName: string;
    assignedCount: number;
    capacity: number;
  }[];
}

export interface TableAssignmentResult {
  eventId: string;
  algorithm: TableAssignmentAlgorithm;
  batchId: string;
  assignments: TableAssignment[];
  summary: TableAssignmentSummary;
}

