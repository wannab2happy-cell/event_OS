'use server';

import { getMessageTemplate } from '@/lib/message/jobs';
import { sendMessage } from '@/lib/message/send';
import { createClient } from '@/lib/supabase/server';
import type { MessageChannel } from '@/lib/mail/types';

interface SendTestMessageInput {
  templateId: string;
  channel: MessageChannel;
  phone: string;
  eventId: string;
}

export async function sendTestMessage(
  input: SendTestMessageInput
): Promise<{ ok: boolean; error?: string }> {
  try {
    // Load template
    const templateResult = await getMessageTemplate(input.templateId);
    if (templateResult.error || !templateResult.data) {
      return { ok: false, error: templateResult.error || 'Template not found' };
    }

    const template = templateResult.data;

    // Load event for merge variables
    const supabase = await createClient();
    const { data: event } = await supabase
      .from('events')
      .select('id, title, code')
      .eq('id', input.eventId)
      .single();

    if (!event) {
      return { ok: false, error: 'Event not found' };
    }

    // Create sample participant for merge
    const sampleParticipant = {
      id: 'test',
      name: '테스트 참가자',
      email: 'test@example.com',
      phone: input.phone,
      company: '테스트 회사',
      position: '테스트 직책',
    };

    // Merge template (simplified - no table assignment for test)
    const { mergeMessageTemplate } = await import('@/lib/message/merge');
    const mergedBody = mergeMessageTemplate(
      template,
      {
        participant: sampleParticipant as any,
        event: {
          id: event.id,
          title: event.title,
          code: event.code,
        },
        tableName: null,
      }
    );

    // Send message
    const sendResult = await sendMessage({
      channel: input.channel,
      phone: input.phone,
      body: mergedBody,
    });

    if (!sendResult.success) {
      return { ok: false, error: sendResult.error || 'Failed to send test message' };
    }

    // Log test message (optional)
    // Could insert into message_logs with a special flag

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
    };
  }
}

