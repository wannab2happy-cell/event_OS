/**
 * Worker Queue System
 * 
 * Unified job queue with idempotency support and deterministic status flow
 */

import { createClient } from '@/lib/supabase/server';

export type JobStatus = 'queued' | 'processing' | 'done' | 'failed';

export interface QueueJob {
  id: string;
  type: string;
  payload: Record<string, any>;
  status: JobStatus;
  idempotency_key?: string | null;
  retry_count: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
}

/**
 * Enqueue a new job with optional idempotency key
 */
export async function enqueueJob(params: {
  type: string;
  payload: Record<string, any>;
  idempotencyKey?: string;
  maxRetries?: number;
}): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Check for existing job with same idempotency key
    if (params.idempotencyKey) {
      const { data: existing } = await supabase
        .from('worker_jobs')
        .select('id, status')
        .eq('idempotency_key', params.idempotencyKey)
        .single();

      if (existing) {
        // Return existing job if it's still queued or processing
        if (existing.status === 'queued' || existing.status === 'processing') {
          return { success: true, jobId: existing.id };
        }
        // If done or failed, create new job (idempotency key allows retry)
      }
    }

    const { data, error } = await supabase
      .from('worker_jobs')
      .insert({
        type: params.type,
        payload: params.payload,
        status: 'queued',
        idempotency_key: params.idempotencyKey || null,
        retry_count: 0,
        max_retries: params.maxRetries ?? 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, jobId: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get next queued job (atomically claim it)
 */
export async function getNextJob(type?: string): Promise<QueueJob | null> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('worker_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return null;
    }

    // Atomically update status to processing
    const { error: updateError } = await supabase
      .from('worker_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)
      .eq('status', 'queued'); // Only update if still queued (prevent race condition)

    if (updateError) {
      // Another worker claimed it, return null
      return null;
    }

    return data as QueueJob;
  } catch (err) {
    console.error('Error getting next job:', err);
    return null;
  }
}

/**
 * Mark job as done
 */
export async function markJobDone(jobId: string): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase
      .from('worker_jobs')
      .update({
        status: 'done',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  } catch (err) {
    console.error('Error marking job done:', err);
  }
}

/**
 * Mark job as failed
 */
export async function markJobFailed(jobId: string, errorMessage: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: job } = await supabase
      .from('worker_jobs')
      .select('retry_count, max_retries')
      .eq('id', jobId)
      .single();

    if (!job) return;

    const shouldRetry = job.retry_count < job.max_retries;

    await supabase
      .from('worker_jobs')
      .update({
        status: shouldRetry ? 'queued' : 'failed',
        error_message: errorMessage,
        retry_count: job.retry_count + 1,
        updated_at: new Date().toISOString(),
        ...(shouldRetry ? {} : { completed_at: new Date().toISOString() }),
      })
      .eq('id', jobId);
  } catch (err) {
    console.error('Error marking job failed:', err);
  }
}

