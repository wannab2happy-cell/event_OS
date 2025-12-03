import { NextRequest, NextResponse } from 'next/server';
import {
  getNextPendingMessageJob,
  getMessageJob,
  getMessageTemplate,
  getParticipantsForMessageJob,
  updateMessageJobStatus,
  writeMessageLog,
} from '@/lib/message/jobs';
import { mergeMessageTemplate } from '@/lib/message/merge';
import { sendMessage } from '@/lib/message/send';
import { createClient } from '@/lib/supabase/server';

const MESSAGE_RATE_LIMIT_MS = 500; // 500ms delay per message
const CONSECUTIVE_FAILURE_THRESHOLD = 20;

/**
 * Simple sleep helper for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Verify CRON_SECRET for protected endpoints
 */
function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // No protection if CRON_SECRET not set
  
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  return token === cronSecret;
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  try {
    const nextJob = await getNextPendingMessageJob();
    if (nextJob) {
      return NextResponse.json({
        status: 'ok',
        message: `Worker is ready. Next job to process: ${nextJob.id} (Channel: ${nextJob.channel})`,
        nextJobId: nextJob.id,
      });
    } else {
      return NextResponse.json({ status: 'ok', message: 'No pending message jobs found.' });
    }
  } catch (error) {
    console.error('Message worker health check failed:', error);
    return NextResponse.json({ status: 'error', message: 'Worker health check failed' }, { status: 500 });
  }
}

/**
 * POST endpoint to process message jobs
 * Security: Protected by CRON_SECRET in production
 */
export async function POST(request: NextRequest) {
  // Verify CRON_SECRET
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const nextJob = await getNextPendingMessageJob();

    if (!nextJob) {
      return NextResponse.json({ message: 'No pending message jobs to process.' }, { status: 200 });
    }

    console.log(`[Message Worker] Starting to process job: ${nextJob.id} (Channel: ${nextJob.channel})`);

    // Mark job as processing
    await updateMessageJobStatus(nextJob.id, { status: 'processing' });

    // Load template
    const templateResult = await getMessageTemplate(nextJob.template_id);
    if (templateResult.error || !templateResult.data) {
      await updateMessageJobStatus(nextJob.id, { status: 'failed' });
      return NextResponse.json(
        { error: templateResult.error || 'Template not found' },
        { status: 500 }
      );
    }
    const template = templateResult.data;

    // Load event details
    const supabase = await createClient();
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, code')
      .eq('id', nextJob.event_id)
      .single();

    if (eventError || !event) {
      await updateMessageJobStatus(nextJob.id, { status: 'failed' });
      return NextResponse.json({ error: 'Event not found' }, { status: 500 });
    }

    // Get participants based on segmentation
    const segmentation = (nextJob.segmentation as any) || { rules: [{ type: 'all' }] };
    const participants = await getParticipantsForMessageJob(nextJob.event_id, segmentation);

    if (participants.length === 0) {
      await updateMessageJobStatus(nextJob.id, {
        status: 'completed',
        processed_count: 0,
        success_count: 0,
        fail_count: 0,
      });
      return NextResponse.json({ message: 'No participants found for segmentation.' });
    }

    // Process each participant
    let consecutiveFailures = 0;
    let processedCount = 0;
    let successCount = 0;
    let failCount = 0;

    for (const participant of participants) {
      if (!participant.phone) {
        console.warn(`Participant ${participant.id} has no phone number, skipping`);
        continue;
      }

      // Get table assignment if available
      let tableName: string | null = null;
      try {
        const supabase = await createClient();
        const { data: assignment } = await supabase
          .from('table_assignments')
          .select('table_id, event_tables(name)')
          .eq('participant_id', participant.id)
          .eq('is_draft', false)
          .single();
        if (assignment && 'event_tables' in assignment && assignment.event_tables) {
          tableName = (assignment.event_tables as any).name || null;
        }
      } catch (tableErr) {
        // Ignore table assignment errors
      }

      // Merge template
      const mergedBody = mergeMessageTemplate(template, {
        participant: {
          id: participant.id,
          name: participant.name,
          email: '',
          phone: participant.phone,
          company: participant.company || '',
          position: null,
        } as any,
        event: {
          id: event.id,
          title: event.title,
          code: event.code,
        },
        tableName,
      });

      // Send message
      const sendResult = await sendMessage({
        channel: nextJob.channel,
        phone: participant.phone,
        body: mergedBody,
      });

      if (sendResult.success) {
        successCount++;
        consecutiveFailures = 0;
        await writeMessageLog({
          job_id: nextJob.id,
          participant_id: participant.id,
          phone: participant.phone,
          status: 'success',
        });
      } else {
        failCount++;
        consecutiveFailures++;
        await writeMessageLog({
          job_id: nextJob.id,
          participant_id: participant.id,
          phone: participant.phone,
          status: 'failed',
          error_message: sendResult.error || 'Unknown error',
        });
        console.error(`Failed to send message to ${participant.phone}: ${sendResult.error}`);
      }

      processedCount++;

      // Update job status periodically
      if (processedCount % 10 === 0 || !sendResult.success) {
        await updateMessageJobStatus(nextJob.id, {
          processed_count: processedCount,
          success_count: successCount,
          fail_count: failCount,
        });
      }

      // Check for consecutive failures
      if (consecutiveFailures >= CONSECUTIVE_FAILURE_THRESHOLD) {
        console.error(`Job ${nextJob.id}: ${CONSECUTIVE_FAILURE_THRESHOLD} consecutive failures. Marking job as failed.`);
        await updateMessageJobStatus(nextJob.id, {
          status: 'failed',
          processed_count: processedCount,
          success_count: successCount,
          fail_count: failCount,
        });
        return NextResponse.json({ error: 'Too many consecutive failures' }, { status: 500 });
      }

      await sleep(MESSAGE_RATE_LIMIT_MS); // Rate limit
    }

    // Mark job as completed
    await updateMessageJobStatus(nextJob.id, {
      status: 'completed',
      processed_count: processedCount,
      success_count: successCount,
      fail_count: failCount,
    });

    return NextResponse.json({
      message: `Job ${nextJob.id} processed successfully.`,
      jobId: nextJob.id,
      processed: processedCount,
      success: successCount,
      failed: failCount,
    });
  } catch (err) {
    console.error('Error in message worker route:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

