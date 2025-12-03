import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import { getMessageTemplates, getMessageJobs } from '@/lib/message/jobs';
import { createClient } from '@/lib/supabase/server';
import { getParticipantCompanies } from '@/lib/mail/segmentation';
import { MessageTemplateList } from '@/components/message/MessageTemplateList';
import { MessageJobList } from '@/components/message/MessageJobList';
import { MessagesPageClient } from './MessagesPageClient';

type MessagesPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function MessagesPage({ params }: MessagesPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // Load templates
  const templatesResult = await getMessageTemplates(eventId);
  const templates = templatesResult.data || [];

  // Load recent jobs
  const jobsResult = await getMessageJobs(eventId, { page: 0, pageSize: 10 });
  const recentJobs = jobsResult.data || [];

  // Load companies for segmentation
  const companies = await getParticipantCompanies(eventId);

  // Load event for context
  const supabase = await createClient();
  const { data: event } = await supabase
    .from('events')
    .select('id, title, code')
    .eq('id', eventId)
    .single();

  if (!event) {
    return notFound();
  }

  return (
    <AdminPage
      title="SMS/Kakao Messaging"
      subtitle="SMS 및 카카오 메시지를 발송하고 관리합니다"
      actions={
        <Link href={`/admin/events/${eventId}/messages/templates/new`}>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </Link>
      }
    >
      <MessagesPageClient
        eventId={eventId}
        initialTemplates={templates}
        initialJobs={recentJobs}
        event={event}
        companies={companies}
      />
    </AdminPage>
  );
}

