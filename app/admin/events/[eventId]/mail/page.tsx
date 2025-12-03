import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight } from 'lucide-react';
import { getEmailTemplates, getEmailJobs } from '@/lib/mail/api';
import { SendPanel } from './components/SendPanel';
import { JobList } from './components/JobList';
import { MailCenterClient } from './components/MailCenterClient';

type MailCenterPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function MailCenterPage({ params }: MailCenterPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // Fetch templates
  const templatesResult = await getEmailTemplates(eventId, { page: 0, pageSize: 50 });
  const templates = templatesResult.data || [];

  // Fetch recent jobs
  const jobsResult = await getEmailJobs(eventId, { page: 0, pageSize: 5 });
  const recentJobs = jobsResult.data || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Mail className="w-6 h-6 text-sky-600" />
          Mail Center
        </h1>
        <p className="text-sm text-gray-500">이벤트 참가자에게 메일을 발송하고 템플릿을 관리합니다.</p>
      </div>

      {/* Templates Section */}
      <MailCenterClient templates={templates} eventId={eventId} />

      {/* Send Panel */}
      {templates.length > 0 && <SendPanel templates={templates} eventId={eventId} />}

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <div>
          <JobList
            jobs={recentJobs}
            templates={templates.map((t) => ({ id: t.id, name: t.name }))}
            eventId={eventId}
          />
        </div>
      )}
    </div>
  );
}

