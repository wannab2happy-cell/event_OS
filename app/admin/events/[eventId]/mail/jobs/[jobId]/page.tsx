/**
 * Job Detail Page (Phase 4)
 * 
 * Shows detailed job statistics, charts, and logs
 */

import { notFound } from 'next/navigation';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import { getEmailJob, getEmailJobLogs } from '@/lib/mail/api';
import JobDetail from '../JobDetail';

type JobDetailPageProps = {
  params: Promise<{ eventId?: string; jobId?: string }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;
  const jobId = resolvedParams?.jobId;

  if (!eventId || !jobId) {
    return notFound();
  }

  // Fetch job
  const jobResult = await getEmailJob(jobId);
  if (jobResult.error || !jobResult.data) {
    return notFound();
  }

  // Fetch logs
  const logsResult = await getEmailJobLogs(jobId, {
    page: 0,
    pageSize: 1000,
  });
  const logs = logsResult.data || [];

  return (
    <AdminPage title={`Job: ${jobResult.data.id.slice(0, 8)}`} subtitle="Job details and statistics">
      <div className="max-w-7xl mx-auto space-y-6">
        <JobDetail job={jobResult.data} logs={logs} />
      </div>
    </AdminPage>
  );
}
