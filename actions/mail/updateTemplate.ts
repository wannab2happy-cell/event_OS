'use server';

import { updateEmailTemplate, getEmailTemplate } from '@/lib/mail/api';
import type { UpdateEmailTemplateInput, ApiResponse, EmailTemplate } from '@/lib/mail/types';
import { revalidatePath } from 'next/cache';

export async function updateTemplate(
  templateId: string,
  input: UpdateEmailTemplateInput
): Promise<ApiResponse<EmailTemplate>> {
  // First, get the template to find event_id for revalidation
  const templateResult = await getEmailTemplate(templateId);
  if (templateResult.error || !templateResult.data) {
    return { error: templateResult.error ?? 'Template not found' };
  }

  const result = await updateEmailTemplate(templateId, input);

  if (result.data) {
    // Revalidate the mail center page
    revalidatePath(`/admin/events/${templateResult.data.event_id}/mail`);
  }

  return result;
}

