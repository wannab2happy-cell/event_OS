'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { EmailTemplate } from '@/lib/mail/types';

export async function getTemplates(eventId: string): Promise<EmailTemplate[]> {
  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get templates error:', error);
    throw new Error(`Failed to get templates: ${error.message}`);
  }

  return (data || []) as EmailTemplate[];
}

