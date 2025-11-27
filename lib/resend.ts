import { Resend } from 'resend';
import { render } from '@react-email/render';
import * as React from 'react';
import ConfirmationEmail from '@/emails/ConfirmationEmail';

// 환경 변수 확인 및 Resend 클라이언트 초기화
if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const RESEND_SENDER_EMAIL = process.env.RESEND_DOMAIN
  ? `event-os@${process.env.RESEND_DOMAIN}`
  : 'onboarding@resend.dev'; // 도메인 미설정 시 Resend 기본 도메인 사용

interface SendConfirmationEmailProps {
  to: string;
  participantName: string;
  eventName: string;
  eventLink: string;
  registerLink: string;
  flightTicketNo: string | null;
  guestConfirmationNo: string | null;
  isTravelConfirmed: boolean;
  isHotelConfirmed: boolean;
  logoUrl?: string | null;
  primaryColor?: string;
}

/**
 * Admin 확정 메일을 전송하는 함수
 */
export async function sendConfirmationEmail({
  to,
  participantName,
  eventName,
  eventLink,
  registerLink,
  flightTicketNo,
  guestConfirmationNo,
  isTravelConfirmed,
  isHotelConfirmed,
  logoUrl,
  primaryColor = '#2563eb',
}: SendConfirmationEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.error('Confirmation Email not sent: RESEND_API_KEY is missing.');
    return { success: false, message: 'API key missing.' };
  }

  try {
    const emailHtml = await render(
      React.createElement(ConfirmationEmail, {
        participantName,
        eventName,
        eventLink,
        registerLink,
        flightTicketNo,
        guestConfirmationNo,
        isTravelConfirmed,
        isHotelConfirmed,
        logoUrl,
        primaryColor,
      })
    );

    const { data, error } = await resend.emails.send({
      from: `Event OS <${RESEND_SENDER_EMAIL}>`,
      to: [to],
      subject: `✨ ${eventName}: ${participantName} 님의 예약이 최종 확정되었습니다!`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend Confirmation Email Error:', error);
      return { success: false, message: error.message };
    }

    console.log('Confirmation Email sent successfully:', data);
    return { success: true, message: 'Confirmation email sent.' };
  } catch (error) {
    console.error('General Resend Error:', error);
    return { success: false, message: 'An unexpected error occurred during email sending.' };
  }
}

/**
 * [추가] Magic Link 이메일 전송 함수
 */
export async function sendMagicLinkEmail(email: string, magicLink: string, eventName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.error('Magic Link Email not sent: RESEND_API_KEY is missing.');
    return { success: false, message: 'API key missing.' };
  }

  try {
    const { error } = await resend.emails.send({
      from: `Event OS <${RESEND_SENDER_EMAIL}>`,
      to: [email],
      subject: `[${eventName}] 로그인 매직 링크`,
      html: `
        <p>안녕하세요. 아래 버튼을 클릭하여 ${eventName} 등록 페이지에 로그인하세요.</p>
        <a href="${magicLink}" style="background-color: #1E40AF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">로그인 하기</a>
        <p>링크가 작동하지 않으면 아래 주소를 복사하여 브라우저에 붙여넣으세요.</p>
        <p>${magicLink}</p>
      `,
    });

    if (error) {
      console.error('Resend Magic Link Error:', error);
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Magic link email sent.' };
  } catch (error) {
    return { success: false, message: 'Error sending magic link.' };
  }
}

