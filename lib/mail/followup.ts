/**
 * Email Follow-up Library
 * 
 * Provides utilities for managing behavior-based email follow-ups
 */

import { createClient } from '@/lib/supabase/server';
import type { EmailFollowUp, FollowUpTriggerType } from './types';
import type { SegmentationConfig } from './segmentation';
import { buildSegmentQuery } from './segmentation';

/**
 * Get all follow-ups for an event
 */
export async function getFollowUpsForEvent(eventId: string): Promise<EmailFollowUp[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('email_followups')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching follow-ups:', error);
      return [];
    }

    return (data || []) as EmailFollowUp[];
  } catch (err) {
    console.error('Error in getFollowUpsForEvent:', err);
    return [];
  }
}

/**
 * Get a single follow-up by ID
 */
export async function getFollowUp(id: string): Promise<EmailFollowUp | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('email_followups')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as EmailFollowUp;
  } catch (err) {
    console.error('Error in getFollowUp:', err);
    return null;
  }
}

/**
 * Compute next run time for a follow-up
 */
export function computeNextFollowUpRun(
  followup: EmailFollowUp,
  baseJob: { created_at: string; status: string }
): Date | null {
  if (!followup.is_active || baseJob.status !== 'completed') {
    return null;
  }

  if (followup.trigger_type === 'after_hours' && followup.delay_hours !== null) {
    const baseJobTime = new Date(baseJob.created_at);
    const nextRun = new Date(baseJobTime);
    nextRun.setHours(nextRun.getHours() + followup.delay_hours);

    const now = new Date();
    if (nextRun <= now) {
      return null; // Already passed
    }

    return nextRun;
  }

  // For 'on_fail' and 'on_success', next_run_at is set when the base job completes
  // This is handled by the scheduler
  return null;
}

/**
 * Build SegmentationConfig from followup.segmentation
 */
export function buildFollowUpSegmentation(followup: EmailFollowUp): SegmentationConfig {
  if (followup.segmentation && typeof followup.segmentation === 'object' && 'rules' in followup.segmentation) {
    return followup.segmentation as SegmentationConfig;
  }
  // Default: all participants
  return { rules: [{ type: 'all' }] };
}

/**
 * Get follow-ups that are due to run
 */
export async function getDueFollowUps(now: Date): Promise<EmailFollowUp[]> {
  try {
    const supabase = await createClient();
    const nowISO = now.toISOString();

    const { data, error } = await supabase
      .from('email_followups')
      .select('*')
      .eq('is_active', true)
      .lte('next_run_at', nowISO)
      .not('next_run_at', 'is', null);

    if (error) {
      console.error('Error fetching due follow-ups:', error);
      return [];
    }

    return (data || []) as EmailFollowUp[];
  } catch (err) {
    console.error('Error in getDueFollowUps:', err);
    return [];
  }
}

/**
 * Get target participant IDs for a follow-up based on trigger type
 */
export async function getTargetsForFollowUp(followup: EmailFollowUp): Promise<string[]> {
  try {
    const supabase = await createClient();

    // Get base job
    const { data: baseJob, error: jobError } = await supabase
      .from('email_jobs')
      .select('id, status')
      .eq('id', followup.base_job_id)
      .single();

    if (jobError || !baseJob) {
      console.error('Base job not found:', followup.base_job_id);
      return [];
    }

    // Get logs for the base job
    const { data: logs, error: logsError } = await supabase
      .from('email_logs')
      .select('participant_id, status')
      .eq('job_id', followup.base_job_id)
      .not('participant_id', 'is', null);

    if (logsError || !logs) {
      console.error('Failed to fetch logs for base job');
      return [];
    }

    let targetParticipantIds: string[] = [];

    if (followup.trigger_type === 'on_fail') {
      // Get participants who failed
      targetParticipantIds = logs
        .filter((log) => log.status === 'failed' && log.participant_id)
        .map((log) => log.participant_id as string);
    } else if (followup.trigger_type === 'on_success') {
      // Get participants who succeeded
      targetParticipantIds = logs
        .filter((log) => log.status === 'success' && log.participant_id)
        .map((log) => log.participant_id as string);
    } else if (followup.trigger_type === 'after_hours') {
      // For after_hours, use segmentation only
      const segmentation = buildFollowUpSegmentation(followup);
      const query = await buildSegmentQuery(followup.event_id, segmentation);
      // buildSegmentQuery already includes select, so we execute it directly
      const { data: participants } = await query;
      if (participants) {
        targetParticipantIds = participants.map((p: any) => p.id);
      }
    }

    // Apply additional segmentation if provided
    // Note: For on_fail/on_success, we already filtered by log status
    // For after_hours, segmentation is already applied above
    // This section is kept for potential future use if we need to apply additional filters

    return targetParticipantIds;
  } catch (err) {
    console.error('Error in getTargetsForFollowUp:', err);
    return [];
  }
}

/**
 * Update follow-up run times
 */
export async function updateFollowUpRunTimes(
  followupId: string,
  lastRunAt: Date,
  nextRunAt: Date | null
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase
      .from('email_followups')
      .update({
        last_run_at: lastRunAt.toISOString(),
        next_run_at: nextRunAt ? nextRunAt.toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', followupId);
  } catch (err) {
    console.error('Error updating follow-up run times:', err);
  }
}

