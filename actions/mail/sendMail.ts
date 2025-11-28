'use server';

import { Resend } from 'resend';
import { render } from '@react-email/render';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createEventICS } from '@/lib/calendar/ics';
import InviteEmail from '@/emails/templates/InviteEmail';
import Reminder1Email from '@/emails/templates/Reminder1Email';
import Reminder2Email from '@/emails/templates/Reminder2Email';
import QrPassEmail from '@/emails/templates/QrPassEmail';
import ConfirmationEmail from '@/emails/templates/ConfirmationEmail';

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
  subject?: string;
  preheader?: string;
  showPipaNotice?: boolean;
  testEmail?: string; // 테스트 발송용 이메일
}

// 기본 제목 생성
function getDefaultSubject(templateKey: TemplateKey, eventTitle: string, participantName?: string): string {
  switch (templateKey) {
    case 'invite':
      return `✨ ${eventTitle}: 참가 등록을 시작해주세요!`;
    case 'reminder_1':
      return `⏰ ${eventTitle}: 등록 정보 입력이 아직 완료되지 않았습니다`;
    case 'reminder_2':
      return `🚨 ${eventTitle}: 등록 마감 임박 안내`;
    case 'qr_pass':
      return `📱 ${eventTitle}: QR Pass 확인 안내`;
    case 'confirmation':
      return `✨ ${eventTitle}: ${participantName || '참가자'} 님의 항공 및 숙박 예약이 최종 확정되었습니다!`;
    default:
      return `${eventTitle}: 안내`;
  }
}

// 이벤트 날짜 포맷팅
function formatEventDates(startDate: string | null, endDate: string | null): string | null {
  if (!startDate) return null;
  
  try {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };
    
    if (end && start.getTime() !== end.getTime()) {
      return `${formatDate(start)} ~ ${formatDate(end)}`;
    }
    
    return formatDate(start);
  } catch {
    return startDate;
  }
}

// 이벤트 장소 포맷팅
function formatEventLocation(venueName: string | null, venueAddress: string | null): string | null {
  const parts = [venueName, venueAddress].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * React Email 템플릿으로 HTML 생성
 */
async function buildEmailHtml(
  templateKey: TemplateKey,
  event: any,
  participant: any,
  eventLink: string,
  registerLink: string,
  qrPassLink: string,
  options: {
    showPipaNotice?: boolean;
    supportEmail?: string;
  }
): Promise<string> {
  const eventDates = formatEventDates(event.start_date, event.end_date);
  const eventLocation = formatEventLocation(event.venue_name, event.venue_address);
  const supportEmail = options.supportEmail || 'support@event-os.com';

  const commonProps = {
    participantName: participant.name || '참가자',
    eventTitle: event.title,
    eventDates,
    eventLocation,
    heroTagline: event.hero_tagline,
    primaryColor: event.primary_color || '#2563eb',
    supportEmail,
    showPipaNotice: options.showPipaNotice ?? true,
  };

  switch (templateKey) {
    case 'invite':
      return render(
        <InviteEmail
          {...commonProps}
          ctaUrl={registerLink}
        />
      );

    case 'reminder_1':
      return render(
        <Reminder1Email
          {...commonProps}
          ctaUrl={registerLink}
        />
      );

    case 'reminder_2':
      return render(
        <Reminder2Email
          {...commonProps}
          ctaUrl={registerLink}
        />
      );

    case 'qr_pass':
      return render(
        <QrPassEmail
          {...commonProps}
          ctaUrl={qrPassLink}
        />
      );

    case 'confirmation':
      return render(
        <ConfirmationEmail
          participantName={participant.name || '참가자'}
          eventName={event.title}
          eventTitle={event.title}
          eventLink={qrPassLink}
          registerLink={registerLink}
          flightTicketNo={participant.flight_ticket_no || null}
          guestConfirmationNo={participant.guest_confirmation_no || null}
          isTravelConfirmed={participant.is_travel_confirmed || false}
          isHotelConfirmed={participant.is_hotel_confirmed || false}
          heroTagline={event.hero_tagline}
          primaryColor={event.primary_color || '#2563eb'}
          supportEmail={supportEmail}
          showPipaNotice={options.showPipaNotice ?? true}
        />
      );

    default:
      throw new Error(`Unknown template key: ${templateKey}`);
  }
}

/**
 * ICS 첨부 여부 확인
 */
function shouldAttachICS(templateKey: TemplateKey): boolean {
  return ['invite', 'reminder_1', 'reminder_2', 'confirmation'].includes(templateKey);
}

/**
 * 메일 발송 Server Action
 */
export async function sendMailAction(input: unknown) {
  try {
    const {
      eventId,
      templateKey,
      targetFilter,
      subject: customSubject,
      preheader,
      showPipaNotice = true,
      testEmail,
    } = input as SendMailInput;

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
    const eventLink = `${siteUrl}/${event.code || eventId}`;
    const registerLink = `${siteUrl}/${event.code || eventId}/login`;
    const qrPassLink = `${siteUrl}/${event.code || eventId}/qr-pass`;

    // 2) 대상자 쿼리 (테스트 모드면 testEmail만)
    let participants: any[] = [];

    if (testEmail) {
      // 테스트 발송: testEmail로 단일 참가자 생성
      participants = [
        {
          id: 'test-participant',
          email: testEmail,
          name: '테스트 참가자',
          status: 'completed',
          flight_ticket_no: null,
          guest_confirmation_no: null,
          is_travel_confirmed: false,
          is_hotel_confirmed: false,
        },
      ];
    } else {
      let query = supabaseAdmin
        .from('event_participants')
        .select('id, email, name, status, flight_ticket_no, guest_confirmation_no, is_travel_confirmed, is_hotel_confirmed')
        .eq('event_id', eventId);

      if (targetFilter === 'completed') {
        query = query.eq('status', 'completed');
      } else if (targetFilter === 'incomplete') {
        query = query.neq('status', 'completed');
      }

      const { data, error: participantsError } = await query;

      if (participantsError) {
        throw new Error(`Failed to load participants: ${participantsError.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No recipients found for this filter');
      }

      participants = data;
    }

    // 3) 메일 발송
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // 첫 번째 참가자로 기본 제목 생성
    const defaultSubject = getDefaultSubject(templateKey, event.title, participants[0]?.name);
    const finalSubject = customSubject || defaultSubject;

    // ICS 생성 (필요한 경우)
    let icsAttachment: any = null;
    if (shouldAttachICS(templateKey) && event.start_date && event.end_date) {
      try {
        const icsContent = createEventICS(
          eventId,
          event.title,
          event.start_date,
          event.end_date,
          event.venue_name,
          event.venue_address,
          eventLink
        );

        icsAttachment = {
          filename: `${event.code || 'event'}-calendar.ics`,
          content: Buffer.from(icsContent).toString('base64'),
          contentType: 'text/calendar; charset=utf-8',
        };
      } catch (icsError) {
        console.error('Failed to generate ICS:', icsError);
        // ICS 생성 실패해도 메일 발송은 계속
      }
    }

    for (const participant of participants) {
      if (!participant.email) {
        failCount++;
        errors.push(`Participant ${participant.id}: No email address`);
        continue;
      }

      try {
        // HTML 생성
        const emailHtml = await buildEmailHtml(
          templateKey,
          event,
          participant,
          eventLink,
          registerLink,
          qrPassLink,
          {
            showPipaNotice,
            supportEmail: 'support@event-os.com',
          }
        );

        // 참가자별 제목 (confirmation의 경우 이름 포함)
        const participantSubject =
          templateKey === 'confirmation'
            ? getDefaultSubject(templateKey, event.title, participant.name)
            : finalSubject;

        // Resend 발송 옵션
        const sendOptions: any = {
          from: `Event OS <${RESEND_SENDER_EMAIL}>`,
          to: participant.email,
          subject: participantSubject,
          html: emailHtml,
        };

        // Preheader 추가
        if (preheader) {
          sendOptions.text = preheader; // 텍스트 버전으로 preheader 사용
        }

        // ICS 첨부
        if (icsAttachment) {
          sendOptions.attachments = [icsAttachment];
        }

        const { error: sendError } = await resend.emails.send(sendOptions);

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
    const errorMessage = failCount > 0 ? errors.slice(0, 5).join('; ') : null;

    const { error: logError } = await supabaseAdmin.from('mail_logs').insert({
      event_id: eventId,
      template_key: templateKey,
      subject: finalSubject,
      body_preview: bodyPreview,
      target_filter: targetFilter,
      recipient_count: participants.length,
      status,
      error_message: errorMessage,
      sent_by: 'admin', // TODO: 실제 admin email/id로 교체
      sent_at: new Date().toISOString(),
      is_test: !!testEmail,
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
      isTest: !!testEmail,
    };
  } catch (error: any) {
    console.error('sendMailAction error:', error);
    return {
      success: false,
      total: 0,
      successCount: 0,
      failed: 0,
      message: error?.message || '메일 발송 중 오류가 발생했습니다.',
      isTest: false,
    };
  }
}
