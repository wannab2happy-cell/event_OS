/**
 * Email Job Sender
 * 
 * Standardized email sending with unified result format and error mapping
 */

import { sendEmail, type SendEmailResult } from './sender';

export interface SendJobResult {
  success: boolean;
  error?: string;
  resendErrorCode?: string;
}

/**
 * Send email job with standardized result format
 * 
 * @param params - Email parameters
 * @returns Standardized result with success/error status
 */
export async function sendJobEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<SendJobResult> {
  const result = await sendEmail(params);

  if (result.success) {
    return { success: true };
  }

  // Map Resend errors to standardized format
  const mappedError = mapResendError(result.error || 'Unknown error');

  return {
    success: false,
    error: mappedError.message,
    resendErrorCode: mappedError.code,
  };
}

/**
 * Map Resend API errors to standardized error messages
 */
function mapResendError(error: string): { message: string; code?: string } {
  const errorLower = error.toLowerCase();

  // Rate limiting
  if (errorLower.includes('rate limit') || errorLower.includes('429')) {
    return {
      message: '이메일 전송 한도에 도달했습니다. 잠시 후 다시 시도해주세요.',
      code: 'RATE_LIMIT',
    };
  }

  // Invalid email
  if (errorLower.includes('invalid email') || errorLower.includes('email format')) {
    return {
      message: '유효하지 않은 이메일 주소입니다.',
      code: 'INVALID_EMAIL',
    };
  }

  // Domain not verified
  if (errorLower.includes('domain') || errorLower.includes('not verified')) {
    return {
      message: '이메일 발신 도메인이 인증되지 않았습니다.',
      code: 'DOMAIN_NOT_VERIFIED',
    };
  }

  // API key issues
  if (errorLower.includes('api key') || errorLower.includes('unauthorized')) {
    return {
      message: '이메일 서비스 인증에 실패했습니다.',
      code: 'AUTH_ERROR',
    };
  }

  // Network/timeout
  if (errorLower.includes('timeout') || errorLower.includes('network')) {
    return {
      message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      code: 'NETWORK_ERROR',
    };
  }

  // Default
  return {
    message: error || '이메일 전송 중 오류가 발생했습니다.',
    code: 'UNKNOWN_ERROR',
  };
}

