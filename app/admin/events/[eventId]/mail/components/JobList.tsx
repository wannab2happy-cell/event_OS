'use client';

import Link from 'next/link';
import { History, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { JobStatusBadge } from './JobStatusBadge';
import type { EmailJob } from '@/lib/mail/types';

interface JobListProps {
  jobs: EmailJob[];
  templates: Array<{ id: string; name: string }>;
  eventId: string;
}

export function JobList({ jobs, templates, eventId }: JobListProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getTemplateName = (templateId: string) => {
    return templates.find((t) => t.id === templateId)?.name || 'Unknown Template';
  };

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            Email Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">발송 작업이 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-sky-600" />
          Email Jobs
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">이벤트의 모든 메일 발송 작업 내역입니다.</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Success</TableHead>
              <TableHead>Failed</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{getTemplateName(job.template_id)}</TableCell>
                <TableCell>
                  <JobStatusBadge status={job.status} />
                </TableCell>
                <TableCell className="text-sm text-gray-500">{formatDate(job.created_at)}</TableCell>
                <TableCell>{job.total_count}</TableCell>
                <TableCell className="text-emerald-600">{job.success_count}</TableCell>
                <TableCell className="text-rose-600">{job.fail_count}</TableCell>
                <TableCell>
                  <Link href={`/admin/events/${eventId}/mail/jobs/${job.id}`}>
                    <button className="text-sky-600 hover:text-sky-700 text-sm font-medium flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

