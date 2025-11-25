import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resendSender = process.env.RESEND_DOMAIN
  ? `event-os@${process.env.RESEND_DOMAIN}`
  : 'Event OS <no-reply@example.com>';

const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendConfirmationEmail({
  to,
  eventName,
  message,
}: {
  to: string;
  eventName: string;
  message: string;
}) {
  if (!resendClient || !resendApiKey) {
    console.warn('RESEND_API_KEY is not configured. Skipping confirmation email.');
    return;
  }

  await resendClient.emails.send({
    from: resendSender,
    to,
    subject: `[${eventName}] 예약 정보가 업데이트되었습니다`,
    html: message,
  });
}

