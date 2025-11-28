'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 타입 정의
interface CreateOperationLogInput {
  eventId: string;
  type: string;
  message: string;
  actor?: string;
  metadata?: any;
}

// 간단한 유효성 검사
function validateInput(input: unknown): CreateOperationLogInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input');
  }
  const data = input as any;
  
  if (!data.eventId || typeof data.eventId !== 'string') {
    throw new Error('eventId is required');
  }
  
  if (!data.type || typeof data.type !== 'string') {
    throw new Error('type is required');
  }
  
  if (!data.message || typeof data.message !== 'string') {
    throw new Error('message is required');
  }
  
  return {
    eventId: data.eventId,
    type: data.type,
    message: data.message,
    actor: data.actor || null,
    metadata: data.metadata || null,
  };
}

/**
 * 운영 로그 생성 Server Action
 */
export async function createOperationLog(input: unknown): Promise<{ success: boolean; message?: string }> {
  try {
    const { eventId, type, message, actor, metadata } = validateInput(input);

    const { error } = await supabaseAdmin.from('operation_logs').insert({
      event_id: eventId,
      type,
      message,
      actor: actor || null,
      metadata: metadata || null,
    });

    if (error) {
      console.error('Operation log insert error:', error);
      throw new Error(`운영 로그 저장에 실패했습니다: ${error.message}`);
    }

    return {
      success: true,
      message: '운영 로그가 저장되었습니다.',
    };
  } catch (error: any) {
    console.error('createOperationLog error:', error);
    return {
      success: false,
      message: error?.message || '운영 로그 저장 중 오류가 발생했습니다.',
    };
  }
}

