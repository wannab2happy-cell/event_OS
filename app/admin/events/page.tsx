/**
 * Events Index Page (Phase 6)
 * 
 * Multi-event admin dashboard
 */

import { AdminPage } from '@/components/admin/layout/AdminPage';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getEventKpis } from '@/lib/events/eventKpiUtils';
import EventsClient from './EventsClient';
import type { EventWithKPIs } from '@/components/events/EventCard';

export default async function EventsIndexPage() {
  // Fetch all events
  const { data: events, error } = await supabaseAdmin
    .from('events')
    .select('id, title, code, start_date, end_date, status')
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    return <div className="p-8 text-red-500">Failed to load events</div>;
  }

  // Compute KPIs for each event
  const eventsWithKPIs: EventWithKPIs[] = await Promise.all(
    (events || []).map(async (event) => {
      const kpis = await getEventKpis(event.id);
      return {
        id: event.id,
        title: event.title,
        code: event.code,
        start_date: event.start_date,
        end_date: event.end_date,
        status: event.status as 'planning' | 'active' | 'archived',
        location: null, // TODO: Add location field to events table if needed
        kpis,
      };
    })
  );

  return (
    <AdminPage title="Events" subtitle="Manage all your events">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
        <EventsClient initialEvents={eventsWithKPIs} />
      </div>
    </AdminPage>
  );
}

