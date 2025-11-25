'use server';

import { supabase } from '@/lib/supabaseClient';

interface BasicInfo {
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
}

export async function saveParticipantData(
  eventId: string,
  participantId: string,
  data: BasicInfo
): Promise<{ success: boolean; message: string }> {
  try {
    const { data: updatedParticipant, error: participantError } = await supabase
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

    return { success: true, message: '정보가 성공적으로 저장되었습니다.' };
  } catch (error) {
    console.error('Server Action Error:', error);
    return { success: false, message: '알 수 없는 서버 오류가 발생했습니다.' };
  }
}

interface PassportData {
  passport_number: string;
  passport_expiry: string;
  visa_required: boolean;
}

export async function savePassportData(
  eventId: string,
  participantId: string,
  data: PassportData
): Promise<{ success: boolean; message: string }> {
  try {
    const { error: participantError } = await supabase
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

    return { success: true, message: '여권 정보가 성공적으로 저장되었습니다.' };
  } catch (error) {
    console.error('Server Action Error:', error);
    return { success: false, message: '알 수 없는 서버 오류가 발생했습니다.' };
  }
}

