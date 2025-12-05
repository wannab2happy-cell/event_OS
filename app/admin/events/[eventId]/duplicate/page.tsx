/**
 * Duplicate Event Page (Phase 6)
 * 
 * Event duplication flow
 */

import { notFound } from 'next/navigation';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import EventDuplicateClient from './EventDuplicateClient';

type DuplicateEventPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function DuplicateEventPage({ params }: DuplicateEventPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // Fetch source event
  const { data: event, error } = await supabaseAdmin
    .from('events')
    .select('title, start_date, end_date')
    .eq('id', eventId)
    .single();

  if (error || !event) {
    return notFound();
  }

  return (
    <AdminPage title="Duplicate Event" subtitle={`Create a copy of ${event.title}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
        <EventDuplicateClient eventId={eventId} sourceEvent={event} />
      </div>
    </AdminPage>
  );
}

