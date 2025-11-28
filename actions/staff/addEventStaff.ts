'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const schema = z.object({
  eventId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['staff', 'lead']),
});

export async function addEventStaffAction(input: unknown) {
  try {
    const { eventId, email, role } = schema.parse(input);

    // 1) email로 users 테이블 조회 (auth.users)
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      throw new Error('유저 조회에 실패했습니다.');
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      throw new Error('해당 이메일의 유저가 없습니다. 먼저 회원가입을 진행해주세요.');
    }

    // 2) event_staff에 insert
    const { error: insertError } = await supabaseAdmin.from('event_staff').insert({
      event_id: eventId,
      user_id: user.id,
      role,
    });

    if (insertError) {
      // unique 제약 위반 시 중복 에러
      if (insertError.code === '23505') {
        throw new Error('이미 할당된 스태프입니다.');
      }
      throw new Error('스태프 추가에 실패했습니다.');
    }

    revalidatePath(`/admin/events/${eventId}/staff`);

    return { success: true, message: '스태프가 성공적으로 추가되었습니다.' };
  } catch (error: any) {
    console.error('addEventStaffAction error:', error);
    return { success: false, message: error.message || '스태프 추가 중 오류가 발생했습니다.' };
  }
}

