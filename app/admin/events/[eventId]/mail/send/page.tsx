/**
 * Send Email Page (Phase 4)
 * 
 * Page with segmentation panel for targeting participants
 */

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import { getEmailTemplates } from '@/lib/mail/api';
import { getParticipantCompanies } from '@/lib/mail/segmentation';
import SendEmailClient from './SendEmailClient';

type SendEmailPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function SendEmailPage({ params }: SendEmailPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // Fetch templates
  const templatesResult = await getEmailTemplates(eventId, { page: 0, pageSize: 100 });
  const templates = templatesResult.data || [];

  // Fetch companies
  const companies = await getParticipantCompanies(eventId);

  return (
    <AdminPage title="Send Email" subtitle="Select template and target participants">
      <SendEmailClient eventId={eventId} templates={templates} companies={companies} />
    </AdminPage>
  );
}

