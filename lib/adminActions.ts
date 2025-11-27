'use server';

import { revalidatePath } from 'next/cache';
import type { UUID, Participant, EventBranding } from '@/lib/types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendConfirmationEmail, generateConfirmationEmailTemplate } from '@/lib/resend';

interface AdminConfirmationData {
  flight_ticket_no?: string;
  guest_confirmation_no?: string;
  is_travel_confirmed?: boolean;
  is_hotel_confirmed?: boolean;
  participantEmail: string;
  eventName: string;
}

export async function updateParticipantConfirmation(
  eventId: UUID,
  participantId: UUID,
  data: AdminConfirmationData
): Promise<{ success: boolean; message: string }> {
  try {
    const { error: dbError } = await supabaseAdmin
      .from('event_participants')
      .update({
        flight_ticket_no: data.flight_ticket_no,
        guest_confirmation_no: data.guest_confirmation_no,
        is_travel_confirmed: data.is_travel_confirmed ?? false,
        is_hotel_confirmed: data.is_hotel_confirmed ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', participantId)
      .eq('event_id', eventId);

    if (dbError) {
      console.error('Admin update error:', dbError);
      return { success: false, message: '예약 확정 정보 업데이트에 실패했습니다.' };
    }

    const shouldNotify =
      (data.is_travel_confirmed && data.flight_ticket_no) ||
      (data.is_hotel_confirmed && data.guest_confirmation_no);

    if (shouldNotify && data.participantEmail) {
      // 업데이트된 참가자 정보 가져오기
      const { data: participantData, error: participantError } = await supabaseAdmin
        .from('event_participants')
        .select('*')
        .eq('id', participantId)
        .eq('event_id', eventId)
        .single();

      if (participantError || !participantData) {
        console.error('Failed to fetch participant data:', participantError);
        return { success: false, message: '참가자 정보를 가져오는데 실패했습니다.' };
      }

      const participant = participantData as Participant;

      // 이벤트 브랜딩 정보 가져오기
      const { data: brandingData } = await supabaseAdmin
        .from('event_branding')
        .select('*')
        .eq('event_id', eventId)
        .single();

      const branding: EventBranding | null = brandingData
        ? {
            primary_color: brandingData.primary_color || '#2563eb',
            secondary_color: brandingData.secondary_color || '#f8f8f8',
            kv_image_url: brandingData.kv_image_url || '',
            logo_image_url: brandingData.logo_image_url || '',
            accent_color: brandingData.accent_color,
            font_family: brandingData.font_family,
          }
        : null;

      // 메일 템플릿 생성
      const { subject, html } = generateConfirmationEmailTemplate({
        participant,
        eventName: data.eventName,
        eventId,
        branding,
        isTravelConfirmed: data.is_travel_confirmed ?? false,
        isHotelConfirmed: data.is_hotel_confirmed ?? false,
      });

      // 메일 발송
      await sendConfirmationEmail({
        to: data.participantEmail,
        eventName: data.eventName,
        message: html,
        subject,
      });
    }

    revalidatePath(`/admin/events/${eventId}/participants`);
    revalidatePath(`/admin/events/${eventId}/participants/${participantId}/edit`);

    return { success: true, message: '예약 확정 정보가 성공적으로 저장되었습니다.' };
  } catch (error) {
    console.error('Admin Confirmation Error:', error);
    return { success: false, message: '알 수 없는 서버 오류가 발생했습니다.' };
  }
}

