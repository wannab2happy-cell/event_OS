/**
 * Table Assignment Type Definitions
 * 
 * Re-exported from lib/tables/assignmentTypes for consistency
 */

export type {
  TableAssignmentAlgorithm,
  ParticipantForAssignment,
  TableForAssignment,
  TableAssignmentOptions,
  AssignmentResultItem,
  TableAssignmentResult,
} from '@/lib/tables/assignmentTypes';

export interface Table {
  id: string;
  event_id: string;
  name: string;
  capacity: number;
  is_vip_table?: boolean | null;
  created_at?: string;
  updated_at?: string;
}

export interface TableAssignment {
  id: string;
  event_id: string;
  participant_id: string;
  table_id: string;
  is_draft: boolean;
  source: string | null;
  batch_id: string | null;
  assigned_by: string | null;
  assigned_at: string | null;
}

