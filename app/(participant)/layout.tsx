import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getBrandingStyles } from '@/lib/branding';

type ParticipantLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ eventId?: string }>;
};

export default async function ParticipantLayout({ children, params }: ParticipantLayoutProps) {
  const resolvedParams = await params;
  const eventId = resolvedParams?.eventId;
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

