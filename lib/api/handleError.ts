/**
 * API Error Handler
 * 
 * Unified error handling for API routes
 */

import { NextResponse } from 'next/server';

export interface ErrorResponse {
  status: number;
  body: {
    success: false;
    error: string;
    code?: string;
  };
}

/**
 * Handle errors and return standardized API response
 */
export function handleError(err: unknown): ErrorResponse {
  // Known error types
  if (err instanceof Error) {
    // Validation errors
    if (err.name === 'ValidationError' || err.message.includes('validation')) {
      return {
        status: 400,
        body: {
          success: false,
          error: err.message,
          code: 'VALIDATION_ERROR',
        },
      };
    }

    // Authentication errors
    if (err.message.includes('unauthorized') || err.message.includes('authentication')) {
      return {
        status: 401,
        body: {
          success: false,
          error: '인증이 필요합니다.',
          code: 'UNAUTHORIZED',
        },
      };
    }

    // Not found errors
    if (err.message.includes('not found') || err.message.includes('존재하지')) {
      return {
        status: 404,
        body: {
          success: false,
          error: err.message,
          code: 'NOT_FOUND',
        },
      };
    }

    // Rate limit errors
    if (err.message.includes('rate limit') || err.message.includes('429')) {
      return {
        status: 429,
        body: {
          success: false,
          error: '요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.',
          code: 'RATE_LIMIT',
        },
      };
    }

    // Default error
    return {
      status: 500,
      body: {
        success: false,
        error: err.message || '서버 오류가 발생했습니다.',
        code: 'INTERNAL_ERROR',
      },
    };
  }

  // Unknown error type
  return {
    status: 500,
    body: {
      success: false,
      error: '알 수 없는 오류가 발생했습니다.',
      code: 'UNKNOWN_ERROR',
    },
  };
}

/**
 * Create NextResponse from error
 */
export function createErrorResponse(err: unknown): NextResponse {
  const errorResponse = handleError(err);
  return NextResponse.json(errorResponse.body, { status: errorResponse.status });
}

