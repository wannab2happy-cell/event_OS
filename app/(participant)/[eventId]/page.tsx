export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import HeroSection from '@/components/participant/HeroSection';
import ScheduleSection from '@/components/participant/ScheduleSection';
import VenueSection from '@/components/participant/VenueSection';
import AboutSection from '@/components/participant/AboutSection';

type ParticipantPageProps = {
  params: Promise<{ eventId?: string }>;
};

export default async function ParticipantPage({ params }: ParticipantPageProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;

  if (!eventId) {
    return notFound();
  }

  const { data: event } = await supabase
    .from('events')
    .select('*, event_branding(*)')
    .eq('id', eventId)
    .single();

  if (!event) {
    return notFound();
  }

  const branding = (event.event_branding as Array<Record<string, any>>)?.[0] || {};

  return (
    <>
      <HeroSection
        event={{
          id: event.id,
          title: event.title,
          code: event.code,
          hero_tagline: event.hero_tagline,
          start_date: event.start_date,
          end_date: event.end_date,
          location_name: event.location_name,
        }}
        branding={{
          logo_url: branding.logo_url,
          kv_image_url: branding.kv_image_url,
        }}
      />

      <ScheduleSection
        event={{
          title: event.title,
          start_date: event.start_date,
          end_date: event.end_date,
          schedule: event.schedule as any,
        }}
      />

      <VenueSection
        event={{
          location_name: event.location_name,
          location_detail: event.location_detail,
          venue_address: event.venue_address,
          venue_latitude: event.venue_latitude,
          venue_longitude: event.venue_longitude,
        }}
      />

      <AboutSection
        event={{
          title: event.title,
          location_detail: event.location_detail,
        }}
      />
    </>
  );
}

