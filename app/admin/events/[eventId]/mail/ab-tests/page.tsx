import { AdminPage } from '@/components/admin/layout/AdminPage';
import { getABTestsForEvent } from '@/lib/mail/abtest';
import { getEmailTemplates } from '@/lib/mail/api';
import { getParticipantCompanies } from '@/lib/mail/segmentation';
import { ABTestsPageClient } from './ABTestsPageClient';

type ABTestsPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function ABTestsPage({ params }: ABTestsPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return <div>Event ID is required</div>;
  }

  // Load AB tests
  const tests = await getABTestsForEvent(eventId);

  // Load templates
  const templatesResult = await getEmailTemplates(eventId);
  const templates = templatesResult.data || [];

  // Load companies for segmentation
  const companies = await getParticipantCompanies(eventId);

  return (
    <AdminPage title="A/B Tests" subtitle="이메일 템플릿 성과를 비교하고 최적화합니다">
      <ABTestsPageClient
        eventId={eventId}
        initialTests={tests}
        templates={templates.map((t) => ({ id: t.id, name: t.name }))}
        companies={companies}
      />
    </AdminPage>
  );
}

