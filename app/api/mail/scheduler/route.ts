import { NextRequest, NextResponse } from 'next/server';
import { getDueAutomations, computeNextRun, buildAutomationSegmentation, updateAutomationRunTimes } from '@/lib/mail/automation';
import { getDueFollowUps, getTargetsForFollowUp, buildFollowUpSegmentation, updateFollowUpRunTimes } from '@/lib/mail/followup';
import { enqueueEmailJob } from '@/actions/mail/enqueueEmailJob';
import { createClient } from '@/lib/supabase/server';
import type { SegmentationConfig } from '@/lib/mail/segmentation';

/**
 * Email Automation Scheduler API Route
 * 
 * Evaluates due automations and enqueues email jobs.
 * Designed to be triggered by cron (every 5-15 minutes) or manually.
 * 
 * Security: Protected by CRON_SECRET in production
 */
export async function POST(request: NextRequest) {
  try {
    // Verify CRON_SECRET if set (production)
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (token !== cronSecret) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const now = new Date();
    const dueAutomations = await getDueAutomations(now);

    if (dueAutomations.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        createdJobs: [],
        message: 'No automations due to run',
      });
    }

    const supabase = await createClient();
    const createdJobs: string[] = [];
    let processed = 0;

    for (const automation of dueAutomations) {
      try {
        // Load event to compute next run time
        const { data: event, error: eventError } = await supabase
          .from('events')
          .select('id, start_date, end_date')
          .eq('id', automation.event_id)
          .single();

        if (eventError || !event) {
          console.error(`Event not found for automation ${automation.id}:`, eventError);
          continue;
        }

        // Build segmentation config
        const segmentation = buildAutomationSegmentation(automation);

        // Enqueue email job
        const jobResult = await enqueueEmailJob({
          eventId: automation.event_id,
          templateId: automation.template_id,
          segmentation,
        });

        if (jobResult.ok && jobResult.jobId) {
          createdJobs.push(jobResult.jobId);

          // Update automation run times
          const nextRun = computeNextRun(automation, event);
          await updateAutomationRunTimes(automation.id, now, nextRun);

          processed++;
        } else {
          console.error(`Failed to enqueue job for automation ${automation.id}:`, jobResult.error);
        }
      } catch (err) {
        console.error(`Error processing automation ${automation.id}:`, err);
        // Continue with next automation
      }
    }

    // Process follow-ups
    const dueFollowups = await getDueFollowUps(now);
    let followupsProcessed = 0;
    const followupJobs: string[] = [];

    for (const followup of dueFollowups) {
      try {
        // Get target participants
        const targetParticipantIds = await getTargetsForFollowUp(followup);

        if (targetParticipantIds.length === 0) {
          console.log(`Follow-up ${followup.id}: No target participants found`);
          // Update run times even if no targets
          await updateFollowUpRunTimes(followup.id, now, null);
          continue;
        }

        // Build segmentation config (filter to target participants)
        // Use a custom segmentation rule with participant IDs
        const segmentation: SegmentationConfig = {
          rules: [{ type: 'custom', values: targetParticipantIds }],
        };

        // Enqueue email job
        const jobResult = await enqueueEmailJob({
          eventId: followup.event_id,
          templateId: followup.template_id,
          segmentation,
        });

        if (jobResult.ok && jobResult.jobId) {
          followupJobs.push(jobResult.jobId);

          // Update follow-up run times
          // For on_fail/on_success, set next_run_at to null (one-time)
          // For after_hours, could recompute if needed
          const nextRun = followup.trigger_type === 'after_hours' ? null : null; // One-time for now
          await updateFollowUpRunTimes(followup.id, now, nextRun);

          followupsProcessed++;
        } else {
          console.error(`Failed to enqueue job for follow-up ${followup.id}:`, jobResult.error);
        }
      } catch (err) {
        console.error(`Error processing follow-up ${followup.id}:`, err);
        // Continue with next follow-up
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      createdJobs,
      followupsProcessed,
      followupJobs,
      message: `Processed ${processed} automations, ${followupsProcessed} follow-ups, created ${createdJobs.length + followupJobs.length} jobs`,
    });
  } catch (err) {
    console.error('Scheduler error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get count of active automations
    const { count, error: countError } = await supabase
      .from('email_automations')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    if (countError) {
      return NextResponse.json(
        { error: `Failed to count automations: ${countError.message}` },
        { status: 500 }
      );
    }

    // Get min/max next_run_at for active automations
    const { data, error: dataError } = await supabase
      .from('email_automations')
      .select('next_run_at')
      .eq('is_active', true)
      .not('next_run_at', 'is', null)
      .order('next_run_at', { ascending: true });

    let minNextRun: string | null = null;
    let maxNextRun: string | null = null;

    if (!dataError && data && data.length > 0) {
      const dates = data.map((d) => d.next_run_at).filter(Boolean) as string[];
      if (dates.length > 0) {
        minNextRun = dates[0];
        maxNextRun = dates[dates.length - 1];
      }
    }

    return NextResponse.json({
      success: true,
      activeAutomations: count ?? 0,
      minNextRun,
      maxNextRun,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

