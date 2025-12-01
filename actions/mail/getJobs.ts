'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { EmailJob } from '@/lib/mail/types';

export async function getJobs(eventId: string): Promise<EmailJob[]> {
  const { data, error } = await supabaseAdmin
    .from('email_jobs')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get jobs error:', error);
    throw new Error(`Failed to get jobs: ${error.message}`);
  }

  return (data || []) as EmailJob[];
}

