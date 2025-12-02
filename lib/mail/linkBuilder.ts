/**
 * Personalized Link Builder
 * 
 * Utility functions for building personalized links in emails
 * Future-compatible for tokenized/signed URLs
 */

/**
 * Build a personalized "My Table" link for a participant
 * 
 * @param params - Link parameters
 * @returns Full URL to the participant's My Table page
 * 
 * @example
 * buildMyTableLink({
 *   eventCode: 'event-2024',
 *   participantId: 'participant-123'
 * })
 * // Returns: 'https://events.anders.kr/events/event-2024/my-table?pid=participant-123'
 */
export function buildMyTableLink({
  eventCode,
  participantId,
}: {
  eventCode: string;
  participantId: string;
}): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://events.anders.kr';

  // Remove trailing slash if present
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');

  return `${cleanBaseUrl}/events/${eventCode}/my-table?pid=${participantId}`;
}

/**
 * Build a signed/tokenized link (for future use)
 * 
 * This is a placeholder for future implementation of secure, tokenized links
 * that don't expose participant IDs directly in URLs.
 * 
 * @param params - Link parameters
 * @returns Tokenized URL (currently returns regular link)
 */
export function buildSignedMyTableLink({
  eventCode,
  participantId,
}: {
  eventCode: string;
  participantId: string;
}): string {
  // TODO: Implement token signing/encryption
  // For now, return regular link
  return buildMyTableLink({ eventCode, participantId });
}

