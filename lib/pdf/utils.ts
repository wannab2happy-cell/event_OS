import QRCode from 'qrcode';
import { hexToRgb } from './base';

/**
 * QR 코드 생성 유틸리티
 */

/**
 * QR 코드를 Data URL로 생성
 */
export async function generateQRCodeDataUrl(
  content: string,
  size: number = 200
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(content, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('QR 코드 생성에 실패했습니다.');
  }
}

/**
 * 참가자 PASS URL 생성
 */
export function generateParticipantPassUrl(
  eventId: string,
  participantId: string
): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${siteUrl}/${eventId}/pass/${participantId}`;
}

/**
 * KIOSK URL 생성
 */
export function generateKioskUrl(eventId: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${siteUrl}/kiosk/${eventId}`;
}

/**
 * 색상 변환 헬퍼 (PDF용)
 */
export function colorToRgb(color: string): string {
  const rgb = hexToRgb(color);
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * 텍스트 자르기 (최대 길이)
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

