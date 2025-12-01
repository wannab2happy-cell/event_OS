'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getRecipients(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('event_participants')
    .select('id, name, email, company, position')
    .eq('event_id', eventId)
    .not('email', 'is', null);

  if (error) {
    console.error('Get recipients error:', error);
    throw new Error(`Failed to get recipients: ${error.message}`);
  }

  return (data || []).map((p) => ({
    email: p.email,
    participantId: p.id,
    variables: {
      name: p.name ?? '',
      company: p.company ?? '',
      position: p.position ?? '',
    },
  }));
}

