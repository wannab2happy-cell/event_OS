/**
 * Worker Processor
 * 
 * Processes jobs from the queue with retry logic, timeouts, and rate limiting
 */

import { getNextJob, markJobDone, markJobFailed, type QueueJob } from './queue';

export interface ProcessorOptions {
  retryLimit?: number;
  timeoutMs?: number;
  rateLimitDelayMs?: number;
}

const DEFAULT_OPTIONS: Required<ProcessorOptions> = {
  retryLimit: 3,
  timeoutMs: 300000, // 5 minutes
  rateLimitDelayMs: 100,
};

/**
 * Process a single job with timeout and error handling
 */
export async function processJob(
  job: QueueJob,
  handler: (payload: Record<string, any>) => Promise<{ success: boolean; error?: string }>,
  options?: ProcessorOptions
): Promise<{ success: boolean; error?: string }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Check retry limit
  if (job.retry_count >= opts.retryLimit) {
    await markJobFailed(job.id, 'Maximum retry limit reached');
    return { success: false, error: 'Maximum retry limit reached' };
  }

  // Create timeout promise
  const timeoutPromise = new Promise<{ success: boolean; error: string }>((resolve) => {
    setTimeout(() => {
      resolve({ success: false, error: 'Job processing timeout' });
    }, opts.timeoutMs);
  });

  // Process job with timeout
  try {
    const result = await Promise.race([
      handler(job.payload),
      timeoutPromise,
    ]);

    if (result.success) {
      await markJobDone(job.id);
      return { success: true };
    } else {
      await markJobFailed(job.id, result.error || 'Job processing failed');
      return result;
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    await markJobFailed(job.id, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Process jobs from queue with rate limiting
 */
export async function processQueue(
  type: string,
  handler: (payload: Record<string, any>) => Promise<{ success: boolean; error?: string }>,
  options?: ProcessorOptions & { maxJobs?: number }
): Promise<{ processed: number; failed: number }> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let processed = 0;
  let failed = 0;
  const maxJobs = options?.maxJobs ?? 10;

  for (let i = 0; i < maxJobs; i++) {
    const job = await getNextJob(type);

    if (!job) {
      break; // No more jobs
    }

    const result = await processJob(job, handler, opts);

    if (result.success) {
      processed++;
    } else {
      failed++;
    }

    // Rate limiting: wait between jobs
    if (i < maxJobs - 1 && opts.rateLimitDelayMs > 0) {
      await sleep(opts.rateLimitDelayMs);
    }
  }

  return { processed, failed };
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

