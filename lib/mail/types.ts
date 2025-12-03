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
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'failed_manual' | 'stopped';
  total_count: number;
  processed_count: number;
  success_count: number;
  fail_count: number;
  created_at: string;
  updated_at: string;
  segmentation?: Record<string, any>; // JSONB field for segmentation rules
}

export interface EmailLog {
  id: string;
  job_id: string;
  participant_id: string | null;
  email: string;
  status: 'success' | 'failed';
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

export type JobLogFilter = 'all' | 'success' | 'failed';

// ============================================
// EMAIL ANALYTICS
// ============================================

export interface EmailAnalytics {
  totalJobs: number;
  totalEmailsSent: number;
  totalSuccess: number;
  totalFailed: number;
  last24hStats: {
    success: number;
    failed: number;
  };
}

export interface JobGroupStats {
  jobId: string;
  jobName: string;
  templateName?: string;
  processed_count: number;
  success_count: number;
  failed_count: number;
  success_rate: number;
  segmentationSummary: string;
  created_at: string;
}

export interface SegmentationBreakdown {
  company?: Array<{
    company: string;
    success_count: number;
    failed_count: number;
    total: number;
  }>;
  vip?: {
    vip: { success_count: number; failed_count: number; total: number };
    nonVip: { success_count: number; failed_count: number; total: number };
  };
  language?: Array<{
    language: string;
    success_count: number;
    failed_count: number;
    total: number;
  }>;
}

export interface FailureReasonStats {
  reason: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesPoint {
  hour: string; // ISO timestamp or hour label
  sent: number;
  success: number;
  failed: number;
}

// ============================================
// EMAIL FOLLOW-UPS
// ============================================

export type FollowUpTriggerType = 'on_fail' | 'on_success' | 'after_hours';

export interface EmailFollowUp {
  id: string;
  event_id: string;
  name: string;
  template_id: string;
  base_job_id: string;
  trigger_type: FollowUpTriggerType;
  delay_hours: number | null;
  segmentation: Record<string, any> | null;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// EMAIL A/B TESTING
// ============================================

export type ABTestStatus = 'draft' | 'running' | 'completed';

export interface ABTestVariant {
  template_id: string;
  weight: number; // Percentage (0-100)
}

export interface EmailABTest {
  id: string;
  event_id: string;
  name: string;
  variants: ABTestVariant[]; // JSONB array
  segmentation: Record<string, any> | null;
  status: ABTestStatus;
  created_at: string;
  updated_at: string;
}

export interface ABTestAssignment {
  id: string;
  test_id: string;
  participant_id: string;
  variant_index: number; // 0=A, 1=B, 2=C
  job_id: string; // email_job created for this variant
  created_at: string;
}

export interface ABTestResult {
  variantIndex: number;
  variantLabel: string;
  templateId: string;
  templateName?: string;
  successCount: number;
  failCount: number;
  total: number;
  successRate: number;
  failRate: number;
}

// ============================================
// MULTI-CHANNEL MESSAGING (SMS / KAKAO)
// ============================================

export type MessageChannel = 'sms' | 'kakao';

export interface MessageTemplate {
  id: string;
  event_id: string;
  name: string;
  body: string;
  channel: MessageChannel;
  created_at: string;
  updated_at: string;
}

export interface MessageJob {
  id: string;
  event_id: string;
  template_id: string;
  channel: MessageChannel;
  segmentation: Record<string, any> | null;
  total_count: number;
  processed_count: number;
  success_count: number;
  fail_count: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface MessageLog {
  id: string;
  job_id: string;
  participant_id: string | null;
  phone: string;
  status: 'success' | 'failed';
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

export type AutomationType = 'time_based' | 'event_based';
export type AutomationTimeType = 'absolute' | 'relative';
export type AutomationTriggerKind = 'on_registration_completed' | 'on_table_assigned';

export interface EmailAutomation {
  id: string;
  event_id: string;
  template_id: string;
  name: string;
  type: AutomationType;
  time_type: AutomationTimeType | null;
  send_at: string | null; // ISO timestamp for absolute time
  relative_days: number | null; // e.g. -3 = 3 days before event.start_date
  trigger_kind: AutomationTriggerKind | null;
  segmentation: Record<string, any> | null; // Same format as email_jobs.segmentation
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
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
