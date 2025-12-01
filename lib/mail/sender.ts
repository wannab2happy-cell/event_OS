import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resendSender = process.env.RESEND_DOMAIN
  ? `event-os@${process.env.RESEND_DOMAIN}`
  : 'Event OS <no-reply@example.com>';

const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; result?: any; error?: string }> {
  if (!resendClient || !resendApiKey) {
    console.warn('RESEND_API_KEY is not configured. Skipping email send.');
    return { ok: false, error: 'RESEND_API_KEY is not configured' };
  }

  try {
    const result = await resendClient.emails.send({
      from: resendSender,
      to,
      subject,
      html,
    });

    return { ok: true, result };
  } catch (err: any) {
    console.error('Resend email error:', err);
    return { ok: false, error: err.message || 'Unknown error' };
  }
}

