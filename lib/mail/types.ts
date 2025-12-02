/**
 * Mail Center Type Definitions
 * 
 * TypeScript interfaces for email_templates, email_jobs, and email_logs tables
 */

export interface EmailTemplate {
  id: string;
  event_id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  merge_variables: string[]; // e.g. ["name", "tableName", "company"]
  created_at: string;
  updated_at: string;
}

export interface EmailJob {
  id: string;
  event_id: string;
  template_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_count: number;
  success_count: number;
  fail_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  job_id: string;
  participant_id: string | null;
  email: string;
  status: 'success' | 'failed';
  error_message: string | null;
  sent_at: string | null;
}

/**
 * Create EmailTemplate input (without id, timestamps)
 */
export interface CreateEmailTemplateInput {
  event_id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text?: string | null;
  merge_variables?: string[];
}

/**
 * Update EmailTemplate input (all fields optional except id)
 */
export interface UpdateEmailTemplateInput {
  name?: string;
  subject?: string;
  body_html?: string;
  body_text?: string | null;
  merge_variables?: string[];
}

/**
 * Create EmailJob input
 */
export interface CreateEmailJobInput {
  event_id: string;
  template_id: string;
  filter_options?: {
    participant_ids?: string[];
    status?: string[];
    is_vip?: boolean;
    company?: string;
  };
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  error?: string;
}

