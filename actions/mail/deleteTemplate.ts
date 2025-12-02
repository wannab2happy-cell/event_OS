'use server';

import { deleteEmailTemplate, getEmailTemplate } from '@/lib/mail/api';
import type { ApiResponse } from '@/lib/mail/types';
import { revalidatePath } from 'next/cache';

export async function deleteTemplate(templateId: string): Promise<ApiResponse<void>> {
  // First, get the template to find event_id for revalidation
  const templateResult = await getEmailTemplate(templateId);
  if (templateResult.error || !templateResult.data) {
    return { error: templateResult.error ?? 'Template not found' };
  }

  const eventId = templateResult.data.event_id;
  const result = await deleteEmailTemplate(templateId);

  if (!result.error) {
    // Revalidate the mail center page
    revalidatePath(`/admin/events/${eventId}/mail`);
  }

  return result;
}

