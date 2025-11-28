'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createOperationLog } from '@/actions/operations/createLog';

// web-push는 동적 import로 처리 (선택적 의존성)
let webPush: any = null;

async function getWebPush() {
  if (!webPush) {
    try {
      webPush = (await import('web-push')).default;
      
      // VAPID 키 설정
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
      
      if (!vapidPublicKey || !vapidPrivateKey) {
        throw new Error('VAPID 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
      }
      
      webPush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@eventos.com',
        vapidPublicKey,
        vapidPrivateKey
      );
    } catch (error) {
      console.error('web-push import error:', error);
      throw new Error('web-push 라이브러리를 사용할 수 없습니다. 설치가 필요합니다: npm install web-push');
    }
  }
  return webPush;
}

// 타입 정의
interface SendPushInput {
  eventId: string;
  title: string;
  body: string;
}

// 간단한 유효성 검사
function validateInput(input: unknown): SendPushInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input');
  }
  const data = input as any;
  
  if (!data.eventId || typeof data.eventId !== 'string') {
    throw new Error('eventId is required');
  }
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    throw new Error('제목은 필수입니다.');
  }
  
  if (!data.body || typeof data.body !== 'string' || data.body.trim().length === 0) {
    throw new Error('본문은 필수입니다.');
  }
  
  return {
    eventId: data.eventId,
    title: data.title.trim(),
    body: data.body.trim(),
  };
}

/**
 * Web Push 발송 Server Action
 */
export async function sendPushAction(input: unknown): Promise<{ success: boolean; sent: number; failed: number; message?: string }> {
  try {
    const { eventId, title, body } = validateInput(input);

    const supabase = supabaseAdmin();

    // 1) 해당 이벤트의 모든 구독 조회
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('id, subscription')
      .eq('event_id', eventId);

    if (fetchError) {
      throw new Error(`구독 정보를 불러오지 못했습니다: ${fetchError.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return {
        success: true,
        sent: 0,
        failed: 0,
        message: '구독 중인 참가자가 없습니다.',
      };
    }

    // 2) web-push 라이브러리 로드
    const push = await getWebPush();

    // 3) 각 구독에 Push 발송
    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const sub of subscriptions) {
      try {
        const subscription = sub.subscription;
        
        // Push 알림 발송
        await push.sendNotification(
          subscription,
          JSON.stringify({
            title,
            body,
            tag: `event-${eventId}`,
            url: `/${eventId}/qr-pass`,
          })
        );
        
        sentCount++;
      } catch (err: any) {
        failedCount++;
        const errorMsg = err?.message || 'Unknown error';
        errors.push(`Subscription ${sub.id}: ${errorMsg}`);
        
        // 구독이 만료되었거나 유효하지 않은 경우 로그만 남기고 계속 진행
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.warn(`Expired subscription: ${sub.id}`);
          // 향후 DB에서 자동 삭제 로직 추가 가능
        } else {
          console.error(`Push error for subscription ${sub.id}:`, err);
        }
      }
    }

    // 운영 로그 기록
    await createOperationLog({
      eventId,
      type: 'broadcast',
      message: `Push 알림 발송: "${title}" (${sentCount}명 성공, ${failedCount}명 실패)`,
      actor: 'admin',
      metadata: {
        title,
        body,
        sent: sentCount,
        failed: failedCount,
      },
    });

    // 페이지 재검증
    revalidatePath(`/admin/events/${eventId}/broadcast`);

    return {
      success: true,
      sent: sentCount,
      failed: failedCount,
      message: `Push 알림 발송 완료: ${sentCount}건 성공, ${failedCount}건 실패`,
    };
  } catch (error: any) {
    console.error('sendPushAction error:', error);
    return {
      success: false,
      sent: 0,
      failed: 0,
      message: error?.message || 'Push 알림 발송 중 오류가 발생했습니다.',
    };
  }
}

