'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCurrentUserWithRole } from '@/lib/auth';

const schema = z.object({
  eventId: z.string().uuid(),
  isEnabled: z.boolean(),
  pinCode: z.string().optional().nullable(),
});

export async function updateKioskSettingsAction(input: unknown) {
  try {
    const { eventId, isEnabled, pinCode } = schema.parse(input);

    // 현재 유저 정보 가져오기
    const userInfo = await getCurrentUserWithRole();
    const updatedBy = userInfo?.id || null;

    // PIN 코드 검증 (4~6자리 숫자)
    if (pinCode && pinCode.trim() !== '') {
      const pinRegex = /^\d{4,6}$/;
      if (!pinRegex.test(pinCode.trim())) {
        throw new Error('PIN 코드는 4~6자리 숫자여야 합니다.');
      }
    }

    // 기존 설정 확인
    const { data: existing } = await supabaseAdmin
      .from('kiosk_settings')
      .select('id')
      .eq('event_id', eventId)
      .single();

    const settingsData = {
      event_id: eventId,
      is_enabled: isEnabled,
      pin_code: pinCode && pinCode.trim() !== '' ? pinCode.trim() : null,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      // 업데이트
      const { error } = await supabaseAdmin
        .from('kiosk_settings')
        .update(settingsData)
        .eq('id', existing.id);

      if (error) {
        throw new Error('KIOSK 설정 업데이트에 실패했습니다.');
      }
    } else {
      // 생성
      const { error } = await supabaseAdmin.from('kiosk_settings').insert([settingsData]);

      if (error) {
        throw new Error('KIOSK 설정 생성에 실패했습니다.');
      }
    }

    revalidatePath(`/admin/events/${eventId}/kiosk`);
    revalidatePath(`/kiosk/${eventId}`);

    return { success: true, message: 'KIOSK 설정이 저장되었습니다.' };
  } catch (error: any) {
    console.error('updateKioskSettingsAction error:', error);
    return { success: false, message: error.message || 'KIOSK 설정 저장 중 오류가 발생했습니다.' };
  }
}

