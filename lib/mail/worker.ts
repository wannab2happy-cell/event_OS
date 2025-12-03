/**
 * Email Job Worker Controller
 * 
 * Handles processing of email jobs: fetching participants, merging templates, sending emails, and logging
 */

import { createClient } from '@/lib/supabase/server';
import { getEmailTemplate } from './api';
import { getEmailJob } from './api';
import { buildSegmentQuery } from './segmentation';
import type { SegmentationConfig } from './segmentation';
import { mergeTemplate } from './merge';
import { sendEmail } from './sender';
import type { EmailJob } from './types';
import type { Participant } from '@/lib/types';

/**
 * Sleep helper to control rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get next pending job from queue
 */
export async function getNextJob(): Promise<EmailJob | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('email_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data as EmailJob;
  } catch (err) {
    console.error('Error getting next job:', err);
    return null;
  }
}

/**
 * Get participants for a job based on segmentation rules
 */
export async function getParticipantsForJob(job: EmailJob): Promise<Participant[]> {
  try {
    // Ensure segmentation has correct structure
    let segmentation: SegmentationConfig;
    if (job.segmentation && typeof job.segmentation === 'object' && 'rules' in job.segmentation) {
      segmentation = job.segmentation as SegmentationConfig;
    } else {
      segmentation = { rules: [{ type: 'all' }] };
    }
    
    const query = await buildSegmentQuery(job.event_id, segmentation);
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching participants:', error);
      return [];
    }

    // Map to Participant-like structure (we only need basic fields for email sending)
    return (data || []) as unknown as Participant[];
  } catch (err) {
    console.error('Error in getParticipantsForJob:', err);
    return [];
  }
}

/**
 * Write email log entry
 */
export async function writeLog(
  jobId: string,
  participantId: string | null,
  email: string,
  status: 'success' | 'failed',
  message: string | null = null
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from('email_logs').insert({
      job_id: jobId,
      participant_id: participantId,
      email,
      status,
      error_message: message,
      sent_at: status === 'success' ? new Date().toISOString() : null,
    });
  } catch (err) {
    console.error('Error writing log:', err);
  }
}

/**
 * Update job status and counts
 */
export async function updateJobStatus(
  jobId: string,
  updates: {
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'failed_manual' | 'stopped';
    processed_count?: number;
    success_count?: number;
    fail_count?: number;
  }
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase
      .from('email_jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  } catch (err) {
    console.error('Error updating job status:', err);
  }
}

/**
 * Process a single email job
 */
export async function processJob(job: EmailJob): Promise<{ success: boolean; error?: string }> {
  try {
    // Mark job as processing
    await updateJobStatus(job.id, { status: 'processing' });

    // Load template
    const templateResult = await getEmailTemplate(job.template_id);
    if (templateResult.error || !templateResult.data) {
      await updateJobStatus(job.id, {
        status: 'failed',
      });
      return { success: false, error: templateResult.error || 'Template not found' };
    }
    const template = templateResult.data;

    // Load event for merge context
    const supabase = await createClient();
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, code')
      .eq('id', job.event_id)
      .single();

    if (eventError || !event) {
      await updateJobStatus(job.id, {
        status: 'failed',
      });
      return { success: false, error: 'Event not found' };
    }

    // Get participants based on segmentation
    const participants = await getParticipantsForJob(job);
    if (participants.length === 0) {
      await updateJobStatus(job.id, {
        status: 'completed',
        processed_count: 0,
        success_count: 0,
        fail_count: 0,
      });
      return { success: true };
    }

    // Load table assignments for participants
    const participantIds = participants.map((p) => p.id);
    const { data: assignments } = await supabase
      .from('table_assignments')
      .select('participant_id, table_id')
      .eq('event_id', job.event_id)
      .eq('is_draft', false)
      .in('participant_id', participantIds);

    // Build table name map
    const tableMap = new Map<string, string>();
    if (assignments && assignments.length > 0) {
      const tableIds = [...new Set(assignments.map((a) => a.table_id).filter(Boolean))];
      if (tableIds.length > 0) {
        const { data: tables } = await supabase
          .from('event_tables')
          .select('id, name')
          .in('id', tableIds);

        tables?.forEach((t) => {
          tableMap.set(t.id, t.name);
        });
      }
    }

    // Process each participant
    let processedCount = 0;
    let successCount = 0;
    let failCount = 0;
    let consecutiveFailures = 0;
    const MAX_CONSECUTIVE_FAILURES = 20;

    for (const participant of participants) {
      try {
        // Get table name for this participant
        const assignment = assignments?.find((a) => a.participant_id === participant.id);
        const tableName = assignment ? tableMap.get(assignment.table_id) : null;

        // Merge template with participant data
        const merged = mergeTemplate(template, {
          participant,
          event: {
            id: event.id,
            title: event.title,
            code: event.code,
          },
          tableName: tableName || null,
        });

        // Send email
        const sendResult = await sendEmail({
          to: participant.email,
          subject: merged.subject,
          html: merged.html,
          text: merged.text || undefined,
        });

        if (sendResult.success) {
          await writeLog(job.id, participant.id, participant.email, 'success');
          successCount++;
          consecutiveFailures = 0;
        } else {
          await writeLog(
            job.id,
            participant.id,
            participant.email,
            'failed',
            sendResult.error || 'Unknown error'
          );
          failCount++;
          consecutiveFailures++;

          // If too many consecutive failures, mark job as failed
          if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
            await updateJobStatus(job.id, {
              status: 'failed',
              processed_count: processedCount,
              success_count: successCount,
              fail_count: failCount,
            });
            return {
              success: false,
              error: `Too many consecutive failures (${consecutiveFailures})`,
            };
          }
        }

        processedCount++;

        // Update job progress every 10 participants
        if (processedCount % 10 === 0) {
          await updateJobStatus(job.id, {
            processed_count: processedCount,
            success_count: successCount,
            fail_count: failCount,
          });
        }

        // Rate limiting: sleep 150ms between sends
        await sleep(150);
      } catch (err) {
        // Individual participant error - log and continue
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        await writeLog(job.id, participant.id, participant.email, 'failed', errorMessage);
        failCount++;
        processedCount++;
        consecutiveFailures++;

        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          await updateJobStatus(job.id, {
            status: 'failed',
            processed_count: processedCount,
            success_count: successCount,
            fail_count: failCount,
          });
          return {
            success: false,
            error: `Too many consecutive failures (${consecutiveFailures})`,
          };
        }
      }
    }

    // Mark job as completed
    await updateJobStatus(job.id, {
      status: 'completed',
      processed_count: processedCount,
      success_count: successCount,
      fail_count: failCount,
    });

    return { success: true };
  } catch (err) {
    // Job-level error - mark as failed
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    await updateJobStatus(job.id, {
      status: 'failed',
    });
    return { success: false, error: errorMessage };
  }
}

