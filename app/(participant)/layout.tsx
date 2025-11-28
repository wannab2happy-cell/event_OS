import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getBrandingStyles } from '@/lib/branding';
import ParticipantHeader from '@/components/participant/ParticipantHeader';
import ParticipantFooter from '@/components/participant/ParticipantFooter';

type ParticipantLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ eventId?: string }>;
};

export default async function ParticipantLayout({ children, params }: ParticipantLayoutProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;
  let brandingStyles = {};
  let eventData = null;
  let brandingData = null;

  if (eventId) {
    // 이벤트 데이터 가져오기
    const { data: event } = await supabase
      .from('events')
      .select('id, title, code')
      .eq('id', eventId)
      .single();

    eventData = event;

    // 브랜딩 데이터 가져오기
    const { data: branding } = await supabase
      .from('event_branding')
      .select('*')
      .eq('event_id', eventId)
      .single();

    brandingData = branding;
    brandingStyles = getBrandingStyles(branding);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={brandingStyles}>
      <div className="font-[var(--font-event),Pretendard] flex-1 flex flex-col">
        {eventId && eventData && brandingData && (
          <ParticipantHeader
            event={{
              id: eventData.id,
              title: eventData.title,
              code: eventData.code,
            }}
            branding={{
              logo_url: brandingData.logo_url,
            }}
          />
        )}
        <main className="flex-1">{children}</main>
        {eventId && <ParticipantFooter eventId={eventId} />}
      </div>
    </div>
  );
}

