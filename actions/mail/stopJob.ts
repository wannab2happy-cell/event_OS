'use server';

import { createClient } from '@/lib/supabase/server';
import { getEmailJobDetails } from '@/lib/mail/api';

interface StopJobParams {
  jobId: string;
  eventId: string;
}

export async function stopJob({ jobId, eventId }: StopJobParams): Promise<{ ok: boolean; error?: string }> {
  try {
    // Verify job exists and belongs to event
    const jobResult = await getEmailJobDetails(jobId);
    if (jobResult.error || !jobResult.data) {
      return { ok: false, error: jobResult.error || 'Job not found' };
    }

    const job = jobResult.data;
    if (job.event_id !== eventId) {
      return { ok: false, error: 'Job does not belong to this event' };
    }

    // Only allow stopping if job is processing
    if (job.status !== 'processing') {
      return { ok: false, error: `Cannot stop job with status: ${job.status}` };
    }

    // Update job status to stopped
    const supabase = await createClient();
    const { error } = await supabase
      .from('email_jobs')
      .update({
        status: 'stopped',
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (error) {
      return { ok: false, error: `Failed to stop job: ${error.message}` };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}




