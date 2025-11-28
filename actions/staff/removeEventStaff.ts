'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const schema = z.object({
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
});

export async function removeEventStaffAction(input: unknown) {
  try {
    const { eventId, userId } = schema.parse(input);

    const { error } = await supabaseAdmin
      .from('event_staff')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) {
      throw new Error('스태프 제거에 실패했습니다.');
    }

    revalidatePath(`/admin/events/${eventId}/staff`);

    return { success: true, message: '스태프가 성공적으로 제거되었습니다.' };
  } catch (error: any) {
    console.error('removeEventStaffAction error:', error);
    return { success: false, message: error.message || '스태프 제거 중 오류가 발생했습니다.' };
  }
}

