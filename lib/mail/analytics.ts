/**
 * Email Analytics Library
 * 
 * Provides data aggregation functions for email campaign analytics
 */

import { createClient } from '@/lib/supabase/server';
import type {
  EmailAnalytics,
  JobGroupStats,
  SegmentationBreakdown,
  FailureReasonStats,
  TimeSeriesPoint,
  ABTestResult,
  ABTestVariant,
} from './types';

/**
 * Get overall email statistics for an event
 */
export async function getEventEmailStats(eventId: string): Promise<EmailAnalytics> {
  try {
    const supabase = await createClient();

    // Get all jobs for this event
    const { data: jobs, error: jobsError } = await supabase
      .from('email_jobs')
      .select('id, success_count, fail_count, processed_count, created_at')
      .eq('event_id', eventId);

    if (jobsError || !jobs) {
      return {
        totalJobs: 0,
        totalEmailsSent: 0,
        totalSuccess: 0,
        totalFailed: 0,
        last24hStats: { success: 0, failed: 0 },
      };
    }

    const totalJobs = jobs.length;
    const totalSuccess = jobs.reduce((sum, job) => sum + (job.success_count || 0), 0);
    const totalFailed = jobs.reduce((sum, job) => sum + (job.fail_count || 0), 0);
    const totalEmailsSent = totalSuccess + totalFailed;

    // Get last 24h stats from logs
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const jobIds = jobs.map((j) => j.id);
    if (jobIds.length === 0) {
      return {
        totalJobs,
        totalEmailsSent,
        totalSuccess,
        totalFailed,
        last24hStats: { success: 0, failed: 0 },
      };
    }

    const { data: recentLogs } = await supabase
      .from('email_logs')
      .select('status')
      .in('job_id', jobIds)
      .gte('created_at', oneDayAgo.toISOString());

    const last24hSuccess = (recentLogs || []).filter((log) => log.status === 'success').length;
    const last24hFailed = (recentLogs || []).filter((log) => log.status === 'failed').length;

    return {
      totalJobs,
      totalEmailsSent,
      totalSuccess,
      totalFailed,
      last24hStats: {
        success: last24hSuccess,
        failed: last24hFailed,
      },
    };
  } catch (err) {
    console.error('Error in getEventEmailStats:', err);
    return {
      totalJobs: 0,
      totalEmailsSent: 0,
      totalSuccess: 0,
      totalFailed: 0,
      last24hStats: { success: 0, failed: 0 },
    };
  }
}

/**
 * Get performance stats grouped by job
 */
export async function getJobGroupStats(eventId: string): Promise<JobGroupStats[]> {
  try {
    const supabase = await createClient();

    // Get all jobs with template names
    const { data: jobs, error: jobsError } = await supabase
      .from('email_jobs')
      .select('id, template_id, processed_count, success_count, fail_count, created_at, segmentation')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (jobsError || !jobs || jobs.length === 0) {
      return [];
    }

    // Get template names
    const templateIds = [...new Set(jobs.map((j) => j.template_id))];
    const { data: templates } = await supabase
      .from('email_templates')
      .select('id, name')
      .in('id', templateIds);

    const templateMap = new Map<string, string>();
    templates?.forEach((t) => {
      templateMap.set(t.id, t.name);
    });

    // Build job stats
    const jobStats: JobGroupStats[] = jobs.map((job) => {
      const total = job.processed_count || 0;
      const success = job.success_count || 0;
      const failed = job.fail_count || 0;
      const successRate = total > 0 ? (success / total) * 100 : 0;

      // Build segmentation summary
      let segmentationSummary = 'All';
      if (job.segmentation && typeof job.segmentation === 'object' && 'rules' in job.segmentation) {
        const seg = job.segmentation as any;
        if (seg.rules && Array.isArray(seg.rules) && seg.rules.length > 0) {
          const rule = seg.rules[0];
          if (rule.type === 'registered_only') segmentationSummary = 'Registered Only';
          else if (rule.type === 'vip_only') segmentationSummary = 'VIP Only';
          else if (rule.type === 'company' && rule.values) {
            segmentationSummary = `${rule.values.length} Companies`;
          } else if (rule.type === 'language' && rule.values) {
            segmentationSummary = `Language: ${rule.values.join(', ')}`;
          }
        }
      }

      return {
        jobId: job.id,
        jobName: templateMap.get(job.template_id) || `Job #${job.id.slice(0, 8)}`,
        templateName: templateMap.get(job.template_id),
        processed_count: total,
        success_count: success,
        failed_count: failed,
        success_rate: successRate,
        segmentationSummary,
        created_at: job.created_at,
      };
    });

    return jobStats;
  } catch (err) {
    console.error('Error in getJobGroupStats:', err);
    return [];
  }
}

/**
 * Get segmentation breakdown statistics
 */
export async function getSegmentationBreakdown(eventId: string): Promise<SegmentationBreakdown> {
  try {
    const supabase = await createClient();

    // Get all jobs for this event
    const { data: jobs } = await supabase
      .from('email_jobs')
      .select('id, segmentation')
      .eq('event_id', eventId);

    if (!jobs || jobs.length === 0) {
      return {};
    }

    const jobIds = jobs.map((j) => j.id);

    // Get all logs for these jobs
    const { data: logs } = await supabase
      .from('email_logs')
      .select('id, participant_id, status')
      .in('job_id', jobIds);

    if (!logs || logs.length === 0) {
      return {};
    }

    // Get participant details for segmentation
    const participantIds = [...new Set(logs.map((l) => l.participant_id).filter(Boolean))] as string[];
    
    if (participantIds.length === 0) {
      return {};
    }

    const { data: participants } = await supabase
      .from('event_participants')
      .select('id, company, is_vip, language')
      .in('id', participantIds)
      .eq('event_id', eventId);

    if (!participants) {
      return {};
    }

    // Build participant map
    const participantMap = new Map<string, typeof participants[0]>();
    participants.forEach((p) => {
      participantMap.set(p.id, p);
    });

    // Group logs by segmentation criteria
    const companyStats = new Map<string, { success: number; failed: number }>();
    let vipSuccess = 0;
    let vipFailed = 0;
    let nonVipSuccess = 0;
    let nonVipFailed = 0;

    logs.forEach((log) => {
      const participant = log.participant_id ? participantMap.get(log.participant_id) : null;
      if (!participant) return;

      const isSuccess = log.status === 'success';

      // Company breakdown
      if (participant.company) {
        const stats = companyStats.get(participant.company) || { success: 0, failed: 0 };
        if (isSuccess) stats.success++;
        else stats.failed++;
        companyStats.set(participant.company, stats);
      }

      // VIP breakdown
      if (participant.is_vip) {
        if (isSuccess) vipSuccess++;
        else vipFailed++;
      } else {
        if (isSuccess) nonVipSuccess++;
        else nonVipFailed++;
      }
    });

    const breakdown: SegmentationBreakdown = {};

    // Company breakdown
    if (companyStats.size > 0) {
      breakdown.company = Array.from(companyStats.entries())
        .map(([company, stats]) => ({
          company,
          success_count: stats.success,
          failed_count: stats.failed,
          total: stats.success + stats.failed,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10); // Top 10 companies
    }

    // VIP breakdown
    breakdown.vip = {
      vip: {
        success_count: vipSuccess,
        failed_count: vipFailed,
        total: vipSuccess + vipFailed,
      },
      nonVip: {
        success_count: nonVipSuccess,
        failed_count: nonVipFailed,
        total: nonVipSuccess + nonVipFailed,
      },
    };

    // Language breakdown - not available in current schema, skip for now

    return breakdown;
  } catch (err) {
    console.error('Error in getSegmentationBreakdown:', err);
    return {};
  }
}

/**
 * Get failure reasons grouped by error type
 */
export async function getFailureReasons(eventId: string): Promise<FailureReasonStats[]> {
  try {
    const supabase = await createClient();

    // Get all jobs for this event
    const { data: jobs } = await supabase
      .from('email_jobs')
      .select('id')
      .eq('event_id', eventId);

    if (!jobs || jobs.length === 0) {
      return [];
    }

    const jobIds = jobs.map((j) => j.id);

    // Get failed logs
    const { data: failedLogs } = await supabase
      .from('email_logs')
      .select('error_message')
      .in('job_id', jobIds)
      .eq('status', 'failed')
      .not('error_message', 'is', null);

    if (!failedLogs || failedLogs.length === 0) {
      return [];
    }

    // Group by error reason
    const reasonGroups = new Map<string, number>();

    failedLogs.forEach((log) => {
      const errorMsg = (log.error_message || '').toLowerCase();
      let reason = 'unknown';

      if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
        reason = 'timeout';
      } else if (errorMsg.includes('invalid') || errorMsg.includes('malformed')) {
        reason = 'invalid_email';
      } else if (errorMsg.includes('blocked') || errorMsg.includes('bounce') || errorMsg.includes('rejected')) {
        reason = 'blocked';
      } else if (errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
        reason = 'rate_limit';
      } else if (errorMsg.includes('api') || errorMsg.includes('key')) {
        reason = 'api_error';
      } else if (errorMsg.trim()) {
        reason = 'other';
      }

      reasonGroups.set(reason, (reasonGroups.get(reason) || 0) + 1);
    });

    const total = failedLogs.length;
    const stats: FailureReasonStats[] = Array.from(reasonGroups.entries())
      .map(([reason, count]) => ({
        reason,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    return stats;
  } catch (err) {
    console.error('Error in getFailureReasons:', err);
    return [];
  }
}

/**
 * Get time series data (hourly)
 */
export async function getTimeSeries(eventId: string, days: number = 7): Promise<TimeSeriesPoint[]> {
  try {
    const supabase = await createClient();

    // Get all jobs for this event
    const { data: jobs } = await supabase
      .from('email_jobs')
      .select('id, created_at')
      .eq('event_id', eventId);

    if (!jobs || jobs.length === 0) {
      return [];
    }

    const jobIds = jobs.map((j) => j.id);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get logs within date range
    const { data: logs } = await supabase
      .from('email_logs')
      .select('status, created_at')
      .in('job_id', jobIds)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (!logs || logs.length === 0) {
      return [];
    }

    // Group by hour
    const hourlyStats = new Map<string, { sent: number; success: number; failed: number }>();

    logs.forEach((log) => {
      const date = new Date(log.created_at);
      const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;

      const stats = hourlyStats.get(hourKey) || { sent: 0, success: 0, failed: 0 };
      stats.sent++;
      if (log.status === 'success') {
        stats.success++;
      } else {
        stats.failed++;
      }
      hourlyStats.set(hourKey, stats);
    });

    // Convert to array and sort by hour
    const timeSeries: TimeSeriesPoint[] = Array.from(hourlyStats.entries())
      .map(([hour, stats]) => ({
        hour,
        sent: stats.sent,
        success: stats.success,
        failed: stats.failed,
      }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    return timeSeries;
  } catch (err) {
    console.error('Error in getTimeSeries:', err);
    return [];
  }
}

// ============================================
// A/B TEST ANALYTICS
// ============================================

/**
 * Get A/B test results
 */
export async function getABTestResults(testId: string): Promise<ABTestResult[]> {
  try {
    const supabase = await createClient();

    // Get test details
    const { data: test } = await supabase
      .from('email_ab_tests')
      .select('variants')
      .eq('id', testId)
      .single();

    if (!test) {
      return [];
    }

    // Get assignments
    const { data: assignments } = await supabase
      .from('email_ab_assignments')
      .select('variant_index, job_id')
      .eq('test_id', testId)
      .not('job_id', 'is', null);

    if (!assignments || assignments.length === 0) {
      return [];
    }

    // Group assignments by variant_index
    const variantJobMap = new Map<number, string[]>();
    for (const assignment of assignments) {
      if (!variantJobMap.has(assignment.variant_index)) {
        variantJobMap.set(assignment.variant_index, []);
      }
      variantJobMap.get(assignment.variant_index)!.push(assignment.job_id);
    }

    // Get template names
    const variantTemplateIds = (test.variants as ABTestVariant[]).map((v) => v.template_id);
    const { data: templates } = await supabase
      .from('email_templates')
      .select('id, name')
      .in('id', variantTemplateIds);

    const templateMap = new Map<string, string>();
    templates?.forEach((t) => {
      templateMap.set(t.id, t.name);
    });

    // Get results for each variant
    const results: ABTestResult[] = [];

    for (const [variantIndex, jobIds] of variantJobMap.entries()) {
      const variant = (test.variants as ABTestVariant[])[variantIndex];
      if (!variant) continue;

      // Get logs for all jobs of this variant
      const { data: logs } = await supabase
        .from('email_logs')
        .select('status')
        .in('job_id', jobIds);

      if (!logs) continue;

      const successCount = logs.filter((log) => log.status === 'success').length;
      const failCount = logs.filter((log) => log.status === 'failed').length;
      const total = logs.length;
      const successRate = total > 0 ? (successCount / total) * 100 : 0;
      const failRate = total > 0 ? (failCount / total) * 100 : 0;

      const variantLabel = String.fromCharCode(65 + variantIndex); // A, B, C

      results.push({
        variantIndex,
        variantLabel,
        templateId: variant.template_id,
        templateName: templateMap.get(variant.template_id),
        successCount,
        failCount,
        total,
        successRate,
        failRate,
      });
    }

    return results.sort((a, b) => a.variantIndex - b.variantIndex);
  } catch (err) {
    console.error('Error in getABTestResults:', err);
    return [];
  }
}

