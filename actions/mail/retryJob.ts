'use server';

import { createClient } from '@/lib/supabase/server';
import { getEmailJobDetails } from '@/lib/mail/api';
import { getEmailJobLogs } from '@/lib/mail/api';
import { createEmailJob } from '@/lib/mail/api';
import type { CreateEmailJobInput } from '@/lib/mail/types';

interface RetryJobParams {
  jobId: string;
  eventId: string;
  mode: 'failed_only' | 'full';
}

export async function retryJob({
  jobId,
  eventId,
  mode,
}: RetryJobParams): Promise<{ ok: boolean; newJobId?: string; error?: string }> {
  try {
    // Get original job details
    const jobResult = await getEmailJobDetails(jobId);
    if (jobResult.error || !jobResult.data) {
      return { ok: false, error: jobResult.error || 'Job not found' };
    }
    const originalJob = jobResult.data;

    // Verify job belongs to event
    if (originalJob.event_id !== eventId) {
      return { ok: false, error: 'Job does not belong to this event' };
    }

    let targetParticipantIds: string[] | undefined;

    if (mode === 'failed_only') {
      // Get all failed logs for this job
      const logsResult = await getEmailJobLogs(jobId, {
        filter: 'failed',
        page: 0,
        pageSize: 10000, // Get all failed logs
      });

      if (logsResult.error) {
        return { ok: false, error: logsResult.error };
      }

      // Extract participant IDs from failed logs
      targetParticipantIds = logsResult.data
        .map((log) => log.participant_id)
        .filter((id): id is string => id !== null);

      if (targetParticipantIds.length === 0) {
        return { ok: false, error: 'No failed participants found to retry' };
      }
    }

    // Create new job with same template and segmentation
    const newJobInput: CreateEmailJobInput = {
      event_id: eventId,
      template_id: originalJob.template_id,
      filter_options: targetParticipantIds
        ? {
            participant_ids: targetParticipantIds,
          }
        : undefined,
    };

    const newJobResult = await createEmailJob(newJobInput);
    if (newJobResult.error || !newJobResult.data) {
      return { ok: false, error: newJobResult.error || 'Failed to create retry job' };
    }

    // Update new job with segmentation from original job
    if (originalJob.segmentation) {
      const supabase = await createClient();
      await supabase
        .from('email_jobs')
        .update({
          segmentation: originalJob.segmentation,
        })
        .eq('id', newJobResult.data.id);
    }

    return { ok: true, newJobId: newJobResult.data.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

