/**
 * Email Sender Utility
 * 
 * Provider-agnostic email sending function using Resend
 */

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const mailFromAddress =
  process.env.MAIL_FROM_ADDRESS || process.env.RESEND_DOMAIN
    ? `event-os@${process.env.RESEND_DOMAIN}`
    : 'Event OS <no-reply@example.com>';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Send an email using Resend
 * 
 * @param params - Email parameters
 * @returns Result with success status and optional error message
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<SendEmailResult> {
  if (!resend) {
    return {
      success: false,
      error: 'Resend API key is not configured. Please set RESEND_API_KEY environment variable.',
    };
  }

  if (!to || !subject || !html) {
    return {
      success: false,
      error: 'Missing required email parameters: to, subject, or html',
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: mailFromAddress,
      to,
      subject,
      html,
      text: text || undefined,
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    if (!data) {
      return {
        success: false,
        error: 'No response data from Resend',
      };
    }

    return {
      success: true,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error occurred while sending email',
    };
  }
}

