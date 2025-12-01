'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabaseAdmin
    .from('email_templates')
    .delete()
    .eq('id', templateId);

  if (error) {
    console.error('Delete template error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

