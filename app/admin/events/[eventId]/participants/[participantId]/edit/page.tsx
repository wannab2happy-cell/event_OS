import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { Participant } from '@/lib/types';
import { AdminParticipantDetail } from '@/components/admin/AdminParticipantDetail';

type ParticipantEditPageProps = {
  params: Promise<{ eventId?: string; participantId?: string }>;
};

export default async function ParticipantEditPage({ params }: ParticipantEditPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;
  const participantId = resolvedParams?.participantId;

  const [{ data: participantData, error: participantError }, { data: eventData, error: eventError }] =
    await Promise.all([
      supabaseAdmin
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId as string)
        .eq('id', participantId as string)
        .single(),
      supabaseAdmin.from('events').select('title').eq('id', eventId as string).single(),
    ]);

  if (!eventId || !participantId || participantError || !participantData || eventError || !eventData) {
    return notFound();
  }

  return (
    <AdminParticipantDetail
      participant={participantData as Participant}
      eventId={eventId}
      eventTitle={eventData.title}
    />
  );
}

