/**
 * Job Utility Functions
 * 
 * Helper functions for computing job metrics and grouping logs
 */

import type { EmailJob, EmailLog } from './types';

/**
 * Compute open rate for a job
 */
export function computeOpenRate(job: EmailJob, logs: EmailLog[]): number {
  const jobLogs = logs.filter((log) => log.job_id === job.id);
  const openedCount = jobLogs.filter((log) => log.status === 'success').length;
  const totalSent = job.success_count;
  
  if (totalSent === 0) return 0;
  return Math.round((openedCount / totalSent) * 100);
}

/**
 * Compute bounce rate for a job
 */
export function computeBounceRate(job: EmailJob, logs: EmailLog[]): number {
  const jobLogs = logs.filter((log) => log.job_id === job.id);
  const bouncedCount = jobLogs.filter(
    (log) => log.status === 'failed' && log.error_message?.toLowerCase().includes('bounce')
  ).length;
  const totalSent = job.success_count;
  
  if (totalSent === 0) return 0;
  return Math.round((bouncedCount / totalSent) * 100);
}

/**
 * Group logs by job ID
 */
export function groupLogsByJobId(logs: EmailLog[]): Map<string, EmailLog[]> {
  const grouped = new Map<string, EmailLog[]>();
  
  for (const log of logs) {
    if (!grouped.has(log.job_id)) {
      grouped.set(log.job_id, []);
    }
    grouped.get(log.job_id)!.push(log);
  }
  
  return grouped;
}

/**
 * Get job statistics
 */
export interface JobStatistics {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  bounced: number;
  failed: number;
  openRate: number;
  bounceRate: number;
}

export function getJobStatistics(job: EmailJob, logs: EmailLog[]): JobStatistics {
  const jobLogs = logs.filter((log) => log.job_id === job.id);
  const sent = job.success_count;
  const delivered = sent; // Assuming success means delivered
  const opened = jobLogs.filter((log) => log.status === 'success').length;
  const bounced = jobLogs.filter(
    (log) => log.status === 'failed' && log.error_message?.toLowerCase().includes('bounce')
  ).length;
  const failed = job.fail_count;
  
  return {
    total: job.total_count,
    sent,
    delivered,
    opened,
    bounced,
    failed,
    openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
    bounceRate: sent > 0 ? Math.round((bounced / sent) * 100) : 0,
  };
}

