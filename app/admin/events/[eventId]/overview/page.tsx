import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getEmailJobs } from '@/lib/mail/api';
import { getAutomationsForEvent } from '@/lib/mail/api';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import { MetricCard } from '@/components/ui/metric-card';
import { SectionCard } from '@/components/ui/section-card';
import { Users, CheckCircle, Mail, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

type OverviewPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function OverviewPage({ params }: OverviewPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const supabase = await createClient();

  // Load event
  const { data: event } = await supabase
    .from('events')
    .select('id, title, code')
    .eq('id', eventId)
    .single();

  if (!event) {
    return notFound();
  }

  // Load participants stats
  const { count: totalParticipants } = await supabase
    .from('event_participants')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  const { count: checkedInParticipants } = await supabase
    .from('event_participants')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'checked_in');

  // Load email stats
  const emailJobsResult = await getEmailJobs(eventId, { page: 0, pageSize: 100 });
  const totalEmailsSent = emailJobsResult.data?.reduce(
    (sum, job) => sum + (job.success_count || 0) + (job.fail_count || 0),
    0
  ) || 0;

  // Load automations
  const automationsResult = await getAutomationsForEvent(eventId);
  const activeAutomations = (automationsResult.data || []).filter((a) => a.is_active).length;

  return (
    <AdminPage
      title={event.title}
      subtitle="Event Overview Dashboard"
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Participants"
          value={totalParticipants || 0}
          icon={Users}
        />
        <MetricCard
          title="Checked In"
          value={checkedInParticipants || 0}
          icon={CheckCircle}
        />
        <MetricCard
          title="Emails Sent"
          value={totalEmailsSent}
          icon={Mail}
        />
        <MetricCard
          title="Active Automations"
          value={activeAutomations}
          icon={Zap}
        />
      </div>

      {/* Quick Actions */}
      <SectionCard title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href={`/admin/events/${eventId}/participants`}>
            <Button variant="secondary" className="w-full justify-between">
              <span>View Participants</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/admin/events/${eventId}/mail`}>
            <Button variant="secondary" className="w-full justify-between">
              <span>Send Email</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/admin/events/${eventId}/mail/automations`}>
            <Button variant="secondary" className="w-full justify-between">
              <span>View Automations</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </SectionCard>

      {/* Today's Timeline (Placeholder) */}
      <SectionCard title="Recent Activity">
        <div className="text-sm text-gray-500">
          <p>Recent activity will appear here</p>
        </div>
      </SectionCard>
    </AdminPage>
  );
}




