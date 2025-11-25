'use server';

import type { UUID } from './types';

export async function sendAdminNotification(eventId: UUID, participantId: UUID, message: string) {
  const webhookUrl = process.env.SLACK_ADMIN_WEBHOOK;

  if (!webhookUrl) {
    console.warn('SLACK_ADMIN_WEBHOOK is not set. Admin notification disabled.');
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `[Event OS - ${String(eventId).slice(0, 8)}] ${message}\n참가자 ID: ${participantId}`,
      }),
    });
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
}

