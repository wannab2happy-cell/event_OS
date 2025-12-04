'use server';

import { createClient } from '@/lib/supabase/server';
import { getABTest, getParticipantsForABTest, assignParticipantsToVariants, createABTestAssignments, updateAssignmentJobId, updateABTestStatus } from '@/lib/mail/abtest';
import { enqueueEmailJob } from '@/actions/mail/enqueueEmailJob';
import { revalidatePath } from 'next/cache';
import type { SegmentationConfig } from '@/lib/mail/segmentation';

export async function startABTest(testId: string): Promise<{ ok: boolean; error?: string; jobIds?: string[] }> {
  try {
    const test = await getABTest(testId);
    if (!test) {
      return { ok: false, error: 'AB test not found' };
    }

    if (test.status !== 'draft') {
      return { ok: false, error: `Cannot start test with status: ${test.status}` };
    }

    // Get participants based on segmentation
    const segmentation = (test.segmentation as SegmentationConfig) || { rules: [{ type: 'all' }] };
    const participants = await getParticipantsForABTest(test.event_id, segmentation);

    if (participants.length === 0) {
      return { ok: false, error: 'No participants found for the specified segmentation' };
    }

    // Assign participants to variants
    const assignments = assignParticipantsToVariants(participants, test.variants);

    // Create assignment records (without job_id initially)
    await createABTestAssignments(testId, assignments);

    // Group participants by variant
    const variantGroups = new Map<number, string[]>();
    for (const [participantId, variantIndex] of assignments.entries()) {
      if (!variantGroups.has(variantIndex)) {
        variantGroups.set(variantIndex, []);
      }
      variantGroups.get(variantIndex)!.push(participantId);
    }

    // Create email jobs for each variant
    const jobIds: string[] = [];
    for (const [variantIndex, participantIds] of variantGroups.entries()) {
      const variant = test.variants[variantIndex];
      if (!variant) continue;

      // Create segmentation config for this variant (filter to assigned participants)
      const variantSegmentation: SegmentationConfig = {
        rules: [{ type: 'custom', values: participantIds }],
      };

      // Enqueue email job
      const jobResult = await enqueueEmailJob({
        eventId: test.event_id,
        templateId: variant.template_id,
        segmentation: variantSegmentation,
      });

      if (jobResult.ok && jobResult.jobId) {
        jobIds.push(jobResult.jobId);

        // Update assignments with job_id
        for (const participantId of participantIds) {
          await updateAssignmentJobId(testId, participantId, variantIndex, jobResult.jobId);
        }
      } else {
        console.error(`Failed to create job for variant ${variantIndex}:`, jobResult.error);
      }
    }

    if (jobIds.length === 0) {
      return { ok: false, error: 'Failed to create any email jobs' };
    }

    // Update test status to 'running'
    await updateABTestStatus(testId, 'running');

    revalidatePath(`/admin/events/${test.event_id}/mail/ab-tests`);

    return { ok: true, jobIds };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}




