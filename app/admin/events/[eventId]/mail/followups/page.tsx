import { AdminPage } from '@/components/admin/layout/AdminPage';
import { getFollowUpsForEvent } from '@/lib/mail/followup';
import { getEmailTemplates } from '@/lib/mail/api';
import { getEmailJobs } from '@/lib/mail/api';
import { getParticipantCompanies } from '@/lib/mail/segmentation';
import { FollowUpsPageClient } from './FollowUpsPageClient';

type FollowUpsPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function FollowUpsPage({ params }: FollowUpsPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return <div>Event ID is required</div>;
  }

  // Load follow-ups
  const followups = await getFollowUpsForEvent(eventId);

  // Load templates
  const templatesResult = await getEmailTemplates(eventId);
  const templates = templatesResult.data || [];

  // Load jobs (for base job selection)
  const jobsResult = await getEmailJobs(eventId, { page: 0, pageSize: 100 });
  const jobs = jobsResult.data || [];

  // Load companies for segmentation
  const companies = await getParticipantCompanies(eventId);

  return (
    <AdminPage title="Email Follow-ups" subtitle="행동 기반 이메일 후속 캠페인을 관리합니다">
      <FollowUpsPageClient
        eventId={eventId}
        initialFollowups={followups}
        templates={templates.map((t) => ({ id: t.id, name: t.name }))}
        jobs={jobs.map((j) => ({ id: j.id, name: `Job #${j.id.slice(0, 8)}`, status: j.status }))}
        companies={companies}
      />
    </AdminPage>
  );
}

