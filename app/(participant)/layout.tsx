import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getBrandingStyles } from '@/lib/branding';

export default async function ParticipantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { eventId?: string };
}) {
  const eventId = params?.eventId;
  let brandingStyles = {};

  if (eventId) {
    const { data: brandingData } = await supabase
      .from('event_branding')
      .select('*')
      .eq('event_id', eventId)
      .single();

    brandingStyles = getBrandingStyles(brandingData);
  }

  return (
    <div className="min-h-screen bg-white" style={brandingStyles}>
      <div className="font-[var(--font-event),Pretendard]">{children}</div>
    </div>
  );
}

