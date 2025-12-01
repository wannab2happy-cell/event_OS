'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { EmailTemplate } from '@/lib/mail/types';

export async function createTemplate(data: {
  eventId: string;
  title: string;
  subject: string;
  bodyHtml: string;
  variables?: Record<string, any>;
}): Promise<EmailTemplate> {
  if (!data.title || !data.subject || !data.bodyHtml) {
    throw new Error('Missing required fields: title, subject, bodyHtml');
  }

  const { data: result, error } = await supabaseAdmin
    .from('email_templates')
    .insert({
      event_id: data.eventId,
      name: data.title,
      subject: data.subject,
      body_html: data.bodyHtml,
      variables: data.variables || {},
    })
    .select()
    .single();

  if (error) {
    console.error('Create template error:', error);
    throw new Error(`Failed to create template: ${error.message}`);
  }

  if (!result) {
    throw new Error('Template creation returned no data');
  }

  return result as EmailTemplate;
}

