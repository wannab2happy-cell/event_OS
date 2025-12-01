'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { EmailLog } from '@/lib/mail/types';

export async function getEmailLogs(jobId: string): Promise<EmailLog[]> {
  const { data, error } = await supabaseAdmin
    .from('email_logs')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get email logs error:', error);
    throw new Error(`Failed to get email logs: ${error.message}`);
  }

  return (data || []) as EmailLog[];
}

export async function getEmailLogsByParticipant(participantId: string): Promise<EmailLog[]> {
  const { data, error } = await supabaseAdmin
    .from('email_logs')
    .select('*')
    .eq('participant_id', participantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get email logs by participant error:', error);
    throw new Error(`Failed to get email logs: ${error.message}`);
  }

  return (data || []) as EmailLog[];
}

