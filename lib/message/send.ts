/**
 * Message Sender
 * 
 * Unified interface for sending SMS and Kakao messages
 */

import { sendSMS } from './providers/sms';
import { sendKakao } from './providers/kakao';
import type { MessageChannel } from '@/lib/mail/types';

interface SendMessageParams {
  channel: MessageChannel;
  phone: string;
  body: string;
}

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a message via the specified channel
 */
export async function sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
  const { channel, phone, body } = params;

  if (channel === 'sms') {
    return await sendSMS(phone, body);
  } else if (channel === 'kakao') {
    return await sendKakao(phone, body);
  } else {
    return {
      success: false,
      error: `Unknown channel: ${channel}`,
    };
  }
}

