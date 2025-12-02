'use server';

import { createEmailJob } from '@/lib/mail/api';
import type { CreateEmailJobInput, ApiResponse, EmailJob } from '@/lib/mail/types';
import { revalidatePath } from 'next/cache';

export async function createJob(input: CreateEmailJobInput): Promise<ApiResponse<EmailJob>> {
  const result = await createEmailJob(input);

  if (result.data) {
    // Revalidate the mail center page
    revalidatePath(`/admin/events/${input.event_id}/mail`);
    revalidatePath(`/admin/events/${input.event_id}/mail/jobs`);
  }

  return result;
}

