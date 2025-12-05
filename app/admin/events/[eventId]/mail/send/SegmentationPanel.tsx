/**
 * Segmentation Panel Component (Phase 4)
 * 
 * Provides filters for targeting participants
 */

'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import SegmentationFilterTag from './SegmentationFilterTag';
import { combineFilters, getParticipantIds } from '@/lib/mail/segmentationFilters';
import type { SegmentationFilters } from '@/lib/mail/segmentationFilters';
import type { Participant } from '@/lib/types/participants';
import { getParticipantsForSegmentation } from '@/actions/mail/getParticipantsForSegmentation';

interface SegmentationPanelProps {
  eventId: string;
  companies: string[];
  filters: SegmentationFilters;
  onFiltersChange: (filters: SegmentationFilters) => void;
  onParticipantIdsChange: (ids: string[]) => void;
}

export default function SegmentationPanel({
  eventId,
  companies,
  filters,
  onFiltersChange,
  onParticipantIdsChange,
}: SegmentationPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(filters.companies || []);

  useEffect(() => {
    loadParticipants();
  }, [eventId]);

  useEffect(() => {
    applyFilters();
  }, [filters, participants]);

  const loadParticipants = async () => {
    try {
      const data = await getParticipantsForSegmentation(eventId);
      setParticipants(data);
    } catch (err) {
      console.error('Error loading participants:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filtered = combineFilters(participants, filters);
    const ids = getParticipantIds(filtered);
    onParticipantIdsChange(ids);
  };

  const updateFilter = <K extends keyof SegmentationFilters>(
    key: K,
    value: SegmentationFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleCompany = (company: string) => {
    const newCompanies = selectedCompanies.includes(company)
      ? selectedCompanies.filter((c) => c !== company)
      : [...selectedCompanies, company];
    setSelectedCompanies(newCompanies);
    updateFilter('companies', newCompanies.length > 0 ? newCompanies : undefined);
  };

  const removeFilter = (key: keyof SegmentationFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
    if (key === 'companies') {
      setSelectedCompanies([]);
    }
  };

  const activeFilters = Object.keys(filters).filter((key) => {
    const value = filters[key as keyof SegmentationFilters];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return true;
    return value !== undefined && value !== false;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Target Participants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-4 border-b">
            {filters.registrationStatus && (
              <SegmentationFilterTag
                label={`Status: ${filters.registrationStatus.join(', ')}`}
                onRemove={() => removeFilter('registrationStatus')}
              />
            )}
            {filters.companies && filters.companies.length > 0 && (
              <SegmentationFilterTag
                label={`Companies: ${filters.companies.length}`}
                onRemove={() => removeFilter('companies')}
              />
            )}
            {filters.vipOnly && (
              <SegmentationFilterTag label="VIP Only" onRemove={() => removeFilter('vipOnly')} />
            )}
            {filters.hasTableAssignment !== undefined && (
              <SegmentationFilterTag
                label={filters.hasTableAssignment ? 'Has Assignment' : 'No Assignment'}
                onRemove={() => removeFilter('hasTableAssignment')}
              />
            )}
            {filters.checkedIn !== undefined && (
              <SegmentationFilterTag
                label={filters.checkedIn ? 'Checked In' : 'Not Checked In'}
                onRemove={() => removeFilter('checkedIn')}
              />
            )}
            {filters.registrationDateRange && (
              <SegmentationFilterTag
                label={`Date: ${filters.registrationDateRange.from} to ${filters.registrationDateRange.to}`}
                onRemove={() => removeFilter('registrationDateRange')}
              />
            )}
          </div>
        )}

        {/* Registration Status */}
        <div>
          <label className="block text-sm font-medium mb-2">Registration Status</label>
          <select
            value={filters.registrationStatus?.join(',') || ''}
            onChange={(e) => {
              const values = e.target.value
                ? (e.target.value.split(',') as ('invited' | 'registered' | 'cancelled' | 'completed')[])
                : undefined;
              updateFilter('registrationStatus', values);
            }}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="invited">Invited</option>
            <option value="registered">Registered</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
            <option value="invited,registered">Invited + Registered</option>
          </select>
        </div>

        {/* Companies */}
        <div>
          <label className="block text-sm font-medium mb-2">Companies</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
            {companies.map((company) => (
              <Button
                key={company}
                variant={selectedCompanies.includes(company) ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => toggleCompany(company)}
              >
                {company}
              </Button>
            ))}
          </div>
        </div>

        {/* VIP Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="vip-only"
            checked={filters.vipOnly || false}
            onChange={(e) => updateFilter('vipOnly', e.target.checked || undefined)}
            className="w-4 h-4"
          />
          <label htmlFor="vip-only" className="text-sm font-medium cursor-pointer">
            VIP Only
          </label>
        </div>

        {/* Table Assignment */}
        <div>
          <label className="block text-sm font-medium mb-2">Table Assignment</label>
          <select
            value={
              filters.hasTableAssignment === undefined
                ? ''
                : filters.hasTableAssignment
                ? 'assigned'
                : 'unassigned'
            }
            onChange={(e) => {
              const value =
                e.target.value === ''
                  ? undefined
                  : e.target.value === 'assigned'
                  ? true
                  : false;
              updateFilter('hasTableAssignment', value);
            }}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="assigned">Has Assignment</option>
            <option value="unassigned">No Assignment</option>
          </select>
        </div>

        {/* Check-in Status */}
        <div>
          <label className="block text-sm font-medium mb-2">Check-in Status</label>
          <select
            value={
              filters.checkedIn === undefined
                ? ''
                : filters.checkedIn
                ? 'checked-in'
                : 'not-checked-in'
            }
            onChange={(e) => {
              const value =
                e.target.value === ''
                  ? undefined
                  : e.target.value === 'checked-in'
                  ? true
                  : false;
              updateFilter('checkedIn', value);
            }}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="checked-in">Checked In</option>
            <option value="not-checked-in">Not Checked In</option>
          </select>
        </div>

        {/* Registration Date Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-2">From Date</label>
            <Input
              type="date"
              value={filters.registrationDateRange?.from || ''}
              onChange={(e) =>
                updateFilter('registrationDateRange', {
                  from: e.target.value,
                  to: filters.registrationDateRange?.to || e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">To Date</label>
            <Input
              type="date"
              value={filters.registrationDateRange?.to || ''}
              onChange={(e) =>
                updateFilter('registrationDateRange', {
                  from: filters.registrationDateRange?.from || e.target.value,
                  to: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Participant Count */}
        {!loading && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {combineFilters(participants, filters).length}
              </span>{' '}
              participants match the filters
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

