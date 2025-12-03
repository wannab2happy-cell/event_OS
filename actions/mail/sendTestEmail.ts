'use server';

import { getEmailTemplate } from '@/lib/mail/api';
import { sendEmail } from '@/lib/mail/sender';
import { applyMergeVariables } from '@/lib/mail/parser';
import { createClient } from '@/lib/supabase/server';

interface SendTestEmailParams {
  eventId: string;
  templateId: string;
  testEmail: string;
}

export async function sendTestEmail({
  eventId,
  templateId,
  testEmail,
}: SendTestEmailParams): Promise<{ ok: boolean; error?: string }> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(testEmail)) {
    return { ok: false, error: 'Invalid email address format' };
  }

  try {
    // Load template
    const templateResult = await getEmailTemplate(templateId);
    if (templateResult.error || !templateResult.data) {
      return { ok: false, error: templateResult.error || 'Template not found' };
    }
    const template = templateResult.data;

    // Verify template belongs to event
    if (template.event_id !== eventId) {
      return { ok: false, error: 'Template does not belong to this event' };
    }

    // Load event for sample data
    const supabase = await createClient();
    const { data: event } = await supabase
      .from('events')
      .select('id, title, code')
      .eq('id', eventId)
      .single();

    // Prepare sample merge variables
    const sampleVariables: Record<string, string> = {
      name: '테스트 사용자',
      email: testEmail,
      event_title: event?.title || '테스트 이벤트',
      event_code: event?.code || 'TEST',
      company: '테스트 회사',
      tableName: '테이블 A',
      // Add more sample variables as needed
    };

    // Apply merge variables to template
    const renderedSubject = applyMergeVariables(template.subject, sampleVariables);
    const renderedHtml = applyMergeVariables(template.body_html, sampleVariables);
    const renderedText = template.body_text
      ? applyMergeVariables(template.body_text, sampleVariables)
      : undefined;

    // Send test email
    const sendResult = await sendEmail({
      to: testEmail,
      subject: `[TEST] ${renderedSubject}`,
      html: renderedHtml,
      text: renderedText,
    });

    if (!sendResult.success) {
      return { ok: false, error: sendResult.error || 'Failed to send test email' };
    }

    // Optionally log test email (we can add a test flag or skip logging)
    // For now, we'll skip logging test emails to email_logs

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

