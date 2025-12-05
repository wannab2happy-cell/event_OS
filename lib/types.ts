/**
 * Core Type Definitions
 * 
 * This file maintains backward compatibility by re-exporting types from modular files.
 * New code should import directly from lib/types/{module}.ts
 */

export type UUID = string;

// Re-export from modular type files
export type {
  Participant,
  ParticipantStatus,
  BasicInfo,
  PassportData,
  TravelDataExtended,
  HotelDataExtended,
} from './types/participants';

export type {
  Table,
  TableAssignment,
} from './types/tables';

export type {
  EmailTemplate,
  EmailJob,
  EmailLog,
} from './types/mail';

export interface EventBranding {
  primary_color: string;
  secondary_color: string;
  kv_image_url: string;
  logo_image_url: string;
  accent_color?: string;
  font_family?: string;
}

export interface Event {
  id: UUID;
  title: string;
  code: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'archived';
}

