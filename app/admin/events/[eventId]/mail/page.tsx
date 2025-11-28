export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import MailCenterClient from '@/components/admin/MailCenterClient';
import MailLogsSection from '@/components/admin/MailLogsSection';

type MailPageProps = {
  params: Promise<{ eventId?: string }>;
};

async function fetchEvent(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('id, title, code')
    .eq('id', eventId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function fetchMailLogs(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('mail_logs')
    .select('*')
    .eq('event_id', eventId)
    .order('sent_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Mail logs fetch error:', error);
    return [];
  }

  return data || [];
}

export default async function MailPage({ params }: MailPageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const [event, mailLogs] = await Promise.all([
    fetchEvent(eventId),
    fetchMailLogs(eventId),
  ]);

  if (!event) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">메일 센터</h1>
        <p className="text-sm text-gray-500 mt-1">
          {event.title} ({event.code}) - 참가자에게 메일을 발송하세요.
        </p>
      </div>

      {/* 메일 센터 클라이언트 컴포넌트 */}
      <MailCenterClient eventId={eventId} eventTitle={event.title} />

      {/* 발송 로그 섹션 */}
      <MailLogsSection logs={mailLogs} />
    </div>
  );
}

