/**
 * Job List Component (Phase 4)
 * 
 * Enhanced job list with status badges and progress indicators
 */

'use client';

import { useState } from 'react';
import { Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import JobProgressBar from './JobProgressBar';
import WorkerStatusBadge from './WorkerStatusBadge';
import type { EmailJob } from '@/lib/mail/types';
import { getRelativeTime } from '@/lib/utils/date';

interface JobListProps {
  jobs: EmailJob[];
  eventId: string;
}

export default function JobList({ jobs, eventId }: JobListProps) {
  const getStatusIcon = (status: EmailJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'failed':
      case 'failed_manual':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: EmailJob['status']): 'default' | 'success' | 'warning' | 'error' => {
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

  const getStatusLabel = (status: EmailJob['status']): string => {
    switch (status) {
      case 'pending':
        return 'Queued';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Done';
      case 'failed':
        return 'Failed';
      case 'failed_manual':
        return 'Failed (Manual)';
      case 'stopped':
        return 'Stopped';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Email Jobs</h2>
          <p className="text-sm text-muted-foreground mt-1">Monitor email sending jobs</p>
        </div>
        <WorkerStatusBadge />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No jobs yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/admin/events/${eventId}/mail/jobs/${job.id}`}
                  className="block p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <Badge variant={getStatusVariant(job.status)}>
                        {getStatusLabel(job.status)}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getRelativeTime(job.created_at)}
                    </span>
                  </div>
                  <JobProgressBar
                    total={job.total_count}
                    processed={job.processed_count}
                    success={job.success_count}
                    failed={job.fail_count}
                  />
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Total: {job.total_count}</span>
                    <span>Sent: {job.success_count}</span>
                    <span>Failed: {job.fail_count}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

