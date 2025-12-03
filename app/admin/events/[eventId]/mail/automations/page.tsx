import { AdminPage } from '@/components/admin/layout/AdminPage';
import { getAutomationsForEvent } from '@/lib/mail/api';
import { getEmailTemplates } from '@/lib/mail/api';
import { getParticipantCompanies } from '@/lib/mail/segmentation';
import { AutomationsPageClient } from './AutomationsPageClient';

type AutomationsPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function AutomationsPage({ params }: AutomationsPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return <div>Event ID is required</div>;
  }

  // Load automations
  const automationsResult = await getAutomationsForEvent(eventId);
  const automations = automationsResult.data || [];

  // Load templates
  const templatesResult = await getEmailTemplates(eventId);
  const templates = templatesResult.data || [];

  // Load companies for segmentation
  const companies = await getParticipantCompanies(eventId);

  return (
    <AdminPage title="Email Automations" subtitle="자동화된 이메일 캠페인을 관리합니다">
      <AutomationsPageClient
        eventId={eventId}
        initialAutomations={automations}
        templates={templates.map((t) => ({ id: t.id, name: t.name }))}
        companies={companies}
      />
    </AdminPage>
  );
}
