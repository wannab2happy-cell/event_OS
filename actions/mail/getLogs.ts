'use server';

import { getEmailLogs } from '@/lib/mail/api';
import type { PaginationOptions, PaginatedResponse, EmailLog } from '@/lib/mail/types';

export async function getLogs(
  jobId: string,
  options?: PaginationOptions
): Promise<PaginatedResponse<EmailLog>> {
  return await getEmailLogs(jobId, options);
}

