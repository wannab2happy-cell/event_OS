import { redirect } from 'next/navigation';

type EventPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function EventPage({ params }: EventPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return <div>Event ID is required</div>;
  }

  redirect(`/admin/events/${eventId}/overview`);
}

