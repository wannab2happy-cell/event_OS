/**
 * Participant Utility Functions
 * 
 * Helper functions for participant status, assignment, and filtering
 */

import type { Participant, ParticipantStatus } from '@/lib/types/participants';

/**
 * Get human-readable status label
 */
export function getParticipantStatusLabel(status: ParticipantStatus): string {
  const labels: Record<ParticipantStatus, string> = {
    invited: '초대됨',
    registered: '등록 중',
    cancelled: '취소됨',
    completed: '등록 완료',
  };
  return labels[status] || status;
}

/**
 * Get assignment status text and conflict flag
 */
export function getAssignmentStatus(participant: Participant): {
  text: string;
  isConflict: boolean;
  isUnassigned: boolean;
} {
  if (participant.assignment_conflict) {
    return {
      text: 'Conflict',
      isConflict: true,
      isUnassigned: false,
    };
  }

  if (!participant.table_id && !participant.table_name) {
    return {
      text: 'Unassigned',
      isConflict: false,
      isUnassigned: true,
    };
  }

  const tableName = participant.table_name || `T${participant.table_id?.slice(-4) || ''}`;
  return {
    text: tableName,
    isConflict: false,
    isUnassigned: false,
  };
}

/**
 * Get check-in label with time
 */
export function getCheckInLabel(participant: Participant): string {
  if (!participant.checked_in) {
    return '—';
  }

  if (participant.checked_in_at) {
    const date = new Date(participant.checked_in_at);
    const time = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    return `Checked in ${time}`;
  }

  return 'Checked in';
}

/**
 * Filter participants by search query
 */
export function filterBySearch(participants: Participant[], query: string): Participant[] {
  if (!query.trim()) return participants;

  const lowerQuery = query.toLowerCase();
  return participants.filter(
    (p) =>
      p.name?.toLowerCase().includes(lowerQuery) ||
      p.email?.toLowerCase().includes(lowerQuery) ||
      p.company?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Filter participants by status
 */
export function filterByStatus(
  participants: Participant[],
  status: ParticipantStatus | 'all'
): Participant[] {
  if (status === 'all') return participants;
  return participants.filter((p) => p.status === status);
}

/**
 * Filter participants by assignment status
 */
export function filterByAssignment(
  participants: Participant[],
  assignment: 'all' | 'unassigned' | 'assigned' | 'conflict' | 'overflow'
): Participant[] {
  if (assignment === 'all') return participants;

  return participants.filter((p) => {
    switch (assignment) {
      case 'unassigned':
        return !p.table_id && !p.table_name;
      case 'assigned':
        return (p.table_id || p.table_name) && !p.assignment_conflict;
      case 'conflict':
        return p.assignment_conflict === true;
      case 'overflow':
        // TODO: Implement overflow detection logic
        return false;
      default:
        return true;
    }
  });
}

/**
 * Filter participants by company
 */
export function filterByCompany(participants: Participant[], company: string): Participant[] {
  if (company === 'all') return participants;
  return participants.filter((p) => p.company === company);
}

/**
 * Filter participants by VIP status
 */
export function filterByVip(participants: Participant[], vipOnly: boolean): Participant[] {
  if (!vipOnly) return participants;
  return participants.filter((p) => p.is_vip === true);
}

/**
 * Sort participants
 */
export type SortOption =
  | 'name_asc'
  | 'name_desc'
  | 'company_asc'
  | 'company_desc'
  | 'newest_registration'
  | 'oldest_registration';

export function sortParticipants(participants: Participant[], sortOption: SortOption): Participant[] {
  const sorted = [...participants];

  switch (sortOption) {
    case 'name_asc':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'name_desc':
      return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    case 'company_asc':
      return sorted.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
    case 'company_desc':
      return sorted.sort((a, b) => (b.company || '').localeCompare(a.company || ''));
    case 'newest_registration':
      return sorted.sort(
        (a, b) =>
          new Date(b.registered_at || b.created_at || 0).getTime() -
          new Date(a.registered_at || a.created_at || 0).getTime()
      );
    case 'oldest_registration':
      return sorted.sort(
        (a, b) =>
          new Date(a.registered_at || a.created_at || 0).getTime() -
          new Date(b.registered_at || b.created_at || 0).getTime()
      );
    default:
      return sorted;
  }
}

/**
 * Apply all filters and sorting
 */
export function filterAndSortParticipants(
  participants: Participant[],
  filters: {
    searchQuery: string;
    statusFilter: ParticipantStatus | 'all';
    assignmentFilter: 'all' | 'unassigned' | 'assigned' | 'conflict' | 'overflow';
    companyFilter: string;
    vipOnly: boolean;
    sortOption: SortOption;
  }
): Participant[] {
  let result = [...participants];

  result = filterBySearch(result, filters.searchQuery);
  result = filterByStatus(result, filters.statusFilter);
  result = filterByAssignment(result, filters.assignmentFilter);
  result = filterByCompany(result, filters.companyFilter);
  result = filterByVip(result, filters.vipOnly);
  result = sortParticipants(result, filters.sortOption);

  return result;
}

