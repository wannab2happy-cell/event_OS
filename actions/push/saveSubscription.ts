'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 타입 정의
interface SaveSubscriptionInput {
  eventId: string;
  participantId: string;
  subscription: any; // PushSubscription JSON
  userAgent?: string;
}

// 간단한 유효성 검사
function validateInput(input: unknown): SaveSubscriptionInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input');
  }
  const data = input as any;
  
  if (!data.eventId || typeof data.eventId !== 'string') {
    throw new Error('eventId is required');
  }
  
  if (!data.participantId || typeof data.participantId !== 'string') {
    throw new Error('participantId is required');
  }
  
  if (!data.subscription || typeof data.subscription !== 'object') {
    throw new Error('subscription is required');
  }
  
  return {
    eventId: data.eventId,
    participantId: data.participantId,
    subscription: data.subscription,
    userAgent: data.userAgent || null,
  };
}

/**
 * Push 구독 정보 저장 Server Action
 */
export async function saveSubscriptionAction(input: unknown): Promise<{ success: boolean; message?: string }> {
  try {
    const { eventId, participantId, subscription, userAgent } = validateInput(input);

    const supabase = supabaseAdmin();

    // 기존 구독이 있는지 확인 (중복 방지)
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('event_id', eventId)
      .eq('participant_id', participantId)
      .eq('subscription->>endpoint', subscription.endpoint)
      .single();

    if (existing) {
      // 기존 구독 업데이트
      const { error: updateError } = await supabase
        .from('push_subscriptions')
        .update({
          subscription,
          user_agent: userAgent,
          created_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (updateError) {
        throw new Error(`구독 정보 업데이트에 실패했습니다: ${updateError.message}`);
      }

      return {
        success: true,
        message: '구독 정보가 업데이트되었습니다.',
      };
    }

    // 새 구독 저장
    const { error: insertError } = await supabase.from('push_subscriptions').insert({
      event_id: eventId,
      participant_id: participantId,
      subscription,
      user_agent: userAgent,
    });

    if (insertError) {
      console.error('Subscription insert error:', insertError);
      throw new Error(`구독 정보 저장에 실패했습니다: ${insertError.message}`);
    }

    return {
      success: true,
      message: 'Push 알림 구독이 완료되었습니다.',
    };
  } catch (error: any) {
    console.error('saveSubscriptionAction error:', error);
    return {
      success: false,
      message: error?.message || '구독 정보 저장 중 오류가 발생했습니다.',
    };
  }
}

