/**
 * Event Settings Page (Phase 5)
 * 
 * Settings page with 4 tabs: General, Branding, Registration, Communications
 */

import { notFound } from 'next/navigation';
import { AdminPage } from '@/components/admin/layout/AdminPage';
import { getEventSettings } from '@/actions/settings/getEventSettings';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import SettingsClient from './SettingsClient';

type SettingsPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function SettingsPage({ params }: SettingsPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  // Fetch event name
  const { data: event, error: eventError } = await supabaseAdmin
    .from('events')
    .select('title')
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    return notFound();
  }

  // Fetch settings
  const settings = await getEventSettings(eventId);

  return (
    <AdminPage title="Settings" subtitle={`Configure settings for ${event.title}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-6">
        <SettingsClient eventId={eventId} initialSettings={settings} />
      </div>
    </AdminPage>
  );
}
