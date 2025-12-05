/**
 * Event List Dashboard Component
 * 
 * Main dashboard for displaying multiple events
 */

'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import EventListFilters, { type EventStatusFilter } from './EventListFilters';
import EventCard, { type EventWithKPIs } from './EventCard';

interface EventListDashboardProps {
  events: EventWithKPIs[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: EventStatusFilter;
  onFilterStatusChange: (status: EventStatusFilter) => void;
}

export default function EventListDashboard({
  events,
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
}: EventListDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all your events from one place
          </p>
        </div>
        <Link href="/admin/events/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <EventListFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        filterStatus={filterStatus}
        onFilterStatusChange={onFilterStatusChange}
      />

      {/* Event Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No events found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

