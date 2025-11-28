export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdminAuth } from '@/lib/auth';
import EventCloneForm from '@/components/admin/EventCloneForm';

type ClonePageProps = {
  params: Promise<{ eventId?: string }>;
};

async function fetchEvent(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('id, title, code, start_date, end_date, hero_tagline, primary_color, venue_name')
    .eq('id', eventId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function CloneEventPage({ params }: ClonePageProps) {
  await assertAdminAuth();

  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const sourceEvent = await fetchEvent(eventId);

  if (!sourceEvent) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">이벤트 복제</h1>
        <p className="text-sm text-gray-500 mt-1">
          "{sourceEvent.title}" 이벤트를 기반으로 새 이벤트를 생성합니다.
        </p>
      </div>

      {/* 복제 폼 */}
      <EventCloneForm sourceEventId={eventId} sourceEvent={sourceEvent} />
    </div>
  );
}

