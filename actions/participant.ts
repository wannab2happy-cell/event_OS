'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createAdminNotification } from '@/lib/notifications';
import { logParticipantUpdate } from '@/actions/participant/logParticipantUpdate';
import type {
  BasicInfo,
  PassportData,
  TravelDataExtended,
  HotelDataExtended,
  UUID,
} from '@/lib/types';

export async function saveParticipantData(
  eventId: string,
  participantId: string,
  data: BasicInfo
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

    // 2) 참가자 정보 업데이트
    const { data: updatedParticipant, error: participantError } = await supabaseAdmin
      .from('event_participants')
      .update({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        position: data.position,
        status: 'registered',
        updated_at: new Date().toISOString(),
      })
      .eq('id', participantId)
      .eq('event_id', eventId)
      .select()
      .single();

    if (participantError) {
      console.error('Participant update error:', participantError);
      return { success: false, message: '기본 정보 업데이트에 실패했습니다.' };
    }

    if (!updatedParticipant) {
      return { success: false, message: '유효한 참가자가 아닙니다.' };
    }

    // 3) 변경 로그 기록
    await logParticipantUpdate({
      eventId,
      participantId,
      before: beforeParticipant,
      after: updatedParticipant,
      actor: 'admin',
    });

    return { success: true, message: '정보가 성공적으로 저장되었습니다.' };
  } catch (error) {
    console.error('Server Action Error:', error);
    return { success: false, message: '알 수 없는 서버 오류가 발생했습니다.' };
  }
}

export async function savePassportData(
  eventId: string,
  participantId: string,
  data: PassportData
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

    // 2) 여권 정보 업데이트
    const { error: participantError } = await supabaseAdmin
      .from('event_participants')
      .update({
        passport_number: data.passport_number,
        passport_expiry: data.passport_expiry,
        visa_required: data.visa_required,
        updated_at: new Date().toISOString(),
      })
      .eq('id', participantId)
      .eq('event_id', eventId);

    if (participantError) {
      console.error('Passport update error:', participantError);
      return { success: false, message: '여권 정보 업데이트에 실패했습니다.' };
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

    return { success: true, message: '여권 정보가 성공적으로 저장되었습니다.' };
  } catch (error) {
    console.error('Server Action Error:', error);
    return { success: false, message: '알 수 없는 서버 오류가 발생했습니다.' };
  }
}

export async function saveTravelData(
  eventId: string,
  participantId: string,
  data: TravelDataExtended
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

    // 2) 항공 정보 업데이트
    const { error: participantError } = await supabaseAdmin
      .from('event_participants')
      .update({
        gender: data.gender,
        dob: data.dob,
        seat_preference: data.seat_preference,
        arrival_date: data.arrival_date,
        arrival_time: data.arrival_time,
        arrival_airport: data.arrival_airport,
        arrival_flight: data.arrival_flight,
        departure_date: data.departure_date,
        departure_time: data.departure_time,
        departure_airport: data.departure_airport,
        departure_flight: data.departure_flight,
        updated_at: new Date().toISOString(),
      })
      .eq('id', participantId)
      .eq('event_id', eventId);

    if (participantError) {
      console.error('Travel update error:', participantError);
      return { success: false, message: '항공 정보 업데이트에 실패했습니다.' };
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

    await createAdminNotification({
      eventId: eventId as UUID,
      participantId: participantId as UUID,
      type: 'travel_updated',
      message: '참가자의 항공 정보가 업데이트되었습니다.',
    });

    return { success: true, message: '항공 정보가 성공적으로 저장되었습니다. 다음은 호텔 정보입니다.' };
  } catch (error) {
    console.error('Server Action Error:', error);
    return { success: false, message: '알 수 없는 서버 오류가 발생했습니다.' };
  }
}

export async function saveHotelData(
  eventId: string,
  participantId: string,
  data: HotelDataExtended
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

    // 2) 호텔 정보 업데이트
    const { error: participantError } = await supabaseAdmin
      .from('event_participants')
      .update({
        hotel_check_in: data.hotel_check_in,
        hotel_check_out: data.hotel_check_out,
        room_preference: data.room_preference,
        sharing_details: data.sharing_details,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', participantId)
      .eq('event_id', eventId);

    if (participantError) {
      console.error('Hotel update error:', participantError);
      return { success: false, message: '호텔 정보 업데이트에 실패했습니다.' };
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

    await createAdminNotification({
      eventId: eventId as UUID,
      participantId: participantId as UUID,
      type: 'hotel_completed',
      message: '참가자의 호텔 정보가 업데이트되어 등록이 완료되었습니다.',
    });

    return { success: true, message: '호텔 정보 등록이 완료되었습니다. 등록이 최종 완료되었습니다!' };
  } catch (error) {
    console.error('Server Action Error:', error);
    return { success: false, message: '알 수 없는 서버 오류가 발생했습니다.' };
  }
}

