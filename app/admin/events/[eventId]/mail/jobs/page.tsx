import { notFound } from 'next/navigation';
import Link from 'next/link';
import { History, ArrowLeft } from 'lucide-react';
import { getEmailJobs, getEmailTemplates } from '@/lib/mail/api';
import { JobList } from '../components/JobList';

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

  // Fetch templates for name mapping
  const templatesResult = await getEmailTemplates(eventId, { page: 0, pageSize: 100 });
  const templates = templatesResult.data || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/events/${eventId}/mail`}>
          <button className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6 text-sky-600" />
            Email Jobs
          </h1>
          <p className="text-sm text-gray-500">모든 메일 발송 작업 내역을 확인합니다.</p>
        </div>
      </div>

      {/* Jobs List */}
      <JobList
        jobs={jobs}
        templates={templates.map((t) => ({ id: t.id, name: t.name }))}
        eventId={eventId}
      />
    </div>
  );
}

