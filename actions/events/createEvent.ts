'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// 타입 정의
interface CreateEventInput {
  title: string;
  code: string;
  startDate: string;
  endDate: string;
  heroTagline?: string;
  primaryColor?: string;
  secondaryColor?: string;
  venueName?: string;
  venueAddress?: string;
  venueLatitude?: number | null;
  venueLongitude?: number | null;
}

// 간단한 유효성 검사
function validateInput(input: unknown): CreateEventInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid input');
  }
  const data = input as any;
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 2) {
    throw new Error('이벤트 제목은 최소 2자 이상이어야 합니다.');
  }
  
  if (!data.code || typeof data.code !== 'string' || data.code.trim().length < 2) {
    throw new Error('이벤트 코드는 최소 2자 이상이어야 합니다.');
  }
  
  if (!data.startDate || typeof data.startDate !== 'string') {
    throw new Error('시작 날짜는 필수입니다.');
  }
  
  if (!data.endDate || typeof data.endDate !== 'string') {
    throw new Error('종료 날짜는 필수입니다.');
  }
  
  // 날짜 유효성 검사
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  
  if (isNaN(startDate.getTime())) {
    throw new Error('유효하지 않은 시작 날짜입니다.');
  }
  
  if (isNaN(endDate.getTime())) {
    throw new Error('유효하지 않은 종료 날짜입니다.');
  }
  
  if (endDate < startDate) {
    throw new Error('종료 날짜는 시작 날짜보다 이후여야 합니다.');
  }
  
  // code 중복 체크는 DB 레벨에서 처리 (unique constraint)
  
  return {
    title: data.title.trim(),
    code: data.code.trim(),
    startDate: data.startDate,
    endDate: data.endDate,
    heroTagline: data.heroTagline?.trim() || null,
    primaryColor: data.primaryColor?.trim() || null,
    secondaryColor: data.secondaryColor?.trim() || null,
    venueName: data.venueName?.trim() || null,
    venueAddress: data.venueAddress?.trim() || null,
    venueLatitude: data.venueLatitude ? parseFloat(data.venueLatitude) : null,
    venueLongitude: data.venueLongitude ? parseFloat(data.venueLongitude) : null,
  };
}

/**
 * 새 이벤트 생성 Server Action
 */
export async function createEventAction(input: unknown): Promise<{ success: boolean; eventId?: string; message?: string }> {
  try {
    const payload = validateInput(input);

    // code 중복 체크
    const { data: existingEvent } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('code', payload.code)
      .single();

    if (existingEvent) {
      throw new Error('이미 사용 중인 이벤트 코드입니다. 다른 코드를 사용해주세요.');
    }

    // 이벤트 생성
    const { data: newEvent, error } = await supabaseAdmin
      .from('events')
      .insert([
        {
          title: payload.title,
          code: payload.code,
          start_date: payload.startDate,
          end_date: payload.endDate,
          hero_tagline: payload.heroTagline,
          primary_color: payload.primaryColor || '#2563eb',
          secondary_color: payload.secondaryColor,
          venue_name: payload.venueName,
          venue_address: payload.venueAddress,
          venue_latitude: payload.venueLatitude,
          venue_longitude: payload.venueLongitude,
          schedule: [], // 기본 빈 스케줄
          status: 'planning',
          location_name: payload.venueName, // 기존 필드와 호환성 유지
          location_detail: payload.venueAddress, // 기존 필드와 호환성 유지
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Event creation error:', error);
      
      // 중복 코드 에러 처리
      if (error.code === '23505') {
        throw new Error('이미 사용 중인 이벤트 코드입니다.');
      }
      
      throw new Error(`이벤트 생성에 실패했습니다: ${error.message}`);
    }

    if (!newEvent) {
      throw new Error('이벤트 생성에 실패했습니다.');
    }

    // 페이지 재검증
    revalidatePath('/admin/events');
    revalidatePath(`/admin/events/${newEvent.id}`);

    return {
      success: true,
      eventId: newEvent.id,
      message: '이벤트가 성공적으로 생성되었습니다.',
    };
  } catch (error: any) {
    console.error('createEventAction error:', error);
    return {
      success: false,
      message: error?.message || '이벤트 생성 중 오류가 발생했습니다.',
    };
  }
}

