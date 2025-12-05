/**
 * AB Test Results Page (Phase 4)
 * 
 * Displays AB test comparison and results visualization
 */

import { notFound } from 'next/navigation';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import { getABTestsForEvent } from '@/lib/mail/abtest';
import { getEmailTemplates } from '@/lib/mail/api';
import ABTestResultsClient from './ABTestResultsClient';

type ABTestPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function ABTestPage({ params }: ABTestPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // Load AB tests
  const tests = await getABTestsForEvent(eventId);

  // Load templates
  const templatesResult = await getEmailTemplates(eventId);
  const templates = templatesResult.data || [];

  return (
    <AdminPage title="A/B Test Results" subtitle="Compare email template performance">
      <div className="max-w-7xl mx-auto space-y-6">
        <ABTestResultsClient eventId={eventId} tests={tests} templates={templates} />
      </div>
    </AdminPage>
  );
}

