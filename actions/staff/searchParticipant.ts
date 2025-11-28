'use server';

import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const schema = z.object({
  eventId: z.string().uuid(),
  query: z.string().min(1),
});

export async function searchParticipantAction(input: unknown) {
  try {
    const { eventId, query } = schema.parse(input);

    const searchQuery = query.trim().toLowerCase();

    // 이메일로 검색
    let { data, error } = await supabaseAdmin
      .from('event_participants')
      .select('id, name, email')
      .eq('event_id', eventId)
      .ilike('email', `%${searchQuery}%`)
      .limit(5);

    // 이메일로 못 찾으면 이름으로 검색
    if (!data || data.length === 0) {
      const { data: nameData } = await supabaseAdmin
        .from('event_participants')
        .select('id, name, email')
        .eq('event_id', eventId)
        .ilike('name', `%${searchQuery}%`)
        .limit(5);

      data = nameData || [];
    }

    // 회사로 검색
    if (!data || data.length === 0) {
      const { data: companyData } = await supabaseAdmin
        .from('event_participants')
        .select('id, name, email')
        .eq('event_id', eventId)
        .ilike('company', `%${searchQuery}%`)
        .limit(5);

      data = companyData || [];
    }

    if (error) {
      throw new Error('검색 중 오류가 발생했습니다.');
    }

    return { success: true, results: data || [] };
  } catch (error: any) {
    console.error('searchParticipantAction error:', error);
    return { success: false, results: [], message: error.message || '검색 중 오류가 발생했습니다.' };
  }
}

