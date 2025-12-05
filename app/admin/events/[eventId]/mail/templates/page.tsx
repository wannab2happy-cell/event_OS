/**
 * Templates Page (Phase 4)
 * 
 * Template list and editor page
 */

import { notFound } from 'next/navigation';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import { getEmailTemplates } from '@/lib/mail/api';
import TemplatesClient from './TemplatesClient';

type TemplatesPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function TemplatesPage({ params }: TemplatesPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // Fetch templates
  const templatesResult = await getEmailTemplates(eventId, { page: 0, pageSize: 100 });
  const templates = templatesResult.data || [];

  return (
    <AdminPage title="Email Templates" subtitle="Create and manage email templates">
      <div className="max-w-7xl mx-auto space-y-6">
        <TemplatesClient eventId={eventId} initialTemplates={templates} />
      </div>
    </AdminPage>
  );
}

