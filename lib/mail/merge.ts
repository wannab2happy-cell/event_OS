/**
 * Template Merge Engine
 * 
 * Replaces merge variables in email templates with actual participant/event data
 */

import type { EmailTemplate } from './types';
import type { Participant } from '@/lib/types';
import { applyMergeVariables } from './parser';
import { buildMyTableLink } from './linkBuilder';

export interface MergeContext {
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
 * 
 * @param template - Email template with {{variable}} placeholders
 * @param context - Participant and event context
 * @returns Merged template with subject, html, and text
 */
export function mergeTemplate(
  template: EmailTemplate,
  context: MergeContext
): { subject: string; html: string; text: string | null } {
  const { participant, event, tableName } = context;

  // Build QR code URL (personalized link)
  const qrUrl = buildMyTableLink({
    eventCode: event.code,
    participantId: participant.id,
  });

  // Prepare merge variables
  const variables: Record<string, string> = {
    name: participant.name || '',
    email: participant.email || '',
    company: participant.company || '',
    position: participant.position || '',
    event_title: event.title || '',
    event_code: event.code || '',
    tableName: tableName || '',
    qr_url: qrUrl,
    // Add more variables as needed
    participant_id: participant.id,
  };

  // Apply merge variables to template
  const subject = applyMergeVariables(template.subject, variables);
  const html = applyMergeVariables(template.body_html, variables);
  const text = template.body_text
    ? applyMergeVariables(template.body_text, variables)
    : null;

  return { subject, html, text };
}

