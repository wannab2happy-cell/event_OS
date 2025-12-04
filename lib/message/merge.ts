/**
 * Message Template Merge Engine
 * 
 * Replaces variables in message templates (same as email merge)
 */

import type { MessageTemplate } from '@/lib/mail/types';
import type { Participant } from '@/lib/types';
import { applyMergeVariables } from '../mail/parser';
import { buildMyTableLink } from '../mail/linkBuilder';

export interface MessageMergeContext {
  participant: Participant;
  event: {
    id: string;
    title: string;
    code: string;
  };
  tableName?: string | null;
}

/**
 * Merge template variables with participant and event data
 */
export function mergeMessageTemplate(
  template: MessageTemplate,
  context: MessageMergeContext
): string {
  const { participant, event, tableName } = context;

  // Build QR code URL
  const qrUrl = buildMyTableLink({ eventCode: event.code, participantId: participant.id });

  // Prepare merge variables
  const variables: Record<string, string> = {
    name: participant.name || '',
    email: participant.email || '',
    company: participant.company || '',
    position: participant.position || '',
    phone: participant.phone || '',
    event_title: event.title || '',
    event_code: event.code || '',
    tableName: tableName || '',
    qr_url: qrUrl,
    participant_id: participant.id,
  };

  // Apply merge variables to template body
  return applyMergeVariables(template.body, variables);
}




