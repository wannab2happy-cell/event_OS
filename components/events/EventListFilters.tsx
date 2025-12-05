/**
 * Event List Filters Component
 * 
 * Filter controls for event list
 */

'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export type EventStatusFilter = 'all' | 'planned' | 'ongoing' | 'ended' | 'archived';

interface EventListFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: EventStatusFilter;
  onFilterStatusChange: (status: EventStatusFilter) => void;
}

export default function EventListFilters({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
}: EventListFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search events by name or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="w-full md:w-48">
        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value as EventStatusFilter)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="planned">Planned</option>
          <option value="ongoing">Ongoing</option>
          <option value="ended">Ended</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>
  );
}

