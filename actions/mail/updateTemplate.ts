'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { EmailTemplate } from '@/lib/mail/types';

export async function updateTemplate(
  templateId: string,
  updates: Partial<{
    title: string;
    subject: string;
    bodyHtml: string;
    variables: Record<string, any>;
  }>
): Promise<EmailTemplate> {
  const updateData: Record<string, any> = {};

  if (updates.title !== undefined) {
    updateData.name = updates.title;
  }
  if (updates.subject !== undefined) {
    updateData.subject = updates.subject;
  }
  if (updates.bodyHtml !== undefined) {
    updateData.body_html = updates.bodyHtml;
  }
  if (updates.variables !== undefined) {
    updateData.variables = updates.variables;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error('No fields to update');
  }

  const { data, error } = await supabaseAdmin
    .from('email_templates')
    .update(updateData)
    .eq('id', templateId)
    .select()
    .single();

  if (error) {
    console.error('Update template error:', error);
    throw new Error(`Failed to update template: ${error.message}`);
  }

  if (!data) {
    throw new Error('Template update returned no data');
  }

  return data as EmailTemplate;
}

