'use client';

import { useState, useMemo } from 'react';
import { ParticipantsActionBar } from './ParticipantsActionBar';
import { ParticipantsTableView } from './ParticipantsTableView';
import { ParticipantsCardView } from './ParticipantsCardView';
import { ParticipantDrawer } from './ParticipantDrawer';
import type { Participant, ParticipantStatus } from '@/lib/types';

interface ParticipantsClientProps {
  initialParticipants: Participant[];
  eventId: string;
}

export function ParticipantsClient({ initialParticipants, eventId }: ParticipantsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ParticipantStatus | 'all'>('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [isVipOnly, setIsVipOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'created_at'>('created_at');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Extract unique companies
  const companies = useMemo(() => {
    const companySet = new Set<string>();
    initialParticipants.forEach((p) => {
      if (p.company) companySet.add(p.company);
    });
    return Array.from(companySet).sort();
  }, [initialParticipants]);

  // Filter and sort participants
  const filteredParticipants = useMemo(() => {
    let filtered = [...initialParticipants];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.email?.toLowerCase().includes(query) ||
          p.company?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Company filter
    if (companyFilter !== 'all') {
      filtered = filtered.filter((p) => p.company === companyFilter);
    }

    // VIP filter
    if (isVipOnly) {
      filtered = filtered.filter((p) => p.is_vip === true);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'company':
          return (a.company || '').localeCompare(b.company || '');
        case 'created_at':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [initialParticipants, searchQuery, statusFilter, companyFilter, isVipOnly, sortBy]);

  return (
    <>
      <ParticipantsActionBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        companyFilter={companyFilter}
        onCompanyFilterChange={setCompanyFilter}
        isVipOnly={isVipOnly}
        onVipToggle={setIsVipOnly}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        companies={companies}
      />

      {viewMode === 'table' ? (
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

