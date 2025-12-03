/**
 * Link Builder
 * 
 * Builds personalized links for participants
 */

interface BuildMyTableLinkParams {
  eventCode: string;
  participantId: string;
}

/**
 * Build a personalized "My Table" link
 */
export function buildMyTableLink({ eventCode, participantId }: BuildMyTableLinkParams): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://events.anders.kr';
  return `${baseUrl}/events/${eventCode}/my-table?pid=${participantId}`;
}
