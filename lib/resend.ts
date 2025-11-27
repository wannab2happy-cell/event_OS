import { Resend } from 'resend';
import type { Participant, EventBranding } from '@/lib/types';

const resendApiKey = process.env.RESEND_API_KEY;
const resendSender = process.env.RESEND_DOMAIN
  ? `event-os@${process.env.RESEND_DOMAIN}`
  : 'Event OS <no-reply@example.com>';

const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

interface ConfirmationEmailData {
  participant: Participant;
  eventName: string;
  eventId: string;
  branding?: EventBranding | null;
  isTravelConfirmed: boolean;
  isHotelConfirmed: boolean;
}

export function generateConfirmationEmailTemplate({
  participant,
  eventName,
  eventId,
  branding,
  isTravelConfirmed,
  isHotelConfirmed,
}: ConfirmationEmailData): { subject: string; html: string } {
  const primaryColor = branding?.primary_color || '#2563eb';
  const secondaryColor = branding?.secondary_color || '#f8f8f8';
  const logoUrl = branding?.logo_image_url || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const qrPassLink = `${siteUrl}/${eventId}/qr-pass`;
  const registerLink = `${siteUrl}/${eventId}/register`;

  // 날짜 포맷팅 헬퍼
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // 숙박 일수 계산
  const calculateNights = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return null;
    try {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const nights = calculateNights(participant.hotel_check_in, participant.hotel_check_out);

  // 항공편 정보 포맷팅
  const formatFlightRoute = () => {
    if (!participant.arrival_airport || !participant.departure_airport) return '';
    const departure = participant.departure_airport;
    const arrival = participant.arrival_airport;
    const arrivalFlight = participant.arrival_flight || '';
    const departureFlight = participant.departure_flight || '';
    
    if (arrivalFlight && departureFlight) {
      return `[출발] ${departure} → [도착] ${arrival} (${arrivalFlight} / ${departureFlight})`;
    } else if (arrivalFlight) {
      return `[출발] ${departure} → [도착] ${arrival} (${arrivalFlight})`;
    } else {
      return `[출발] ${departure} → [도착] ${arrival}`;
    }
  };

  const subject = `✨ [${eventName}]: ${participant.name} 님의 항공 및 숙박 예약이 최종 확정되었습니다!`;

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- 헤더: 브랜딩 -->
          <tr>
            <td style="background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%); padding: 40px 30px; text-align: center;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${eventName}" style="max-width: 200px; height: auto; margin-bottom: 20px;" />` : ''}
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.3;">
                ${eventName}
              </h1>
            </td>
          </tr>

          <!-- 인사말 -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                <strong>${participant.name}</strong> 님, <strong>${eventName}</strong>에 오신 것을 환영합니다.
              </p>
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #666666;">
                모든 예약 절차가 완료되어 최종 확정 정보를 안내해 드립니다.
              </p>
            </td>
          </tr>

          <!-- 항공 예약 확정 정보 -->
          ${isTravelConfirmed && participant.flight_ticket_no ? `
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #f8f9fa; border-left: 4px solid ${primaryColor}; border-radius: 6px; padding: 25px;">
                <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #333333; display: flex; align-items: center;">
                  <span style="display: inline-block; width: 24px; height: 24px; background-color: #10b981; border-radius: 50%; margin-right: 10px; text-align: center; line-height: 24px; color: white; font-size: 14px;">✓</span>
                  항공 예약 확정 정보
                </h2>
                
                <div style="background-color: #ffffff; border: 2px solid #10b981; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 16px; font-weight: 600; color: #059669;">항공권 번호</span>
                    <span style="font-size: 24px; font-weight: 700; color: #047857; letter-spacing: 1px;">
                      ${participant.flight_ticket_no}
                    </span>
                  </div>
                </div>

                ${participant.flight_reservation_no ? `
                <div style="margin-bottom: 15px;">
                  <span style="font-size: 14px; font-weight: 600; color: #666666;">예약 번호 (PNR):</span>
                  <span style="font-size: 16px; font-weight: 700; color: #333333; margin-left: 10px;">${participant.flight_reservation_no}</span>
                </div>
                ` : ''}

                ${formatFlightRoute() ? `
                <div style="margin-bottom: 15px; padding: 15px; background-color: #ffffff; border-radius: 6px;">
                  <div style="font-size: 14px; font-weight: 600; color: #666666; margin-bottom: 8px;">항공편 정보</div>
                  <div style="font-size: 18px; font-weight: 700; color: #333333;">${formatFlightRoute()}</div>
                </div>
                ` : ''}

                ${participant.arrival_date ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
                  <div style="padding: 15px; background-color: #eff6ff; border-radius: 6px; border-left: 3px solid #3b82f6;">
                    <div style="font-size: 12px; font-weight: 600; color: #3b82f6; margin-bottom: 5px;">도착</div>
                    <div style="font-size: 16px; font-weight: 700; color: #1e40af;">${formatDate(participant.arrival_date)}</div>
                    ${participant.arrival_time ? `<div style="font-size: 14px; color: #1e40af; margin-top: 5px;">${participant.arrival_time}</div>` : ''}
                    ${participant.arrival_airport ? `<div style="font-size: 14px; color: #1e40af; margin-top: 5px;">${participant.arrival_airport}</div>` : ''}
                  </div>
                  ${participant.departure_date ? `
                  <div style="padding: 15px; background-color: #fff7ed; border-radius: 6px; border-left: 3px solid #f97316;">
                    <div style="font-size: 12px; font-weight: 600; color: #f97316; margin-bottom: 5px;">출발</div>
                    <div style="font-size: 16px; font-weight: 700; color: #c2410c;">${formatDate(participant.departure_date)}</div>
                    ${participant.departure_time ? `<div style="font-size: 14px; color: #c2410c; margin-top: 5px;">${participant.departure_time}</div>` : ''}
                    ${participant.departure_airport ? `<div style="font-size: 14px; color: #c2410c; margin-top: 5px;">${participant.departure_airport}</div>` : ''}
                  </div>
                  ` : ''}
                </div>
                ` : ''}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- 호텔 숙박 확정 정보 -->
          ${isHotelConfirmed && participant.guest_confirmation_no ? `
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <div style="background-color: #f8f9fa; border-left: 4px solid #8b5cf6; border-radius: 6px; padding: 25px;">
                <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #333333; display: flex; align-items: center;">
                  <span style="display: inline-block; width: 24px; height: 24px; background-color: #10b981; border-radius: 50%; margin-right: 10px; text-align: center; line-height: 24px; color: white; font-size: 14px;">✓</span>
                  호텔 숙박 확정 정보
                </h2>
                
                <div style="background-color: #ffffff; border: 2px solid #10b981; border-radius: 6px; padding: 20px; margin-bottom: 20px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 16px; font-weight: 600; color: #059669;">예약 확인 번호</span>
                    <span style="font-size: 24px; font-weight: 700; color: #047857; letter-spacing: 1px;">
                      ${participant.guest_confirmation_no}
                    </span>
                  </div>
                </div>

                ${participant.hotel_check_in && participant.hotel_check_out ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                  <div style="padding: 15px; background-color: #eff6ff; border-radius: 6px; border-left: 3px solid #3b82f6;">
                    <div style="font-size: 12px; font-weight: 600; color: #3b82f6; margin-bottom: 5px;">체크인</div>
                    <div style="font-size: 18px; font-weight: 700; color: #1e40af;">${formatDate(participant.hotel_check_in)}</div>
                  </div>
                  <div style="padding: 15px; background-color: #fff7ed; border-radius: 6px; border-left: 3px solid #f97316;">
                    <div style="font-size: 12px; font-weight: 600; color: #f97316; margin-bottom: 5px;">체크아웃</div>
                    <div style="font-size: 18px; font-weight: 700; color: #c2410c;">${formatDate(participant.hotel_check_out)}</div>
                  </div>
                </div>
                ${nights ? `<div style="font-size: 14px; color: #666666; margin-bottom: 10px;"><strong>숙박 일수:</strong> ${nights}박</div>` : ''}
                ` : ''}

                ${participant.room_preference ? `
                <div style="font-size: 14px; color: #666666;">
                  <strong>객실 타입:</strong> ${participant.room_preference === 'single' ? '싱글' : '트윈'}
                </div>
                ` : ''}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- CTA 버튼 -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding-bottom: 15px;">
                    <a href="${qrPassLink}" style="display: inline-block; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s;">
                      나의 QR PASS 확인
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${registerLink}" style="display: inline-block; color: ${primaryColor}; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px;">
                      정보 수정 바로가기 →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 푸터 -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.6; color: #666666;">
                행사장에서 뵙기를 기대합니다. 궁금한 점은 언제든지 문의해 주세요.
              </p>
              <p style="margin: 0; font-size: 14px; color: #999999;">
                ${eventName} 드림
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}

export async function sendConfirmationEmail({
  to,
  eventName,
  message,
  subject,
}: {
  to: string;
  eventName: string;
  message?: string;
  subject?: string;
}) {
  if (!resendClient || !resendApiKey) {
    console.warn('RESEND_API_KEY is not configured. Skipping confirmation email.');
    return;
  }

  await resendClient.emails.send({
    from: resendSender,
    to,
    subject: subject || `[${eventName}] 예약 정보가 업데이트되었습니다`,
    html: message || '',
  });
}

