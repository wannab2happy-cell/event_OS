import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getEmailJobDetails } from '@/lib/mail/api';
import { getEmailJobLogs } from '@/lib/mail/api';
import { JobSummary } from '@/components/mail/job/JobSummary';
import { JobProgress } from '@/components/mail/job/JobProgress';
import { JobSegmentationCard } from '@/components/mail/job/JobSegmentationCard';
import { JobControlBar } from '@/components/mail/job/JobControlBar';
import { JobLogTable } from '@/components/mail/job/JobLogTable';

type JobDetailPageProps = {
  params: Promise<{ eventId?: string; jobId?: string }>;
  searchParams: Promise<{ page?: string; filter?: string; search?: string }>;
};

export default async function JobDetailPage({ params, searchParams }: JobDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const eventId = resolvedParams?.eventId;
  const jobId = resolvedParams?.jobId;

  if (!eventId || !jobId) {
    return notFound();
  }

  // Get job details
  const jobResult = await getEmailJobDetails(jobId);
  if (jobResult.error || !jobResult.data) {
    return notFound();
  }

  const job = jobResult.data;

  // Verify job belongs to event
  if (job.event_id !== eventId) {
    return notFound();
  }

  // Get logs
  const page = parseInt(resolvedSearchParams.page || '0', 10);
  const filter = (resolvedSearchParams.filter as 'all' | 'success' | 'failed') || 'all';
  const search = resolvedSearchParams.search || '';

  const logsResult = await getEmailJobLogs(jobId, {
    filter,
    page,
    pageSize: 20,
    search: search || undefined,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/events/${eventId}/mail`}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Job Detail</h1>
      </div>

      {/* Job Summary */}
      <JobSummary job={job} />

      {/* Progress and Segmentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <JobProgress job={job} />
        <JobSegmentationCard segmentation={job.segmentation as any} />
      </div>

      {/* Control Bar */}
      <JobControlBar job={job} eventId={eventId} />

      {/* Logs Table */}
      <JobLogTable
        jobId={jobId}
        initialLogs={logsResult.data}
        initialTotal={logsResult.total}
        initialPage={page}
        initialPageSize={20}
      />
    </div>
  );
}
