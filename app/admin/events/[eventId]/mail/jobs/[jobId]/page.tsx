import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getEmailJob, getEmailLogs, getEmailTemplate } from '@/lib/mail/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { JobStatusBadge } from '../../components/JobStatusBadge';
import { LogsTable } from '../../components/LogsTable';
import { RunJobButton } from './RunJobButton';

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
  const job = jobResult.data;

  // Fetch template name
  const templateResult = await getEmailTemplate(job.template_id);
  const templateName = templateResult.data?.name || 'Unknown Template';

  // Fetch logs
  const logsResult = await getEmailLogs(jobId, { page: 0, pageSize: 1000 });
  const logs = logsResult.data || [];

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/events/${eventId}/mail/jobs`}>
          <button className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-sky-600" />
            Job Detail
          </h1>
          <p className="text-sm text-gray-500">{templateName}</p>
        </div>
        <RunJobButton jobId={jobId} jobStatus={job.status} />
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Job Summary</CardTitle>
            <JobStatusBadge status={job.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                Created
              </div>
              <p className="text-sm font-semibold text-gray-900">{formatDate(job.created_at)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Mail className="w-4 h-4" />
                Total
              </div>
              <p className="text-lg font-semibold text-gray-900">{job.total_count}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-emerald-600 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                Success
              </div>
              <p className="text-lg font-semibold text-emerald-700">{job.success_count}</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-rose-600 mb-1">
                <XCircle className="w-4 h-4" />
                Failed
              </div>
              <p className="text-lg font-semibold text-rose-700">{job.fail_count}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Card */}
      <Card>
        <CardHeader>
          <CardTitle>Email Logs ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <LogsTable logs={logs} />
        </CardContent>
      </Card>
    </div>
  );
}

