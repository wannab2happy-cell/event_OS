/**
 * Email Automation Library
 * 
 * Utilities for managing email automations: scheduling, computing next run times, etc.
 */

import { createClient } from '@/lib/supabase/server';
import type { EmailAutomation, AutomationType, AutomationTriggerKind } from './types';
import type { SegmentationConfig } from './segmentation';

/**
 * Get all automations for an event
 */
export async function getAutomationsForEvent(eventId: string): Promise<EmailAutomation[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('email_automations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching automations:', error);
      return [];
    }

    return (data || []) as EmailAutomation[];
  } catch (err) {
    console.error('Error in getAutomationsForEvent:', err);
    return [];
  }
}

/**
 * Get a single automation by ID
 */
export async function getAutomation(id: string): Promise<EmailAutomation | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('email_automations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as EmailAutomation;
  } catch (err) {
    console.error('Error in getAutomation:', err);
    return null;
  }
}

/**
 * Compute next run time for a time-based automation
 * 
 * @param automation - Automation rule
 * @param event - Event object with start_date
 * @returns Next run date or null if cannot compute
 */
export function computeNextRun(
  automation: EmailAutomation,
  event: { start_date: string | null; end_date: string | null }
): Date | null {
  if (automation.type !== 'time_based' || !automation.is_active) {
    return null;
  }

  if (automation.time_type === 'absolute') {
    if (automation.send_at) {
      const sendAt = new Date(automation.send_at);
      const now = new Date();
      // If send_at is in the past, return null (already passed)
      if (sendAt <= now) {
        return null;
      }
      return sendAt;
    }
    return null;
  }

  if (automation.time_type === 'relative') {
    if (automation.relative_days === null || !event.start_date) {
      return null;
    }

    const eventStart = new Date(event.start_date);
    const nextRun = new Date(eventStart);
    nextRun.setDate(eventStart.getDate() + automation.relative_days);

    const now = new Date();
    // If computed time is in the past, return null
    if (nextRun <= now) {
      return null;
    }

    return nextRun;
  }

  return null;
}

/**
 * Build SegmentationConfig from automation.segmentation
 */
export function buildAutomationSegmentation(automation: EmailAutomation): SegmentationConfig {
  if (automation.segmentation && typeof automation.segmentation === 'object' && 'rules' in automation.segmentation) {
    return automation.segmentation as SegmentationConfig;
  }
  // Default: all participants
  return { rules: [{ type: 'all' }] };
}

/**
 * Get automations that are due to run
 * 
 * @param now - Current date/time
 * @returns Array of automations where is_active=true and next_run_at <= now
 */
export async function getDueAutomations(now: Date): Promise<EmailAutomation[]> {
  try {
    const supabase = await createClient();
    const nowISO = now.toISOString();

    const { data, error } = await supabase
      .from('email_automations')
      .select('*')
      .eq('is_active', true)
      .lte('next_run_at', nowISO)
      .not('next_run_at', 'is', null);

    if (error) {
      console.error('Error fetching due automations:', error);
      return [];
    }

    return (data || []) as EmailAutomation[];
  } catch (err) {
    console.error('Error in getDueAutomations:', err);
    return [];
  }
}

/**
 * Update automation's last_run_at and next_run_at
 */
export async function updateAutomationRunTimes(
  automationId: string,
  lastRunAt: Date,
  nextRunAt: Date | null
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase
      .from('email_automations')
      .update({
        last_run_at: lastRunAt.toISOString(),
        next_run_at: nextRunAt ? nextRunAt.toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', automationId);
  } catch (err) {
    console.error('Error updating automation run times:', err);
  }
}

