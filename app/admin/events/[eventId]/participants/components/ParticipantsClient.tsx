/**
 * Participants Client Component
 * 
 * Phase 3: Refined Participants module with unified filter/sort state management
 * 
 * Manages:
 * - Single source of truth for all filters and sort options
 * - Filtering and sorting logic via utility functions
 * - View mode (table/cards) and drawer state
 */

'use client';

import { useState, useMemo } from 'react';
import { ParticipantsActionBar, type ParticipantFilters } from './ParticipantsActionBar';
import { ParticipantsTableView } from './ParticipantsTableView';
import { ParticipantsCardView } from './ParticipantsCardView';
import { ParticipantDrawer } from './ParticipantDrawer';
import type { Participant } from '@/lib/types/participants';
import { filterAndSortParticipants } from '@/lib/utils/participants';

interface ParticipantsClientProps {
  initialParticipants: Participant[];
  eventId: string;
}

const defaultFilters: ParticipantFilters = {
  searchQuery: '',
  statusFilter: 'all',
  assignmentFilter: 'all',
  companyFilter: 'all',
  vipOnly: false,
  sortOption: 'newest_registration',
  viewMode: 'table',
};

export function ParticipantsClient({ initialParticipants, eventId }: ParticipantsClientProps) {
  const [filters, setFilters] = useState<ParticipantFilters>(defaultFilters);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Extract unique companies
  const companies = useMemo(() => {
    const companySet = new Set<string>();
    initialParticipants.forEach((p) => {
      if (p.company) companySet.add(p.company);
    });
    return Array.from(companySet).sort();
  }, [initialParticipants]);

  // Apply filters and sorting
  const filteredParticipants = useMemo(() => {
    return filterAndSortParticipants(initialParticipants, {
      searchQuery: filters.searchQuery,
      statusFilter: filters.statusFilter,
      assignmentFilter: filters.assignmentFilter,
      companyFilter: filters.companyFilter,
      vipOnly: filters.vipOnly,
      sortOption: filters.sortOption,
    });
  }, [initialParticipants, filters]);

  return (
    <>
      <ParticipantsActionBar filters={filters} onFiltersChange={setFilters} companies={companies} />

      {filters.viewMode === 'table' ? (
        <ParticipantsTableView
          participants={filteredParticipants}
          eventId={eventId}
          onParticipantClick={setSelectedParticipant}
        />
      ) : (
        <ParticipantsCardView
          participants={filteredParticipants}
          eventId={eventId}
          onParticipantClick={setSelectedParticipant}
        />
      )}

      <ParticipantDrawer
        participant={selectedParticipant}
        eventId={eventId}
        onClose={() => setSelectedParticipant(null)}
      />
    </>
  );
}
