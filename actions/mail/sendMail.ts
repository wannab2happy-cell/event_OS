'use server';

import { Resend } from 'resend';
import { render } from '@react-email/render';
import * as React from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import ConfirmationEmail from '@/emails/ConfirmationEmail';

// Resend 클라이언트 초기화
if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set. Email functionality will be disabled.');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const RESEND_SENDER_EMAIL = process.env.RESEND_DOMAIN
  ? `event-os@${process.env.RESEND_DOMAIN}`
  : 'onboarding@resend.dev';

// 타입 정의
type TemplateKey = 'invite' | 'reminder_1' | 'reminder_2' | 'qr_pass' | 'confirmation';
type TargetFilter = 'all' | 'completed' | 'incomplete';

interface SendMailInput {
  eventId: string;
  templateKey: TemplateKey;
  targetFilter: TargetFilter;
}

// 간단한 유효성 검사
function validateInput(input: unknown): SendMailInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input');
  }
  const { eventId, templateKey, targetFilter } = input as any;
  
  if (!eventId || typeof eventId !== 'string') {
    throw new Error('eventId is required');
  }
  
  const validTemplateKeys: TemplateKey[] = ['invite', 'reminder_1', 'reminder_2', 'qr_pass', 'confirmation'];
  if (!validTemplateKeys.includes(templateKey)) {
    throw new Error(`Invalid templateKey: ${templateKey}`);
  }
  
  const validTargetFilters: TargetFilter[] = ['all', 'completed', 'incomplete'];
  if (!validTargetFilters.includes(targetFilter)) {
    throw new Error(`Invalid targetFilter: ${targetFilter}`);
  }
  
  return { eventId, templateKey, targetFilter };
}

interface TemplateConfig {
  subject: string;
  getHtml: (event: any, participant: any, eventLink: string, registerLink: string) => Promise<string>;
}

/**
 * 템플릿별 설정 반환
 */
async function getTemplateConfig(
  templateKey: string,
  event: any,
  participant: any,
  eventLink: string,
  registerLink: string
): Promise<TemplateConfig> {
  const baseHtml = (content: string, buttonText: string, buttonLink: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">${event.title}</h1>
        </div>
        <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p style="font-size: 16px;">안녕하세요, <strong>${participant.name}</strong>님,</p>
          ${content}
          <div style="margin-top: 30px; text-align: center;">
            <a href="${buttonLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">${buttonText}</a>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #666; border-top: 1px solid #eee; padding-top: 20px;">
            문의사항이 있으시면 이메일로 연락주세요.
          </p>
        </div>
      </body>
    </html>
  `;

  switch (templateKey) {
    case 'invite':
      return {
        subject: `✨ ${event.title}: 참가 등록을 시작해주세요!`,
        getHtml: async () =>
          baseHtml(
            `<p>${event.title}에 초대되었습니다. 참가 등록을 시작해주세요.</p>`,
            '등록하기',
            registerLink
          ),
      };

    case 'reminder_1':
      return {
        subject: `⏰ ${event.title}: 등록 정보 입력이 아직 완료되지 않았습니다`,
        getHtml: async () =>
          baseHtml(
            `<p>등록 정보 입력이 아직 완료되지 않았습니다. 빠른 시일 내에 등록을 완료해주시기 바랍니다.</p>`,
            '등록 완료하기',
            registerLink
          ),
      };

    case 'reminder_2':
      return {
        subject: `🚨 ${event.title}: 등록 마감 임박 안내`,
        getHtml: async () =>
          baseHtml(
            `<p>등록 마감이 임박했습니다. 빠른 시일 내에 등록을 완료해주세요.</p>`,
            '등록 완료하기',
            registerLink
          ),
      };

    case 'qr_pass':
      return {
        subject: `📱 ${event.title}: QR Pass 확인 안내`,
        getHtml: async () =>
          baseHtml(
            `<p>QR Pass를 확인하고 현장 체크인에 준비하세요.</p>`,
            'QR Pass 확인하기',
            eventLink
          ),
      };

    case 'confirmation':
      return {
        subject: `✨ ${event.title}: ${participant.name} 님의 항공 및 숙박 예약이 최종 확정되었습니다!`,
        getHtml: async () => {
          const emailHtml = await render(
            React.createElement(ConfirmationEmail, {
              participantName: participant.name,
              eventName: event.title,
              eventLink,
              registerLink,
              flightTicketNo: participant.flight_ticket_no || null,
              guestConfirmationNo: participant.guest_confirmation_no || null,
              isTravelConfirmed: participant.is_travel_confirmed || false,
              isHotelConfirmed: participant.is_hotel_confirmed || false,
              logoUrl: null,
              primaryColor: '#2563eb',
            })
          );
          return emailHtml;
        },
      };

    default:
      throw new Error(`Unknown template key: ${templateKey}`);
  }
}

/**
 * 메일 발송 Server Action
 */
export async function sendMailAction(input: unknown) {
  try {
    const { eventId, templateKey, targetFilter } = validateInput(input);

    // 1) 이벤트 정보 로드
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*, event_branding(*)')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    const branding = (event.event_branding as Array<Record<string, any>>)?.[0] || {};
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const eventLink = `${siteUrl}/${eventId}`;
    const registerLink = `${siteUrl}/${eventId}/login`;

    // 2) 대상자 쿼리
    let query = supabaseAdmin
      .from('event_participants')
      .select('id, email, name, status, flight_ticket_no, guest_confirmation_no, is_travel_confirmed, is_hotel_confirmed')
      .eq('event_id', eventId);

    if (targetFilter === 'completed') {
      query = query.eq('status', 'completed');
    } else if (targetFilter === 'incomplete') {
      query = query.neq('status', 'completed');
    }

    const { data: participants, error: participantsError } = await query;

    if (participantsError) {
      throw new Error(`Failed to load participants: ${participantsError.message}`);
    }

    if (!participants || participants.length === 0) {
      throw new Error('No recipients found for this filter');
    }

    // 3) 메일 발송 (루프 방식, 향후 batch 최적화 가능)
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const participant of participants) {
      if (!participant.email) {
        failCount++;
        errors.push(`Participant ${participant.id}: No email address`);
        continue;
      }

      try {
        const templateConfig = await getTemplateConfig(
          templateKey,
          event,
          participant,
          eventLink,
          registerLink
        );

        // HTML 생성
        const emailHtml = await templateConfig.getHtml(event, participant, eventLink, registerLink);

        const { error: sendError } = await resend.emails.send({
          from: `Event OS <${RESEND_SENDER_EMAIL}>`,
          to: participant.email,
          subject: templateConfig.subject,
          html: emailHtml,
        });

        if (sendError) {
          failCount++;
          errors.push(`Failed to send to ${participant.email}: ${sendError.message || 'Unknown error'}`);
          console.error('Failed to send email to', participant.email, sendError);
        } else {
          successCount++;
        }
      } catch (err: any) {
        failCount++;
        const errorMsg = err?.message || 'Unknown error';
        errors.push(`Failed to send to ${participant.email}: ${errorMsg}`);
        console.error('Failed to send email to', participant.email, err);
      }
    }

    // 4) mail_logs 기록
    const bodyPreview = `Template: ${templateKey}, Filter: ${targetFilter}, Event: ${event.title}`;
    const status = failCount === 0 ? 'success' : successCount > 0 ? 'partial' : 'failed';
    const errorMessage = failCount > 0 ? errors.slice(0, 5).join('; ') : null; // 최대 5개 에러만 저장

    // 로그용 subject 가져오기
    const firstParticipant = participants[0];
    const logTemplateConfig = await getTemplateConfig(templateKey, event, firstParticipant, eventLink, registerLink);

    const { error: logError } = await supabaseAdmin.from('mail_logs').insert({
      event_id: eventId,
      template_key: templateKey,
      subject: logTemplateConfig.subject,
      body_preview: bodyPreview,
      target_filter: targetFilter,
      recipient_count: participants.length,
      status,
      error_message: errorMessage,
      sent_by: 'admin', // TODO: 실제 admin email/id로 교체
      sent_at: new Date().toISOString(),
    });

    if (logError) {
      console.error('Failed to insert mail_log', logError);
      // 로그 저장 실패해도 발송 결과는 반환
    }

    return {
      success: true,
      total: participants.length,
      successCount,
      failed: failCount,
      message: `메일 발송 완료: ${successCount}/${participants.length} 성공, ${failCount} 실패`,
    };
  } catch (error: any) {
    console.error('sendMailAction error:', error);
    return {
      success: false,
      total: 0,
      successCount: 0,
      failed: 0,
      message: error?.message || '메일 발송 중 오류가 발생했습니다.',
    };
  }
}

