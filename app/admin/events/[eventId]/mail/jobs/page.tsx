/**
 * Email Jobs Page (Phase 4)
 * 
 * Job Monitoring Dashboard with enhanced UI/UX
 */

import { notFound } from 'next/navigation';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import { getEmailJobs } from '@/lib/mail/api';
import JobList from './JobList';

type JobsPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function JobsPage({ params }: JobsPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // Fetch jobs
  const jobsResult = await getEmailJobs(eventId, { page: 0, pageSize: 100 });
  const jobs = jobsResult.data || [];

  return (
    <AdminPage title="Email Jobs" subtitle="Monitor email sending jobs and their progress">
      <div className="max-w-7xl mx-auto space-y-6">
        <JobList jobs={jobs} eventId={eventId} />
      </div>
    </AdminPage>
  );
}

