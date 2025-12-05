/**
 * Events Client Component (Phase 6)
 * 
 * Manages event list filtering and state
 */

'use client';

import { useState, useMemo } from 'react';
import EventListDashboard from '@/components/events/EventListDashboard';
import type { EventStatusFilter } from '@/components/events/EventListFilters';
import type { EventWithKPIs } from '@/components/events/EventCard';

interface EventsClientProps {
  initialEvents: EventWithKPIs[];
}

export default function EventsClient({ initialEvents }: EventsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<EventStatusFilter>('all');

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = [...initialEvents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query) ||
          event.code.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((event) => {
        switch (filterStatus) {
          case 'planned':
            return event.status === 'planning';
          case 'ongoing':
            return event.status === 'active';
          case 'ended':
            // TODO: Check if event has ended based on end_date
            return false;
          case 'archived':
            return event.status === 'archived';
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [initialEvents, searchQuery, filterStatus]);

  return (
    <EventListDashboard
      events={filteredEvents}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      filterStatus={filterStatus}
      onFilterStatusChange={setFilterStatus}
    />
  );
}

