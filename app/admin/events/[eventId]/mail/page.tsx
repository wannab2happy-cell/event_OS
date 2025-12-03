import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Zap, BarChart3, RefreshCw, TestTube, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import { getEmailTemplates, getEmailJobs, getRecentEmailLogs, getAutomationsForEvent } from '@/lib/mail/api';
import { getFollowUpsForEvent } from '@/lib/mail/followup';
import { getABTestsForEvent } from '@/lib/mail/abtest';
import { TemplateList } from '@/components/mail/TemplateList';
import { JobList } from '@/components/mail/JobList';
import { LogList } from '@/components/mail/LogList';

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
  const jobsResult = await getEmailJobs(eventId, { page: 0, pageSize: 10 });
  const recentJobs = jobsResult.data || [];

  // Fetch recent logs
  const logsResult = await getRecentEmailLogs(eventId, 20);
  const recentLogs = logsResult.data || [];

  // Fetch active automations count
  const automationsResult = await getAutomationsForEvent(eventId);
  const activeAutomationsCount = (automationsResult.data || []).filter((a) => a.is_active).length;

  // Fetch active follow-ups count
  const followups = await getFollowUpsForEvent(eventId);
  const activeFollowupsCount = followups.filter((f) => f.is_active).length;

  // Fetch running AB tests count
  const abTests = await getABTestsForEvent(eventId);
  const runningABTestsCount = abTests.filter((t) => t.status === 'running').length;

  return (
    <AdminPage
      title="Email Center"
      subtitle="이벤트 참가자에게 메일을 발송하고 템플릿을 관리합니다"
      actions={
        <>
          <Link href={`/admin/events/${eventId}/mail/analytics`}>
            <Button variant="ghost">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Link href={`/admin/events/${eventId}/mail/ab-tests`}>
            <Button variant="ghost">
              <TestTube className="w-4 h-4 mr-2" />
              A/B Tests
              {runningABTestsCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  {runningABTestsCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href={`/admin/events/${eventId}/mail/followups`}>
            <Button variant="ghost">
              <RefreshCw className="w-4 h-4 mr-2" />
              Follow-Ups
              {activeFollowupsCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {activeFollowupsCount}
                </span>
              )}
            </Button>
          </Link>
          <Link href={`/admin/events/${eventId}/mail/automations`}>
            <Button variant="secondary">
              <Zap className="w-4 h-4 mr-2" />
              Manage Automations
              {activeAutomationsCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  {activeAutomationsCount}
                </span>
              )}
            </Button>
          </Link>
        </>
      }
    >
      {/* Main Layout: Two Column */}
      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Left Panel: Templates */}
        <TemplateList templates={templates} eventId={eventId} />

        {/* Right Panel: Jobs & Logs */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Job Queue */}
          <JobList
            jobs={recentJobs}
            templates={templates.map((t) => ({ id: t.id, name: t.name }))}
            eventId={eventId}
          />

          {/* Recent Logs */}
          <LogList logs={recentLogs} />
        </div>
      </div>
    </AdminPage>
  );
}

