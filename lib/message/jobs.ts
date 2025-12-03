/**
 * Message Jobs Library
 * 
 * Provides utilities for managing message jobs (SMS/Kakao)
 */

import { createClient } from '@/lib/supabase/server';
import type { MessageJob, MessageTemplate, MessageChannel } from '@/lib/mail/types';
import type { SegmentationConfig } from '../mail/segmentation';
import { buildSegmentQuery } from '../mail/segmentation';

/**
 * Get all message jobs for an event
 */
export async function getMessageJobs(
  eventId: string,
  options?: { page?: number; pageSize?: number }
): Promise<{ data: MessageJob[]; total: number; error?: string }> {
  try {
    const supabase = await createClient();
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 50;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('message_jobs')
      .select('*', { count: 'exact' })
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return {
        data: [],
        total: 0,
        error: `Failed to fetch message jobs: ${error.message}`,
      };
    }

    return {
      data: (data || []) as MessageJob[],
      total: count ?? 0,
    };
  } catch (err) {
    return {
      data: [],
      total: 0,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get a single message job by ID
 */
export async function getMessageJob(id: string): Promise<{ data?: MessageJob; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('message_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { error: `Failed to fetch message job: ${error.message}` };
    }

    if (!data) {
      return { error: 'Message job not found' };
    }

    return { data: data as MessageJob };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get message templates for an event
 */
export async function getMessageTemplates(
  eventId: string,
  channel?: MessageChannel
): Promise<{ data: MessageTemplate[]; error?: string }> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('message_templates')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (channel) {
      query = query.eq('channel', channel);
    }

    const { data, error } = await query;

    if (error) {
      return {
        data: [],
        error: `Failed to fetch message templates: ${error.message}`,
      };
    }

    return { data: (data || []) as MessageTemplate[] };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get a single message template by ID
 */
export async function getMessageTemplate(id: string): Promise<{ data?: MessageTemplate; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { error: `Failed to fetch message template: ${error.message}` };
    }

    if (!data) {
      return { error: 'Message template not found' };
    }

    return { data: data as MessageTemplate };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get participants for a message job based on segmentation
 */
export async function getParticipantsForMessageJob(
  eventId: string,
  segmentation: SegmentationConfig
): Promise<{ id: string; phone: string; name: string; company: string | null }[]> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('event_participants')
      .select('id, phone, name, company')
      .eq('event_id', eventId)
      .eq('is_active', true);

    // Apply segmentation rules manually (similar to buildSegmentQuery)
    for (const rule of segmentation.rules) {
      switch (rule.type) {
        case 'all':
          break;
        case 'registered_only':
          query = query.eq('status', 'registered');
          break;
        case 'invited_only':
          query = query.eq('status', 'invited');
          break;
        case 'vip_only':
          query = query.eq('is_vip', true);
          break;
        case 'company':
          if (rule.values && rule.values.length > 0) {
            query = query.in('company', rule.values);
          }
          break;
        case 'language':
          if (rule.values && rule.values.length > 0) {
            query = query.in('language', rule.values);
          }
          break;
        default:
          break;
      }
    }

    const { data: participants } = await query;

    if (!participants) {
      return [];
    }

    return participants.map((p: any) => ({
      id: p.id,
      phone: p.phone || '',
      name: p.name || '',
      company: p.company || null,
    }));
  } catch (err) {
    console.error('Error in getParticipantsForMessageJob:', err);
    return [];
  }
}

/**
 * Create a message job
 */
export async function createMessageJob(input: {
  event_id: string;
  template_id: string;
  channel: MessageChannel;
  segmentation: SegmentationConfig;
  total_count: number;
}): Promise<{ data?: MessageJob; error?: string }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('message_jobs')
      .insert({
        event_id: input.event_id,
        template_id: input.template_id,
        channel: input.channel,
        segmentation: input.segmentation as any,
        total_count: input.total_count,
        processed_count: 0,
        success_count: 0,
        fail_count: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      return { error: `Failed to create message job: ${error.message}` };
    }

    return { data: data as MessageJob };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Update message job status and counts
 */
export async function updateMessageJobStatus(
  jobId: string,
  updates: {
    status?: MessageJob['status'];
    processed_count?: number;
    success_count?: number;
    fail_count?: number;
  }
): Promise<void> {
  try {
    const supabase = await createClient();
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (updates.status) payload.status = updates.status;
    if (updates.processed_count !== undefined) payload.processed_count = updates.processed_count;
    if (updates.success_count !== undefined) payload.success_count = updates.success_count;
    if (updates.fail_count !== undefined) payload.fail_count = updates.fail_count;

    await supabase.from('message_jobs').update(payload).eq('id', jobId);
  } catch (err) {
    console.error('Error updating message job status:', err);
  }
}

/**
 * Write a message log entry
 */
export async function writeMessageLog(input: {
  job_id: string;
  participant_id: string | null;
  phone: string;
  status: 'success' | 'failed';
  error_message?: string | null;
}): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from('message_logs').insert({
      job_id: input.job_id,
      participant_id: input.participant_id,
      phone: input.phone,
      status: input.status,
      error_message: input.error_message || null,
      sent_at: input.status === 'success' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error writing message log:', err);
  }
}

/**
 * Get the next pending message job
 */
export async function getNextPendingMessageJob(): Promise<MessageJob | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('message_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching next message job:', error);
      return null;
    }

    return (data as MessageJob) || null;
  } catch (err) {
    console.error('Error in getNextPendingMessageJob:', err);
    return null;
  }
}

