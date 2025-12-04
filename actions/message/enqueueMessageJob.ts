'use server';

import { createMessageJob, getParticipantsForMessageJob } from '@/lib/message/jobs';
import { getSegmentCount } from '@/lib/mail/segmentation';
import type { SegmentationConfig } from '@/lib/mail/segmentation';
import type { MessageChannel } from '@/lib/mail/types';

interface EnqueueMessageJobParams {
  eventId: string;
  templateId: string;
  channel: MessageChannel;
  segmentation: SegmentationConfig;
}

export async function enqueueMessageJob({
  eventId,
  templateId,
  channel,
  segmentation,
}: EnqueueMessageJobParams): Promise<{ ok: boolean; jobId?: string; error?: string }> {
  try {
    // Get total count based on segmentation
    const totalCount = await getSegmentCount(eventId, segmentation);

    if (totalCount === 0) {
      return { ok: false, error: 'No participants match the segmentation criteria' };
    }

    // Create message job
    const jobResult = await createMessageJob({
      event_id: eventId,
      template_id: templateId,
      channel,
      segmentation,
      total_count: totalCount,
    });

    if (jobResult.error || !jobResult.data) {
      return { ok: false, error: jobResult.error || 'Failed to create message job' };
    }

    return { ok: true, jobId: jobResult.data.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}




