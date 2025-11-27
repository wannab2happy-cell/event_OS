'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { UUID } from './types';

interface CreateAdminNotificationOptions {
  eventId: UUID;
  participantId?: UUID | null;
  type: string;
  message: string;
}

export async function createAdminNotification({
  eventId,
  participantId = null,
  type,
  message,
}: CreateAdminNotificationOptions) {
  try {
    const { error } = await supabaseAdmin.from('admin_notifications').insert({
      event_id: eventId,
      participant_id: participantId,
      type,
      message,
    });

    if (error) {
      console.error('Failed to create admin notification:', error);
    }
  } catch (error) {
    console.error('Unexpected error while creating admin notification:', error);
  }
}

