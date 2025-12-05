/**
 * Global Mail Jobs Client Component (Phase 6)
 * 
 * Manages filtering and display of global mail jobs
 */

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import GlobalMailJobFilters from './GlobalMailJobFilters';
import type { GlobalMailJob } from '../page';
import { getRelativeTime } from '@/lib/utils/date';

interface GlobalMailJobsClientProps {
  initialJobs: GlobalMailJob[];
}

export default function GlobalMailJobsClient({ initialJobs }: GlobalMailJobsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEvent, setFilterEvent] = useState<string>('all');

  // Get unique events
  const events = useMemo(() => {
    const eventSet = new Set<string>();
    initialJobs.forEach((job) => {
      if (job.event_title) eventSet.add(job.event_title);
    });
    return Array.from(eventSet).sort();
  }, [initialJobs]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...initialJobs];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((job) => job.status === filterStatus);
    }

    if (filterEvent !== 'all') {
      filtered = filtered.filter((job) => job.event_title === filterEvent);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.event_title?.toLowerCase().includes(query) ||
          job.template_name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [initialJobs, filterStatus, filterEvent, searchQuery]);

  const getStatusVariant = (
    status: string
  ): 'default' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
      case 'failed_manual':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <GlobalMailJobFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        filterEvent={filterEvent}
        onFilterEventChange={setFilterEvent}
        events={events}
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Mail Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Bounced</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.event_title || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {job.template_name || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
                    </TableCell>
                    <TableCell>{job.success_count}</TableCell>
                    <TableCell>{job.success_count}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>{job.fail_count}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getRelativeTime(job.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

