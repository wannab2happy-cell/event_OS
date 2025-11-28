'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 타입 정의
interface CloneEventInput {
  sourceEventId: string;
  title: string;
  code: string;
  startDate?: string;
  endDate?: string;
}

// 간단한 유효성 검사
function validateInput(input: unknown): CloneEventInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input');
  }
  const data = input as any;
  
  if (!data.sourceEventId || typeof data.sourceEventId !== 'string') {
    throw new Error('원본 이벤트 ID가 필요합니다.');
  }
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 2) {
    throw new Error('이벤트 제목은 최소 2자 이상이어야 합니다.');
  }
  
  if (!data.code || typeof data.code !== 'string' || data.code.trim().length < 2) {
    throw new Error('이벤트 코드는 최소 2자 이상이어야 합니다.');
  }
  
  return {
    sourceEventId: data.sourceEventId,
    title: data.title.trim(),
    code: data.code.trim(),
    startDate: data.startDate || null,
    endDate: data.endDate || null,
  };
}

/**
 * 이벤트 복제 Server Action
 */
export async function cloneEventAction(input: unknown): Promise<{ success: boolean; eventId?: string; message?: string }> {
  try {
    const { sourceEventId, title, code, startDate, endDate } = validateInput(input);

    // 1) 원본 이벤트 로드
    const { data: sourceEvent, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', sourceEventId)
      .single();

    if (fetchError || !sourceEvent) {
      throw new Error('원본 이벤트를 찾을 수 없습니다.');
    }

    // 2) code 중복 체크
    const { data: existingEvent } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('code', code)
      .single();

    if (existingEvent) {
      throw new Error('이미 사용 중인 이벤트 코드입니다. 다른 코드를 사용해주세요.');
    }

    // 3) 새 이벤트 생성 (원본 데이터 복사)
    const clonePayload: any = {
      title,
      code,
      start_date: startDate || sourceEvent.start_date,
      end_date: endDate || sourceEvent.end_date,
      hero_tagline: sourceEvent.hero_tagline,
      primary_color: sourceEvent.primary_color || '#2563eb',
      secondary_color: sourceEvent.secondary_color,
      venue_name: sourceEvent.venue_name,
      venue_address: sourceEvent.venue_address,
      venue_latitude: sourceEvent.venue_latitude,
      venue_longitude: sourceEvent.venue_longitude,
      schedule: sourceEvent.schedule || [],
      status: 'planning', // 새 이벤트는 항상 planning 상태로 시작
      location_name: sourceEvent.venue_name || sourceEvent.location_name,
      location_detail: sourceEvent.venue_address || sourceEvent.location_detail,
    };

    const { data: newEvent, error: insertError } = await supabaseAdmin
      .from('events')
      .insert([clonePayload])
      .select('id')
      .single();

    if (insertError) {
      console.error('Event clone error:', insertError);
      
      // 중복 코드 에러 처리
      if (insertError.code === '23505') {
        throw new Error('이미 사용 중인 이벤트 코드입니다.');
      }
      
      throw new Error(`이벤트 복제에 실패했습니다: ${insertError.message}`);
    }

    if (!newEvent) {
      throw new Error('이벤트 복제에 실패했습니다.');
    }

    // 4) (선택) event_branding 복제
    const { data: sourceBranding } = await supabaseAdmin
      .from('event_branding')
      .select('*')
      .eq('event_id', sourceEventId)
      .single();

    if (sourceBranding) {
      const brandingPayload = {
        event_id: newEvent.id,
        primary_color: sourceBranding.primary_color,
        secondary_color: sourceBranding.secondary_color,
        kv_image_url: sourceBranding.kv_image_url,
        logo_url: sourceBranding.logo_url,
        accent_color: sourceBranding.accent_color,
        font_family: sourceBranding.font_family,
      };

      await supabaseAdmin
        .from('event_branding')
        .insert([brandingPayload]);
    }

    // 페이지 재검증
    revalidatePath('/admin/events');
    revalidatePath(`/admin/events/${newEvent.id}`);

    return {
      success: true,
      eventId: newEvent.id,
      message: '이벤트가 성공적으로 복제되었습니다.',
    };
  } catch (error: any) {
    console.error('cloneEventAction error:', error);
    return {
      success: false,
      message: error?.message || '이벤트 복제 중 오류가 발생했습니다.',
    };
  }
}

