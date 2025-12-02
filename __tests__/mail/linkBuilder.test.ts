import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildMyTableLink, buildSignedMyTableLink } from '@/lib/mail/linkBuilder';

describe('Link Builder', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('buildMyTableLink', () => {
    it('should build correct My Table link with NEXT_PUBLIC_BASE_URL', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://events.anders.kr';
      const result = buildMyTableLink({
        eventCode: 'event-2024',
        participantId: 'participant-123',
      });
      expect(result).toBe('https://events.anders.kr/events/event-2024/my-table?pid=participant-123');
    });

    it('should fallback to NEXT_PUBLIC_SITE_URL if BASE_URL not set', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      process.env.NEXT_PUBLIC_SITE_URL = 'https://events.anders.kr';
      const result = buildMyTableLink({
        eventCode: 'event-2024',
        participantId: 'participant-123',
      });
      expect(result).toBe('https://events.anders.kr/events/event-2024/my-table?pid=participant-123');
    });

    it('should remove trailing slash from base URL', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://events.anders.kr/';
      const result = buildMyTableLink({
        eventCode: 'event-2024',
        participantId: 'participant-123',
      });
      expect(result).toBe('https://events.anders.kr/events/event-2024/my-table?pid=participant-123');
    });

    it('should use default URL if no env vars set', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      delete process.env.NEXT_PUBLIC_SITE_URL;
      const result = buildMyTableLink({
        eventCode: 'event-2024',
        participantId: 'participant-123',
      });
      expect(result).toBe('https://events.anders.kr/events/event-2024/my-table?pid=participant-123');
    });
  });

  describe('buildSignedMyTableLink', () => {
    it('should return regular link for now (placeholder)', () => {
      process.env.NEXT_PUBLIC_BASE_URL = 'https://events.anders.kr';
      const result = buildSignedMyTableLink({
        eventCode: 'event-2024',
        participantId: 'participant-123',
      });
      // Currently returns regular link, but structure is ready for token signing
      expect(result).toContain('/events/event-2024/my-table?pid=participant-123');
    });
  });
});

