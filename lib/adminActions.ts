'use server';

import { revalidatePath } from 'next/cache';
import type { UUID } from '@/lib/types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendConfirmationEmail } from '@/lib/resend';
import { logParticipantUpdate } from '@/actions/participant/logParticipantUpdate';

interface AdminConfirmationData {
  flight_ticket_no?: string;
  guest_confirmation_no?: string;
  is_travel_confirmed?: boolean;
  is_hotel_confirmed?: boolean;
  participantEmail: string;
  participantName: string; // 이름 추가
  eventName: string;
}

export async function updateParticipantConfirmation(
  eventId: UUID,
  participantId: UUID,
  data: AdminConfirmationData
): Promise<{ success: boolean; message: string }> {
  try {
    // 1) 업데이트 전 참가자 정보 가져오기
    const { data: beforeParticipant, error: fetchError } = await supabaseAdmin
      .from('event_participants')
      .select('*')
      .eq('id', participantId)
      .eq('event_id', eventId)
      .single();

    if (fetchError || !beforeParticipant) {
      return { success: false, message: '참가자 정보를 찾을 수 없습니다.' };
    }

    // 2) 예약 확정 정보 업데이트
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

    // 3) 업데이트 후 참가자 정보 가져오기
    const { data: afterParticipant } = await supabaseAdmin
      .from('event_participants')
      .select('*')
      .eq('id', participantId)
      .eq('event_id', eventId)
      .single();

    if (afterParticipant) {
      // 4) 변경 로그 기록
      await logParticipantUpdate({
        eventId,
        participantId,
        before: beforeParticipant,
        after: afterParticipant,
        actor: 'admin',
      });
    }

    // 2. 상태가 확정됨으로 변경되었을 경우, 참가자에게 이메일 알림
    if (data.is_travel_confirmed || data.is_hotel_confirmed) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
      const participantLink = `${siteUrl}/${eventId}/qr-pass`;
      const registerLink = `${siteUrl}/${eventId}/register`;

      // 이벤트 브랜딩 정보 가져오기
      const { data: brandingData } = await supabaseAdmin
        .from('event_branding')
        .select('*')
        .eq('event_id', eventId)
        .single();

      const primaryColor = brandingData?.primary_color || '#2563eb';
      const logoUrl = brandingData?.logo_image_url || null;

      const emailResult = await sendConfirmationEmail({
        to: data.participantEmail,
        participantName: data.participantName,
        eventName: data.eventName,
        eventLink: participantLink,
        registerLink: registerLink,
        flightTicketNo: data.flight_ticket_no ?? null,
        guestConfirmationNo: data.guest_confirmation_no ?? null,
        isTravelConfirmed: data.is_travel_confirmed ?? false,
        isHotelConfirmed: data.is_hotel_confirmed ?? false,
        logoUrl: logoUrl,
        primaryColor: primaryColor,
      });

      revalidatePath(`/admin/events/${eventId}/participants/${participantId}/edit`); // UI 즉시 갱신
      revalidatePath(`/${eventId}/qr-pass`); // 참가자 페이지도 갱신

      if (emailResult.success) {
        return { success: true, message: '예약 확정 정보 저장 및 참가자에게 알림 메일 발송 완료.' };
      } else {
        // 이메일 전송 실패 시에도 DB 업데이트는 성공했으므로, 경고 메시지만 반환
        return { success: true, message: `DB 업데이트 성공. 경고: 알림 메일 발송에 실패했습니다: ${emailResult.message}` };
      }
    }

    revalidatePath(`/admin/events/${eventId}/participants`);
    revalidatePath(`/admin/events/${eventId}/participants/${participantId}/edit`);

    return { success: true, message: '예약 확정 정보가 성공적으로 저장되었습니다.' };
  } catch (error) {
    console.error('Admin Confirmation Error:', error);
    return { success: false, message: '알 수 없는 서버 오류가 발생했습니다.' };
  }
}

