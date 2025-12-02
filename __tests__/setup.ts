// Vitest setup file
// This file runs before all tests

// Mock environment variables
process.env.NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://events.anders.kr';
process.env.NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://events.anders.kr';
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 'test-key';
process.env.MAIL_FROM_ADDRESS = process.env.MAIL_FROM_ADDRESS || 'test@example.com';

