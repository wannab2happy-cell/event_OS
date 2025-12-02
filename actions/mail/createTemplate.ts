'use server';

import { createEmailTemplate } from '@/lib/mail/api';
import type { CreateEmailTemplateInput, ApiResponse, EmailTemplate } from '@/lib/mail/types';
import { revalidatePath } from 'next/cache';

export async function createTemplate(
  input: CreateEmailTemplateInput
): Promise<ApiResponse<EmailTemplate>> {
  const result = await createEmailTemplate(input);

  if (result.data) {
    // Revalidate the mail center page
    revalidatePath(`/admin/events/${input.event_id}/mail`);
  }

  return result;
}

