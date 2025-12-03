/**
 * Mail Center Supabase CRUD Utilities
 * 
 * Provides type-safe functions for interacting with email_templates, email_jobs, and email_logs tables
 */

import { createClient } from '@/lib/supabase/server';
import type {
  EmailTemplate,
  EmailJob,
  EmailLog,
  EmailAutomation,
  CreateEmailTemplateInput,
  UpdateEmailTemplateInput,
  CreateEmailJobInput,
  PaginationOptions,
  ApiResponse,
  PaginatedResponse,
} from './types';

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Get all email templates for an event
 */
export async function getEmailTemplates(
  eventId: string,
  options?: PaginationOptions
): Promise<PaginatedResponse<EmailTemplate>> {
  try {
    const supabase = await createClient();
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 50;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('email_templates')
      .select('id, event_id, name, subject, body_html, body_text, merge_variables, created_at, updated_at', {
        count: 'exact',
      })
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
        error: `Failed to fetch templates: ${error.message}`,
      };
    }

    const total = count ?? 0;
    const hasMore = (page + 1) * pageSize < total;

    return {
      data: (data || []) as EmailTemplate[],
      total,
      page,
      pageSize,
      hasMore,
    };
  } catch (err) {
    return {
      data: [],
      total: 0,
      page: options?.page ?? 0,
      pageSize: options?.pageSize ?? 50,
      hasMore: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get a single email template by ID
 */
export async function getEmailTemplate(id: string): Promise<ApiResponse<EmailTemplate>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('email_templates')
      .select('id, event_id, name, subject, body_html, body_text, merge_variables, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) {
      return { error: `Failed to fetch template: ${error.message}` };
    }

    if (!data) {
      return { error: 'Template not found' };
    }

    return { data: data as EmailTemplate };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Create a new email template
 */
export async function createEmailTemplate(
  input: CreateEmailTemplateInput
): Promise<ApiResponse<EmailTemplate>> {
  try {
    const supabase = await createClient();

    const payload = {
      event_id: input.event_id,
      name: input.name,
      subject: input.subject,
      body_html: input.body_html,
      body_text: input.body_text ?? null,
      merge_variables: input.merge_variables ?? [],
    };

    const { data, error } = await supabase
      .from('email_templates')
      .insert(payload)
      .select('id, event_id, name, subject, body_html, body_text, merge_variables, created_at, updated_at')
      .single();

    if (error) {
      return { error: `Failed to create template: ${error.message}` };
    }

    return { data: data as EmailTemplate };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Update an existing email template
 */
export async function updateEmailTemplate(
  id: string,
  input: UpdateEmailTemplateInput
): Promise<ApiResponse<EmailTemplate>> {
  try {
    const supabase = await createClient();

    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.subject !== undefined) payload.subject = input.subject;
    if (input.body_html !== undefined) payload.body_html = input.body_html;
    if (input.body_text !== undefined) payload.body_text = input.body_text;
    if (input.merge_variables !== undefined) payload.merge_variables = input.merge_variables;

    // Update updated_at timestamp
    payload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('email_templates')
      .update(payload)
      .eq('id', id)
      .select('id, event_id, name, subject, body_html, body_text, merge_variables, created_at, updated_at')
      .single();

    if (error) {
      return { error: `Failed to update template: ${error.message}` };
    }

    if (!data) {
      return { error: 'Template not found' };
    }

    return { data: data as EmailTemplate };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete an email template
 */
export async function deleteEmailTemplate(id: string): Promise<ApiResponse<void>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('email_templates').delete().eq('id', id);

    if (error) {
      return { error: `Failed to delete template: ${error.message}` };
    }

    return {};
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

// ============================================
// EMAIL JOBS
// ============================================

/**
 * Create a new email job
 */
export async function createEmailJob(
  input: CreateEmailJobInput
): Promise<ApiResponse<EmailJob>> {
  try {
    const supabase = await createClient();

    // Calculate total_count based on filter_options
    let totalCount = 0;
    if (input.filter_options) {
      let query = supabase
        .from('event_participants')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', input.event_id)
        .eq('is_active', true);

      if (input.filter_options.participant_ids?.length) {
        query = query.in('id', input.filter_options.participant_ids);
      }
      if (input.filter_options.status?.length) {
        query = query.in('status', input.filter_options.status);
      }
      if (input.filter_options.is_vip !== undefined) {
        query = query.eq('is_vip', input.filter_options.is_vip);
      }
      if (input.filter_options.company) {
        query = query.eq('company', input.filter_options.company);
      }

      const { count, error: countError } = await query;
      if (countError) {
        return { error: `Failed to calculate total count: ${countError.message}` };
      }
      totalCount = count ?? 0;
    } else {
      // No filter - count all active participants
      const { count, error: countError } = await supabase
        .from('event_participants')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', input.event_id)
        .eq('is_active', true);

      if (countError) {
        return { error: `Failed to calculate total count: ${countError.message}` };
      }
      totalCount = count ?? 0;
    }

    const payload = {
      event_id: input.event_id,
      template_id: input.template_id,
      status: 'pending' as const,
      total_count: totalCount,
      processed_count: 0,
      success_count: 0,
      fail_count: 0,
    };

    const { data, error } = await supabase
      .from('email_jobs')
      .insert(payload)
      .select('id, event_id, template_id, status, total_count, success_count, fail_count, created_at, updated_at')
      .single();

    if (error) {
      return { error: `Failed to create job: ${error.message}` };
    }

    return { data: data as EmailJob };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get all email jobs for an event
 */
export async function getEmailJobs(
  eventId: string,
  options?: PaginationOptions
): Promise<PaginatedResponse<EmailJob>> {
  try {
    const supabase = await createClient();
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 50;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('email_jobs')
      .select('id, event_id, template_id, status, total_count, processed_count, success_count, fail_count, created_at, updated_at, segmentation', {
        count: 'exact',
      })
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
        error: `Failed to fetch jobs: ${error.message}`,
      };
    }

    const total = count ?? 0;
    const hasMore = (page + 1) * pageSize < total;

    return {
      data: (data || []) as EmailJob[],
      total,
      page,
      pageSize,
      hasMore,
    };
  } catch (err) {
    return {
      data: [],
      total: 0,
      page: options?.page ?? 0,
      pageSize: options?.pageSize ?? 50,
      hasMore: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get a single email job by ID
 */
export async function getEmailJob(id: string): Promise<ApiResponse<EmailJob>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('email_jobs')
      .select('id, event_id, template_id, status, total_count, processed_count, success_count, fail_count, created_at, updated_at, segmentation')
      .eq('id', id)
      .single();

    if (error) {
      return { error: `Failed to fetch job: ${error.message}` };
    }

    if (!data) {
      return { error: 'Job not found' };
    }

    return { data: data as EmailJob };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

// ============================================
// EMAIL LOGS
// ============================================

/**
 * Get all email logs for a job
 */
export async function getEmailLogs(
  jobId: string,
  options?: PaginationOptions
): Promise<PaginatedResponse<EmailLog>> {
  try {
    const supabase = await createClient();
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 100;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('email_logs')
      .select('id, job_id, participant_id, email, status, error_message, sent_at', {
        count: 'exact',
      })
      .eq('job_id', jobId)
      .order('sent_at', { ascending: false, nullsFirst: false })
      .range(from, to);

    if (error) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
        error: `Failed to fetch logs: ${error.message}`,
      };
    }

    const total = count ?? 0;
    const hasMore = (page + 1) * pageSize < total;

    return {
      data: (data || []) as EmailLog[],
      total,
      page,
      pageSize,
      hasMore,
    };
  } catch (err) {
    return {
      data: [],
      total: 0,
      page: options?.page ?? 0,
      pageSize: options?.pageSize ?? 100,
      hasMore: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get a single email log by ID
 */
export async function getEmailLogDetail(id: string): Promise<ApiResponse<EmailLog>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('email_logs')
      .select('id, job_id, participant_id, email, status, error_message, sent_at')
      .eq('id', id)
      .single();

    if (error) {
      return { error: `Failed to fetch log: ${error.message}` };
    }

    if (!data) {
      return { error: 'Log not found' };
    }

    return { data: data as EmailLog };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get recent email logs for an event (across all jobs)
 */
export async function getRecentEmailLogs(
  eventId: string,
  limit: number = 20
): Promise<ApiResponse<EmailLog[]>> {
  try {
    const supabase = await createClient();

    // First, get all job IDs for this event
    const { data: jobs, error: jobsError } = await supabase
      .from('email_jobs')
      .select('id')
      .eq('event_id', eventId);

    if (jobsError) {
      return { error: `Failed to fetch jobs: ${jobsError.message}` };
    }

    if (!jobs || jobs.length === 0) {
      return { data: [] };
    }

    const jobIds = jobs.map((job) => job.id);

    // Then get logs for these jobs
    const { data, error } = await supabase
      .from('email_logs')
      .select('id, job_id, participant_id, email, status, error_message, sent_at')
      .in('job_id', jobIds)
      .order('sent_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      return { error: `Failed to fetch logs: ${error.message}` };
    }

    return { data: (data || []) as EmailLog[] };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

// ============================================
// EMAIL AUTOMATIONS
// ============================================

/**
 * Get all automations for an event
 */
export async function getAutomationsForEvent(eventId: string): Promise<ApiResponse<EmailAutomation[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('email_automations')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      return { error: `Failed to fetch automations: ${error.message}` };
    }

    return { data: (data || []) as EmailAutomation[] };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get a single automation by ID
 */
export async function getAutomationById(id: string): Promise<ApiResponse<EmailAutomation>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('email_automations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { error: `Failed to fetch automation: ${error.message}` };
    }

    if (!data) {
      return { error: 'Automation not found' };
    }

    return { data: data as EmailAutomation };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get email logs for a job with filtering and pagination
 */
export async function getEmailJobLogs(
  jobId: string,
  options?: {
    filter?: 'all' | 'success' | 'failed';
    page?: number;
    pageSize?: number;
    search?: string;
  }
): Promise<PaginatedResponse<EmailLog>> {
  try {
    const supabase = await createClient();
    const page = options?.page ?? 0;
    const pageSize = options?.pageSize ?? 20;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('email_logs')
      .select('id, job_id, participant_id, email, status, error_message, sent_at, created_at', {
        count: 'exact',
      })
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    // Apply filter
    if (options?.filter === 'success') {
      query = query.eq('status', 'success');
    } else if (options?.filter === 'failed') {
      query = query.eq('status', 'failed');
    }

    // Apply search (by email)
    if (options?.search) {
      query = query.ilike('email', `%${options.search}%`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
        error: `Failed to fetch logs: ${error.message}`,
      };
    }

    const total = count ?? 0;
    const hasMore = (page + 1) * pageSize < total;

    return {
      data: (data || []) as EmailLog[],
      total,
      page,
      pageSize,
      hasMore,
    };
  } catch (err) {
    return {
      data: [],
      total: 0,
      page: options?.page ?? 0,
      pageSize: options?.pageSize ?? 20,
      hasMore: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get detailed job information including template name
 */
export async function getEmailJobDetails(jobId: string): Promise<ApiResponse<EmailJob & { template_name?: string }>> {
  try {
    const supabase = await createClient();

    const { data: job, error: jobError } = await supabase
      .from('email_jobs')
      .select('id, event_id, template_id, status, total_count, processed_count, success_count, fail_count, created_at, updated_at, segmentation')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return { error: jobError?.message || 'Job not found' };
    }

    // Get template name
    const { data: template } = await supabase
      .from('email_templates')
      .select('name')
      .eq('id', job.template_id)
      .single();

    return {
      data: {
        ...(job as EmailJob),
        template_name: template?.name,
      },
    };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

