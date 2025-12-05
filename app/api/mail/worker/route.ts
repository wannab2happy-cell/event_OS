import { NextRequest, NextResponse } from 'next/server';
import { getNextJob, processJob } from '@/lib/mail/worker';
import { createErrorResponse } from '@/lib/api/handleError';

/**
 * Email Job Worker API Route
 * 
 * Processes pending email jobs:
 * - Finds next pending job
 * - Processes it (sends emails, logs results)
 * - Updates job status
 * 
 * Can be triggered:
 * - Manually via POST request
 * - Scheduled via cron job
 * - Polled periodically
 * 
 * Security: Protected by CRON_SECRET in production
 */
export async function POST(request: NextRequest) {
  try {
    // Verify CRON_SECRET if set (production)
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (token !== cronSecret) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // Get next pending job
    const job = await getNextJob();

    if (!job) {
      return NextResponse.json({
        success: true,
        message: 'No pending jobs found',
        processed: false,
      });
    }

    // Process the job
    const result = await processJob(job);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Job ${job.id} processed successfully`,
        jobId: job.id,
        processed: true,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `Job ${job.id} failed: ${result.error}`,
          jobId: job.id,
          processed: true,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('Worker error:', err);
    return createErrorResponse(err);
  }
}

/**
 * GET endpoint for health check or manual trigger
 */
export async function GET(request: NextRequest) {
  try {
    const job = await getNextJob();

    if (!job) {
      return NextResponse.json({
        success: true,
        message: 'No pending jobs found',
        hasJob: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Found pending job: ${job.id}`,
      hasJob: true,
      jobId: job.id,
      totalCount: job.total_count,
    });
  } catch (err) {
    return createErrorResponse(err);
  }
}

