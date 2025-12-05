/**
 * Segmentation Filter Functions
 * 
 * Client-side filtering functions for participant segmentation
 */

import type { Participant } from '@/lib/types/participants';

export interface SegmentationFilters {
  registrationStatus?: ('invited' | 'registered' | 'cancelled' | 'completed')[];
  companies?: string[];
  vipOnly?: boolean;
  hasTableAssignment?: boolean;
  checkedIn?: boolean;
  registrationDateRange?: {
    from: string;
    to: string;
  };
}

/**
 * Filter participants by registration status
 */
export function filterByStatus(
  participants: Participant[],
  statuses: ('invited' | 'registered' | 'cancelled' | 'completed')[]
): Participant[] {
  if (!statuses || statuses.length === 0) return participants;
  return participants.filter((p) => statuses.includes(p.status));
}

/**
 * Filter participants by company
 */
export function filterByCompany(participants: Participant[], companies: string[]): Participant[] {
  if (!companies || companies.length === 0) return participants;
  return participants.filter((p) => p.company && companies.includes(p.company));
}

/**
 * Filter participants by VIP status
 */
export function filterByVip(participants: Participant[], vipOnly: boolean): Participant[] {
  if (!vipOnly) return participants;
  return participants.filter((p) => p.is_vip === true || p.vip === true);
}

/**
 * Filter participants by table assignment
 */
export function filterByAssignment(participants: Participant[], hasAssignment: boolean): Participant[] {
  if (hasAssignment === undefined) return participants;
  return participants.filter((p) => {
    const hasTable = !!(p.table_id || p.table_name);
    return hasAssignment ? hasTable : !hasTable;
  });
}

/**
 * Filter participants by check-in status
 */
export function filterByCheckIn(participants: Participant[], checkedIn: boolean): Participant[] {
  if (checkedIn === undefined) return participants;
  return participants.filter((p) => p.checked_in === checkedIn);
}

/**
 * Filter participants by registration date range
 */
export function filterByDateRange(
  participants: Participant[],
  dateRange: { from: string; to: string }
): Participant[] {
  if (!dateRange || !dateRange.from || !dateRange.to) return participants;
  
  const fromDate = new Date(dateRange.from);
  const toDate = new Date(dateRange.to);
  
  return participants.filter((p) => {
    if (!p.registered_at && !p.created_at) return false;
    const regDate = new Date(p.registered_at || p.created_at || '');
    return regDate >= fromDate && regDate <= toDate;
  });
}

/**
 * Combine all filters
 */
export function combineFilters(
  participants: Participant[],
  filters: SegmentationFilters
): Participant[] {
  let result = [...participants];
  
  if (filters.registrationStatus) {
    result = filterByStatus(result, filters.registrationStatus);
  }
  
  if (filters.companies) {
    result = filterByCompany(result, filters.companies);
  }
  
  if (filters.vipOnly) {
    result = filterByVip(result, filters.vipOnly);
  }
  
  if (filters.hasTableAssignment !== undefined) {
    result = filterByAssignment(result, filters.hasTableAssignment);
  }
  
  if (filters.checkedIn !== undefined) {
    result = filterByCheckIn(result, filters.checkedIn);
  }
  
  if (filters.registrationDateRange) {
    result = filterByDateRange(result, filters.registrationDateRange);
  }
  
  return result;
}

/**
 * Get participant IDs from filtered list
 */
export function getParticipantIds(participants: Participant[]): string[] {
  return participants.map((p) => p.id);
}

