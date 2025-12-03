'use server';

import { createEmailJob } from '@/lib/mail/api';
import type { CreateEmailJobInput } from '@/lib/mail/types';
import type { SegmentationConfig } from '@/lib/mail/segmentation';
import { getSegmentCount } from '@/lib/mail/segmentation';

interface EnqueueEmailJobParams {
  eventId: string;
  templateId: string;
  segmentation: SegmentationConfig;
}

export async function enqueueEmailJob({
  eventId,
  templateId,
  segmentation,
}: EnqueueEmailJobParams): Promise<{ ok: boolean; jobId?: string; error?: string }> {
  try {
    // Convert segmentation rules to filter_options (for backward compatibility)
    const filterOptions: CreateEmailJobInput['filter_options'] = {};

    for (const rule of segmentation.rules) {
      switch (rule.type) {
        case 'registered_only':
          filterOptions.status = ['registered'];
          break;
        case 'invited_only':
          filterOptions.status = ['invited'];
          break;
        case 'vip_only':
          filterOptions.is_vip = true;
          break;
        case 'company':
          if (rule.values && rule.values.length > 0) {
            // For multiple companies, we'll use the first one in filter_options
            // The full list will be stored in segmentation JSON
            filterOptions.company = rule.values[0];
          }
          break;
        // language and custom are handled via segmentation JSON only
      }
    }

    // Get total count based on segmentation
    const totalCount = await getSegmentCount(eventId, segmentation);

    // Create job with segmentation stored as JSON
    const jobResult = await createEmailJob({
      event_id: eventId,
      template_id: templateId,
      filter_options: Object.keys(filterOptions).length > 0 ? filterOptions : undefined,
    });

    if (jobResult.error || !jobResult.data) {
      return { ok: false, error: jobResult.error || 'Failed to create email job' };
    }

    // Update job with segmentation JSON
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('email_jobs')
      .update({
        segmentation: segmentation as any,
        total_count: totalCount,
      })
      .eq('id', jobResult.data.id);

    if (updateError) {
      console.error('Error updating job segmentation:', updateError);
      // Don't fail the whole operation, segmentation is optional metadata
    }

    return { ok: true, jobId: jobResult.data.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

