'use server';

import { revalidatePath } from 'next/cache';
import type { UUID } from '@/lib/types';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendConfirmationEmail } from '@/lib/resend';

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
      const passLink = `${process.env.NEXT_PUBLIC_SITE_URL}/${eventId}/qr-pass`;
      const updates: string[] = [];
      if (data.is_travel_confirmed) updates.push('항공 예약');
      if (data.is_hotel_confirmed) updates.push('호텔 예약');

      await sendConfirmationEmail({
        to: data.participantEmail,
        eventName: data.eventName,
        message: `
          <p>안녕하세요.</p>
          <p><strong>${data.eventName}</strong> 행사에 대한 ${updates.join(
            ' 및 '
          )} 정보가 업데이트되었습니다.</p>
          <p>자세한 내용은 <a href="${passLink}">QR PASS 페이지</a>에서 확인해주세요.</p>
        `,
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

